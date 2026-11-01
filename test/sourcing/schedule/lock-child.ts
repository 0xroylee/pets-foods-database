// Child process for run-lock tests. Usage:
//   bun lock-child.ts <lockPath> <signalDir> <name> [--pause-after-open]
// Signals in <signalDir>:
//   <name>.opened   with --pause-after-open: the lock file is open (its device and inode);
//                   the child then waits for <name>.continue before asking for the lock
//   <name>.result   acquired (with device, inode and how many children were active) or
//                   already_running
//   <name>.active   exists while this child holds the lock; it holds until <name>.release

import { fstatSync, rmSync } from "node:fs";
import { acquireRunLock, releaseRunLock } from "../../../src/sourcing/schedule/run-lock.ts";
import { activeCount, signalPath, waitForSignalSync, writeSignal } from "./signals.ts";

const [lockPath, dir, name, flag] = Bun.argv.slice(2);
if (!lockPath || !dir || !name) {
  throw new Error("usage: bun lock-child.ts <lockPath> <signalDir> <name> [--pause-after-open]");
}
const signal = (suffix: string) => signalPath(dir, name, suffix);

const result = acquireRunLock(lockPath, {
  afterOpen: (fd) => {
    if (flag !== "--pause-after-open") return;
    const { dev, ino } = fstatSync(fd);
    writeSignal(signal("opened"), { device: dev, inode: ino });
    waitForSignalSync(signal("continue"));
  },
});
if (result.status === "already_running") {
  writeSignal(signal("result"), { status: result.status });
} else {
  writeSignal(signal("active"));
  writeSignal(signal("result"), {
    status: result.status,
    device: result.lock.device,
    inode: result.lock.inode,
    activeSeen: activeCount(dir),
  });
  waitForSignalSync(signal("release"));
  rmSync(signal("active"));
  releaseRunLock(result.lock);
}
