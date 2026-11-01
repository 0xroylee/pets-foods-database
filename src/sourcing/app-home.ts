// Where the back office keeps its private files on the owner's Mac: the run lock, the raw
// stores and the scheduled job's logs. It sits outside the repository, so nothing in it is
// ever committed.

import { homedir } from "node:os";
import { join } from "node:path";

export const DEFAULT_APP_HOME = join(
  homedir(),
  "Library",
  "Application Support",
  "pets-foods-database",
);

/** PFDB_HOME moves the folder, for tests and the isolated schedule check. */
export function appHome(): string {
  return process.env.PFDB_HOME || DEFAULT_APP_HOME;
}

export function runLockPath(home: string): string {
  return join(home, "run.lock");
}

export function dataDir(home: string): string {
  return join(home, "data");
}

export function logDir(home: string): string {
  return join(home, "logs");
}
