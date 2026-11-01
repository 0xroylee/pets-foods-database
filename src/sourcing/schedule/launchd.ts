// The per-user Mac schedule: a launchd LaunchAgent that runs the same collect command as a
// manual run, every four hours. Installing registers and enables the job; a plist file on its
// own schedules nothing, so status reads what launchd reports rather than the file.

import { chmodSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { logDir } from "../app-home.ts";

export const SCHEDULE_LABEL = "com.github.0xroylee.pets-foods-database.collect";
export const SCHEDULE_INTERVAL_SECONDS = 4 * 60 * 60;
export const LAUNCH_AGENTS_DIR = join(homedir(), "Library", "LaunchAgents");
/** The command line manual runs use; the schedule runs this same file. */
export const CLI_PATH = resolve(import.meta.dir, "../../cli.ts");
export const REPO_ROOT = resolve(import.meta.dir, "../../..");

export interface ScheduleConfiguration {
  bunPath: string;
  cliPath: string;
  workingDirectory: string;
  /** Private folder for the job's output; created with owner-only permissions. */
  logDir: string;
  label?: string;
  intervalSeconds?: number;
  environment?: Record<string, string>;
}

export interface ScheduleArtifact {
  label: string;
  intervalSeconds: number;
  programArguments: string[];
  stdoutPath: string;
  stderrPath: string;
  logDir: string;
  plist: string;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export type CommandRunner = (command: string[]) => CommandResult;

export const runCommand: CommandRunner = (command) => {
  const result = Bun.spawnSync({ cmd: command, stdout: "pipe", stderr: "pipe" });
  return {
    exitCode: result.exitCode ?? 1,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
};

/** This checkout's command line, run by the bun that installs the job, writing to home. */
export function scheduleConfiguration(home: string): ScheduleConfiguration {
  return {
    bunPath: process.execPath,
    cliPath: CLI_PATH,
    workingDirectory: REPO_ROOT,
    logDir: logDir(home),
    environment: { PFDB_HOME: home },
  };
}

export function buildMacSchedule(config: ScheduleConfiguration): ScheduleArtifact {
  const label = config.label ?? SCHEDULE_LABEL;
  const intervalSeconds = config.intervalSeconds ?? SCHEDULE_INTERVAL_SECONDS;
  const programArguments = [
    config.bunPath,
    config.cliPath,
    "collect",
    "--mode",
    "live",
    "--trigger",
    "scheduled",
  ];
  const stdoutPath = join(config.logDir, `${label}.out.log`);
  const stderrPath = join(config.logDir, `${label}.err.log`);
  const environment = Object.entries(config.environment ?? {});
  const plist = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    "<dict>",
    `  <key>Label</key><string>${xml(label)}</string>`,
    "  <key>ProgramArguments</key>",
    "  <array>",
    ...programArguments.map((arg) => `    <string>${xml(arg)}</string>`),
    "  </array>",
    `  <key>WorkingDirectory</key><string>${xml(config.workingDirectory)}</string>`,
    `  <key>StartInterval</key><integer>${intervalSeconds}</integer>`,
    "  <key>RunAtLoad</key><true/>",
    "  <key>ProcessType</key><string>Background</string>",
    `  <key>StandardOutPath</key><string>${xml(stdoutPath)}</string>`,
    `  <key>StandardErrorPath</key><string>${xml(stderrPath)}</string>`,
    ...(environment.length > 0
      ? [
          "  <key>EnvironmentVariables</key>",
          "  <dict>",
          ...environment.map(
            ([key, value]) => `    <key>${xml(key)}</key><string>${xml(value)}</string>`,
          ),
          "  </dict>",
        ]
      : []),
    "</dict>",
    "</plist>",
    "",
  ].join("\n");
  return {
    label,
    intervalSeconds,
    programArguments,
    stdoutPath,
    stderrPath,
    logDir: config.logDir,
    plist,
  };
}

export interface LaunchdOptions {
  runner?: CommandRunner;
  launchAgentsDir?: string;
  uid?: number;
}

export interface InstalledSchedule {
  plistPath: string;
  domain: string;
}

/** Writes the plist, then enables and registers (bootstraps) the job for this user. */
export function installMacSchedule(
  artifact: ScheduleArtifact,
  options: LaunchdOptions = {},
): InstalledSchedule {
  const runner = options.runner ?? runCommand;
  const domain = userDomain(options.uid);
  const service = `${domain}/${artifact.label}`;
  mkdirSync(artifact.logDir, { recursive: true, mode: 0o700 });
  chmodSync(artifact.logDir, 0o700);
  const plistPath = plistPathFor(artifact.label, options);
  mkdirSync(dirname(plistPath), { recursive: true });
  writeFileSync(plistPath, artifact.plist, { mode: 0o644 });
  // Replace any earlier registration so the new definition takes effect.
  const replaced = runner(["launchctl", "bootout", service]).exitCode === 0;
  // Enable first: launchd refuses to bootstrap a job the owner disabled earlier.
  check(runner, ["launchctl", "enable", service]);
  // Right after a bootout launchd may still be tearing the old job down; give it a moment.
  for (let attempt = 1; ; attempt++) {
    const command = ["launchctl", "bootstrap", domain, plistPath];
    const result = runner(command);
    if (result.exitCode === 0) break;
    if (!replaced || attempt === 4) fail(command, result);
    Bun.sleepSync(500);
  }
  return { plistPath, domain };
}

/** Unregisters the job and deletes its plist, as for the isolated verification job. */
export function removeMacSchedule(
  label: string,
  options: LaunchdOptions = {},
): { wasRegistered: boolean; plistPath: string } {
  const runner = options.runner ?? runCommand;
  const plistPath = plistPathFor(label, options);
  const bootout = runner(["launchctl", "bootout", `${userDomain(options.uid)}/${label}`]);
  rmSync(plistPath, { force: true });
  return { wasRegistered: bootout.exitCode === 0, plistPath };
}

export interface InstalledScheduleStatus {
  registered: boolean;
  enabled: boolean;
  state?: string;
  intervalSeconds?: number;
  program?: string;
  arguments?: string[];
  stdoutPath?: string;
  stderrPath?: string;
  /** How many times launchd itself has started the job since it was registered. */
  runs?: number;
  lastExitCode?: string;
}

/** What launchd itself reports about the job, not what the plist file says. */
export function inspectInstalledSchedule(
  options: { label?: string; runner?: CommandRunner; uid?: number } = {},
): InstalledScheduleStatus {
  const runner = options.runner ?? runCommand;
  const label = options.label ?? SCHEDULE_LABEL;
  const domain = userDomain(options.uid);
  const printed = runner(["launchctl", "print", `${domain}/${label}`]);
  if (printed.exitCode !== 0) return { registered: false, enabled: false };
  const overrides = runner(["launchctl", "print-disabled", domain]).stdout;
  const override = new RegExp(`"${escapeRegExp(label)}"\\s*=>\\s*(\\w+)`).exec(overrides)?.[1];
  // Older macOS versions print true/false (disabled or not) instead of disabled/enabled.
  const enabled = override !== "disabled" && override !== "true";

  // Top-level properties are indented by one tab; nested blocks by more.
  const lines = printed.stdout.split("\n");
  const fields = new Map<string, string>();
  for (const line of lines) {
    const match = /^\t([^\t=][^=]*?) = (.*)$/.exec(line);
    if (match?.[1] && match[2] !== undefined && !fields.has(match[1])) {
      fields.set(match[1], match[2]);
    }
  }
  const argumentsStart = lines.indexOf("\targuments = {");
  const argumentsEnd = lines.indexOf("\t}", argumentsStart);
  const interval = /^(\d+) seconds$/.exec(fields.get("run interval") ?? "")?.[1];
  const runs = fields.get("runs");
  return {
    registered: true,
    enabled,
    state: fields.get("state"),
    intervalSeconds: interval === undefined ? undefined : Number(interval),
    program: fields.get("program"),
    arguments:
      argumentsStart === -1 || argumentsEnd === -1
        ? undefined
        : lines.slice(argumentsStart + 1, argumentsEnd).map((line) => line.trim()),
    stdoutPath: fields.get("stdout path"),
    stderrPath: fields.get("stderr path"),
    runs: runs === undefined ? undefined : Number(runs),
    lastExitCode: fields.get("last exit code"),
  };
}

function userDomain(uid?: number): string {
  const id = uid ?? process.getuid?.();
  if (id === undefined) throw new Error("the Mac schedule needs a user ID");
  return `gui/${id}`;
}

function plistPathFor(label: string, options: LaunchdOptions): string {
  return join(options.launchAgentsDir ?? LAUNCH_AGENTS_DIR, `${label}.plist`);
}

function check(runner: CommandRunner, command: string[]): void {
  const result = runner(command);
  if (result.exitCode !== 0) fail(command, result);
}

function fail(command: string[], result: CommandResult): never {
  const detail = result.stderr.trim() || result.stdout.trim() || `exit ${result.exitCode}`;
  throw new Error(`${command.join(" ")} failed: ${detail}`);
}

function xml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
