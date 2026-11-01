// File signals between a test and its child processes, so the test can hold each child at an
// exact point. Writes are atomic (write, then rename), so a reader never sees half a file.

import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function signalPath(dir: string, name: string, suffix: string): string {
  return join(dir, `${name}.${suffix}`);
}

export function writeSignal(path: string, value: unknown = {}): void {
  writeFileSync(`${path}.tmp`, JSON.stringify(value));
  renameSync(`${path}.tmp`, path);
}

/** Blocks the whole process until the file appears: the lock test seam is synchronous. */
export function waitForSignalSync(path: string): void {
  while (!existsSync(path)) Bun.sleepSync(5);
}

export function readSignal<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

/** How many children are inside their run right now. */
export function activeCount(dir: string): number {
  return readdirSync(dir).filter((name) => name.endsWith(".active")).length;
}
