// One collection run at a time, across processes: an OS advisory lock (flock) on a lock file
// that is never deleted or replaced. The OS drops the lock when its process dies, so a crashed
// run never blocks the next one, and nothing ever "steals" a lock from a live owner, however
// long it has held it (a Mac that slept for a day still owns its run).

import { dlopen, FFIType } from "bun:ffi";
import { chmodSync, closeSync, fstatSync, mkdirSync, openSync } from "node:fs";
import { dirname } from "node:path";

const libc = dlopen("/usr/lib/libSystem.B.dylib", {
  flock: { args: [FFIType.i32, FFIType.i32], returns: FFIType.i32 },
});
const LOCK_EX = 2;
const LOCK_NB = 4;
const LOCK_UN = 8;

export interface RunLock {
  fd: number;
  path: string;
  device: number;
  inode: number;
}

export type RunLockResult = { status: "acquired"; lock: RunLock } | { status: "already_running" };

export interface RunLockHooks {
  /** Test seam: runs with the open descriptor, after opening the file and before locking it. */
  afterOpen?: (fd: number) => void;
}

/** Takes the run lock without waiting; another live owner means already_running. */
export function acquireRunLock(path: string, hooks: RunLockHooks = {}): RunLockResult {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  chmodSync(dirname(path), 0o700);
  // "a" creates the file if needed and never truncates or replaces it.
  const fd = openSync(path, "a", 0o600);
  chmodSync(path, 0o600);
  hooks.afterOpen?.(fd);
  if (libc.symbols.flock(fd, LOCK_EX | LOCK_NB) !== 0) {
    closeSync(fd);
    return { status: "already_running" };
  }
  const stat = fstatSync(fd);
  return { status: "acquired", lock: { fd, path, device: stat.dev, inode: stat.ino } };
}

/**
 * Unlocks and closes the descriptor. The file stays where it is: deleting it would let a
 * contender that opened the old file lock that while another locks a new one.
 */
export function releaseRunLock(lock: RunLock): void {
  libc.symbols.flock(lock.fd, LOCK_UN);
  closeSync(lock.fd);
}
