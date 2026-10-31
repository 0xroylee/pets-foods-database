// Raw store migrations, applied in order and tracked with PRAGMA user_version.

export const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE raw_document (
    document_id INTEGER PRIMARY KEY,
    publisher_key TEXT NOT NULL,
    identity_namespace TEXT NOT NULL,
    source_document_key TEXT NOT NULL,
    document_type TEXT NOT NULL,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    current_revision_id INTEGER REFERENCES raw_revision (revision_id),
    UNIQUE (publisher_key, identity_namespace, source_document_key)
  );

  -- Payload bytes are stored once per content hash and shared by every revision that has them.
  CREATE TABLE raw_payload (
    payload_id INTEGER PRIMARY KEY,
    content_hash TEXT NOT NULL UNIQUE,
    media_type TEXT NOT NULL,
    bytes BLOB NOT NULL
  );

  -- One row per change occurrence. A document that goes A, B, A has three rows, so there is
  -- deliberately no UNIQUE (document_id, content_hash).
  CREATE TABLE raw_revision (
    revision_id INTEGER PRIMARY KEY,
    revision_sequence INTEGER NOT NULL UNIQUE,
    document_id INTEGER NOT NULL REFERENCES raw_document (document_id),
    previous_revision_id INTEGER REFERENCES raw_revision (revision_id),
    content_hash TEXT NOT NULL,
    payload_id INTEGER NOT NULL REFERENCES raw_payload (payload_id),
    record_json TEXT NOT NULL,
    retrieved_at TEXT NOT NULL
  );
  CREATE INDEX raw_revision_by_document ON raw_revision (document_id, revision_sequence);

  -- One row per committed retrieval. The key makes replaying the same work a no-op.
  CREATE TABLE raw_observation (
    observation_key TEXT PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES raw_document (document_id),
    revision_id INTEGER NOT NULL REFERENCES raw_revision (revision_id),
    disposition TEXT NOT NULL CHECK (disposition IN ('new', 'duplicate', 'changed')),
    retrieved_at TEXT NOT NULL,
    committed_at TEXT NOT NULL
  );

  CREATE TRIGGER raw_revision_no_update BEFORE UPDATE ON raw_revision
  BEGIN SELECT RAISE(ABORT, 'raw revisions are immutable'); END;
  CREATE TRIGGER raw_revision_no_delete BEFORE DELETE ON raw_revision
  BEGIN SELECT RAISE(ABORT, 'raw revisions are immutable'); END;
  CREATE TRIGGER raw_payload_no_update BEFORE UPDATE ON raw_payload
  BEGIN SELECT RAISE(ABORT, 'raw payloads are immutable'); END;
  CREATE TRIGGER raw_payload_no_delete BEFORE DELETE ON raw_payload
  BEGIN SELECT RAISE(ABORT, 'raw payloads are immutable'); END;
  `,
  `
  -- A raw recall group: one upstream event at one firm. It correlates source documents and is
  -- not a core Incident; each member keeps its own identity and history.
  CREATE TABLE raw_recall_event (
    raw_recall_event_id INTEGER PRIMARY KEY,
    publisher_key TEXT NOT NULL,
    upstream_event_id TEXT NOT NULL,
    fei_number TEXT NOT NULL,
    UNIQUE (publisher_key, upstream_event_id, fei_number)
  );

  CREATE TABLE raw_recall_membership (
    raw_recall_event_id INTEGER NOT NULL REFERENCES raw_recall_event (raw_recall_event_id),
    document_id INTEGER NOT NULL REFERENCES raw_document (document_id),
    supporting_revision_id INTEGER NOT NULL REFERENCES raw_revision (revision_id),
    basis TEXT NOT NULL CHECK (basis IN ('explicit_identifiers', 'source_cross_reference')),
    linked_at TEXT NOT NULL,
    UNIQUE (raw_recall_event_id, document_id, supporting_revision_id)
  );

  CREATE TRIGGER raw_document_no_delete BEFORE DELETE ON raw_document
  BEGIN SELECT RAISE(ABORT, 'raw documents are never deleted'); END;
  CREATE TRIGGER raw_recall_membership_no_delete BEFORE DELETE ON raw_recall_membership
  BEGIN SELECT RAISE(ABORT, 'recall memberships are never deleted'); END;
  `,
  `
  -- Collection work. Times are epoch milliseconds.
  CREATE TABLE work_item (
    work_id INTEGER PRIMARY KEY,
    adapter_key TEXT NOT NULL,
    work_key TEXT NOT NULL,
    origin TEXT NOT NULL,
    request_json TEXT NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('pending', 'completed', 'refused', 'failed')),
    eligible_at INTEGER NOT NULL,
    -- Transient failures in the run named by run_failures_run_id; a new run starts again at 0.
    run_failures INTEGER NOT NULL DEFAULT 0,
    run_failures_run_id TEXT,
    created_at INTEGER NOT NULL,
    completed_at INTEGER,
    UNIQUE (adapter_key, work_key)
  );
  CREATE INDEX work_item_by_state ON work_item (state, eligible_at);

  -- One row per request, written before the request is sent and finished afterwards.
  CREATE TABLE fetch_attempt (
    attempt_id INTEGER PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES work_item (work_id),
    run_id TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    finished_at INTEGER,
    outcome TEXT CHECK (outcome IN ('success', 'transient_error', 'refused', 'deadline_exceeded',
                                    'http_error', 'interrupted')),
    detail TEXT,
    http_status INTEGER,
    -- Whatever arrived before a deadline: kept as incomplete evidence, never as a document.
    partial_body BLOB
  );
  CREATE TRIGGER fetch_attempt_no_delete BEFORE DELETE ON fetch_attempt
  BEGIN SELECT RAISE(ABORT, 'fetch attempts are never deleted'); END;

  -- The earliest time the next request to an origin may be sent; survives restarts.
  CREATE TABLE origin_pacing (
    origin TEXT PRIMARY KEY,
    next_allowed_at INTEGER NOT NULL
  );

  CREATE TABLE collection_checkpoint (
    adapter_key TEXT PRIMARY KEY,
    checkpoint_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  `,
];
