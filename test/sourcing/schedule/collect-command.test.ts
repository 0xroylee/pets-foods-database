import { afterEach, describe, expect, test } from "bun:test";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { dataDir, runLockPath } from "../../../src/sourcing/app-home.ts";
import { runCollectCommand } from "../../../src/sourcing/collect/command.ts";
import { CLI_PATH } from "../../../src/sourcing/schedule/launchd.ts";
import { singleItemAdapter } from "../collect/helpers.ts";
import { type Child, ChildHarness } from "./children.ts";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const LOCK_CHILD = join(import.meta.dir, "lock-child.ts");
const COLLECT_CHILD = join(import.meta.dir, "collect-child.ts");
const ORIGIN = "https://contender.test";
const TIMEOUT = 20_000;
const harnesses: ChildHarness[] = [];

afterEach(async () => {
  for (const harness of harnesses.splice(0)) await harness.cleanup();
});

function harness(): ChildHarness {
  const h = new ChildHarness();
  harnesses.push(h);
  return h;
}

/** A private keys file outside the repository, so a run that gets the lock goes live. */
function keysFile(h: ChildHarness): string {
  const path = join(h.root, "keys.json");
  writeFileSync(path, JSON.stringify({ authorization_user: "u", authorization_key: "k" }));
  chmodSync(path, 0o600);
  return path;
}

async function resultLine(h: ChildHarness, child: Child): Promise<Record<string, unknown>> {
  const out = await h.stdout(child);
  await h.exited(child);
  const lines = out.trim().split("\n");
  return JSON.parse(lines[lines.length - 1] ?? "{}");
}

describe("the shared collect entry point (T9-A2)", () => {
  test(
    "a run that loses the lock stops before opening a store or making any request",
    async () => {
      const h = harness();
      const holder = h.start("holder", [LOCK_CHILD, runLockPath(h.home), h.signals, "holder"]);
      await h.waitFor(holder, "result");
      let requests = 0;
      const countingFetch = (async () => {
        requests++;
        return new Response("{}", { status: 200 });
      }) as unknown as typeof fetch;
      const run = () =>
        runCollectCommand({
          home: h.home,
          requested: "live",
          trigger: "manual",
          repoRoot: REPO_ROOT,
          credentialsPath: keysFile(h),
          sources: {
            adapters: [singleItemAdapter("contender", ORIGIN)],
            fixtures: [],
            credentialOrigins: [ORIGIN],
          },
          fetch: countingFetch,
          limits: { originSpacingMs: 0 },
        });

      expect(await run()).toEqual({ status: "already_running", trigger: "manual" });
      expect(requests).toBe(0);
      expect(existsSync(dataDir(h.home))).toBe(false);

      // Once the owner releases, the same command takes the lock and makes its request.
      await h.release(holder);
      expect(await run()).toMatchObject({ status: "ran", mode: "live", credentials: "available" });
      expect(requests).toBe(1);
    },
    TIMEOUT,
  );

  test(
    "manual and scheduled runs never overlap, whichever starts first",
    async () => {
      const h = harness();
      const scheduled = h.start("scheduled", [
        COLLECT_CHILD,
        h.home,
        h.signals,
        "scheduled",
        "scheduled",
      ]);
      await h.waitFor(scheduled, "active");
      const inode = statSync(runLockPath(h.home)).ino;

      // A manual run from the real command line while the scheduled run is mid-page.
      const manualCli = h.start("manual-cli", [CLI_PATH, "collect", "--mode", "fixture"], h.cliEnv);
      expect(await resultLine(h, manualCli)).toMatchObject({
        event: "collection_run",
        status: "already_running",
        trigger: "manual",
      });
      await h.release(scheduled);
      expect(await resultLine(h, scheduled)).toMatchObject({
        status: "ran",
        trigger: "scheduled",
        summary: { status: "completed", committedPages: 1 },
      });

      // The other way round: a manual run holds and the scheduled command loses.
      const manual = h.start("manual", [COLLECT_CHILD, h.home, h.signals, "manual", "manual"]);
      await h.waitFor(manual, "active");
      const scheduledCli = h.start(
        "scheduled-cli",
        [CLI_PATH, "collect", "--mode", "live", "--trigger", "scheduled"],
        h.cliEnv,
      );
      expect(await resultLine(h, scheduledCli)).toMatchObject({
        status: "already_running",
        trigger: "scheduled",
      });
      await h.release(manual);
      expect(await resultLine(h, manual)).toMatchObject({ status: "ran", trigger: "manual" });
      expect(statSync(runLockPath(h.home)).ino).toBe(inode);
    },
    TIMEOUT,
  );

  test(
    "a paused run keeps the lock and a killed run gives it up",
    async () => {
      const h = harness();
      const run = h.start("paused", [COLLECT_CHILD, h.home, h.signals, "paused", "scheduled"]);
      await h.waitFor(run, "active");
      run.proc.kill("SIGSTOP");
      const past = new Date(Date.now() - 2 * 24 * 60 * 60_000);
      utimesSync(runLockPath(h.home), past, past);

      const whilePaused = h.start(
        "while-paused",
        [CLI_PATH, "collect", "--mode", "live"],
        h.cliEnv,
      );
      expect(await resultLine(h, whilePaused)).toMatchObject({ status: "already_running" });

      run.proc.kill("SIGKILL");
      await run.proc.exited;
      // Without keys, the scheduled command reports live_disabled and makes no request.
      const afterDeath = h.start(
        "after-death",
        [CLI_PATH, "collect", "--mode", "live", "--trigger", "scheduled"],
        h.cliEnv,
      );
      expect(await resultLine(h, afterDeath)).toMatchObject({
        status: "live_disabled",
        trigger: "scheduled",
        credentials: "missing",
      });
      expect(existsSync(join(dataDir(h.home), "live"))).toBe(false);
    },
    TIMEOUT,
  );

  test("a run that fails still releases the lock", async () => {
    const h = harness();
    const options = {
      home: h.home,
      requested: "fixture" as const,
      trigger: "manual" as const,
      repoRoot: REPO_ROOT,
      credentialsPath: join(h.root, "no-keys.json"),
      sources: { adapters: [], fixtures: [], credentialOrigins: [] },
    };
    // A file where the data folder belongs makes opening the store fail mid-run.
    mkdirSync(h.home, { recursive: true });
    writeFileSync(dataDir(h.home), "not a folder");
    await expect(runCollectCommand(options)).rejects.toThrow();
    rmSync(dataDir(h.home));
    expect(await runCollectCommand(options)).toMatchObject({
      status: "ran",
      mode: "fixture",
      credentials: "missing",
    });
  });

  test("the command line rejects an unknown mode", async () => {
    const h = harness();
    const child = h.start("bad-mode", [CLI_PATH, "collect", "--mode", "turbo"], h.cliEnv);
    expect(await child.proc.exited).toBe(2);
    expect(await new Response(child.proc.stderr).text()).toContain("--mode must be one of");
  });
});
