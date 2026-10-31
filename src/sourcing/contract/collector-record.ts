// CollectorRecordV1: the one record format every collector writes and the core's import
// (issue #14) reads. The stage 1 plan calls the same format ReportEnvelopeV1.
// See docs/adr/0002-collector-record-format.md.

import type { Barcode, BarcodeFormat, BarcodeOrigin } from "./barcodes.ts";

/** Frozen version discriminator. A changed meaning needs a new version, never an edit here. */
export const COLLECTOR_RECORD_V1 = "pfdb.collector-record.v1";

/** The FDA document types. Other sources add their own snake_case types without a new version. */
export const FDA_DOCUMENT_TYPES = {
  enforcementReportRecall: "enforcement_report_recall",
  recallPressRelease: "recall_press_release",
  warningLetter: "warning_letter",
  advisory: "advisory",
} as const;

export type Acquisition = "api" | "html" | "xlsx" | "rss" | "file";

export interface ExtractedFields {
  product_description?: string;
  firm?: string;
  fei_number?: string;
  recall_number?: string;
  recall_event_id?: string;
  classification?: string;
  status?: string;
  /** Named dates as given by the source, e.g. report_date or termination_date. */
  dates?: Record<string, string>;
  distribution?: string;
  markets?: string[];
  lot_codes?: string[];
  best_by_dates?: string[];
  barcodes?: Barcode[];
}

export interface CollectorRecordV1 {
  schema: typeof COLLECTOR_RECORD_V1;
  /** The publisher, e.g. { key: "us-fda", name: "U.S. Food and Drug Administration" }. */
  source: { key: string; name: string };
  /** Source-specific identifiers, e.g. recall_event_id, recall_number, fei_number. */
  source_ids: Record<string, string>;
  document_type: string;
  original_url: string;
  /** ISO 8601 time the payload was retrieved. */
  retrieved_at: string;
  payload: { media_type: string; encoding: "utf8" | "base64"; body: string };
  /** "sha256:" followed by the hex digest of the payload bytes. */
  content_hash: string;
  /** Where the record came from; referenced_urls lets the core detect Echoes later. */
  origin: {
    collector: string;
    collector_version: string;
    acquisition: Acquisition;
    fixture: boolean;
    referenced_urls: string[];
  };
  extracted: ExtractedFields;
}

export interface DecodedCollectorRecord {
  record: CollectorRecordV1;
  /** Dotted paths of fields that were present but not part of the format. They were dropped. */
  ignoredFields: string[];
}

export interface CompatibilityResult {
  accepted: number;
  rejected: { index: number; reason: string }[];
}

export class CollectorRecordError extends Error {
  override name = "CollectorRecordError";
}

const ACQUISITIONS: readonly Acquisition[] = ["api", "html", "xlsx", "rss", "file"];
const BARCODE_FORMATS: readonly BarcodeFormat[] = ["upc_a", "ean_13", "gtin_14", "unknown"];
const BARCODE_ORIGINS: readonly BarcodeOrigin[] = ["declared", "text"];
const SNAKE = /^[a-z][a-z0-9_]*$/;
const SOURCE_KEY = /^[a-z0-9][a-z0-9._-]*$/;
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const CONTENT_HASH = /^sha256:[0-9a-f]{64}$/;
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

const STRING_FIELDS = [
  "product_description",
  "firm",
  "fei_number",
  "recall_number",
  "recall_event_id",
  "classification",
  "status",
  "distribution",
] as const;
const STRING_LIST_FIELDS = ["markets", "lot_codes", "best_by_dates"] as const;

export function payloadBytes(payload: CollectorRecordV1["payload"]): Uint8Array {
  return payload.encoding === "base64"
    ? Buffer.from(payload.body, "base64")
    : new TextEncoder().encode(payload.body);
}

export function hashPayload(payload: CollectorRecordV1["payload"]): string {
  return `sha256:${new Bun.CryptoHasher("sha256").update(payloadBytes(payload)).digest("hex")}`;
}

/** Builds a record from collector output, computing the content hash from the payload. */
export function createCollectorRecordV1(
  fields: Omit<CollectorRecordV1, "schema" | "content_hash">,
): CollectorRecordV1 {
  return decodeCollectorRecordV1({
    schema: COLLECTOR_RECORD_V1,
    ...fields,
    content_hash: hashPayload(fields.payload),
  });
}

/** Serializes one record as a JSON object with a fixed key order. Invalid records throw. */
export function encodeCollectorRecordV1(record: CollectorRecordV1): string {
  const valid = decodeCollectorRecordV1(record);
  return JSON.stringify({
    schema: COLLECTOR_RECORD_V1,
    source: valid.source,
    source_ids: valid.source_ids,
    document_type: valid.document_type,
    original_url: valid.original_url,
    retrieved_at: valid.retrieved_at,
    payload: valid.payload,
    content_hash: valid.content_hash,
    origin: valid.origin,
    extracted: valid.extracted,
  });
}

export function decodeCollectorRecordV1(input: unknown): CollectorRecordV1 {
  return decodeCollectorRecordV1Detailed(input).record;
}

/**
 * The decoder the core's import uses. Accepts a JSON string or a parsed object, validates every
 * field against the allowlist, and drops unknown fields, reporting them in ignoredFields.
 */
export function decodeCollectorRecordV1Detailed(input: unknown): DecodedCollectorRecord {
  const raw = typeof input === "string" ? parseJson(input) : input;
  const ignoredFields: string[] = [];
  const top = object(raw, "record");
  noteUnknown(top, TOP_LEVEL_KEYS, "", ignoredFields);

  if (top.schema !== COLLECTOR_RECORD_V1) {
    throw new CollectorRecordError(`schema must be "${COLLECTOR_RECORD_V1}"`);
  }
  const source = object(top.source, "source");
  noteUnknown(source, ["key", "name"], "source.", ignoredFields);
  const payload = object(top.payload, "payload");
  noteUnknown(payload, ["media_type", "encoding", "body"], "payload.", ignoredFields);
  const origin = object(top.origin, "origin");
  noteUnknown(origin, ORIGIN_KEYS, "origin.", ignoredFields);

  const record: CollectorRecordV1 = {
    schema: COLLECTOR_RECORD_V1,
    source: {
      key: matching(source.key, SOURCE_KEY, "source.key"),
      name: text(source.name, "source.name"),
    },
    source_ids: stringMap(top.source_ids, "source_ids", true),
    document_type: matching(top.document_type, SNAKE, "document_type"),
    original_url: url(top.original_url, "original_url"),
    retrieved_at: matching(top.retrieved_at, ISO_TIME, "retrieved_at"),
    payload: {
      media_type: text(payload.media_type, "payload.media_type"),
      encoding: oneOf(payload.encoding, ["utf8", "base64"] as const, "payload.encoding"),
      body: payloadBody(payload),
    },
    content_hash: matching(top.content_hash, CONTENT_HASH, "content_hash"),
    origin: {
      collector: text(origin.collector, "origin.collector"),
      collector_version: text(origin.collector_version, "origin.collector_version"),
      acquisition: oneOf(origin.acquisition, ACQUISITIONS, "origin.acquisition"),
      fixture: bool(origin.fixture, "origin.fixture"),
      referenced_urls: list(origin.referenced_urls, "origin.referenced_urls").map((v, i) =>
        url(v, `origin.referenced_urls[${i}]`),
      ),
    },
    extracted: extractedFields(top.extracted, ignoredFields),
  };
  if (hashPayload(record.payload) !== record.content_hash) {
    throw new CollectorRecordError("content_hash does not match the payload bytes");
  }
  return { record, ignoredFields };
}

/** Checks that each record survives the import decoder unchanged. */
export function validateImportCompatibility(records: Iterable<unknown>): CompatibilityResult {
  const result: CompatibilityResult = { accepted: 0, rejected: [] };
  let index = 0;
  for (const record of records) {
    try {
      const encoded = encodeCollectorRecordV1(record as CollectorRecordV1);
      const { record: decoded, ignoredFields } = decodeCollectorRecordV1Detailed(encoded);
      if (ignoredFields.length > 0 || encodeCollectorRecordV1(decoded) !== encoded) {
        result.rejected.push({ index, reason: "record changed when decoded for import" });
      } else {
        result.accepted++;
      }
    } catch (error) {
      result.rejected.push({ index, reason: (error as Error).message });
    }
    index++;
  }
  return result;
}

const TOP_LEVEL_KEYS = [
  "schema",
  "source",
  "source_ids",
  "document_type",
  "original_url",
  "retrieved_at",
  "payload",
  "content_hash",
  "origin",
  "extracted",
];
const ORIGIN_KEYS = ["collector", "collector_version", "acquisition", "fixture", "referenced_urls"];
const EXTRACTED_KEYS = [...STRING_FIELDS, ...STRING_LIST_FIELDS, "dates", "barcodes"];

function extractedFields(value: unknown, ignoredFields: string[]): ExtractedFields {
  const input = object(value, "extracted");
  noteUnknown(input, EXTRACTED_KEYS, "extracted.", ignoredFields);
  const fields: ExtractedFields = {};
  for (const key of STRING_FIELDS) {
    if (input[key] !== undefined) fields[key] = text(input[key], `extracted.${key}`);
  }
  for (const key of STRING_LIST_FIELDS) {
    if (input[key] !== undefined) {
      fields[key] = list(input[key], `extracted.${key}`).map((v, i) =>
        text(v, `extracted.${key}[${i}]`),
      );
    }
  }
  if (input.dates !== undefined) fields.dates = stringMap(input.dates, "extracted.dates", false);
  if (input.barcodes !== undefined) {
    fields.barcodes = list(input.barcodes, "extracted.barcodes").map((v, i) => {
      const path = `extracted.barcodes[${i}]`;
      const barcode = object(v, path);
      noteUnknown(barcode, ["value", "format", "origin", "valid"], `${path}.`, ignoredFields);
      return {
        value: text(barcode.value, `${path}.value`),
        format: oneOf(barcode.format, BARCODE_FORMATS, `${path}.format`),
        origin: oneOf(barcode.origin, BARCODE_ORIGINS, `${path}.origin`),
        valid: bool(barcode.valid, `${path}.valid`),
      };
    });
  }
  return fields;
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    throw new CollectorRecordError("record is not valid JSON");
  }
}

function noteUnknown(
  value: Record<string, unknown>,
  known: readonly string[],
  prefix: string,
  ignored: string[],
): void {
  for (const key of Object.keys(value)) {
    if (!known.includes(key)) ignored.push(prefix + key);
  }
}

function object(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CollectorRecordError(`${path} must be an object`);
  }
  return value as Record<string, unknown>;
}

function list(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new CollectorRecordError(`${path} must be an array`);
  return value;
}

function text(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new CollectorRecordError(`${path} must be a non-empty string`);
  }
  return value;
}

function bool(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") throw new CollectorRecordError(`${path} must be a boolean`);
  return value;
}

function matching(value: unknown, pattern: RegExp, path: string): string {
  const s = text(value, path);
  if (!pattern.test(s)) throw new CollectorRecordError(`${path} has an invalid format`);
  return s;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new CollectorRecordError(`${path} must be one of ${allowed.join(", ")}`);
  }
  return value as T;
}

function url(value: unknown, path: string): string {
  const s = text(value, path);
  let parsed: URL;
  try {
    parsed = new URL(s);
  } catch {
    throw new CollectorRecordError(`${path} must be an absolute URL`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new CollectorRecordError(`${path} must be an http or https URL`);
  }
  return s;
}

function stringMap(value: unknown, path: string, snakeKeys: boolean): Record<string, string> {
  const input = object(value, path);
  const map: Record<string, string> = {};
  for (const [key, entry] of Object.entries(input)) {
    if (snakeKeys && !SNAKE.test(key)) {
      throw new CollectorRecordError(`${path}.${key} must be a snake_case key`);
    }
    map[key] = text(entry, `${path}.${key}`);
  }
  return map;
}

function payloadBody(payload: Record<string, unknown>): string {
  if (typeof payload.body !== "string") {
    throw new CollectorRecordError("payload.body must be a string");
  }
  if (payload.encoding === "base64" && !BASE64.test(payload.body)) {
    throw new CollectorRecordError("payload.body is not valid base64");
  }
  return payload.body;
}
