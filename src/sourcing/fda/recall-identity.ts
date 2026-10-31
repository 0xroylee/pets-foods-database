// FDA recall identity rules (sourcing plan T3). A recall group correlates documents; it never
// replaces a document's own identity, and it is not a core Incident.

import type { CollectorRecordV1 } from "../contract/collector-record.ts";
import type {
  DocumentIdentity,
  LinkResult,
  PutRecordInput,
  RawTransaction,
  StoreOutcome,
} from "../store/raw-store.ts";

export const IRES_PRODUCT_ROW = "ires_product_row";
export const UNRESOLVED_EVIDENCE = "unresolved_evidence";

/** The event ID and FEI number a record states about itself. A recall number is not needed. */
export function explicitRecallIdentifiers(
  record: CollectorRecordV1,
): { eventId: string; feiNumber: string } | undefined {
  const eventId = record.source_ids.recall_event_id ?? record.extracted.recall_event_id;
  const feiNumber = record.source_ids.fei_number ?? record.extracted.fei_number;
  return eventId && feiNumber ? { eventId, feiNumber } : undefined;
}

/**
 * One iRES product row is identified by its verified upstream row key (T7 confirms the field).
 * Without that key the record is kept as unresolved evidence under its content hash. It is never
 * keyed by a shared page URL, the event/FEI pair, a missing recall number or the description,
 * because several product rows can share all of those.
 */
export function iresProductRowIdentity(record: CollectorRecordV1): DocumentIdentity {
  const rowKey = record.source_ids.product_row_key;
  return rowKey
    ? { namespace: IRES_PRODUCT_ROW, key: rowKey }
    : { namespace: UNRESOLVED_EVIDENCE, key: record.content_hash };
}

/** Stores a record, then links it to its recall group when its own identifiers name one. */
export function storeAndLink(
  tx: RawTransaction,
  input: PutRecordInput,
): { stored: StoreOutcome; link?: LinkResult } {
  const stored = tx.putRecord(input);
  const ids = explicitRecallIdentifiers(input.record);
  if (!ids) return { stored };
  const link = tx.linkRecallEvent({
    publisherKey: input.record.source.key,
    eventId: ids.eventId,
    feiNumber: ids.feiNumber,
    identity: input.identity,
    basis: "explicit_identifiers",
  });
  return { stored, link };
}
