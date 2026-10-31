// The private raw store: one SQLite file on the owner's Mac, readable only by the owner.
// Documents are stored once, payload bytes once per hash, and every content change is a new,
// immutable revision occurrence. It opens no network listener.

import { Database } from "bun:sqlite";
import { chmodSync, closeSync, existsSync, mkdirSync, openSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  type CollectorRecordV1,
  decodeCollectorRecordV1,
  encodeCollectorRecordV1,
  payloadBytes,
} from "../contract/collector-record.ts";
import { MIGRATIONS } from "./schema.ts";

/** How a collector identifies one source document, e.g. an iRES product row. */
export interface DocumentIdentity {
  namespace: string;
  key: string;
}

export type Disposition = "new" | "duplicate" | "changed";

export interface StoreOutcome {
  /** "replayed" means this observation was already committed and nothing was written. */
  disposition: Disposition | "replayed";
  documentId: number;
  revisionId: number;
  revisionSequence: number;
}

export interface PutRecordInput {
  identity: DocumentIdentity;
  record: CollectorRecordV1;
  /** Unique per retrieval, e.g. a work item and attempt. Replaying it writes nothing. */
  observationKey: string;
}

export interface RevisionEntry {
  revisionId: number;
  revisionSequence: number;
  contentHash: string;
  retrievedAt: string;
  payloadId: number;
  record: CollectorRecordV1;
}

/** A verified statement that a stored document belongs to one upstream recall event. */
export interface RecallAssociation {
  publisherKey: string;
  eventId: string;
  feiNumber: string;
  identity: DocumentIdentity;
  /** Either the document's own identifiers, or an authoritative record that cites it. */
  basis: "explicit_identifiers" | "source_cross_reference";
}

export interface LinkResult {
  recallEventId: number;
  documentId: number;
  membership: "added" | "existing";
}

export interface RecallGroup {
  eventId: string;
  feiNumber: string;
}

export interface RecallGroupMember {
  identity: DocumentIdentity;
  documentType: string;
  basis: RecallAssociation["basis"];
}

export interface RawTransaction {
  putRecord(input: PutRecordInput): StoreOutcome;
  linkRecallEvent(association: RecallAssociation): LinkResult;
}

/**
 * What decides whether a retrieval changed the document: the payload bytes and nothing else.
 * Retrieval time is not content, so fetching the same bytes again is a duplicate.
 */
export function sourceContentHash(record: CollectorRecordV1): string {
  return record.content_hash;
}

export class RawStore {
  readonly path: string;
  readonly #db: Database;

  private constructor(path: string, db: Database) {
    this.path = path;
    this.#db = db;
  }

  /**
   * The connection itself, for collection modules whose writes must share a transaction with
   * putRecord. Anything run inside transaction() on it commits or rolls back together.
   */
  get database(): Database {
    return this.#db;
  }

  static open(path: string): RawStore {
    const file = resolve(path);
    mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
    chmodSync(dirname(file), 0o700);
    if (!existsSync(file)) closeSync(openSync(file, "a", 0o600));
    // SQLite gives the -wal and -shm files the same permissions as the database file.
    chmodSync(file, 0o600);
    const db = new Database(file, { create: true, strict: true });
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA synchronous = FULL;");
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec("PRAGMA busy_timeout = 5000;");
    migrate(db);
    return new RawStore(file, db);
  }

  /** Runs fn in one immediate transaction; everything it writes commits together or not at all. */
  transaction<T>(fn: (tx: RawTransaction) => T): T {
    const tx: RawTransaction = {
      putRecord: (input) => this.#put(input),
      linkRecallEvent: (association) => this.#link(association),
    };
    return this.#db.transaction(() => fn(tx)).immediate();
  }

  /** The recall groups a document belongs to. */
  recallGroupsFor(publisherKey: string, identity: DocumentIdentity): RecallGroup[] {
    return this.#db
      .query<{ upstream_event_id: string; fei_number: string }, [string, string, string]>(
        `SELECT DISTINCT e.upstream_event_id, e.fei_number
           FROM raw_recall_event e
           JOIN raw_recall_membership m ON m.raw_recall_event_id = e.raw_recall_event_id
           JOIN raw_document d ON d.document_id = m.document_id
          WHERE d.publisher_key = ? AND d.identity_namespace = ? AND d.source_document_key = ?
          ORDER BY e.upstream_event_id, e.fei_number`,
      )
      .all(publisherKey, identity.namespace, identity.key)
      .map((row) => ({ eventId: row.upstream_event_id, feiNumber: row.fei_number }));
  }

  /** The documents in one recall group, each listed once. */
  recallGroupMembers(publisherKey: string, group: RecallGroup): RecallGroupMember[] {
    return this.#db
      .query<
        {
          identity_namespace: string;
          source_document_key: string;
          document_type: string;
          basis: string;
        },
        [string, string, string]
      >(
        `SELECT d.identity_namespace, d.source_document_key, d.document_type, min(m.basis) AS basis
           FROM raw_recall_membership m
           JOIN raw_recall_event e ON e.raw_recall_event_id = m.raw_recall_event_id
           JOIN raw_document d ON d.document_id = m.document_id
          WHERE e.publisher_key = ? AND e.upstream_event_id = ? AND e.fei_number = ?
          GROUP BY d.document_id
          ORDER BY d.document_id`,
      )
      .all(publisherKey, group.eventId, group.feiNumber)
      .map((row) => ({
        identity: { namespace: row.identity_namespace, key: row.source_document_key },
        documentType: row.document_type,
        basis: row.basis as RecallAssociation["basis"],
      }));
  }

  #link(association: RecallAssociation): LinkResult {
    const db = this.#db;
    const document = db
      .query<{ document_id: number; current_revision_id: number | null }, [string, string, string]>(
        `SELECT document_id, current_revision_id FROM raw_document
          WHERE publisher_key = ? AND identity_namespace = ? AND source_document_key = ?`,
      )
      .get(association.publisherKey, association.identity.namespace, association.identity.key);
    if (!document || document.current_revision_id === null) {
      throw new Error("a recall association needs a stored document");
    }
    db.query<never, [string, string, string]>(
      `INSERT OR IGNORE INTO raw_recall_event (publisher_key, upstream_event_id, fei_number)
       VALUES (?, ?, ?)`,
    ).run(association.publisherKey, association.eventId, association.feiNumber);
    const event = db
      .query<{ raw_recall_event_id: number }, [string, string, string]>(
        `SELECT raw_recall_event_id FROM raw_recall_event
          WHERE publisher_key = ? AND upstream_event_id = ? AND fei_number = ?`,
      )
      .get(association.publisherKey, association.eventId, association.feiNumber) as {
      raw_recall_event_id: number;
    };
    const inserted = db
      .query<never, [number, number, number, string, string]>(
        `INSERT OR IGNORE INTO raw_recall_membership
           (raw_recall_event_id, document_id, supporting_revision_id, basis, linked_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        event.raw_recall_event_id,
        document.document_id,
        document.current_revision_id,
        association.basis,
        new Date().toISOString(),
      );
    return {
      recallEventId: event.raw_recall_event_id,
      documentId: document.document_id,
      membership: inserted.changes > 0 ? "added" : "existing",
    };
  }

  putRecord(input: PutRecordInput): StoreOutcome {
    return this.transaction((tx) => tx.putRecord(input));
  }

  /** Every revision occurrence of one document, oldest first. */
  history(publisherKey: string, identity: DocumentIdentity): RevisionEntry[] {
    const rows = this.#db
      .query<RevisionRow, [string, string, string]>(
        `SELECT r.revision_id, r.revision_sequence, r.content_hash, r.retrieved_at, r.payload_id,
                r.record_json
           FROM raw_revision r
           JOIN raw_document d ON d.document_id = r.document_id
          WHERE d.publisher_key = ? AND d.identity_namespace = ? AND d.source_document_key = ?
          ORDER BY r.revision_sequence`,
      )
      .all(publisherKey, identity.namespace, identity.key);
    return rows.map((row) => ({
      revisionId: row.revision_id,
      revisionSequence: row.revision_sequence,
      contentHash: row.content_hash,
      retrievedAt: row.retrieved_at,
      payloadId: row.payload_id,
      record: decodeCollectorRecordV1(row.record_json),
    }));
  }

  payloadBytes(payloadId: number): Uint8Array | undefined {
    const row = this.#db
      .query<{ bytes: Uint8Array }, [number]>("SELECT bytes FROM raw_payload WHERE payload_id = ?")
      .get(payloadId);
    return row?.bytes;
  }

  counts(): { documents: number; revisions: number; payloads: number; observations: number } {
    const count = (table: string) =>
      (
        this.#db.query<{ n: number }, []>(`SELECT count(*) AS n FROM ${table}`).get() as {
          n: number;
        }
      ).n;
    return {
      documents: count("raw_document"),
      revisions: count("raw_revision"),
      payloads: count("raw_payload"),
      observations: count("raw_observation"),
    };
  }

  settings(): { journalMode: string; foreignKeys: boolean; synchronous: string } {
    const pragma = (name: string) =>
      Object.values(this.#db.query(`PRAGMA ${name}`).get() as Record<string, unknown>)[0];
    const synchronous = ["off", "normal", "full", "extra"][Number(pragma("synchronous"))] ?? "?";
    return {
      journalMode: String(pragma("journal_mode")),
      foreignKeys: pragma("foreign_keys") === 1,
      synchronous,
    };
  }

  close(): void {
    this.#db.close();
  }

  #put({ identity, record, observationKey }: PutRecordInput): StoreOutcome {
    const db = this.#db;
    const replay = db
      .query<ObservationRow, [string]>(
        `SELECT o.document_id, o.revision_id, r.revision_sequence
           FROM raw_observation o JOIN raw_revision r ON r.revision_id = o.revision_id
          WHERE o.observation_key = ?`,
      )
      .get(observationKey);
    if (replay) {
      return {
        disposition: "replayed",
        documentId: replay.document_id,
        revisionId: replay.revision_id,
        revisionSequence: replay.revision_sequence,
      };
    }

    const recordJson = encodeCollectorRecordV1(record);
    const contentHash = sourceContentHash(record);
    const publisherKey = record.source.key;
    let document = db
      .query<DocumentRow, [string, string, string]>(
        `SELECT d.document_id, d.current_revision_id, r.content_hash, r.revision_sequence
           FROM raw_document d LEFT JOIN raw_revision r ON r.revision_id = d.current_revision_id
          WHERE d.publisher_key = ? AND d.identity_namespace = ? AND d.source_document_key = ?`,
      )
      .get(publisherKey, identity.namespace, identity.key);

    let disposition: Disposition;
    if (!document) {
      const inserted = db
        .query<{ document_id: number }, [string, string, string, string, string, string]>(
          `INSERT INTO raw_document (publisher_key, identity_namespace, source_document_key,
                                     document_type, first_seen_at, last_seen_at)
           VALUES (?, ?, ?, ?, ?, ?) RETURNING document_id`,
        )
        .get(
          publisherKey,
          identity.namespace,
          identity.key,
          record.document_type,
          record.retrieved_at,
          record.retrieved_at,
        ) as { document_id: number };
      document = {
        document_id: inserted.document_id,
        current_revision_id: null,
        content_hash: null,
        revision_sequence: null,
      };
      disposition = "new";
    } else {
      disposition = document.content_hash === contentHash ? "duplicate" : "changed";
    }

    let revisionId = document.current_revision_id;
    let revisionSequence = document.revision_sequence;
    if (disposition !== "duplicate") {
      db.query<never, [string, string, Uint8Array]>(
        "INSERT OR IGNORE INTO raw_payload (content_hash, media_type, bytes) VALUES (?, ?, ?)",
      ).run(contentHash, record.payload.media_type, payloadBytes(record.payload));
      const payload = db
        .query<{ payload_id: number }, [string]>(
          "SELECT payload_id FROM raw_payload WHERE content_hash = ?",
        )
        .get(contentHash) as { payload_id: number };
      const revision = db
        .query<
          { revision_id: number; revision_sequence: number },
          [number, number | null, string, number, string, string]
        >(
          `INSERT INTO raw_revision (revision_sequence, document_id, previous_revision_id,
                                     content_hash, payload_id, record_json, retrieved_at)
           VALUES ((SELECT coalesce(max(revision_sequence), 0) + 1 FROM raw_revision),
                   ?, ?, ?, ?, ?, ?)
           RETURNING revision_id, revision_sequence`,
        )
        .get(
          document.document_id,
          document.current_revision_id,
          contentHash,
          payload.payload_id,
          recordJson,
          record.retrieved_at,
        ) as { revision_id: number; revision_sequence: number };
      revisionId = revision.revision_id;
      revisionSequence = revision.revision_sequence;
      db.query<never, [number, number]>(
        "UPDATE raw_document SET current_revision_id = ? WHERE document_id = ?",
      ).run(revisionId, document.document_id);
    }
    db.query<never, [string, number]>(
      "UPDATE raw_document SET last_seen_at = max(last_seen_at, ?) WHERE document_id = ?",
    ).run(record.retrieved_at, document.document_id);

    db.query<never, [string, number, number, string, string, string]>(
      `INSERT INTO raw_observation (observation_key, document_id, revision_id, disposition,
                                    retrieved_at, committed_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      observationKey,
      document.document_id,
      revisionId as number,
      disposition,
      record.retrieved_at,
      new Date().toISOString(),
    );
    return {
      disposition,
      documentId: document.document_id,
      revisionId: revisionId as number,
      revisionSequence: revisionSequence as number,
    };
  }
}

interface RevisionRow {
  revision_id: number;
  revision_sequence: number;
  content_hash: string;
  retrieved_at: string;
  payload_id: number;
  record_json: string;
}

interface ObservationRow {
  document_id: number;
  revision_id: number;
  revision_sequence: number;
}

interface DocumentRow {
  document_id: number;
  current_revision_id: number | null;
  content_hash: string | null;
  revision_sequence: number | null;
}

function migrate(db: Database): void {
  const current = (db.query<{ user_version: number }, []>("PRAGMA user_version").get() ?? {
    user_version: 0,
  }) as { user_version: number };
  for (let version = current.user_version; version < MIGRATIONS.length; version++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[version] as string);
      db.exec(`PRAGMA user_version = ${version + 1}`);
    }).immediate();
  }
}
