# One collector record format shared by collectors and the core's import

Every collector writes `CollectorRecordV1` (version marker `pfdb.collector-record.v1`), and the core's import (issue #14) reads that same format; the stage 1 plan's `ReportEnvelopeV1` is this format under another name. Records are snake_case JSON objects decoded against an allowlist: unknown fields, including any attempt to set publication, approval or Reviewer state, are dropped and reported, never applied. We chose one format, frozen by version, so collected records stay readable by the core no matter which collector or stage produced them.

## Consequences

- Changing what a field means needs a new version marker and a decoder that accepts both versions, because the raw store keeps records in the format they were written in.
- `document_type` is an open snake_case identifier, so later sources (EU RASFF, Taiwan 農業部, Lab Test bodies) add their own types without a new version.
- Barcodes stay strings so leading zeros survive. Declared barcodes are kept even when their check digit fails; barcodes found in free text are kept only when valid.
- The decoder verifies `content_hash` against the payload bytes, so a record whose payload was altered cannot be imported.
- The raw store keeps every change occurrence in order, and the hand-off to the core exports them in that order: a document that goes A → B → A is three occurrences, so the core sees the return to A.
