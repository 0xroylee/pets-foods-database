// Test helpers for the collection runner: a fake clock, a watchdog, and small adapters.

import type { Clock, Timer } from "../../../src/sourcing/collect/clock.ts";
import type { CollectorAdapter, PageRecord } from "../../../src/sourcing/collect/runner.ts";
import {
  type CollectorRecordV1,
  createCollectorRecordV1,
} from "../../../src/sourcing/contract/collector-record.ts";
import type {
  FetchResult,
  HttpTransport,
  PublicRequestDescription,
  TransportContext,
} from "../../../src/sourcing/http/transport.ts";

export const T0 = Date.parse("2026-11-01T00:00:00Z");

/** Lets pending promise callbacks and I/O callbacks run. */
export async function flush(): Promise<void> {
  for (let i = 0; i < 20; i++) await new Promise((resolve) => setImmediate(resolve));
}

/** A clock that only moves when the test advances it, firing due timers in order. */
export class FakeClock implements Clock {
  #now: number;
  #seq = 0;
  #timers: { at: number; seq: number; resolve: () => void; cancelled: boolean }[] = [];

  constructor(start = T0) {
    this.#now = start;
  }

  now(): number {
    return this.#now;
  }

  timer(ms: number): Timer {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => {
      resolve = r;
    });
    const entry = { at: this.#now + Math.max(0, ms), seq: this.#seq++, resolve, cancelled: false };
    this.#timers.push(entry);
    return {
      promise,
      cancel: () => {
        entry.cancelled = true;
      },
    };
  }

  sleep(ms: number): Promise<void> {
    return this.timer(ms).promise;
  }

  async advance(ms: number): Promise<void> {
    const target = this.#now + ms;
    for (;;) {
      await flush();
      const due = this.#timers
        .filter((t) => !t.cancelled && t.at <= target)
        .sort((a, b) => a.at - b.at || a.seq - b.seq)[0];
      if (!due) break;
      this.#timers.splice(this.#timers.indexOf(due), 1);
      this.#now = Math.max(this.#now, due.at);
      due.resolve();
    }
    this.#now = target;
    await flush();
  }
}

/**
 * Advances the clock until the run settles. The limit is the watchdog: a run that is still
 * blocked after maxMs of simulated time fails the test instead of hanging it.
 */
export async function drive<T>(
  clock: FakeClock,
  run: Promise<T>,
  { stepMs = 1_000, maxMs = 20 * 60_000 } = {},
): Promise<T> {
  let settled = false;
  run.then(
    () => {
      settled = true;
    },
    () => {
      settled = true;
    },
  );
  for (let elapsed = 0; !settled && elapsed < maxMs; elapsed += stepMs) await clock.advance(stepMs);
  if (!settled) throw new Error("watchdog: a stalled request blocked source progress");
  return run;
}

export function testRecord(key: string, url: string, body: string): CollectorRecordV1 {
  return createCollectorRecordV1({
    source: { key: "test-source", name: "Test Source" },
    source_ids: { item: key },
    document_type: "test_item",
    original_url: url,
    retrieved_at: "2026-11-01T00:00:00Z",
    payload: { media_type: "application/json", encoding: "utf8", body },
    origin: {
      collector: "test",
      collector_version: "0.1.0",
      acquisition: "api",
      fixture: true,
      referenced_urls: [],
    },
    extracted: {},
  });
}

/** An adapter with one work item whose successful response becomes one record. */
export function singleItemAdapter(key: string, origin: string): CollectorAdapter {
  return {
    key,
    seed: () => [{ workKey: "item", origin, request: { method: "GET", url: `${origin}/item` } }],
    handle: (result) => ({
      records: [
        {
          identity: { namespace: key, key: "item" },
          record: testRecord(`${key}-item`, result.url, new TextDecoder().decode(result.body)),
        },
      ],
      checkpoint: { done: true },
    }),
  };
}

export const PAGED_ORIGIN = "https://paged.test";
export const PAGES = 4;
export const RECORDS_PER_PAGE = 3;

export function pageUrl(page: number): string {
  return `${PAGED_ORIGIN}/items?page=${page}`;
}

export function allPagedIds(): string[] {
  const ids: string[] = [];
  for (let page = 1; page <= PAGES; page++) {
    for (let i = 0; i < RECORDS_PER_PAGE; i++) ids.push(`${page}-${i}`);
  }
  return ids;
}

/** Pages 1..PAGES, each with RECORDS_PER_PAGE records and a successor for the next page. */
export function pagedAdapter(hooks: { onRecord?: (page: number, index: number) => void } = {}) {
  const adapter: CollectorAdapter = {
    key: "paged",
    seed: () => [
      { workKey: "page:1", origin: PAGED_ORIGIN, request: { method: "GET", url: pageUrl(1) } },
    ],
    handle: (result) => {
      const page = Number(new URL(result.url).searchParams.get("page"));
      function* records(): Generator<PageRecord> {
        for (let i = 0; i < RECORDS_PER_PAGE; i++) {
          hooks.onRecord?.(page, i);
          yield {
            identity: { namespace: "paged_item", key: `${page}-${i}` },
            record: testRecord(`${page}-${i}`, result.url, JSON.stringify({ page, i })),
          };
        }
      }
      return {
        records: records(),
        successors:
          page < PAGES
            ? [
                {
                  workKey: `page:${page + 1}`,
                  origin: PAGED_ORIGIN,
                  request: { method: "GET", url: pageUrl(page + 1) },
                },
              ]
            : [],
        checkpoint: { nextPage: page + 1 },
      };
    },
  };
  return adapter;
}

export function okResult(
  url: string,
  body = "{}",
  headers: Record<string, string> = {},
): FetchResult {
  return {
    status: 200,
    headers,
    body: new TextEncoder().encode(body),
    url,
    transport: "fixture",
  };
}

/** Serves the paged adapter's pages and records which pages were requested, in order. */
export function pagedTransport(hooks: { onRequest?: (page: number) => void } = {}) {
  const pages: number[] = [];
  const transport: HttpTransport = {
    async sendAndRead(request: PublicRequestDescription, context?: TransportContext) {
      const page = Number(new URL(request.url).searchParams.get("page"));
      pages.push(page);
      hooks.onRequest?.(page);
      context?.onHeaders?.(200);
      return okResult(request.url, JSON.stringify({ page }));
    },
  };
  return { transport, pages };
}

/** Routes each request to the transport for its origin. */
export function routingTransport(routes: Record<string, HttpTransport>): HttpTransport {
  return {
    sendAndRead(request, context) {
      const route = routes[new URL(request.url).origin];
      if (!route) throw new Error(`no route for ${request.url}`);
      return route.sendAndRead(request, context);
    },
  };
}

/** A transport that answers with a scripted sequence of results and logs dispatch times. */
export function scriptedTransport(clock: Clock, script: (call: number) => FetchResult) {
  const dispatchedAt: number[] = [];
  const transport: HttpTransport = {
    async sendAndRead(request, context) {
      dispatchedAt.push(clock.now());
      const result = { ...script(dispatchedAt.length), url: request.url };
      context?.onHeaders?.(result.status);
      return result;
    },
  };
  return { transport, dispatchedAt };
}
