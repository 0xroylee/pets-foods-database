// Child process for entry-point tests: a real run through runCollectCommand that stays inside
// its one page until told to finish, so the test can contend with it, pause it or kill it.
//   bun collect-child.ts <home> <signalDir> <name> <manual|scheduled>
// Signals in <signalDir>: <name>.active once the run is mid-page (it holds the run lock by
// then); the run finishes after <name>.release appears and prints its result as one line.

import { resolve } from "node:path";
import { runCollectCommand, type Trigger } from "../../../src/sourcing/collect/command.ts";
import type { CollectorAdapter } from "../../../src/sourcing/collect/runner.ts";
import { singleItemAdapter } from "../collect/helpers.ts";
import { signalPath, waitForSignalSync, writeSignal } from "./signals.ts";

const HELD_ORIGIN = "https://held-run.test";

const [home, dir, name, trigger] = Bun.argv.slice(2);
if (!home || !dir || !name || (trigger !== "manual" && trigger !== "scheduled")) {
  throw new Error("usage: bun collect-child.ts <home> <signalDir> <name> <manual|scheduled>");
}

// A key per child, so a later child in the same home has its own work to do.
const inner = singleItemAdapter(`held-run-${name}`, HELD_ORIGIN);
const adapter: CollectorAdapter = {
  ...inner,
  handle: (result, work) => {
    writeSignal(signalPath(dir, name, "active"));
    waitForSignalSync(signalPath(dir, name, "release"));
    return inner.handle(result, work);
  },
};

const result = await runCollectCommand({
  home,
  requested: "fixture",
  trigger: trigger as Trigger,
  repoRoot: resolve(import.meta.dir, "../../.."),
  credentialsPath: resolve(home, "no-keys.json"),
  sources: {
    adapters: [adapter],
    fixtures: [
      {
        request: { method: "GET", url: `${HELD_ORIGIN}/item` },
        response: { status: 200, headers: {}, body: '{"held":true}', encoding: "utf8" },
        provenance: { recorded_at: "2026-11-01T00:00:00Z", synthetic: true, note: "test run" },
      },
    ],
    credentialOrigins: [],
  },
  limits: { originSpacingMs: 0 },
});
console.log(JSON.stringify(result));
