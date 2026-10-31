// The collection runner: one request at a time, each with one absolute deadline, polite pacing
// per origin and durable work, so a run can stop anywhere and the next one carries on.
// Patterns from Scrapy (persisted scheduler, explicit retry limits) and Crawlee (one deadline
// shared by headers and body, cancellation passed to the HTTP client).

import type { CollectorRecordV1 } from "../contract/collector-record.ts";
import type { FetchResult, HttpTransport } from "../http/transport.ts";
import type { DocumentIdentity, RawStore } from "../store/raw-store.ts";
import { type Clock, systemClock } from "./clock.ts";
import { type AttemptOutcome, type NewWork, type WorkItem, WorkQueue } from "./work-queue.ts";

export const DEADLINE_MESSAGE = "Collection request deadline exceeded";

export interface PageRecord {
  identity: DocumentIdentity;
  record: CollectorRecordV1;
}

/** What one successful response produces. Everything in it commits together. */
export interface PageEffect {
  /** Consumed inside the page's transaction. */
  records: Iterable<PageRecord>;
  successors?: NewWork[];
  checkpoint?: unknown;
}

export interface CollectorAdapter {
  key: string;
  /** Work to start from when the adapter has never had any. */
  seed(): NewWork[];
  handle(result: FetchResult, work: WorkItem): PageEffect;
}

export interface CollectionLimits {
  /** One absolute deadline per attempt, covering headers and the whole body. */
  attemptDeadlineMs: number;
  runBudgetMs: number;
  /** Minimum gap between requests to one origin; a source may need more. */
  originSpacingMs: number;
  maxTransientAttemptsPerRun: number;
  backoffBaseMs: number;
  backoffMaxMs: number;
  refusalCooldownMs: number;
  /** Waits longer than this end the run instead of keeping it open. */
  maxInRunWaitMs: number;
}

export const DEFAULT_LIMITS: CollectionLimits = {
  attemptDeadlineMs: 30_000,
  runBudgetMs: 15 * 60_000,
  originSpacingMs: 1_000,
  maxTransientAttemptsPerRun: 3,
  backoffBaseMs: 5_000,
  backoffMaxMs: 5 * 60_000,
  refusalCooldownMs: 24 * 60 * 60_000,
  maxInRunWaitMs: 60_000,
};

export interface RunSummary {
  runId: string;
  /** completed: no work left; deferred: work waits beyond this run; partial: budget ran out. */
  status: "completed" | "deferred" | "partial";
  attempts: number;
  committedPages: number;
}

export interface RunOptions {
  store: RawStore;
  adapters: readonly CollectorAdapter[];
  transport: HttpTransport;
  clock?: Clock;
  limits?: Partial<CollectionLimits>;
  runId?: string;
}

type FetchOutcome =
  | { kind: "response"; result: FetchResult }
  | { kind: "deadline"; stage: "headers" | "body"; status?: number; partial: Uint8Array }
  | { kind: "error"; message: string };

export async function runCollection(options: RunOptions): Promise<RunSummary> {
  const { store, adapters, transport } = options;
  const clock = options.clock ?? systemClock;
  const limits = { ...DEFAULT_LIMITS, ...options.limits };
  const runId = options.runId ?? crypto.randomUUID();
  const queue = new WorkQueue(store.database);
  const startedAt = clock.now();
  const runDeadline = startedAt + limits.runBudgetMs;
  let attempts = 0;
  let committedPages = 0;
  let turn = 0;

  queue.interruptAbandoned(startedAt);
  for (const adapter of adapters) {
    if (!queue.hasAnyWork(adapter.key)) queue.enqueue(adapter.key, adapter.seed(), startedAt);
  }
  const summary = (status: RunSummary["status"]): RunSummary => ({
    runId,
    status,
    attempts,
    committedPages,
  });

  for (;;) {
    const now = clock.now();
    if (now >= runDeadline) return summary("partial");
    let chosen: { adapter: CollectorAdapter; work: WorkItem } | undefined;
    let earliest = Number.POSITIVE_INFINITY;
    // Take adapters in turn, so one slow source never starves the others.
    for (let i = 0; i < adapters.length && !chosen; i++) {
      const adapter = adapters[(turn + i) % adapters.length] as CollectorAdapter;
      const work = queue.nextPending(adapter.key, runId, limits.maxTransientAttemptsPerRun);
      if (!work) continue;
      const readyAt = Math.max(work.eligibleAt, queue.originNextAllowed(work.origin));
      if (readyAt <= now) {
        chosen = { adapter, work };
        turn = (turn + i + 1) % adapters.length;
      } else {
        earliest = Math.min(earliest, readyAt);
      }
    }
    if (!chosen) {
      if (earliest === Number.POSITIVE_INFINITY) {
        return summary(adapters.some((a) => queue.hasPending(a.key)) ? "deferred" : "completed");
      }
      if (earliest - now > limits.maxInRunWaitMs || earliest >= runDeadline) {
        return summary("deferred");
      }
      await clock.sleep(earliest - now);
      continue;
    }
    attempts++;
    if (await attemptWork(chosen.adapter, chosen.work)) committedPages++;
  }

  async function attemptWork(adapter: CollectorAdapter, work: WorkItem): Promise<boolean> {
    const sentAt = clock.now();
    // Recorded before any I/O, so a crash mid-request still leaves the attempt on file.
    const attemptId = queue.startAttempt(work.workId, runId, sentAt);
    queue.delayOrigin(work.origin, sentAt + limits.originSpacingMs);
    const deadlineMs = Math.min(limits.attemptDeadlineMs, runDeadline - sentAt);
    const outcome = await fetchWithDeadline(work, deadlineMs);
    const now = clock.now();

    if (outcome.kind === "deadline") {
      const detail = `${DEADLINE_MESSAGE} (${outcome.stage})`;
      // A refusal stays a refusal even if its body then stalls; it is never retried at once.
      if (outcome.status === 401 || outcome.status === 403) {
        refuse(work, attemptId, now, detail, outcome.status);
        return false;
      }
      transient(
        work,
        attemptId,
        now,
        "deadline_exceeded",
        detail,
        outcome.status,
        undefined,
        outcome.partial,
      );
      return false;
    }
    if (outcome.kind === "error") {
      transient(work, attemptId, now, "transient_error", outcome.message);
      return false;
    }

    const { result } = outcome;
    if (result.status === 401 || result.status === 403) {
      refuse(work, attemptId, now, `HTTP ${result.status} refused`, result.status);
      return false;
    }
    if (result.status === 408 || result.status === 429 || result.status >= 500) {
      const retryAfter = retryAfterMs(result.headers, now);
      transient(
        work,
        attemptId,
        now,
        "transient_error",
        `HTTP ${result.status}`,
        result.status,
        retryAfter,
      );
      return false;
    }
    if (result.status < 200 || result.status >= 300) {
      store.database.transaction(() => {
        queue.finishAttempt(attemptId, "http_error", now, {
          detail: `HTTP ${result.status}`,
          httpStatus: result.status,
        });
        queue.fail(work.workId);
      })();
      return false;
    }

    let effect: PageEffect;
    try {
      effect = adapter.handle(result, work);
    } catch (error) {
      transient(work, attemptId, now, "transient_error", `adapter: ${(error as Error).message}`);
      return false;
    }
    // Records, follow-up work, checkpoint and completion commit together or not at all.
    try {
      store.transaction((tx) => {
        let index = 0;
        for (const { identity, record } of effect.records) {
          tx.putRecord({
            identity,
            record,
            observationKey: `${adapter.key}:${work.workKey}#${attemptId}:${index++}`,
          });
        }
        queue.enqueue(adapter.key, effect.successors ?? [], now);
        if (effect.checkpoint !== undefined) {
          queue.setCheckpoint(adapter.key, effect.checkpoint, now);
        }
        queue.complete(work.workId, now);
        queue.finishAttempt(attemptId, "success", now, { httpStatus: result.status });
      });
    } catch (error) {
      // The whole page rolled back; the work stays pending and is retried like any failure.
      transient(work, attemptId, now, "transient_error", `commit: ${(error as Error).message}`);
      return false;
    }
    return true;
  }

  async function fetchWithDeadline(work: WorkItem, deadlineMs: number): Promise<FetchOutcome> {
    const controller = new AbortController();
    let stage: "headers" | "body" = "headers";
    let status: number | undefined;
    const chunks: Uint8Array[] = [];
    const deadline = clock.timer(deadlineMs);
    const settled = transport
      .sendAndRead(work.request, {
        signal: controller.signal,
        onHeaders: (received) => {
          stage = "body";
          status = received;
        },
        onChunk: (chunk) => {
          chunks.push(chunk);
        },
      })
      .then(
        (result): FetchOutcome => ({ kind: "response", result }),
        (error): FetchOutcome => ({
          kind: "error",
          message: String((error as Error)?.message ?? error),
        }),
      );
    const expired = deadline.promise.then(() => "deadline" as const);
    const winner = await Promise.race([settled, expired]);
    deadline.cancel();
    if (winner === "deadline") {
      // Abort the request and its body reader. A response arriving later is never used.
      controller.abort(new Error(DEADLINE_MESSAGE));
      return { kind: "deadline", stage, status, partial: Buffer.concat(chunks) };
    }
    return winner;
  }

  function refuse(work: WorkItem, attemptId: number, now: number, detail: string, status: number) {
    store.database.transaction(() => {
      queue.finishAttempt(attemptId, "refused", now, { detail, httpStatus: status });
      queue.refuse(work.workId, now + limits.refusalCooldownMs);
    })();
  }

  function transient(
    work: WorkItem,
    attemptId: number,
    now: number,
    outcome: AttemptOutcome,
    detail: string,
    httpStatus?: number,
    retryAfter?: number,
    partialBody?: Uint8Array,
  ) {
    store.database.transaction(() => {
      queue.finishAttempt(attemptId, outcome, now, { detail, httpStatus, partialBody });
      const failures = queue.recordTransientFailure(work.workId, runId);
      const backoff = Math.min(limits.backoffBaseMs * 2 ** (failures - 1), limits.backoffMaxMs);
      // Retry-After is a floor: it wins over spacing and over the backoff cap.
      const wait = Math.max(backoff, retryAfter ?? 0);
      queue.setEligibleAt(work.workId, now + wait);
      if (retryAfter !== undefined) queue.delayOrigin(work.origin, now + retryAfter);
    })();
  }
}

/** Retry-After as milliseconds from now: delay-seconds or an HTTP date. */
export function retryAfterMs(headers: Record<string, string>, now: number): number | undefined {
  const entry = Object.entries(headers).find(([name]) => name.toLowerCase() === "retry-after");
  if (!entry) return undefined;
  const value = entry[1].trim();
  if (/^\d+$/.test(value)) return Number(value) * 1000;
  const at = Date.parse(value);
  return Number.isNaN(at) ? undefined : Math.max(0, at - now);
}
