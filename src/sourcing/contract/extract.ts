// Turns what a source declares, plus its free text, into a record's extracted fields.
// Missing values stay absent; nothing is invented.

import { extractBarcodes } from "./barcodes.ts";
import type { ExtractedFields } from "./collector-record.ts";

export interface SourceDocument {
  /** Free-text fields to scan for barcodes, e.g. product description and code information. */
  text: readonly string[];
  /** Values the source states in its own fields. */
  declared?: Omit<ExtractedFields, "barcodes"> & { barcodes?: readonly string[] };
}

const STRING_KEYS = [
  "product_description",
  "firm",
  "fei_number",
  "recall_number",
  "recall_event_id",
  "classification",
  "status",
  "distribution",
] as const;
const LIST_KEYS = ["markets", "lot_codes", "best_by_dates"] as const;

export function extractAvailableFields(doc: SourceDocument): ExtractedFields {
  const declared = doc.declared ?? {};
  const fields: ExtractedFields = {};

  for (const key of STRING_KEYS) {
    const value = declared[key]?.trim();
    if (value) fields[key] = value;
  }
  for (const key of LIST_KEYS) {
    const values = (declared[key] ?? []).map((v) => v.trim()).filter(Boolean);
    if (values.length > 0) fields[key] = [...new Set(values)];
  }
  if (declared.dates) {
    const dates = Object.entries(declared.dates)
      .map(([name, value]) => [name, value.trim()] as const)
      .filter(([, value]) => value);
    if (dates.length > 0) fields.dates = Object.fromEntries(dates);
  }

  const barcodes = extractBarcodes(doc.text.join("\n"), declared.barcodes ?? []);
  if (barcodes.length > 0) fields.barcodes = barcodes;
  return fields;
}
