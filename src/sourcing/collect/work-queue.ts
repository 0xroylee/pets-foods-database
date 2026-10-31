// Durable collection work in the raw store's database. Calls made inside RawStore.transaction()
// commit together with the records they produce.

import type { Database } from "bun:sqlite";
import type { PublicRequestDescription } from "../http/transport.ts";

export interface NewWork {
  workKey: string;
  origin: string;
  request: PublicRequestDescription;
  eligibleAt?: number;
}

export interface WorkItem {
  workId: number;
  adapterKey: string;
  workKey: string;
  origin: string;
  request: PublicRequestDescription;
  eligibleAt: number;
}

export type AttemptOutcome =
  | "success"
  | "transient_error"
  | "refused"
  | "deadline_exceeded"
  | "http_error"
  | "interrupted";

export interface AttemptRow {
  attemptId: number;
  workKey: string;
  runId: string;
  startedAt: number;
  finishedAt: number | null;
  outcome: AttemptOutcome | null;
  detail: string | null;
  httpStatus: number | null;
  partialBytes: number;
}

interface WorkRow {
  work_id: number;
  adapter_key: string;
  work_key: string;
  origin: string;
  request_json: string;
  eligible_at: number;
}

export class WorkQueue {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  hasAnyWork(adapterKey: string): boolean {
    return (
      this.#db
        .query<{ n: number }, [string]>("SELECT count(*) AS n FROM work_item WHERE adapter_key = ?")
        .get(adapterKey)?.n !== 0
    );
  }

  enqueue(adapterKey: string, items: readonly NewWork[], now: number): void {
    const insert = this.#db.query<never, [string, string, string, string, number, number]>(
      `INSERT OR IGNORE INTO work_item
         (adapter_key, work_key, origin, request_json, state, eligible_at, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
    );
    for (const item of items) {
      insert.run(
        adapterKey,
        item.workKey,
        item.origin,
        JSON.stringify(item.request),
        item.eligibleAt ?? now,
        now,
      );
    }
  }

  /**
   * The adapter's next pending work, earliest eligibility first. Work that already used up its
   * transient attempts in this run is skipped until the next run.
   */
  nextPending(adapterKey: string, runId: string, maxRunFailures: number): WorkItem | undefined {
    const row = this.#db
      .query<WorkRow, [string, string, number]>(
        `SELECT work_id, adapter_key, work_key, origin, request_json, eligible_at
           FROM work_item
          WHERE adapter_key = ? AND state = 'pending'
            AND NOT (run_failures_run_id IS ? AND run_failures >= ?)
          ORDER BY eligible_at, work_id
          LIMIT 1`,
      )
      .get(adapterKey, runId, maxRunFailures);
    return row ? toWorkItem(row) : undefined;
  }

  hasPending(adapterKey: string): boolean {
    return (
      this.#db
        .query<{ n: number }, [string]>(
          "SELECT count(*) AS n FROM work_item WHERE adapter_key = ? AND state = 'pending'",
        )
        .get(adapterKey)?.n !== 0
    );
  }

  /** Written before the request is sent, so a crash still leaves a record of the attempt. */
  startAttempt(workId: number, runId: string, now: number): number {
    return (
      this.#db
        .query<{ attempt_id: number }, [number, string, number]>(
          `INSERT INTO fetch_attempt (work_id, run_id, started_at) VALUES (?, ?, ?)
           RETURNING attempt_id`,
        )
        .get(workId, runId, now) as { attempt_id: number }
    ).attempt_id;
  }

  finishAttempt(
    attemptId: number,
    outcome: AttemptOutcome,
    now: number,
    details: { detail?: string; httpStatus?: number; partialBody?: Uint8Array } = {},
  ): void {
    this.#db
      .query<never, [number, string, string | null, number | null, Uint8Array | null, number]>(
        `UPDATE fetch_attempt
            SET finished_at = ?, outcome = ?, detail = ?, http_status = ?, partial_body = ?
          WHERE attempt_id = ? AND finished_at IS NULL`,
      )
      .run(
        now,
        outcome,
        details.detail ?? null,
        details.httpStatus ?? null,
        details.partialBody ?? null,
        attemptId,
      );
  }

  /** Attempts a previous run left unfinished (the process died) are marked interrupted. */
  interruptAbandoned(now: number): number {
    return this.#db
      .query<never, [number]>(
        `UPDATE fetch_attempt SET finished_at = ?, outcome = 'interrupted'
          WHERE finished_at IS NULL`,
      )
      .run(now).changes;
  }

  complete(workId: number, now: number): void {
    this.#db
      .query<never, [number, number]>(
        "UPDATE work_item SET state = 'completed', completed_at = ? WHERE work_id = ?",
      )
      .run(now, workId);
  }

  refuse(workId: number, eligibleAt: number): void {
    this.#db
      .query<never, [number, number]>(
        "UPDATE work_item SET state = 'refused', eligible_at = ? WHERE work_id = ?",
      )
      .run(eligibleAt, workId);
  }

  fail(workId: number): void {
    this.#db
      .query<never, [number]>("UPDATE work_item SET state = 'failed' WHERE work_id = ?")
      .run(workId);
  }

  /** Counts a transient failure in this run; the count starts again in a new run. */
  recordTransientFailure(workId: number, runId: string): number {
    return (
      this.#db
        .query<{ run_failures: number }, [string, string, number]>(
          `UPDATE work_item
              SET run_failures = CASE WHEN run_failures_run_id IS ? THEN run_failures + 1 ELSE 1 END,
                  run_failures_run_id = ?
            WHERE work_id = ?
          RETURNING run_failures`,
        )
        .get(runId, runId, workId) as { run_failures: number }
    ).run_failures;
  }

  setEligibleAt(workId: number, at: number): void {
    this.#db
      .query<never, [number, number]>("UPDATE work_item SET eligible_at = ? WHERE work_id = ?")
      .run(at, workId);
  }

  originNextAllowed(origin: string): number {
    return (
      this.#db
        .query<{ next_allowed_at: number }, [string]>(
          "SELECT next_allowed_at FROM origin_pacing WHERE origin = ?",
        )
        .get(origin)?.next_allowed_at ?? 0
    );
  }

  /** Moves an origin's next allowed request time later, never earlier. */
  delayOrigin(origin: string, at: number): void {
    this.#db
      .query<never, [string, number]>(
        `INSERT INTO origin_pacing (origin, next_allowed_at) VALUES (?, ?)
         ON CONFLICT (origin) DO UPDATE
           SET next_allowed_at = max(next_allowed_at, excluded.next_allowed_at)`,
      )
      .run(origin, at);
  }

  setCheckpoint(adapterKey: string, checkpoint: unknown, now: number): void {
    this.#db
      .query<never, [string, string, number]>(
        `INSERT INTO collection_checkpoint (adapter_key, checkpoint_json, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT (adapter_key) DO UPDATE
           SET checkpoint_json = excluded.checkpoint_json, updated_at = excluded.updated_at`,
      )
      .run(adapterKey, JSON.stringify(checkpoint), now);
  }

  checkpoint(adapterKey: string): unknown {
    const row = this.#db
      .query<{ checkpoint_json: string }, [string]>(
        "SELECT checkpoint_json FROM collection_checkpoint WHERE adapter_key = ?",
      )
      .get(adapterKey);
    return row ? JSON.parse(row.checkpoint_json) : undefined;
  }

  workEligibleAt(adapterKey: string, workKey: string): number | undefined {
    return this.#db
      .query<{ eligible_at: number }, [string, string]>(
        "SELECT eligible_at FROM work_item WHERE adapter_key = ? AND work_key = ?",
      )
      .get(adapterKey, workKey)?.eligible_at;
  }

  attempts(adapterKey?: string): AttemptRow[] {
    return this.#db
      .query<
        {
          attempt_id: number;
          work_key: string;
          run_id: string;
          started_at: number;
          finished_at: number | null;
          outcome: AttemptOutcome | null;
          detail: string | null;
          http_status: number | null;
          partial_bytes: number | null;
        },
        [string | null, string | null]
      >(
        `SELECT a.attempt_id, w.work_key, a.run_id, a.started_at, a.finished_at, a.outcome,
                a.detail, a.http_status, length(a.partial_body) AS partial_bytes
           FROM fetch_attempt a JOIN work_item w ON w.work_id = a.work_id
          WHERE ? IS NULL OR w.adapter_key = ?
          ORDER BY a.attempt_id`,
      )
      .all(adapterKey ?? null, adapterKey ?? null)
      .map((row) => ({
        attemptId: row.attempt_id,
        workKey: row.work_key,
        runId: row.run_id,
        startedAt: row.started_at,
        finishedAt: row.finished_at,
        outcome: row.outcome,
        detail: row.detail,
        httpStatus: row.http_status,
        partialBytes: row.partial_bytes ?? 0,
      }));
  }
}

function toWorkItem(row: WorkRow): WorkItem {
  return {
    workId: row.work_id,
    adapterKey: row.adapter_key,
    workKey: row.work_key,
    origin: row.origin,
    request: JSON.parse(row.request_json) as PublicRequestDescription,
    eligibleAt: row.eligible_at,
  };
}
