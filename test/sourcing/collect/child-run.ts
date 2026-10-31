// Child process for crash tests: runs a paged collection and kills itself with SIGKILL at a
// chosen moment, so the parent can check what survived. Usage: bun child-run.ts <db> <mode>
//   mid-page-2-records    die while page 2's records are being committed
//   before-page-3-request die just as page 3 is requested, after page 2 committed

import { runCollection } from "../../../src/sourcing/collect/runner.ts";
import { RawStore } from "../../../src/sourcing/store/raw-store.ts";
import { pagedAdapter, pagedTransport } from "./helpers.ts";

const [dbPath, mode] = Bun.argv.slice(2);
if (!dbPath || !mode) throw new Error("usage: bun child-run.ts <db> <mode>");

const die = () => process.kill(process.pid, "SIGKILL");
const store = RawStore.open(dbPath);
const adapter = pagedAdapter({
  onRecord: (page, index) => {
    if (mode === "mid-page-2-records" && page === 2 && index === 1) die();
  },
});
const { transport } = pagedTransport({
  onRequest: (page) => {
    if (mode === "before-page-3-request" && page === 3) die();
  },
});
await runCollection({ store, adapters: [adapter], transport, limits: { originSpacingMs: 0 } });
store.close();
