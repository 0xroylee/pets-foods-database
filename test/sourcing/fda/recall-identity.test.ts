import { Database } from "bun:sqlite";
import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  type CollectorRecordV1,
  createCollectorRecordV1,
  FDA_DOCUMENT_TYPES,
} from "../../../src/sourcing/contract/collector-record.ts";
import {
  IRES_PRODUCT_ROW,
  iresProductRowIdentity,
  storeAndLink,
  UNRESOLVED_EVIDENCE,
} from "../../../src/sourcing/fda/recall-identity.ts";
import { type DocumentIdentity, RawStore } from "../../../src/sourcing/store/raw-store.ts";

const FDA = { key: "us-fda", name: "U.S. Food and Drug Administration" };
const FEI = "3001234567";
const PRESS_URL =
  "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/example-recall";
const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function openStore(): { store: RawStore; path: string } {
  const dir = mkdtempSync(join(tmpdir(), "pfdb-recall-"));
  dirs.push(dir);
  const path = join(dir, "raw.sqlite");
  return { store: RawStore.open(path), path };
}

function record(
  documentType: string,
  sourceIds: Record<string, string>,
  body: unknown,
  retrievedAt = "2026-10-31T08:00:00Z",
): CollectorRecordV1 {
  return createCollectorRecordV1({
    source: FDA,
    source_ids: sourceIds,
    document_type: documentType,
    original_url: "https://www.accessdata.fda.gov/scripts/ires/index.cfm",
    retrieved_at: retrievedAt,
    payload: { media_type: "application/json", encoding: "utf8", body: JSON.stringify(body) },
    origin: {
      collector: "fda",
      collector_version: "0.1.0",
      acquisition: "api",
      fixture: true,
      referenced_urls: [],
    },
    extracted: {},
  });
}

function iresRow(rowKey: string | undefined, eventId: string, extra: Record<string, string> = {}) {
  const ids: Record<string, string> = { recall_event_id: eventId, fei_number: FEI, ...extra };
  if (rowKey) ids.product_row_key = rowKey;
  return record(FDA_DOCUMENT_TYPES.enforcementReportRecall, ids, { rowKey, eventId, ...extra });
}

describe("one recall, several representations (T3-A1, T3-A3)", () => {
  test("press release, iRES row and Dashboard row of one recall share one group", () => {
    const { store, path } = openStore();
    const ires = iresRow("90001-P1", "90001", { recall_number: "V-0123-2026" });
    const iresId = iresProductRowIdentity(ires);
    const dashboard = record(
      "dashboard_recall_row",
      { recall_event_id: "90001", fei_number: FEI, dashboard_row_key: "D-555" },
      { row: "D-555" },
    );
    const dashboardId: DocumentIdentity = { namespace: "fda_dashboard_row", key: "D-555" };
    const press = record(FDA_DOCUMENT_TYPES.recallPressRelease, {}, { headline: "Example recall" });
    const pressId: DocumentIdentity = { namespace: "fda_press_release_url", key: PRESS_URL };

    store.transaction((tx) => {
      storeAndLink(tx, { identity: iresId, record: ires, observationKey: "ires#1" });
      storeAndLink(tx, { identity: dashboardId, record: dashboard, observationKey: "dash#1" });
      tx.putRecord({ identity: pressId, record: press, observationKey: "press#1" });
      // The iRES record cites the press release, so it supplies the press release's event.
      tx.linkRecallEvent({
        publisherKey: FDA.key,
        eventId: "90001",
        feiNumber: FEI,
        identity: pressId,
        basis: "source_cross_reference",
      });
    });
    store.close();

    const reopened = RawStore.open(path);
    const members = reopened.recallGroupMembers(FDA.key, { eventId: "90001", feiNumber: FEI });
    expect(members.map((m) => m.documentType).sort()).toEqual(
      ["dashboard_recall_row", "enforcement_report_recall", "recall_press_release"].sort(),
    );
    for (const id of [iresId, dashboardId, pressId]) {
      expect(reopened.history(FDA.key, id)).toHaveLength(1);
    }
    expect(reopened.counts().documents).toBe(3);
    reopened.close();
  });

  test("two events at one firm stay separate groups", () => {
    const { store } = openStore();
    const first = iresRow("90001-P1", "90001");
    const second = iresRow("90002-P1", "90002");
    store.transaction((tx) => {
      storeAndLink(tx, {
        identity: iresProductRowIdentity(first),
        record: first,
        observationKey: "a",
      });
      storeAndLink(tx, {
        identity: iresProductRowIdentity(second),
        record: second,
        observationKey: "b",
      });
    });
    expect(store.recallGroupsFor(FDA.key, iresProductRowIdentity(first))).toEqual([
      { eventId: "90001", feiNumber: FEI },
    ]);
    expect(store.recallGroupsFor(FDA.key, iresProductRowIdentity(second))).toEqual([
      { eventId: "90002", feiNumber: FEI },
    ]);
    store.close();
  });
});

describe("records without a recall number (T3-A2)", () => {
  test("an unclassified record with event ID and FEI is linked", () => {
    const { store } = openStore();
    const unclassified = iresRow("90003-P1", "90003", { status: "Not Yet Classified" });
    const result = store.transaction((tx) =>
      storeAndLink(tx, {
        identity: iresProductRowIdentity(unclassified),
        record: unclassified,
        observationKey: "u1",
      }),
    );
    expect(result.link?.membership).toBe("added");
    expect(store.recallGroupsFor(FDA.key, iresProductRowIdentity(unclassified))).toEqual([
      { eventId: "90003", feiNumber: FEI },
    ]);
    store.close();
  });

  test("a record missing its FEI is stored but not linked", () => {
    const { store } = openStore();
    const partial = record(
      FDA_DOCUMENT_TYPES.enforcementReportRecall,
      { recall_event_id: "90004", product_row_key: "90004-P1" },
      { eventId: "90004" },
    );
    const identity = iresProductRowIdentity(partial);
    const result = store.transaction((tx) =>
      storeAndLink(tx, { identity, record: partial, observationKey: "p1" }),
    );
    expect(result.link).toBeUndefined();
    expect(store.history(FDA.key, identity)).toHaveLength(1);
    expect(store.recallGroupsFor(FDA.key, identity)).toEqual([]);
    store.close();
  });
});

describe("product rows keep their own identity (T3-A3)", () => {
  test("two unclassified rows with one event and FEI stay two documents", () => {
    const { store, path } = openStore();
    const rowOne = iresRow("90005-P1", "90005", { status: "Not Yet Classified" });
    const rowTwo = iresRow("90005-P2", "90005", { status: "Not Yet Classified" });
    store.transaction((tx) => {
      storeAndLink(tx, {
        identity: iresProductRowIdentity(rowOne),
        record: rowOne,
        observationKey: "1",
      });
      storeAndLink(tx, {
        identity: iresProductRowIdentity(rowTwo),
        record: rowTwo,
        observationKey: "2",
      });
    });
    const rowOneLater = iresRow("90005-P1", "90005", { status: "Class II" });
    store.transaction((tx) =>
      storeAndLink(tx, {
        identity: iresProductRowIdentity(rowOneLater),
        record: rowOneLater,
        observationKey: "3",
      }),
    );
    store.close();

    const reopened = RawStore.open(path);
    expect(reopened.counts().documents).toBe(2);
    expect(
      reopened.history(FDA.key, { namespace: IRES_PRODUCT_ROW, key: "90005-P1" }),
    ).toHaveLength(2);
    expect(
      reopened.history(FDA.key, { namespace: IRES_PRODUCT_ROW, key: "90005-P2" }),
    ).toHaveLength(1);
    const members = reopened.recallGroupMembers(FDA.key, { eventId: "90005", feiNumber: FEI });
    expect(members.map((m) => m.identity.key)).toEqual(["90005-P1", "90005-P2"]);
    reopened.close();
  });

  test("rows without a verified row key are kept as separate unresolved evidence", () => {
    const { store } = openStore();
    const first = iresRow(undefined, "90006", { product: "Chicken Recipe" });
    const second = iresRow(undefined, "90006", { product: "Beef Recipe" });
    expect(iresProductRowIdentity(first).namespace).toBe(UNRESOLVED_EVIDENCE);
    store.transaction((tx) => {
      storeAndLink(tx, {
        identity: iresProductRowIdentity(first),
        record: first,
        observationKey: "1",
      });
      storeAndLink(tx, {
        identity: iresProductRowIdentity(second),
        record: second,
        observationKey: "2",
      });
    });
    expect(store.counts().documents).toBe(2);
    store.close();
  });

  test("documents and memberships cannot be deleted", () => {
    const { store, path } = openStore();
    const row = iresRow("90007-P1", "90007");
    store.transaction((tx) =>
      storeAndLink(tx, { identity: iresProductRowIdentity(row), record: row, observationKey: "1" }),
    );
    // Both tables must have a row, or a DELETE would have nothing to refuse.
    expect(store.recallGroupsFor(FDA.key, iresProductRowIdentity(row))).toHaveLength(1);
    const raw = new Database(path);
    expect(() => raw.exec("DELETE FROM raw_document")).toThrow("never deleted");
    expect(() => raw.exec("DELETE FROM raw_recall_membership")).toThrow("never deleted");
    raw.close();
    store.close();
  });
});
