import { describe, expect, test } from "bun:test";
import {
  COLLECTOR_RECORD_V1,
  CollectorRecordError,
  type CollectorRecordV1,
  createCollectorRecordV1,
  decodeCollectorRecordV1,
  decodeCollectorRecordV1Detailed,
  encodeCollectorRecordV1,
  FDA_DOCUMENT_TYPES,
  validateImportCompatibility,
} from "../../../src/sourcing/contract/collector-record.ts";
import { extractAvailableFields } from "../../../src/sourcing/contract/extract.ts";
import golden from "./fixtures/golden-record-v1.json";

// Written out on purpose: if the constant in the code changes, these tests must notice.
const FROZEN_DISCRIMINATOR = "pfdb.collector-record.v1";

function sampleRecord(overrides: Partial<CollectorRecordV1> = {}): CollectorRecordV1 {
  return createCollectorRecordV1({
    source: { key: "us-fda", name: "U.S. Food and Drug Administration" },
    source_ids: { recall_event_id: "90002", recall_number: "V-0456-2026" },
    document_type: FDA_DOCUMENT_TYPES.enforcementReportRecall,
    original_url: "https://www.accessdata.fda.gov/scripts/ires/index.cfm?Event=90002",
    retrieved_at: "2026-10-31T09:30:00.250Z",
    payload: {
      media_type: "application/json",
      encoding: "utf8",
      body: '{"recalleventid":"90002"}',
    },
    origin: {
      collector: "fda-ires",
      collector_version: "0.1.0",
      acquisition: "api",
      fixture: true,
      referenced_urls: ["https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"],
    },
    extracted: { firm: "Example Pet Foods LLC", markets: ["US"] },
    ...overrides,
  });
}

function roundTrip(record: CollectorRecordV1): CollectorRecordV1 {
  return decodeCollectorRecordV1(encodeCollectorRecordV1(record));
}

describe("CollectorRecordV1 discriminator and import compatibility (T1-A1)", () => {
  test("the golden v1 record decodes and re-encodes unchanged", () => {
    const decoded = decodeCollectorRecordV1(golden);
    expect(JSON.parse(encodeCollectorRecordV1(decoded))).toEqual(golden);
  });

  test("encoded records carry the frozen discriminator", () => {
    expect(COLLECTOR_RECORD_V1).toBe(FROZEN_DISCRIMINATOR);
    expect(JSON.parse(encodeCollectorRecordV1(sampleRecord())).schema).toBe(FROZEN_DISCRIMINATOR);
  });

  test("the import decoder accepts collector output unchanged", () => {
    const result = validateImportCompatibility([sampleRecord(), decodeCollectorRecordV1(golden)]);
    expect(result).toEqual({ accepted: 2, rejected: [] });
  });

  test("a record with another discriminator is rejected for import", () => {
    const result = validateImportCompatibility([{ ...golden, schema: "pfdb.collector-record.v2" }]);
    expect(result.accepted).toBe(0);
    expect(result.rejected[0]?.reason).toContain("schema");
  });
});

describe("CollectorRecordV1 metadata round trip (T1-A2)", () => {
  test("the encoded record carries the original URL", () => {
    const record = sampleRecord();
    expect(JSON.parse(encodeCollectorRecordV1(record)).original_url).toBe(record.original_url);
  });

  test("round trip preserves every metadata field", () => {
    const record = sampleRecord();
    const decoded = roundTrip(record);
    expect(decoded.source).toEqual(record.source);
    expect(decoded.source_ids).toEqual(record.source_ids);
    expect(decoded.original_url).toBe(record.original_url);
    expect(decoded.retrieved_at).toBe(record.retrieved_at);
    expect(decoded.document_type).toBe(record.document_type);
    expect(decoded.payload).toEqual(record.payload);
    expect(decoded.content_hash).toBe(record.content_hash);
    expect(decoded.origin).toEqual(record.origin);
  });

  test("a base64 payload keeps its bytes and hash", () => {
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0xff]);
    const record = sampleRecord({
      payload: {
        media_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        encoding: "base64",
        body: Buffer.from(bytes).toString("base64"),
      },
    });
    const decoded = roundTrip(record);
    expect(Buffer.from(decoded.payload.body, "base64")).toEqual(Buffer.from(bytes));
    expect(decoded.content_hash).toBe(record.content_hash);
  });

  test("a sparse record keeps missing optional values absent", () => {
    const decoded = roundTrip(sampleRecord({ extracted: {} }));
    expect(decoded.extracted).toEqual({});
  });
});

describe("FDA document types (T1-A3)", () => {
  test("the four FDA document types keep their frozen values", () => {
    expect(FDA_DOCUMENT_TYPES).toEqual({
      enforcementReportRecall: "enforcement_report_recall",
      recallPressRelease: "recall_press_release",
      warningLetter: "warning_letter",
      advisory: "advisory",
    });
  });

  test("each FDA document type survives serialization distinctly", () => {
    const types = Object.values(FDA_DOCUMENT_TYPES);
    const decodedTypes = types.map(
      (type) => roundTrip(sampleRecord({ document_type: type })).document_type,
    );
    expect(decodedTypes).toEqual(types);
    expect(new Set(decodedTypes).size).toBe(4);
  });

  test("a type from a later source needs no new version", () => {
    expect(roundTrip(sampleRecord({ document_type: "rasff_notification" })).document_type).toBe(
      "rasff_notification",
    );
  });
});

describe("extracted fields (T1-A4)", () => {
  test("every available extracted field survives a round trip", () => {
    const decoded = decodeCollectorRecordV1(golden);
    expect(roundTrip(decoded).extracted).toEqual(
      golden.extracted as CollectorRecordV1["extracted"],
    );
  });

  test("encoded barcodes are JSON strings with leading zeros", () => {
    const extracted = extractAvailableFields({ text: ["UPC 0 32251 00429 2"] });
    const encoded = JSON.parse(encodeCollectorRecordV1(sampleRecord({ extracted })));
    expect(encoded.extracted.barcodes[0].value).toBe("032251004292");
  });

  test("barcodes extracted before encoding stay strings with leading zeros", () => {
    const description =
      "Example Brand Dry Cat Food UPC 0 32251 00429 2; EAN 4006381333931; case GTIN 10012345000017";
    const extracted = extractAvailableFields({
      text: [description],
      declared: { firm: "Example" },
    });
    const decoded = roundTrip(sampleRecord({ extracted }));
    const values = decoded.extracted.barcodes?.map((b) => b.value);
    expect(values).toEqual(["032251004292", "4006381333931", "10012345000017"]);
    expect(values?.every((v) => typeof v === "string")).toBe(true);
    expect(decoded.extracted.barcodes?.map((b) => b.format)).toEqual([
      "upc_a",
      "ean_13",
      "gtin_14",
    ]);
  });
});

describe("decoder allowlist", () => {
  test("unknown and reserved fields are dropped and reported", () => {
    const input = {
      ...golden,
      publication_state: "Published",
      reviewer: "someone",
      origin: { ...golden.origin, official: true },
      extracted: { ...golden.extracted, brand_owner: "Example Holdings" },
    };
    const { record, ignoredFields } = decodeCollectorRecordV1Detailed(input);
    expect(ignoredFields.sort()).toEqual(
      ["extracted.brand_owner", "origin.official", "publication_state", "reviewer"].sort(),
    );
    const encoded = JSON.parse(encodeCollectorRecordV1(record));
    expect(encoded).not.toHaveProperty("publication_state");
    expect(encoded.origin).not.toHaveProperty("official");
  });

  test.each([
    ["another discriminator", { schema: "pfdb.collector-record.v2" }],
    ["no original URL", { original_url: undefined }],
    ["a relative original URL", { original_url: "/scripts/ires/index.cfm" }],
    ["a retrieval time without a zone", { retrieved_at: "2026-10-31 09:30:00" }],
    ["a hash that does not match the payload", { content_hash: `sha256:${"0".repeat(64)}` }],
  ])("a record with %s is rejected", (_label, change) => {
    expect(() => decodeCollectorRecordV1({ ...golden, ...change })).toThrow(CollectorRecordError);
  });

  test("a barcode stored as a number is rejected", () => {
    const barcodes = [{ value: 32251004292, format: "upc_a", origin: "declared", valid: true }];
    const input = { ...golden, extracted: { ...golden.extracted, barcodes } };
    expect(() => decodeCollectorRecordV1(input)).toThrow(CollectorRecordError);
  });
});
