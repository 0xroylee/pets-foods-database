import { Database } from "bun:sqlite";
import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  type CollectorRecordV1,
  createCollectorRecordV1,
  FDA_DOCUMENT_TYPES,
} from "../../../src/sourcing/contract/collector-record.ts";
import { type DocumentIdentity, RawStore } from "../../../src/sourcing/store/raw-store.ts";

const ROW: DocumentIdentity = { namespace: "ires_product_row", key: "90001-1" };
const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function storePath(): string {
  const dir = mkdtempSync(join(tmpdir(), "pfdb-store-"));
  dirs.push(dir);
  return join(dir, "raw", "raw.sqlite");
}

function iresRecord(body: Record<string, string>, retrievedAt: string): CollectorRecordV1 {
  return createCollectorRecordV1({
    source: { key: "us-fda", name: "U.S. Food and Drug Administration" },
    source_ids: { recall_event_id: "90001" },
    document_type: FDA_DOCUMENT_TYPES.enforcementReportRecall,
    original_url: "https://www.accessdata.fda.gov/scripts/ires/index.cfm?Event=90001",
    retrieved_at: retrievedAt,
    payload: { media_type: "application/json", encoding: "utf8", body: JSON.stringify(body) },
    origin: {
      collector: "fda-ires",
      collector_version: "0.1.0",
      acquisition: "api",
      fixture: true,
      referenced_urls: [],
    },
    extracted: body.classification ? { classification: body.classification } : {},
  });
}

const A = { recalleventid: "90001", status: "Ongoing", classification: "Class II" };
const B = { recalleventid: "90001", status: "Terminated", classification: "Class II" };

function mode(path: string): string {
  return (statSync(path).mode & 0o777).toString(8);
}

describe("private storage (T2-A1)", () => {
  test("the database, its sidecar files and its directory are owner-only", () => {
    const path = storePath();
    const store = RawStore.open(path);
    store.putRecord({
      identity: ROW,
      record: iresRecord(A, "2026-10-31T08:00:00Z"),
      observationKey: "w1",
    });
    expect(mode(join(path, ".."))).toBe("700");
    expect(mode(path)).toBe("600");
    expect(mode(`${path}-wal`)).toBe("600");
    expect(mode(`${path}-shm`)).toBe("600");
    store.close();
  });

  test("durability settings are on", () => {
    const store = RawStore.open(storePath());
    expect(store.settings()).toEqual({
      journalMode: "wal",
      foreignKeys: true,
      synchronous: "full",
    });
    store.close();
  });
});

describe("stored-once identity and revision occurrences (T2-A2, T2-A3)", () => {
  test("A, A, B, B, A, A across reopenings gives one document and three ordered revisions", () => {
    const path = storePath();
    const steps = [A, A, B, B, A, A];
    const dispositions: string[] = [];
    let store = RawStore.open(path);
    steps.forEach((body, i) => {
      if (i % 2 === 0) {
        store.close();
        store = RawStore.open(path);
      }
      const record = iresRecord(body, `2026-10-31T0${i}:00:00Z`);
      dispositions.push(
        store.putRecord({ identity: ROW, record, observationKey: `w${i}` }).disposition,
      );
    });

    expect(dispositions).toEqual([
      "new",
      "duplicate",
      "changed",
      "duplicate",
      "changed",
      "duplicate",
    ]);
    const history = store.history("us-fda", ROW);
    const [first, second, third] = history;
    expect(history).toHaveLength(3);
    expect(history.map((r) => JSON.parse(r.record.payload.body).status)).toEqual([
      "Ongoing",
      "Terminated",
      "Ongoing",
    ]);
    expect(third?.contentHash).toBe(first?.contentHash as string);
    expect(second?.contentHash).not.toBe(first?.contentHash as string);
    const sequences = history.map((r) => r.revisionSequence);
    expect(sequences).toEqual([...sequences].sort((a, b) => a - b));
    expect(new Set(sequences).size).toBe(3);
    expect(third?.payloadId).toBe(first?.payloadId as number);
    expect(store.counts()).toMatchObject({
      documents: 1,
      revisions: 3,
      payloads: 2,
      observations: 6,
    });
    store.close();
  });

  test("the earlier payload stays recoverable after the content changes", () => {
    const store = RawStore.open(storePath());
    store.putRecord({
      identity: ROW,
      record: iresRecord(A, "2026-10-31T08:00:00Z"),
      observationKey: "w1",
    });
    store.putRecord({
      identity: ROW,
      record: iresRecord(B, "2026-10-31T09:00:00Z"),
      observationKey: "w2",
    });
    const [first, second] = store.history("us-fda", ROW);
    const decode = (id: number | undefined) =>
      JSON.parse(new TextDecoder().decode(store.payloadBytes(id as number)));
    expect(decode(first?.payloadId)).toEqual(A);
    expect(decode(second?.payloadId)).toEqual(B);
    store.close();
  });

  test("the same content retrieved later is a duplicate and adds nothing", () => {
    const store = RawStore.open(storePath());
    store.putRecord({
      identity: ROW,
      record: iresRecord(A, "2026-10-31T08:00:00Z"),
      observationKey: "w1",
    });
    const later = store.putRecord({
      identity: ROW,
      record: iresRecord(A, "2026-11-01T08:00:00Z"),
      observationKey: "w2",
    });
    expect(later.disposition).toBe("duplicate");
    expect(store.counts()).toMatchObject({ documents: 1, revisions: 1, payloads: 1 });
    store.close();
  });

  test("replaying a committed observation writes nothing", () => {
    const store = RawStore.open(storePath());
    const record = iresRecord(A, "2026-10-31T08:00:00Z");
    store.putRecord({ identity: ROW, record, observationKey: "page-1#attempt-1" });
    const replay = store.putRecord({ identity: ROW, record, observationKey: "page-1#attempt-1" });
    expect(replay.disposition).toBe("replayed");
    expect(store.counts()).toMatchObject({ revisions: 1, observations: 1 });
    store.close();
  });
});

describe("status and classification history (T2-A4)", () => {
  test("a classification-only change is a new revision, read back in order", () => {
    const store = RawStore.open(storePath());
    const unclassified = {
      recalleventid: "90001",
      status: "Ongoing",
      classification: "Not Yet Classified",
    };
    const classified = { recalleventid: "90001", status: "Ongoing", classification: "Class II" };
    const first = store.putRecord({
      identity: ROW,
      record: iresRecord(unclassified, "2026-10-31T08:00:00Z"),
      observationKey: "w1",
    });
    const second = store.putRecord({
      identity: ROW,
      record: iresRecord(classified, "2026-11-07T08:00:00Z"),
      observationKey: "w2",
    });
    expect([first.disposition, second.disposition]).toEqual(["new", "changed"]);
    expect(store.history("us-fda", ROW).map((r) => r.record.extracted.classification)).toEqual([
      "Not Yet Classified",
      "Class II",
    ]);
    store.close();
  });

  test("stored revisions and payloads cannot be edited or deleted", () => {
    const path = storePath();
    const store = RawStore.open(path);
    store.putRecord({
      identity: ROW,
      record: iresRecord(A, "2026-10-31T08:00:00Z"),
      observationKey: "w1",
    });
    const raw = new Database(path);
    expect(() => raw.exec("UPDATE raw_revision SET record_json = '{}'")).toThrow("immutable");
    expect(() => raw.exec("DELETE FROM raw_revision")).toThrow("immutable");
    expect(() => raw.exec("UPDATE raw_payload SET bytes = x'00'")).toThrow("immutable");
    raw.close();
    store.close();
  });
});

// Persistence cases ported from Scrapy's dupefilter tests (tests/test_dupefilters.py, BSD-3).
describe("committed data across connections", () => {
  test("a store reopened later still knows the document", () => {
    const path = storePath();
    const first = RawStore.open(path);
    first.putRecord({
      identity: ROW,
      record: iresRecord(A, "2026-10-31T08:00:00Z"),
      observationKey: "w1",
    });
    first.close();
    const resumed = RawStore.open(path);
    const again = resumed.putRecord({
      identity: ROW,
      record: iresRecord(A, "2026-10-31T09:00:00Z"),
      observationKey: "w2",
    });
    expect(again.disposition).toBe("duplicate");
    resumed.close();
  });

  test("a second connection sees committed rows", () => {
    const path = storePath();
    const writer = RawStore.open(path);
    const reader = RawStore.open(path);
    writer.putRecord({
      identity: ROW,
      record: iresRecord(A, "2026-10-31T08:00:00Z"),
      observationKey: "w1",
    });
    expect(reader.history("us-fda", ROW)).toHaveLength(1);
    writer.close();
    reader.close();
  });

  test("an interrupted transaction leaves nothing behind", () => {
    const path = storePath();
    const store = RawStore.open(path);
    expect(() =>
      store.transaction((tx) => {
        tx.putRecord({
          identity: ROW,
          record: iresRecord(A, "2026-10-31T08:00:00Z"),
          observationKey: "w1",
        });
        throw new Error("interrupted");
      }),
    ).toThrow("interrupted");
    store.close();
    const reopened = RawStore.open(path);
    expect(reopened.counts()).toEqual({ documents: 0, revisions: 0, payloads: 0, observations: 0 });
    reopened.close();
  });
});
