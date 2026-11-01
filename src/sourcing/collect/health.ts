// Collection health, read from the raw store alone: every run, and for each source its work,
// progress, cooldowns, what it committed and every attempt that did not succeed. It only
// reads, so the report can be taken while a run is going on.
// Counting attempts by outcome per source follows Scrapy's retry stats (retry/count,
// retry/reason_count/<reason>), so each failure is attributed to its source and reason.

import type { Database } from "bun:sqlite";
import type { PublicRequestDescription } from "../http/transport.ts";
import type { AttemptOutcome, CommitCounts, DeadlineStage, RunStatus } from "./work-queue.ts";

export interface CollectionHealth {
  generatedAt: string;
  runs: RunReport[];
  /** Origins that may not be contacted yet, for example after a Retry-After. */
  pausedOrigins: { origin: string; until: string }[];
  sources: SourceReport[];
}

export interface RunReport {
  runId: string;
  mode: "fixture" | "live" | null;
  trigger: string | null;
  startedAt: string;
  finishedAt: string | null;
  /** null while the run is still going. */
  status: RunStatus | null;
  detail: string | null;
  attempts: number;
  committedPages: number;
  committed: CommitCounts;
}

export interface AttemptReport {
  attemptId: number;
  runId: string;
  workKey: string;
  /** What was requested: method and URL. */
  locator: string;
  startedAt: string;
  finishedAt: string | null;
  outcome: AttemptOutcome | null;
  detail: string | null;
  httpStatus: number | null;
  deadlineStage: DeadlineStage | null;
}

export interface FetchedDocument {
  namespace: string;
  key: string;
  disposition: "new" | "changed" | "duplicate";
}

export interface FetchReport {
  attemptId: number;
  runId: string;
  workKey: string;
  locator: string;
  fetchedAt: string;
  committed: CommitCounts;
  documents: FetchedDocument[];
}

export interface SourceReport {
  source: string;
  work: { pending: number; completed: number; refused: number; failed: number };
  nextEligibleAt: string | null;
  /** The adapter's last checkpoint. */
  progress: unknown;
  /** Work that may not be tried yet, with the outcome that put it there. */
  cooldowns: { workKey: string; locator: string; until: string; reason: string | null }[];
  committed: CommitCounts;
  attemptsByOutcome: Record<string, number>;
  /** Successful attempts, newest first, up to the report's limit. */
  fetched: FetchReport[];
  /** Every finished attempt that did not succeed, oldest first. */
  failures: AttemptReport[];
  adapterErrors: { runId: string; stage: string; occurredAt: string; detail: string }[];
}

export interface HealthOptions {
  now?: number;
  /** How many successful attempts to list per source. */
  fetchedLimit?: number;
}

interface AttemptQueryRow {
  attempt_id: number;
  run_id: string;
  work_key: string;
  request_json: string;
  started_at: number;
  finished_at: number | null;
  outcome: AttemptOutcome | null;
  detail: string | null;
  http_status: number | null;
  deadline_stage: DeadlineStage | null;
  committed_new: number | null;
  committed_changed: number | null;
  committed_duplicate: number | null;
}

const ATTEMPT_COLUMNS = `a.attempt_id, a.run_id, w.work_key, w.request_json, a.started_at,
  a.finished_at, a.outcome, a.detail, a.http_status, a.deadline_stage, a.committed_new,
  a.committed_changed, a.committed_duplicate`;

export function collectionHealth(db: Database, options: HealthOptions = {}): CollectionHealth {
  const now = options.now ?? Date.now();
  const fetchedLimit = options.fetchedLimit ?? 20;

  const runs = db
    .query<
      {
        run_id: string;
        mode: "fixture" | "live" | null;
        trigger: string | null;
        started_at: number;
        finished_at: number | null;
        status: RunStatus | null;
        detail: string | null;
        attempts: number;
        committed_pages: number;
        new: number;
        changed: number;
        duplicate: number;
      },
      []
    >(
      `SELECT r.run_id, r.mode, r.trigger, r.started_at, r.finished_at, r.status, r.detail,
              count(a.attempt_id) AS attempts,
              count(CASE WHEN a.outcome = 'success' THEN 1 END) AS committed_pages,
              coalesce(sum(a.committed_new), 0) AS new,
              coalesce(sum(a.committed_changed), 0) AS changed,
              coalesce(sum(a.committed_duplicate), 0) AS duplicate
         FROM collection_run r LEFT JOIN fetch_attempt a ON a.run_id = r.run_id
        GROUP BY r.run_id
        ORDER BY r.started_at, r.rowid`,
    )
    .all()
    .map(
      (row): RunReport => ({
        runId: row.run_id,
        mode: row.mode,
        trigger: row.trigger,
        startedAt: iso(row.started_at),
        finishedAt: isoOrNull(row.finished_at),
        status: row.status,
        detail: row.detail,
        attempts: row.attempts,
        committedPages: row.committed_pages,
        committed: { new: row.new, changed: row.changed, duplicate: row.duplicate },
      }),
    );

  const pausedOrigins = db
    .query<{ origin: string; next_allowed_at: number }, [number]>(
      `SELECT origin, next_allowed_at FROM origin_pacing
        WHERE next_allowed_at > ? ORDER BY origin`,
    )
    .all(now)
    .map((row) => ({ origin: row.origin, until: iso(row.next_allowed_at) }));

  const sourceKeys = db
    .query<{ adapter_key: string }, []>(
      `SELECT adapter_key FROM work_item UNION SELECT adapter_key FROM adapter_error
        ORDER BY adapter_key`,
    )
    .all()
    .map((row) => row.adapter_key);

  return {
    generatedAt: iso(now),
    runs,
    pausedOrigins,
    sources: sourceKeys.map((source) => sourceReport(db, source, now, fetchedLimit)),
  };
}

function sourceReport(db: Database, source: string, now: number, limit: number): SourceReport {
  const work = { pending: 0, completed: 0, refused: 0, failed: 0 };
  for (const row of db
    .query<{ state: keyof typeof work; n: number }, [string]>(
      "SELECT state, count(*) AS n FROM work_item WHERE adapter_key = ? GROUP BY state",
    )
    .all(source)) {
    work[row.state] = row.n;
  }

  const next = db
    .query<{ at: number | null }, [string]>(
      `SELECT min(eligible_at) AS at FROM work_item
        WHERE adapter_key = ? AND state IN ('pending', 'refused')`,
    )
    .get(source);

  const checkpoint = db
    .query<{ checkpoint_json: string }, [string]>(
      "SELECT checkpoint_json FROM collection_checkpoint WHERE adapter_key = ?",
    )
    .get(source);

  const cooldowns = db
    .query<
      { work_key: string; request_json: string; eligible_at: number; reason: string | null },
      [string, number]
    >(
      `SELECT w.work_key, w.request_json, w.eligible_at,
              (SELECT a.outcome || ': ' || coalesce(a.detail, '')
                 FROM fetch_attempt a WHERE a.work_id = w.work_id AND a.outcome IS NOT NULL
                ORDER BY a.attempt_id DESC LIMIT 1) AS reason
         FROM work_item w
        WHERE w.adapter_key = ? AND w.state IN ('pending', 'refused') AND w.eligible_at > ?
        ORDER BY w.eligible_at, w.work_id`,
    )
    .all(source, now)
    .map((row) => ({
      workKey: row.work_key,
      locator: locator(row.request_json),
      until: iso(row.eligible_at),
      reason: row.reason,
    }));

  const committed: CommitCounts = { new: 0, changed: 0, duplicate: 0 };
  const attemptsByOutcome: Record<string, number> = {};
  for (const row of db
    .query<
      { outcome: string; n: number; new: number; changed: number; duplicate: number },
      [string]
    >(
      `SELECT coalesce(a.outcome, 'in_progress') AS outcome, count(*) AS n,
              coalesce(sum(a.committed_new), 0) AS new,
              coalesce(sum(a.committed_changed), 0) AS changed,
              coalesce(sum(a.committed_duplicate), 0) AS duplicate
         FROM fetch_attempt a JOIN work_item w ON w.work_id = a.work_id
        WHERE w.adapter_key = ?
        GROUP BY 1 ORDER BY 1`,
    )
    .all(source)) {
    attemptsByOutcome[row.outcome] = row.n;
    committed.new += row.new;
    committed.changed += row.changed;
    committed.duplicate += row.duplicate;
  }

  const documentsOf = db.query<
    { identity_namespace: string; source_document_key: string; disposition: string },
    [number]
  >(
    `SELECT d.identity_namespace, d.source_document_key, o.disposition
       FROM raw_observation o JOIN raw_document d ON d.document_id = o.document_id
      WHERE o.attempt_id = ?
      ORDER BY o.rowid`,
  );
  const fetched = db
    .query<AttemptQueryRow, [string, number]>(
      `SELECT ${ATTEMPT_COLUMNS}
         FROM fetch_attempt a JOIN work_item w ON w.work_id = a.work_id
        WHERE w.adapter_key = ? AND a.outcome = 'success'
        ORDER BY a.attempt_id DESC LIMIT ?`,
    )
    .all(source, limit)
    .map(
      (row): FetchReport => ({
        attemptId: row.attempt_id,
        runId: row.run_id,
        workKey: row.work_key,
        locator: locator(row.request_json),
        fetchedAt: iso(row.finished_at ?? row.started_at),
        committed: {
          new: row.committed_new ?? 0,
          changed: row.committed_changed ?? 0,
          duplicate: row.committed_duplicate ?? 0,
        },
        documents: documentsOf.all(row.attempt_id).map((doc) => ({
          namespace: doc.identity_namespace,
          key: doc.source_document_key,
          disposition: doc.disposition as FetchedDocument["disposition"],
        })),
      }),
    );

  const failures = db
    .query<AttemptQueryRow, [string]>(
      `SELECT ${ATTEMPT_COLUMNS}
         FROM fetch_attempt a JOIN work_item w ON w.work_id = a.work_id
        WHERE w.adapter_key = ? AND a.outcome IS NOT NULL AND a.outcome != 'success'
        ORDER BY a.attempt_id`,
    )
    .all(source)
    .map(
      (row): AttemptReport => ({
        attemptId: row.attempt_id,
        runId: row.run_id,
        workKey: row.work_key,
        locator: locator(row.request_json),
        startedAt: iso(row.started_at),
        finishedAt: isoOrNull(row.finished_at),
        outcome: row.outcome,
        detail: row.detail,
        httpStatus: row.http_status,
        deadlineStage: row.deadline_stage,
      }),
    );

  const adapterErrors = db
    .query<{ run_id: string; stage: string; occurred_at: number; detail: string }, [string]>(
      `SELECT run_id, stage, occurred_at, detail FROM adapter_error
        WHERE adapter_key = ? ORDER BY error_id`,
    )
    .all(source)
    .map((row) => ({
      runId: row.run_id,
      stage: row.stage,
      occurredAt: iso(row.occurred_at),
      detail: row.detail,
    }));

  return {
    source,
    work,
    nextEligibleAt: isoOrNull(next?.at ?? null),
    progress: checkpoint ? JSON.parse(checkpoint.checkpoint_json) : null,
    cooldowns,
    committed,
    attemptsByOutcome,
    fetched,
    failures,
    adapterErrors,
  };
}

function locator(requestJson: string): string {
  const request = JSON.parse(requestJson) as PublicRequestDescription;
  return `${request.method} ${request.url}`;
}

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

function isoOrNull(ms: number | null): string | null {
  return ms === null ? null : iso(ms);
}
