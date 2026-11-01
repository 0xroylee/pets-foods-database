// Starts child processes for the schedule tests and waits on their signals. Every child is
// tracked, so cleanup can make sure all of them have exited before it deletes the isolated
// test folder (and only that folder).

import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Subprocess } from "bun";
import { readSignal, signalPath, writeSignal } from "./signals.ts";

const TIMEOUT_MS = 10_000;

export interface ChildResult {
  status: "acquired" | "already_running";
  device?: number;
  inode?: number;
  activeSeen?: number;
}

export interface Child {
  name: string;
  proc: Subprocess<"ignore", "pipe", "pipe">;
}

export class ChildHarness {
  readonly root = mkdtempSync(join(tmpdir(), "pfdb-schedule-"));
  readonly home = join(this.root, "home");
  readonly signals = join(this.root, "signals");
  readonly #children: Child[] = [];

  constructor() {
    mkdirSync(this.signals);
  }

  /** Env for real CLI runs: the isolated home and a keys file that does not exist. */
  get cliEnv(): Record<string, string> {
    return {
      ...process.env,
      PFDB_HOME: this.home,
      PFDB_FDA_CREDENTIALS: join(this.root, "no-keys.json"),
    } as Record<string, string>;
  }

  start(name: string, args: string[], env?: Record<string, string>): Child {
    const proc = Bun.spawn([process.execPath, ...args], {
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
      env,
    });
    const child = { name, proc };
    this.#children.push(child);
    return child;
  }

  /** Waits for a child's signal file, failing early if the child exits without writing it. */
  async waitFor<T>(child: Child, suffix: string): Promise<T> {
    const path = signalPath(this.signals, child.name, suffix);
    const deadline = Date.now() + TIMEOUT_MS;
    while (!existsSync(path)) {
      if (child.proc.exitCode !== null || child.proc.signalCode !== null) {
        if (existsSync(path)) break;
        const stderr = await new Response(child.proc.stderr).text();
        throw new Error(`${child.name} exited before ${suffix}: ${stderr}`);
      }
      if (Date.now() > deadline) throw new Error(`timed out waiting for ${child.name}.${suffix}`);
      await Bun.sleep(5);
    }
    return readSignal<T>(path);
  }

  signal(child: Child, suffix: string): void {
    writeSignal(signalPath(this.signals, child.name, suffix));
  }

  /** Lets a holding child release and waits for it to exit. */
  async release(child: Child): Promise<void> {
    this.signal(child, "release");
    await this.exited(child);
  }

  async exited(child: Child): Promise<number> {
    const code = await child.proc.exited;
    if (code !== 0 && child.proc.signalCode === null) {
      throw new Error(`${child.name} failed: ${await new Response(child.proc.stderr).text()}`);
    }
    return code;
  }

  async stdout(child: Child): Promise<string> {
    await child.proc.exited;
    return new Response(child.proc.stdout).text();
  }

  /** Stops every child that is still running, waits for all of them, then removes the folder. */
  async cleanup(): Promise<void> {
    for (const { proc } of this.#children) {
      if (proc.exitCode === null && proc.signalCode === null) {
        proc.kill("SIGCONT");
        proc.kill("SIGKILL");
      }
    }
    await Promise.all(this.#children.map(({ proc }) => proc.exited));
    rmSync(this.root, { recursive: true, force: true });
  }
}
