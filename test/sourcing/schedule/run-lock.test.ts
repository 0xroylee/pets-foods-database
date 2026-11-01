import { afterEach, describe, expect, test } from "bun:test";
import { rmSync, statSync, utimesSync } from "node:fs";
import { join } from "node:path";
import { ChildHarness, type ChildResult } from "./children.ts";
import { activeCount, signalPath } from "./signals.ts";

const LOCK_CHILD = join(import.meta.dir, "lock-child.ts");
const TIMEOUT = 20_000;
const harnesses: ChildHarness[] = [];

afterEach(async () => {
  for (const harness of harnesses.splice(0)) await harness.cleanup();
});

function setup() {
  const h = new ChildHarness();
  harnesses.push(h);
  const lockPath = join(h.home, "run.lock");
  const start = (name: string, options: { pauseAfterOpen?: boolean } = {}) =>
    h.start(name, [
      LOCK_CHILD,
      lockPath,
      h.signals,
      name,
      ...(options.pauseAfterOpen ? ["--pause-after-open"] : []),
    ]);
  return { h, lockPath, start };
}

/** Moves the lock file's timestamps two days back, as if its owner had held it that long. */
function ageLockFile(path: string): void {
  const past = new Date(Date.now() - 2 * 24 * 60 * 60_000);
  utimesSync(path, past, past);
}

describe("one run at a time across processes (T9-A2)", () => {
  test(
    "a contender gets already_running while the owner holds the lock, then the lock passes on",
    async () => {
      const { h, lockPath, start } = setup();
      const a = start("A");
      const ra = await h.waitFor<ChildResult>(a, "result");
      expect(ra).toMatchObject({ status: "acquired", activeSeen: 1 });

      const b = start("B");
      expect(await h.waitFor<ChildResult>(b, "result")).toEqual({ status: "already_running" });
      await h.exited(b);
      expect(activeCount(h.signals)).toBe(1);

      await h.release(a);
      const c = start("C");
      expect(await h.waitFor<ChildResult>(c, "result")).toMatchObject({
        status: "acquired",
        device: ra.device,
        inode: ra.inode,
        activeSeen: 1,
      });
      await h.release(c);
      expect(statSync(lockPath).ino).toBe(ra.inode as number);
    },
    TIMEOUT,
  );

  test(
    "an owner paused for days, like a sleeping Mac, keeps the lock",
    async () => {
      const { h, lockPath, start } = setup();
      const a = start("A");
      const ra = await h.waitFor<ChildResult>(a, "result");
      a.proc.kill("SIGSTOP");
      ageLockFile(lockPath);

      const b = start("B");
      expect(await h.waitFor<ChildResult>(b, "result")).toEqual({ status: "already_running" });
      await h.exited(b);

      a.proc.kill("SIGCONT");
      await h.release(a);
      const c = start("C");
      expect(await h.waitFor<ChildResult>(c, "result")).toMatchObject({
        status: "acquired",
        inode: ra.inode,
        activeSeen: 1,
      });
      await h.release(c);
    },
    TIMEOUT,
  );

  test(
    "a killed owner's lock is released by the OS, on the same file",
    async () => {
      const { h, lockPath, start } = setup();
      const a = start("A");
      const ra = await h.waitFor<ChildResult>(a, "result");
      a.proc.kill("SIGKILL");
      await a.proc.exited;
      // A died inside its run, so it is no longer active.
      rmSync(signalPath(h.signals, "A", "active"));

      const b = start("B");
      expect(await h.waitFor<ChildResult>(b, "result")).toMatchObject({
        status: "acquired",
        device: ra.device,
        inode: ra.inode,
        activeSeen: 1,
      });
      await h.release(b);
      expect(statSync(lockPath).ino).toBe(ra.inode as number);
    },
    TIMEOUT,
  );

  test(
    "A/B/C race: a contender paused between opening and locking gets already_running",
    async () => {
      const { h, lockPath, start } = setup();
      const a = start("A");
      const ra = await h.waitFor<ChildResult>(a, "result");
      expect(ra.status).toBe("acquired");

      // B opens the lock file, then stops before asking for the lock.
      const b = start("B", { pauseAfterOpen: true });
      const opened = await h.waitFor<{ device: number; inode: number }>(b, "opened");
      expect(opened).toEqual({ device: ra.device as number, inode: ra.inode as number });

      // A releases normally; C opens, locks and stays active.
      await h.release(a);
      const c = start("C");
      const rc = await h.waitFor<ChildResult>(c, "result");
      expect(rc.status).toBe("acquired");

      // B resumes with the descriptor it opened before A released.
      h.signal(b, "continue");
      const rb = await h.waitFor<ChildResult>(b, "result");
      expect(rb).toEqual({ status: "already_running" });
      await h.exited(b);

      // One lock file with one identity throughout, and never two active collectors.
      expect({ device: rc.device, inode: rc.inode }).toEqual({
        device: ra.device,
        inode: ra.inode,
      });
      expect(statSync(lockPath).ino).toBe(ra.inode as number);
      expect(rc.activeSeen).toBe(1);
      expect(activeCount(h.signals)).toBe(1);
      await h.release(c);
    },
    TIMEOUT,
  );
});
