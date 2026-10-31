import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  type CollectorAdapter,
  DEADLINE_MESSAGE,
  runCollection,
} from "../../../src/sourcing/collect/runner.ts";
import { WorkQueue } from "../../../src/sourcing/collect/work-queue.ts";
import { type FetchResult, LiveTransport } from "../../../src/sourcing/http/transport.ts";
import { RawStore } from "../../../src/sourcing/store/raw-store.ts";
import {
  allPagedIds,
  drive,
  FakeClock,
  flush,
  okResult,
  pagedAdapter,
  pagedTransport,
  routingTransport,
  scriptedTransport,
  singleItemAdapter,
  T0,
  testRecord,
} from "./helpers.ts";

const CHILD = join(import.meta.dir, "child-run.ts");
const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function storePath(): string {
  const dir = mkdtempSync(join(tmpdir(), "pfdb-runner-"));
  dirs.push(dir);
  return join(dir, "raw.sqlite");
}

function result(status: number, headers: Record<string, string> = {}): FetchResult {
  return { ...okResult("", "{}", headers), status };
}

function pagedIds(store: RawStore): string[] {
  return store.database
    .query<{ k: string }, []>(
      "SELECT source_document_key AS k FROM raw_document WHERE identity_namespace = 'paged_item'",
    )
    .all()
    .map((row) => row.k)
    .sort();
}

describe("pacing and retries (T5-A1)", () => {
  test("Retry-After: 120 holds the next request for 120 s, also after reopening", async () => {
    const path = storePath();
    const clock = new FakeClock();
    const { transport, dispatchedAt } = scriptedTransport(clock, (call) =>
      call === 1 ? result(503, { "retry-after": "120" }) : result(200),
    );
    const adapters = [singleItemAdapter("limited", "https://limited.test")];
    const limits = { originSpacingMs: 1_000, backoffBaseMs: 1_000, maxInRunWaitMs: 60_000 };

    let store = RawStore.open(path);
    const first = await drive(clock, runCollection({ store, adapters, transport, clock, limits }));
    expect(first.status).toBe("deferred");
    const queue = new WorkQueue(store.database);
    expect(queue.workEligibleAt("limited", "item")).toBeGreaterThanOrEqual(T0 + 120_000);
    expect(queue.originNextAllowed("https://limited.test")).toBeGreaterThanOrEqual(T0 + 120_000);
    store.close();

    await clock.advance(60_000);
    store = RawStore.open(path);
    const second = await drive(clock, runCollection({ store, adapters, transport, clock, limits }));
    expect(second.status).toBe("completed");
    expect(dispatchedAt).toHaveLength(2);
    expect((dispatchedAt[1] as number) - T0).toBeGreaterThanOrEqual(120_000);
    store.close();
  });

  test("an HTTP-date Retry-After beyond base spacing is honored", async () => {
    const store = RawStore.open(storePath());
    const clock = new FakeClock();
    const retryAt = new Date(T0 + 200_000).toUTCString();
    const { transport, dispatchedAt } = scriptedTransport(clock, (call) =>
      call === 1 ? result(429, { "Retry-After": retryAt }) : result(200),
    );
    const adapters = [singleItemAdapter("dated", "https://dated.test")];
    const limits = { originSpacingMs: 1_000, backoffBaseMs: 1_000, maxInRunWaitMs: 60_000 };
    await drive(clock, runCollection({ store, adapters, transport, clock, limits }));
    expect(new WorkQueue(store.database).workEligibleAt("dated", "item")).toBe(T0 + 200_000);
    await clock.advance(150_000);
    await drive(clock, runCollection({ store, adapters, transport, clock, limits }));
    expect((dispatchedAt[1] as number) - T0).toBeGreaterThanOrEqual(200_000);
    store.close();
  });

  test("a request is tried at most three times per run, and again in the next run", async () => {
    const store = RawStore.open(storePath());
    const clock = new FakeClock();
    const { transport, dispatchedAt } = scriptedTransport(clock, () => result(500));
    const adapters = [singleItemAdapter("flaky", "https://flaky.test")];
    const limits = { backoffBaseMs: 1_000, maxInRunWaitMs: 60_000 };
    const first = await drive(clock, runCollection({ store, adapters, transport, clock, limits }));
    expect(first.status).toBe("deferred");
    expect(dispatchedAt).toHaveLength(3);
    await drive(clock, runCollection({ store, adapters, transport, clock, limits }));
    expect(dispatchedAt).toHaveLength(6);
    store.close();
  });

  test("a refusal is recorded and not retried at once", async () => {
    const store = RawStore.open(storePath());
    const clock = new FakeClock();
    const { transport, dispatchedAt } = scriptedTransport(clock, () => result(401));
    const adapters = [singleItemAdapter("refused", "https://refused.test")];
    const summary = await drive(clock, runCollection({ store, adapters, transport, clock }));
    expect(summary.status).toBe("completed");
    expect(dispatchedAt).toHaveLength(1);
    const queue = new WorkQueue(store.database);
    expect(queue.attempts("refused").map((a) => [a.outcome, a.httpStatus])).toEqual([
      ["refused", 401],
    ]);
    expect(queue.workEligibleAt("refused", "item")).toBe(T0 + 24 * 60 * 60_000);
    store.close();
  });

  test("a refusal whose body stalls stays a refusal", async () => {
    const store = RawStore.open(storePath());
    const clock = new FakeClock();
    const stalledRefusal = (async () =>
      new Response(new ReadableStream({ pull: () => new Promise(() => {}) }), {
        status: 403,
      })) as unknown as typeof fetch;
    const transport = new LiveTransport({ fetch: stalledRefusal, credentialOrigins: [] });
    const adapters = [singleItemAdapter("refused", "https://refused.test")];
    await drive(clock, runCollection({ store, adapters, transport, clock }));
    const attempts = new WorkQueue(store.database).attempts("refused");
    expect(attempts.map((a) => [a.outcome, a.detail])).toEqual([
      ["refused", `${DEADLINE_MESSAGE} (body)`],
    ]);
    store.close();
  });

  test("requests to one origin are at least one second apart", async () => {
    const store = RawStore.open(storePath());
    const clock = new FakeClock();
    const { transport, dispatchedAt } = scriptedTransport(clock, () => result(200));
    await drive(clock, runCollection({ store, adapters: [pagedAdapter()], transport, clock }));
    expect(dispatchedAt).toHaveLength(4);
    for (let i = 1; i < dispatchedAt.length; i++) {
      expect((dispatchedAt[i] as number) - (dispatchedAt[i - 1] as number)).toBeGreaterThanOrEqual(
        1_000,
      );
    }
    store.close();
  });
});

describe("deadlines (T5-A3)", () => {
  type Stall = "headers" | "body" | "slow-chunks";
  const STAGE: Record<Stall, string> = { headers: "headers", body: "body", "slow-chunks": "body" };

  async function stalledRun(stall: Stall) {
    const store = RawStore.open(storePath());
    const clock = new FakeClock();
    const signals: AbortSignal[] = [];
    let readerCancelled = false;
    const stallingFetch = (async (_url: string, init: RequestInit) => {
      const signal = init.signal as AbortSignal;
      signals.push(signal);
      if (stall === "headers") {
        return new Promise<Response>((_, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")));
        });
      }
      const body = new ReadableStream<Uint8Array>({
        async pull(controller) {
          if (stall === "body") return new Promise<void>(() => {});
          await clock.sleep(20_000);
          controller.enqueue(new TextEncoder().encode("partial "));
        },
        cancel() {
          readerCancelled = true;
        },
      });
      return new Response(body, { status: 200 });
    }) as unknown as typeof fetch;
    const healthy = scriptedTransport(clock, () => result(200));
    const transport = routingTransport({
      "https://stall.test": new LiveTransport({ fetch: stallingFetch, credentialOrigins: [] }),
      "https://healthy.test": healthy.transport,
    });
    const adapters = [
      singleItemAdapter("stalled", "https://stall.test"),
      singleItemAdapter("healthy", "https://healthy.test"),
    ];
    const run = runCollection({
      store,
      adapters,
      transport,
      clock,
      limits: { maxTransientAttemptsPerRun: 1 },
    });
    const summary = await drive(clock, run, { maxMs: 5 * 60_000 });
    return { store, clock, summary, signals, readerCancelled: () => readerCancelled };
  }

  for (const stall of ["headers", "body", "slow-chunks"] as const) {
    test(`a stall in ${stall} is aborted at the deadline and the next adapter still commits`, async () => {
      const { store, signals, readerCancelled } = await stalledRun(stall);
      const queue = new WorkQueue(store.database);
      const [attempt] = queue.attempts("stalled");
      expect(attempt?.outcome).toBe("deadline_exceeded");
      expect(attempt?.detail).toBe(`${DEADLINE_MESSAGE} (${STAGE[stall]})`);
      expect((attempt?.finishedAt as number) - (attempt?.startedAt as number)).toBe(30_000);
      expect(signals[0]?.aborted).toBe(true);
      if (stall !== "headers") expect(readerCancelled()).toBe(true);
      if (stall === "slow-chunks") expect(attempt?.partialBytes).toBeGreaterThan(0);
      expect(store.history("test-source", { namespace: "stalled", key: "item" })).toHaveLength(0);
      expect(queue.nextPending("stalled", "next-run", 3)?.workKey).toBe("item");
      expect(store.history("test-source", { namespace: "healthy", key: "item" })).toHaveLength(1);
      store.close();
    });
  }

  test("a response that arrives after the deadline writes nothing", async () => {
    const store = RawStore.open(storePath());
    const clock = new FakeClock();
    let release!: (response: Response) => void;
    // Ignores the abort signal, like a misbehaving client, and answers late.
    const lateFetch = (async () =>
      new Promise<Response>((resolve) => {
        release = resolve;
      })) as unknown as typeof fetch;
    const healthy = scriptedTransport(clock, () => result(200));
    const transport = routingTransport({
      "https://late.test": new LiveTransport({ fetch: lateFetch, credentialOrigins: [] }),
      "https://healthy.test": healthy.transport,
    });
    const adapters = [
      singleItemAdapter("late", "https://late.test"),
      singleItemAdapter("healthy", "https://healthy.test"),
    ];
    await drive(
      clock,
      runCollection({
        store,
        adapters,
        transport,
        clock,
        limits: { maxTransientAttemptsPerRun: 1 },
      }),
    );
    release(new Response('{"late":true}', { status: 200 }));
    await flush();
    const queue = new WorkQueue(store.database);
    expect(store.history("test-source", { namespace: "late", key: "item" })).toHaveLength(0);
    expect(queue.checkpoint("late")).toBeUndefined();
    expect(queue.attempts("late").map((a) => a.outcome)).toEqual(["deadline_exceeded"]);
    store.close();
  });

  test("the attempt deadline is cut short by the remaining run budget", async () => {
    const store = RawStore.open(storePath());
    const clock = new FakeClock();
    const neverAnswers = (async (_url: string, init: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
      })) as unknown as typeof fetch;
    const transport = new LiveTransport({ fetch: neverAnswers, credentialOrigins: [] });
    const summary = await drive(
      clock,
      runCollection({
        store,
        adapters: [singleItemAdapter("slow", "https://slow.test")],
        transport,
        clock,
        limits: { runBudgetMs: 10_000 },
      }),
    );
    const [attempt] = new WorkQueue(store.database).attempts("slow");
    expect((attempt?.finishedAt as number) - (attempt?.startedAt as number)).toBe(10_000);
    expect(summary.status).toBe("partial");
    store.close();
  });
});

describe("restarts and crashes (T5-A2)", () => {
  function crashChild(path: string, mode: string): void {
    const child = Bun.spawnSync({ cmd: [process.execPath, CHILD, path, mode] });
    expect(child.signalCode).toBe("SIGKILL");
  }

  test("a process killed while committing a page loses no records", async () => {
    const path = storePath();
    crashChild(path, "mid-page-2-records");
    const store = RawStore.open(path);
    const { transport, pages } = pagedTransport();
    await runCollection({
      store,
      adapters: [pagedAdapter()],
      transport,
      limits: { originSpacingMs: 0 },
    });
    expect(pagedIds(store)).toEqual(allPagedIds().sort());
    expect(pages[0]).toBe(2);
    expect(
      new WorkQueue(store.database).attempts("paged").some((a) => a.outcome === "interrupted"),
    ).toBe(true);
    store.close();
  });

  test("a process killed between pages resumes at the next page", async () => {
    const path = storePath();
    crashChild(path, "before-page-3-request");
    const store = RawStore.open(path);
    const { transport, pages } = pagedTransport();
    await runCollection({
      store,
      adapters: [pagedAdapter()],
      transport,
      limits: { originSpacingMs: 0 },
    });
    expect(pages[0]).toBe(3);
    expect(pagedIds(store)).toEqual(allPagedIds().sort());
    store.close();
  });

  test("a page whose commit fails rolls back completely and is retried", async () => {
    const store = RawStore.open(storePath());
    const clock = new FakeClock();
    let failOnce = true;
    const adapter: CollectorAdapter = {
      key: "fragile",
      seed: () => [
        {
          workKey: "item",
          origin: "https://fragile.test",
          request: { method: "GET", url: "https://fragile.test/item" },
        },
      ],
      handle: (fetched) => {
        function* records() {
          yield {
            identity: { namespace: "fragile", key: "a" },
            record: testRecord("a", fetched.url, "a"),
          };
          if (failOnce) {
            failOnce = false;
            throw new Error("storage hiccup");
          }
          yield {
            identity: { namespace: "fragile", key: "b" },
            record: testRecord("b", fetched.url, "b"),
          };
        }
        return { records: records(), checkpoint: { done: true } };
      },
    };
    const { transport } = scriptedTransport(clock, () => result(200));
    await drive(
      clock,
      runCollection({
        store,
        adapters: [adapter],
        transport,
        clock,
        limits: { backoffBaseMs: 1_000 },
      }),
    );
    const queue = new WorkQueue(store.database);
    expect(queue.attempts("fragile").map((a) => a.outcome)).toEqual(["transient_error", "success"]);
    expect(store.counts().documents).toBe(2);
    store.close();
  });
});
