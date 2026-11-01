import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  buildMacSchedule,
  CLI_PATH,
  type CommandResult,
  type CommandRunner,
  inspectInstalledSchedule,
  installMacSchedule,
  removeMacSchedule,
  SCHEDULE_LABEL,
  scheduleConfiguration,
} from "../../../src/sourcing/schedule/launchd.ts";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const SERVICE = `gui/501/${SCHEDULE_LABEL}`;
const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "pfdb-launchd-"));
  dirs.push(dir);
  return dir;
}

/** Parses a plist the way macOS does, after checking it is well formed. */
function parsePlist(plist: string): Record<string, unknown> {
  const file = join(tempDir(), "job.plist");
  writeFileSync(file, plist);
  expect(Bun.spawnSync(["plutil", "-lint", file]).exitCode).toBe(0);
  const converted = Bun.spawnSync(["plutil", "-convert", "json", "-o", "-", file]);
  return JSON.parse(converted.stdout.toString());
}

/** A launchctl stand-in that records commands and answers from a script. */
function fakeLaunchctl(answer: (command: string[]) => Partial<CommandResult> = () => ({})) {
  const calls: string[][] = [];
  const runner: CommandRunner = (command) => {
    calls.push(command);
    return { exitCode: 0, stdout: "", stderr: "", ...answer(command) };
  };
  return { calls, runner };
}

const NOT_LOADED = { exitCode: 3, stderr: "Boot-out failed: 3: No such process" };

describe("the schedule artifact (T9-A1)", () => {
  test("runs the manual collect command in live mode every four hours", () => {
    const home = join(tempDir(), "home");
    const artifact = buildMacSchedule(scheduleConfiguration(home));
    expect(artifact.intervalSeconds).toBe(14_400);
    const job = parsePlist(artifact.plist);
    expect(job).toEqual({
      Label: SCHEDULE_LABEL,
      ProgramArguments: [
        process.execPath,
        CLI_PATH,
        "collect",
        "--mode",
        "live",
        "--trigger",
        "scheduled",
      ],
      WorkingDirectory: REPO_ROOT,
      StartInterval: 14_400,
      RunAtLoad: true,
      ProcessType: "Background",
      StandardOutPath: join(home, "logs", `${SCHEDULE_LABEL}.out.log`),
      StandardErrorPath: join(home, "logs", `${SCHEDULE_LABEL}.err.log`),
      EnvironmentVariables: { PFDB_HOME: home },
    });
    // The very file manual runs use.
    expect(CLI_PATH).toBe(join(REPO_ROOT, "src", "cli.ts"));
    expect(existsSync(CLI_PATH)).toBe(true);
  });

  test("paths with XML special characters survive", () => {
    const home = join(tempDir(), "R&D <pets>");
    const job = parsePlist(buildMacSchedule(scheduleConfiguration(home)).plist);
    expect(job.EnvironmentVariables).toEqual({ PFDB_HOME: home });
  });
});

describe("installing the job (T9-A1)", () => {
  test("writes the plist, then enables and registers the job, with private logs", () => {
    const root = tempDir();
    const artifact = buildMacSchedule(scheduleConfiguration(join(root, "home")));
    const { calls, runner } = fakeLaunchctl((command) =>
      command[1] === "bootout" ? NOT_LOADED : {},
    );
    const installed = installMacSchedule(artifact, {
      runner,
      launchAgentsDir: join(root, "LaunchAgents"),
      uid: 501,
    });
    expect(installed).toEqual({
      plistPath: join(root, "LaunchAgents", `${SCHEDULE_LABEL}.plist`),
      domain: "gui/501",
    });
    expect(readFileSync(installed.plistPath, "utf8")).toBe(artifact.plist);
    expect(calls).toEqual([
      ["launchctl", "bootout", SERVICE],
      ["launchctl", "enable", SERVICE],
      ["launchctl", "bootstrap", "gui/501", installed.plistPath],
    ]);
    expect(statSync(artifact.logDir).mode & 0o777).toBe(0o700);
  });

  test("a refused registration fails the install", () => {
    const root = tempDir();
    const artifact = buildMacSchedule(scheduleConfiguration(join(root, "home")));
    const { runner } = fakeLaunchctl((command) => {
      if (command[1] === "bootout") return NOT_LOADED;
      if (command[1] === "bootstrap") {
        return { exitCode: 5, stderr: "Bootstrap failed: 5: Input/output error" };
      }
      return {};
    });
    expect(() =>
      installMacSchedule(artifact, { runner, launchAgentsDir: join(root, "LA"), uid: 501 }),
    ).toThrow("Bootstrap failed: 5");
  });

  test("reinstalling waits for launchd to remove the old job", () => {
    const root = tempDir();
    const artifact = buildMacSchedule(scheduleConfiguration(join(root, "home")));
    let bootstraps = 0;
    const { calls, runner } = fakeLaunchctl((command) =>
      command[1] === "bootstrap" && ++bootstraps === 1
        ? { exitCode: 5, stderr: "Bootstrap failed: 5: Input/output error" }
        : {},
    );
    installMacSchedule(artifact, { runner, launchAgentsDir: join(root, "LA"), uid: 501 });
    expect(calls.map((command) => command[1])).toEqual([
      "bootout",
      "enable",
      "bootstrap",
      "bootstrap",
    ]);
  });

  test("removing unregisters the job and deletes its plist", () => {
    const root = tempDir();
    const artifact = buildMacSchedule(scheduleConfiguration(join(root, "home")));
    const launchAgentsDir = join(root, "LA");
    const { runner } = fakeLaunchctl((command) => (command[1] === "bootout" ? NOT_LOADED : {}));
    const { plistPath } = installMacSchedule(artifact, { runner, launchAgentsDir, uid: 501 });
    const removal = fakeLaunchctl();
    expect(removeMacSchedule(SCHEDULE_LABEL, { ...removal, launchAgentsDir, uid: 501 })).toEqual({
      wasRegistered: true,
      plistPath,
    });
    expect(removal.calls).toEqual([["launchctl", "bootout", SERVICE]]);
    expect(existsSync(plistPath)).toBe(false);
  });
});

// Shaped like real `launchctl print` output; the paths are made up.
const PRINTED = [
  `${SERVICE} = {`,
  "\tactive count = 0",
  `\tpath = /opt/pfdb/LaunchAgents/${SCHEDULE_LABEL}.plist`,
  "\ttype = LaunchAgent",
  "\tstate = not running",
  "",
  "\tprogram = /opt/pfdb/bin/bun",
  "\targuments = {",
  "\t\t/opt/pfdb/bin/bun",
  "\t\t/opt/pfdb/repo/src/cli.ts",
  "\t\tcollect",
  "\t\t--mode",
  "\t\tlive",
  "\t\t--trigger",
  "\t\tscheduled",
  "\t}",
  "",
  "\tworking directory = /opt/pfdb/repo",
  "\tstdout path = /opt/pfdb/home/logs/collect.out.log",
  "\tstderr path = /opt/pfdb/home/logs/collect.err.log",
  "\tenvironment = {",
  `\t\tXPC_SERVICE_NAME => ${SCHEDULE_LABEL}`,
  "\t}",
  "",
  "\tdomain = gui/501 [100023]",
  "\truns = 3",
  "\tlast exit code = 0",
  "",
  "\tresource coalition = {",
  "\t\tstate = active",
  "\t}",
  "",
  "\trun interval = 14400 seconds",
  "}",
].join("\n");

function launchdReports(override: string | undefined) {
  return fakeLaunchctl((command) => {
    if (command[1] === "print") return { stdout: PRINTED };
    const entry = override === undefined ? "" : `\t\t"${SCHEDULE_LABEL}" => ${override}\n`;
    return {
      stdout: `\tdisabled services = {\n\t\t"com.example.other" => disabled\n${entry}\t}\n`,
    };
  });
}

describe("schedule status reads launchd itself (T9-A1)", () => {
  test("reports registration, enablement, interval, command line, outputs and runs", () => {
    const { calls, runner } = launchdReports("enabled");
    expect(inspectInstalledSchedule({ runner, uid: 501 })).toEqual({
      registered: true,
      enabled: true,
      state: "not running",
      intervalSeconds: 14_400,
      program: "/opt/pfdb/bin/bun",
      arguments: [
        "/opt/pfdb/bin/bun",
        "/opt/pfdb/repo/src/cli.ts",
        "collect",
        "--mode",
        "live",
        "--trigger",
        "scheduled",
      ],
      stdoutPath: "/opt/pfdb/home/logs/collect.out.log",
      stderrPath: "/opt/pfdb/home/logs/collect.err.log",
      runs: 3,
      lastExitCode: "0",
    });
    expect(calls).toEqual([
      ["launchctl", "print", SERVICE],
      ["launchctl", "print-disabled", "gui/501"],
    ]);
  });

  test("a job the owner disabled is reported disabled", () => {
    expect(inspectInstalledSchedule({ ...launchdReports("disabled"), uid: 501 }).enabled).toBe(
      false,
    );
    expect(inspectInstalledSchedule({ ...launchdReports("true"), uid: 501 }).enabled).toBe(false);
    expect(inspectInstalledSchedule({ ...launchdReports(undefined), uid: 501 }).enabled).toBe(true);
  });

  test("a job launchd doesn't know is not registered, whatever files exist", () => {
    const { runner } = fakeLaunchctl(() => ({
      exitCode: 113,
      stderr: `Could not find service "${SCHEDULE_LABEL}" in domain for user gui: 501`,
    }));
    expect(inspectInstalledSchedule({ runner, uid: 501 })).toEqual({
      registered: false,
      enabled: false,
    });
  });
});
