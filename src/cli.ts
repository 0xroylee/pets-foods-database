// The back office command line. Manual and scheduled collection run the same command:
//   bun src/cli.ts collect [--mode auto|fixture|live] [--trigger manual|scheduled]
//   bun src/cli.ts schedule install [--label L] [--interval SECONDS] [--home DIR]
//   bun src/cli.ts schedule status [--label L]
//   bun src/cli.ts schedule remove [--label L]
// PFDB_HOME moves the private app folder (run lock, raw stores, logs) and
// PFDB_FDA_CREDENTIALS moves the keys file.

import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { appHome } from "./sourcing/app-home.ts";
import { runCollectCommand } from "./sourcing/collect/command.ts";
import {
  buildMacSchedule,
  inspectInstalledSchedule,
  installMacSchedule,
  REPO_ROOT,
  removeMacSchedule,
  SCHEDULE_LABEL,
  scheduleConfiguration,
} from "./sourcing/schedule/launchd.ts";
import { collectionSources } from "./sourcing/sources.ts";

const USAGE = `usage:
  bun src/cli.ts collect [--mode auto|fixture|live] [--trigger manual|scheduled]
  bun src/cli.ts schedule install [--label L] [--interval SECONDS] [--home DIR]
  bun src/cli.ts schedule status [--label L]
  bun src/cli.ts schedule remove [--label L]`;

class UsageError extends Error {}

async function collect(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      mode: { type: "string", default: "auto" },
      trigger: { type: "string", default: "manual" },
    },
  });
  const requested = oneOf(values.mode, ["auto", "fixture", "live"] as const, "--mode");
  const trigger = oneOf(values.trigger, ["manual", "scheduled"] as const, "--trigger");
  const startedAt = new Date().toISOString();
  const result = await runCollectCommand({
    home: appHome(),
    requested,
    trigger,
    repoRoot: REPO_ROOT,
    sources: collectionSources(),
  });
  // One line per run. Under the schedule it goes to the job's private log, where the launchd
  // job name and parent process show that the scheduler started the run, not a person.
  print({
    event: "collection_run",
    ...result,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    pid: process.pid,
    parent_pid: process.ppid,
    xpc_service_name: process.env.XPC_SERVICE_NAME ?? null,
  });
}

function schedule(args: string[]): void {
  const [action, ...rest] = args;
  const { values } = parseArgs({
    args: rest,
    options: {
      label: { type: "string", default: SCHEDULE_LABEL },
      interval: { type: "string" },
      home: { type: "string" },
    },
  });
  const { label } = values;
  if (action === "install") {
    const home = resolve(values.home ?? appHome());
    const configuration = scheduleConfiguration(home);
    const keysFile = process.env.PFDB_FDA_CREDENTIALS;
    const artifact = buildMacSchedule({
      ...configuration,
      label,
      intervalSeconds: values.interval === undefined ? undefined : seconds(values.interval),
      environment: {
        ...configuration.environment,
        ...(keysFile && { PFDB_FDA_CREDENTIALS: resolve(keysFile) }),
      },
    });
    const installed = installMacSchedule(artifact);
    print({
      event: "schedule_installed",
      label,
      interval_seconds: artifact.intervalSeconds,
      program_arguments: artifact.programArguments,
      plist: installed.plistPath,
      log_dir: artifact.logDir,
    });
  } else if (action === "status") {
    print({ event: "schedule_status", label, ...inspectInstalledSchedule({ label }) });
  } else if (action === "remove") {
    print({ event: "schedule_removed", label, ...removeMacSchedule(label) });
  } else {
    throw new UsageError(`unknown schedule action: ${action ?? "(none)"}`);
  }
}

function oneOf<T extends string>(value: string, allowed: readonly T[], flag: string): T {
  if ((allowed as readonly string[]).includes(value)) return value as T;
  throw new UsageError(`${flag} must be one of ${allowed.join(", ")}`);
}

function seconds(value: string): number {
  const parsed = Number(value);
  // launchd won't start a job more often than every ten seconds anyway.
  if (!Number.isInteger(parsed) || parsed < 10) {
    throw new UsageError("--interval must be a whole number of seconds, at least 10");
  }
  return parsed;
}

function print(value: unknown): void {
  console.log(JSON.stringify(value));
}

const [command, ...args] = Bun.argv.slice(2);
try {
  if (command === "collect") await collect(args);
  else if (command === "schedule") schedule(args);
  else throw new UsageError(`unknown command: ${command ?? "(none)"}`);
} catch (error) {
  if (error instanceof UsageError || (error as { code?: string }).code?.startsWith("ERR_PARSE")) {
    console.error(`${(error as Error).message}\n${USAGE}`);
    process.exitCode = 2;
  } else {
    console.error(JSON.stringify({ event: "error", message: (error as Error).message }));
    process.exitCode = 1;
  }
}
