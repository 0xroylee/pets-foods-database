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
];
