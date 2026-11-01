import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  type CollectionHealth,
  collectionHealth,
  type SourceReport,
} from "../../../src/sourcing/collect/health.ts";
import {
  type CollectorAdapter,
  DEADLINE_MESSAGE,
  type PageRecord,
  runCollection,
} from "../../../src/sourcing/collect/runner.ts";
import { WorkQueue } from "../../../src/sourcing/collect/work-queue.ts";
import { type FetchResult, LiveTransport } from "../../../src/sourcing/http/transport.ts";
import { RawStore } from "../../../src/sourcing/store/raw-store.ts";
import {
  drive,
  FakeClock,
  okResult,
  pagedAdapter,
  pagedTransport,
  routingTransport,
  scriptedTransport,
  singleItemAdapter,
  T0,
  testRecord,
} from "../collect/helpers.ts";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const CLI = join(REPO_ROOT, "src", "cli.ts");
const CHILD_RUN = join(REPO_ROOT, "test", "sourcing", "collect", "child-run.ts");
const DAY = 24 * 60 * 60_000;
const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "pfdb-health-"));
  dirs.push(dir);
  return dir;
}

function storePath(): string {
  return join(tempDir(), "raw.sqlite");
}

/** Health as a later process sees it: the store is reopened from disk. */
function healthAfterReopen(path: string, now: number): CollectionHealth {
  const store = RawStore.open(path);
  try {
    return collectionHealth(store.database, { now });
  } finally {
    store.close();
  }
}

function sourceOf(health: CollectionHealth, key: string): SourceReport {
  const source = health.sources.find((report) => report.source === key);
  if (!source) throw new Error(`no health report for ${key}`);
  return source;
}

const iso = (ms: number) => new Date(ms).toISOString();
const result = (status: number): FetchResult => ({ ...okResult(""), status });

const MIXED_ORIGIN = "https://mixed.test";

/** Page 1 stores X and Y; page 2 brings a new Z, a changed X and an unchanged Y. */
function mixedAdapter(): CollectorAdapter {
  const record = (key: string, body: string, url: string): PageRecord => ({
    identity: { namespace: "mixed", key },
    record: testRecord(key, url, body),
  });
  const page = (n: number) => ({
    workKey: `page:${n}`,
    origin: MIXED_ORIGIN,
    request: { method: "GET" as const, url: `${MIXED_ORIGIN}/page/${n}` },
  });
  return {
    key: "mixed",
    seed: () => [page(1)],
    handle: (response, work) =>
      work.workKey === "page:1"
        ? {
            records: [record("X", "x-v1", response.url), record("Y", "y-v1", response.url)],
            successors: [page(2)],
            checkpoint: { page: 1 },
          }
        : {
            records: [
              record("Z", "z-v1", response.url),
              record("X", "x-v2", response.url),
              record("Y", "y-v1", response.url),
            ],
            checkpoint: { page: 2 },
          },
  };
}

describe("fetched documents and committed counts (T10-A1)", () => {
  test("after reopening, health names each fetched document and the exact new, changed and duplicate counts", async () => {
    const path = storePath();
    const store = RawStore.open(path);
    const clock = new FakeClock();
    const { transport } = scriptedTransport(clock, () => result(200));
    const run = runCollection({
      store,
      adapters: [mixedAdapter()],
      transport,
      clock,
      mode: "fixture",
      trigger: "manual",
    });
    const summary = await drive(clock, run);
    store.close();

    const health = healthAfterReopen(path, clock.now());
    const mixed = sourceOf(health, "mixed");
    const [page2, page1] = mixed.fetched;
    expect(page2?.committed).toEqual({ new: 1, changed: 1, duplicate: 1 });
    expect(page2).toMatchObject({
      workKey: "page:2",
      locator: `GET ${MIXED_ORIGIN}/page/2`,
      fetchedAt: iso(T0 + 1_000),
      documents: [
        { namespace: "mixed", key: "Z", disposition: "new" },
        { namespace: "mixed", key: "X", disposition: "changed" },
        { namespace: "mixed", key: "Y", disposition: "duplicate" },
      ],
    });
    expect(page1).toMatchObject({
      workKey: "page:1",
      locator: `GET ${MIXED_ORIGIN}/page/1`,
      committed: { new: 2, changed: 0, duplicate: 0 },
      documents: [
        { namespace: "mixed", key: "X", disposition: "new" },
        { namespace: "mixed", key: "Y", disposition: "new" },
      ],
    });
    expect(mixed).toMatchObject({
      committed: { new: 3, changed: 1, duplicate: 1 },
      work: { pending: 0, completed: 2, refused: 0, failed: 0 },
      progress: { page: 2 },
      attemptsByOutcome: { success: 2 },
      failures: [],
      cooldowns: [],
    });
    expect(summary.committed).toEqual({ new: 3, changed: 1, duplicate: 1 });
    expect(health.runs).toEqual([
      {
        runId: summary.runId,
        mode: "fixture",
        trigger: "manual",
        startedAt: iso(T0),
        finishedAt: iso(T0 + 1_000),
        status: "completed",
        detail: null,
        attempts: 2,
        committedPages: 2,
        committed: { new: 3, changed: 1, duplicate: 1 },
      },
    ]);
  });
});

describe("attempt history (T10-A2)", () => {
  test("a failure followed by a successful retry keeps both attempts, with their own IDs, reasons and times", async () => {
    const path = storePath();
    const store = RawStore.open(path);
    const clock = new FakeClock();
    const origin = "https://retry.test";
    const { transport } = scriptedTransport(clock, (call) => result(call === 1 ? 500 : 200));
    const adapters = [singleItemAdapter("retry", origin)];
    await drive(clock, runCollection({ store, adapters, transport, clock }));
    store.close();

    const retry = sourceOf(healthAfterReopen(path, clock.now()), "retry");
    expect(retry.failures).toEqual([
      {
        attemptId: expect.any(Number),
        runId: expect.any(String),
        workKey: "item",
        locator: `GET ${origin}/item`,
        startedAt: iso(T0),
        finishedAt: iso(T0),
        outcome: "transient_error",
        detail: "HTTP 500",
        httpStatus: 500,
        deadlineStage: null,
      },
    ]);
    expect(retry.fetched).toHaveLength(1);
    expect(retry.fetched[0]?.attemptId).not.toBe(retry.failures[0]?.attemptId);
    // The retry waited out the 5 s backoff.
    expect(retry.fetched[0]?.fetchedAt).toBe(iso(T0 + 5_000));
    expect(retry.attemptsByOutcome).toEqual({ success: 1, transient_error: 1 });
  });

  test("a refusal stays inspectable with its locator, and success in a later run keeps it", async () => {
    const path = storePath();
    const clock = new FakeClock();
    const origin = "https://guarded.test";
    const { transport } = scriptedTransport(clock, (call) => result(call === 1 ? 403 : 200));
    const adapters = [singleItemAdapter("guarded", origin)];
    let store = RawStore.open(path);
    await drive(clock, runCollection({ store, adapters, transport, clock }));
    store.close();

    const refusal = {
      workKey: "item",
      locator: `GET ${origin}/item`,
      startedAt: iso(T0),
      finishedAt: iso(T0),
      outcome: "refused",
      detail: "HTTP 403 refused",
      httpStatus: 403,
      deadlineStage: null,
    };
    const afterRefusal = sourceOf(healthAfterReopen(path, clock.now()), "guarded");
    expect(afterRefusal.failures).toMatchObject([refusal]);
    expect(afterRefusal.cooldowns).toEqual([
      {
        workKey: "item",
        locator: `GET ${origin}/item`,
        until: iso(T0 + DAY),
        reason: "refused: HTTP 403 refused",
      },
    ]);
    expect(afterRefusal.work).toMatchObject({ refused: 1, completed: 0 });

    // A run after the cooldown succeeds, and the refusal stays on record.
    await clock.advance(DAY);
    const secondRunAt = clock.now();
    store = RawStore.open(path);
    await drive(clock, runCollection({ store, adapters, transport, clock }));
    store.close();
    const later = healthAfterReopen(path, clock.now());
    const guarded = sourceOf(later, "guarded");
    expect(guarded.failures).toMatchObject([refusal]);
    expect(guarded.fetched.map((fetch) => fetch.fetchedAt)).toEqual([iso(secondRunAt)]);
    expect(guarded.cooldowns).toEqual([]);
    expect(guarded.work).toMatchObject({ refused: 0, completed: 1 });
    expect(later.runs.map((run) => run.status)).toEqual(["deferred", "completed"]);
  });

  test("a run whose process dies is reported interrupted, with its unfinished attempt", async () => {
    const path = storePath();
    const child = Bun.spawn([process.execPath, CHILD_RUN, path, "mid-page-2-records"], {
      stdout: "ignore",
      stderr: "pipe",
    });
    await child.exited;
    expect(child.signalCode).toBe("SIGKILL");

    const store = RawStore.open(path);
    const { transport } = pagedTransport();
    const adapters = [pagedAdapter()];
    await runCollection({ store, adapters, transport, limits: { originSpacingMs: 0 } });
    store.close();

    const health = healthAfterReopen(path, Date.now());
    expect(health.runs.map((run) => run.status)).toEqual(["interrupted", "completed"]);
    const paged = sourceOf(health, "paged");
    expect(paged.failures.map((failure) => [failure.workKey, failure.outcome])).toEqual([
      ["page:2", "interrupted"],
    ]);
    expect(paged.committed).toEqual({ new: 12, changed: 0, duplicate: 0 });
  });

  test("a finished attempt is final", async () => {
    const store = RawStore.open(storePath());
    const clock = new FakeClock();
    const { transport } = scriptedTransport(clock, () => result(200));
    const adapters = [singleItemAdapter("once", "https://once.test")];
    await drive(clock, runCollection({ store, adapters, transport, clock }));
    const queue = new WorkQueue(store.database);
    const [attempt] = queue.attempts("once");
    const attemptId = attempt?.attemptId as number;

    queue.finishAttempt(attemptId, "transient_error", T0 + 1, { detail: "late" });
    expect(queue.attempts("once")[0]).toMatchObject({ outcome: "success", detail: null });
    expect(() =>
      store.database.run("UPDATE fetch_attempt SET outcome = 'refused' WHERE attempt_id = ?", [
        attemptId,
      ]),
    ).toThrow("finished fetch attempts are final");
    expect(() => store.database.run("DELETE FROM fetch_attempt")).toThrow("never deleted");
    expect(() => store.database.run("DELETE FROM collection_run")).toThrow("never deleted");
    store.close();
  });
});

describe("one source's trouble never stops another (T10-A3)", () => {
  const HEALTHY_ORIGIN = "https://healthy.test";

  function healthyCommitted(store: RawStore): boolean {
    return store.history("test-source", { namespace: "healthy", key: "item" }).length > 0;
  }

  test("an adapter that throws while parsing is recorded and a later adapter still commits", async () => {
    const path = storePath();
    const store = RawStore.open(path);
    const clock = new FakeClock();
    const parseOrigin = "https://parse.test";
    const parsing: CollectorAdapter = {
      ...singleItemAdapter("parsing", parseOrigin),
      handle: () => {
        throw new SyntaxError("Unexpected token '<' in JSON");
      },
    };
    const { transport } = scriptedTransport(clock, () => result(200));
    const adapters = [parsing, singleItemAdapter("healthy", HEALTHY_ORIGIN)];
    const run = runCollection({
      store,
      adapters,
      transport,
      clock,
      limits: { maxTransientAttemptsPerRun: 1 },
    });
    await drive(clock, run);
    expect(healthyCommitted(store)).toBe(true);
    store.close();

    const health = healthAfterReopen(path, clock.now());
    expect(sourceOf(health, "parsing").failures).toMatchObject([
      {
        locator: `GET ${parseOrigin}/item`,
        startedAt: iso(T0),
        outcome: "transient_error",
        detail: "adapter: Unexpected token '<' in JSON",
        httpStatus: 200,
      },
    ]);
    expect(sourceOf(health, "healthy").committed).toEqual({ new: 1, changed: 0, duplicate: 0 });
  });

  test("an adapter whose seed throws is recorded and the other sources still run", async () => {
    const path = storePath();
    const store = RawStore.open(path);
    const clock = new FakeClock();
    const broken: CollectorAdapter = {
      key: "broken",
      seed: () => {
        throw new Error("listing page moved");
      },
      handle: () => ({ records: [] }),
    };
    const { transport } = scriptedTransport(clock, () => result(200));
    const adapters = [broken, singleItemAdapter("healthy", HEALTHY_ORIGIN)];
    const summary = await drive(clock, runCollection({ store, adapters, transport, clock }));
    expect(summary.status).toBe("completed");
    expect(healthyCommitted(store)).toBe(true);
    store.close();

    const health = healthAfterReopen(path, clock.now());
    expect(sourceOf(health, "broken").adapterErrors).toEqual([
      { runId: summary.runId, stage: "seed", occurredAt: iso(T0), detail: "listing page moved" },
    ]);
    expect(sourceOf(health, "healthy").committed).toEqual({ new: 1, changed: 0, duplicate: 0 });
  });

  for (const stall of ["headers", "body"] as const) {
    test(`stalled ${stall} in the first source end at the deadline with that stage, and the later source commits in time`, async () => {
      const path = storePath();
      const store = RawStore.open(path);
      const clock = new FakeClock();
      const stallOrigin = "https://stall.test";
      const signals: AbortSignal[] = [];
      const stallingFetch = (async (_url: string, init: RequestInit) => {
        const signal = init.signal as AbortSignal;
        signals.push(signal);
        if (stall === "headers") {
          return new Promise<Response>((_, reject) => {
            signal.addEventListener("abort", () => reject(new Error("aborted")));
          });
        }
        const body = new ReadableStream<Uint8Array>({ pull: () => new Promise<void>(() => {}) });
        return new Response(body, { status: 200 });
      }) as unknown as typeof fetch;
      const transport = routingTransport({
        [stallOrigin]: new LiveTransport({ fetch: stallingFetch, credentialOrigins: [] }),
        [HEALTHY_ORIGIN]: scriptedTransport(clock, () => result(200)).transport,
      });
      const adapters = [
        singleItemAdapter("stalled", stallOrigin),
        singleItemAdapter("healthy", HEALTHY_ORIGIN),
      ];
      const run = runCollection({ store, adapters, transport, clock });

      // Bounded progress: the healthy source commits once the stalled request's 30 s deadline
      // has passed, before any retry of the stalled one.
      const bound = T0 + 30_000 + 1_000;
      while (clock.now() < bound && !healthyCommitted(store)) await clock.advance(500);
      if (!healthyCommitted(store)) {
        throw new Error(`healthy later source did not commit after the stalled-${stall} deadline`);
      }
      // The watchdog: a run that never settles fails here instead of hanging the test.
      await drive(clock, run, { maxMs: 5 * 60_000 });
      store.close();

      expect(signals[0]?.aborted).toBe(true);
      const stalled = sourceOf(healthAfterReopen(path, clock.now()), "stalled");
      expect(stalled.failures[0]).toEqual({
        attemptId: expect.any(Number),
        runId: expect.any(String),
        workKey: "item",
        locator: `GET ${stallOrigin}/item`,
        startedAt: iso(T0),
        finishedAt: iso(T0 + 30_000),
        outcome: "deadline_exceeded",
        detail: `${DEADLINE_MESSAGE} (${stall})`,
        httpStatus: stall === "body" ? 200 : null,
        deadlineStage: stall,
      });
      expect(stalled.attemptsByOutcome).toEqual({ deadline_exceeded: 3 });
    });
  }
});

describe("the health command", () => {
  test("reports runs from the store and never creates one", async () => {
    const home = tempDir();
    const env = { ...process.env, PFDB_HOME: home, PFDB_FDA_CREDENTIALS: join(home, "none") };
    const cli = async (...args: string[]) => {
      const child = Bun.spawn([process.execPath, CLI, ...args], { env, stdout: "pipe" });
      expect(await child.exited).toBe(0);
      return JSON.parse(await new Response(child.stdout).text());
    };
    expect(await cli("health", "--mode", "fixture")).toEqual({
      event: "collection_health",
      mode: "fixture",
      store: "missing",
    });
    await cli("collect", "--mode", "fixture");
    const report = await cli("health", "--mode", "fixture");
    expect(report.runs).toMatchObject([
      { mode: "fixture", trigger: "manual", status: "completed" },
    ]);
    expect(report.sources).toEqual([]);
  });
});
