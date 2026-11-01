# FDA sourcing stage: private raw store and resumable collection

**Readiness: Draft**

Repaired implementation plan covering all 12 requirements and A1–A42. Repairs preserve chronological revision occurrences, bound stalled requests, verify redirect credential isolation, require incremental discovery and press-release detail collection, activate the Mac schedule, protect lock-file identity and retain complete attempt history. All implementation and verification remain proposed; no checks were run.

This is a proposed implementation plan. The target application has not been changed, and its tests or scripts were not run.

Saved report: `.unshit/2026-10-31T07-39-43-056Z-ff9173a0/plan.md`
Evidence manifest: `.unshit/2026-10-31T07-39-43-056Z-ff9173a0/manifest.json`

## Scope

**Final plan scope.** Repaired implementation plan covering all 12 requirements and A1–A42. Repairs preserve chronological revision occurrences, bound stalled requests, verify redirect credential isolation, require incremental discovery and press-release detail collection, activate the Mac schedule, protect lock-file identity and retain complete attempt history. All implementation and verification remain proposed; no checks were run.
**Initial intake summary (before material answers and source review).** Build the FDA sourcing stage of a pet food safety incident database on the owner's Mac using Bun, TypeScript and SQLite. Preserve the following 12 owner-confirmed requirements in their stated priority order. This stage collects and retains records for later core processing.

**Assumptions.**

- The 12 numbered items are the complete requirements in priority order; surrounding context guides their interpretation.
- Existing domain definitions and the CollectorRecordV1 import contract will be inspected during later source research.
- FDA coverage, endpoint behavior and other contextual research claims remain unverified until research.
- Fixture mode supports work while keys are unavailable; completing the full live backfill requires valid registered keys and source access.

**Out of scope.**

- Implementing the core, review page, AI triage, AI Summaries or publication already planned in docs/plans/stage1-plan.md.
- Implementing live collectors for the named non-FDA regulators and Lab Test sources; those require later plans.
- Grok discovery, which waits until the review page exists.
- Archived FDA material before 8 June 2012, including the 2007 melamine recalls.

## Brief approval

The host received approved true through the agent protocol; it cannot verify who approved this brief. Recorded 2026-10-31T08:17:39.336Z; brief SHA-256 `18895567dfd2d701b5be6db91e16cc55af6507e7892672b56da32f2054d99a23`.

## Requirement map

- **R1.** Define one versioned collector record format compatible unchanged with the stage 1 CollectorRecordV1 import contract. (you said: "1. Collector record format. One versioned record format that every collector produces and that the stage 1 import (issue #14, CollectorRecordV1) will accept unchanged. Each record carries its Source, source-specific identifiers, original URL, retrieval time, document type (Enforcement Report recall, recall press release, warning letter, advisory), the raw payload, a content hash, origin information that later lets the core detect Echoes, and extracted fields when available: product description, firm, FEI number, recall number, recall event ID, classification, status, dates, distribution and Markets, lot codes, best-by dates and barcodes.") → T1, T7, T8
  - A1: Every collector produces the same versioned record format, accepted unchanged by the stage 1 issue #14 CollectorRecordV1 contract. → T1 → T1-V1
  - A2: Every record includes its Source, source-specific identifiers, original URL, retrieval time, document type, raw payload, content hash and origin information for later Echo detection. → T1 → T1-V1
  - A3: Document types distinguish Enforcement Report recalls, recall press releases, warning letters and advisories. → T1 → T1-V1
  - A4: Available extracted fields preserve product description, firm, FEI number, recall number, recall event ID, classification, status, dates, distribution, Markets, lot codes, best-by dates and barcodes. → T1, T7, T8 → T1-V1, T7-V1, T8-V1
- **R2.** Store source documents once in private local SQLite storage and retain changed content as revisions. (you said: "2. Raw store with stored-once identity. A local SQLite raw store on the owner's Mac keeps each source document once: collecting the same document again never creates a duplicate, and changed content is kept as a new revision, because iRES records change status and classification over time. Nothing in the raw store is public.") → T2
  - A5: The raw store resides in SQLite on the owner's Mac and has no public access. → T2 → T2-V1
  - A6: Collecting an unchanged source document again creates neither a duplicate document nor a duplicate revision. → T2 → T2-V1
  - A7: Changed content creates a new revision associated with the existing source document, preserving earlier revisions. → T2 → T2-V1
  - A8: Changes to iRES status and classification remain visible in revision history. → T2 → T2-V1
- **R3.** Link multiple FDA source identities to one recall event using event ID and FEI number while retaining every source record. (you said: "3. One recall, several identities. One FDA recall can appear as a press release (no recall number), an iRES event (the recall number is assigned only at classification and is "Not Yet Classified" until then) and a Data Dashboard row. The raw store links these as one recall event, keyed on event ID and FEI number, without losing any source record.") → T3
  - A9: Press-release, iRES and Data Dashboard records for the same recall can be associated with one recall event using event ID and FEI number. → T3 → T3-V1
  - A10: A missing recall number or a Not Yet Classified state does not prevent storing a record or linking it when event identifiers are available. → T3 → T3-V1
  - A11: Linked records retain their individual source identities, raw payloads and revision histories. → T3 → T3-V1
- **R4.** Backfill FDA iRES Veterinary Enforcement Reports from 8 June 2012, then collect incremental changes and revisit unfinished recalls. (you said: "4. FDA iRES collector with full backfill. Collect Enforcement Report records with product type "Veterinary" through the iRES API with registered keys (Authorization-User and Authorization-Key headers, issued through FDA's OII Unified Logon), from 8 June 2012 onward: a full backfill first, then incremental updates. Re-poll records that are open or "Not Yet Classified" until they are terminated.") → T7, T13
  - A12: With valid registered credentials, live requests use the iRES API, product type Veterinary, and Authorization-User and Authorization-Key headers. → T7, T13 → T7-V1, T13-V2
  - A13: The initial backfill collects all available matching records from 8 June 2012 onward before transitioning to incremental updates. → T7, T13 → T7-V1, T13-V2
  - A14: Open and Not Yet Classified records continue to be polled until terminated. → T7 → T7-V1
  - A15: Refreshed records pass through the shared identity and revision behavior. → T7 → T7-V1
- **R5.** Collect the specified additional FDA sources and handle access refusals as recorded failures with restrained retries. (you said: "5. Other FDA sources. Recall press releases (the FDA recalls listing, its XLSX export and its RSS feed of the 20 newest items), warning letters to animal food firms, and CVM outbreaks and advisories pages. During research, www.fda.gov returned HTTP 401 to scripted requests, so these collectors must treat a refusal as a recorded failure, never crash, and never retry aggressively.") → T8
  - A16: Collection covers recall press releases through the FDA recalls listing, its XLSX export and its RSS feed of the 20 newest items. → T8 → T8-V1
  - A17: Collection covers warning letters to animal food firms and CVM outbreaks and advisories pages. → T8 → T8-V1
  - A18: HTTP 401 and other access refusals are recorded as failures rather than successful empty collections. → T8 → T8-V1
  - A19: A refusal does not crash collection or trigger aggressive retries. → T8 → T8-V1
  - Re-scoped by ADR 0003 (2026-11-01): fda.gov pages arrive as files the owner saves, so T8 meets A16 and A17 by importing them. A18 and A19 no longer apply to those pages, since nothing is requested; refusals of the keyed API requests stay covered by T5 and T7.
- **R6.** Assign a deterministic three-state Pet Food candidate flag without discarding records or performing final classification. (you said: "6. Pet Food screening without dropping data. iRES "Veterinary" also covers animal drugs, compounded veterinary medicines and livestock or horse feed. Each record gets a Pet Food candidate flag (likely dog or cat complete diet, unlikely, unknown) from deterministic rules on the product description and firm. Nothing is deleted; the final classification happens later in the core's AI triage.") → T6
  - A20: Every record receives a likely, unlikely or unknown Pet Food candidate flag, with likely referring to dog or cat complete diets. → T6 → T6-V1
  - A21: The flag is determined by reproducible rules using product description and firm. → T6 → T6-V1
  - A22: Records flagged unlikely or unknown remain stored, including animal drugs, compounded medicines and livestock or horse feed. → T6 → T6-V1
  - A23: Final classification remains deferred to the core's later AI triage. → T6 → T6-V1
- **R7.** Keep FDA credentials outside git and support fixture collection with an explicit live-disabled state while keys are unavailable. (you said: "7. Keys and fixture mode (owner's answer: the FDA keys are not available yet). API keys are read from a local file outside git and are never committed or logged. Without keys, the collectors run against recorded fixtures, and a live run reports clearly that live collection is disabled until keys are provided.") → T4
  - A24: API keys are read from a local file outside git and never appear in committed files or logs. → T4 → T4-V1
  - A25: Collectors can run against recorded fixtures without API keys. → T4 → T4-V1
  - A26: A live run without keys clearly reports that live collection is disabled until keys are provided. → T4 → T4-V1
- **R8.** Run collection every few hours without overlap, respect source limits and resume interrupted backfills. (you said: "8. Scheduling and politeness. Collection runs every few hours while the Mac is on, one run at a time, respecting rate limits and backing off on errors. A backfill resumes where it stopped after the Mac sleeps, restarts or loses the network.") → T5, T9, T13
  - A27: Collection is scheduled every few hours while the Mac is available. → T9 → T9-V1, T9-V2
  - A28: Only one collection run can be active at a time. → T9 → T9-V1
  - A29: Requests respect source rate limits and back off after errors. → T5 → T5-V1
  - A30: Backfill progress survives sleep, restart and network loss, allowing collection to resume from saved progress. → T5, T13 → T5-V1, T13-V2
- **R9.** Provide inspectable collection health through complete run logs and independent source execution. (you said: "9. Run log and collection health. Every run records what it fetched, how many records were new, changed or duplicate, and every failure or refusal, so the owner can see collection health. A failing source never blocks the other sources.") → T5, T10
  - A31: Every run records what it fetched and counts of new, changed and duplicate records. → T10 → T10-V1
  - A32: Every failure and refusal is recorded with enough source context for the owner to inspect collection health. → T10 → T10-V1
  - A33: A source failure does not prevent other sources from running or retaining their successful results. → T5, T10 → T5-V1, T10-V1
- **R10.** Verify collection offline using recorded source fixtures, with live checks conditional on available keys. (you said: "10. Offline tests with recorded fixtures. Tests run offline against recorded sample responses: iRES JSON pages, a press-release listing, a warning letter, an advisory page and a refusal response. Live checks run only when keys exist.") → T11
  - A34: Offline tests use recorded iRES JSON pages, a press-release listing, a warning letter, an advisory page and a refusal response. → T11 → T11-V1
  - A35: Offline tests require neither network access nor API keys. → T11 → T11-V1
  - A36: Live checks run only when keys exist. → T11 → T11-V1
- **R11.** Make the shared format, raw store and collector structure extensible to the named future Official Sources and Lab Test sources. (you said: "11. Ready for the next sources. The record format, raw store and collector structure accept the next Official Sources without redesign: Taiwan's Ministry of Agriculture (農業部), EU RASFF, and the UK, Canada, Australia and Japan regulators, plus Lab Test sources such as the HK Consumer Council and 消基會.") → T12
  - A37: The shared record format and raw store can represent Official Source and Lab Test records while retaining source-specific identifiers and raw payloads. → T12 → T12-V1
  - A38: The collector structure accommodates Taiwan's Ministry of Agriculture, EU RASFF, and UK, Canadian, Australian and Japanese regulators without redesigning the shared components. → T12 → T12-V1
  - A39: The same extensibility accommodates Lab Test sources including the HK Consumer Council and 消基會. → T12 → T12-V1
- **R12.** Expose the retained backlog to the stage 1 import through the raw store or same-format exports, leaving processing and publication to the core. (you said: "12. Hand-off to the core. The stage 1 import (issue #14) reads records from the raw store, or from exported files in the same format, so the core can process the backlog later; Official Source Reports then publish with AI Summaries under the stage 1 rules. Nothing in this stage publishes anything.") → T13
  - A40: The stage 1 issue #14 import can consume retained records from the raw store or exported files using the same CollectorRecordV1 format. → T13 → T13-V1
  - A41: The backlog remains available for later core processing without recollecting source documents. → T13 → T13-V1
  - A42: This stage publishes nothing; Official Source Report publication and AI Summaries remain governed by the later stage 1 workflow. → T13 → T13-V1

## Ordered tasks

### T1: Establish the shared contract and extraction foundation

Retrieve the complete issue #14 contract and reconcile CollectorRecordV1 with E89's ReportEnvelopeV1 name. Establish one codec and ordered revision-occurrence semantics with the importer, including A→B→A and future Lab Test records. Inspect the implementation checkout's package setup before adding Bun/TypeScript scaffolding and new verification scripts. Implement metadata validation and optional extraction helpers. Preserve declared barcodes and support UPC-A, EAN-13 and GTIN-14 without truncating longer values into UPC substrings. Keep missing optional values acceptable.

Requirements: R1
Depends on: none

Acceptance:

- [ ] T1-A1 (R1; covers A1): All collector-facing records use one resolved CollectorRecordV1 codec and are accepted unchanged by the issue #14 compatibility decoder.
- [ ] T1-A2 (R1; covers A2): Round trips preserve Source, source identifiers, original URL, retrieval time, document type, raw payload, hash and origin metadata.
- [ ] T1-A3 (R1; covers A3): The four required FDA document types remain distinct after serialization.
- [ ] T1-A4 (R1; covers A4): Every requested available extracted field survives round trip and production extraction helpers preserve UPC-A, EAN-13 and GTIN-14 strings, including leading zeros.

Proposed verification:

- T1-V1 checks A1, A2, A3, A4: Create complete, sparse and unknown-field contract tests. Port UPC separator and best-by exclusion cases from E5. Add explicitly synthetic raw-text and declared-field extraction cases for valid EAN-13 4006381333931 and GTIN-14 10012345000017; these are proposed local cases, not reference-test coverage. Exercise extraction before encoding, not only prepopulated round trips. Create and run `bun run verify:sourcing:contract` as part of implementation.
  - Must fail on T1-V1-M1 (A1): Emit a version discriminator different from the frozen CollectorRecordV1 discriminator. Expected failure: The unchanged issue #14 decoder rejects a record that the compatibility assertion expects it to accept.
  - Must fail on T1-V1-M2 (A2): Omit the original URL from serialized records. Expected failure: The metadata comparison reports: original URL missing from round-tripped record.
  - Must fail on T1-V1-M3 (A3): Serialize warning letters with the advisory discriminator. Expected failure: The document-type comparison finds an advisory where the warning-letter fixture is expected.
  - Must fail on T1-V1-M4 (A4): Convert barcode strings to numbers before encoding. Expected failure: The assertion expects 032251004292 and receives 32251004292.
  - Must fail on T1-V1-M5 (A4): Use the 12-digit UPC validator as the only extraction path for all barcode formats. Expected failure: The extracted barcode set is missing 4006381333931 and 10012345000017; both are required by the raw-input fixture.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The exact shared contract remains absent. (`docs/plans/stage1-plan.md#L729-L788`)
- Existing domain meanings constrain the record. (`CONTEXT.md#L1-L145`)
- The reference helper normalizes UPC candidates. ([openfda/res/extract.py L1-L81](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py#L1-L81))
- Reference tests supply UPC regression cases only. ([openfda/res/tests/extract_test.py L1-L100](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/tests/extract_test.py#L1-L100))

### T2: Implement private documents, reusable payloads and chronological revisions

Create prepared SQLite operations and migrations. Enforce document identity and deduplicate payload bytes independently. In one transaction, compare incoming source content with the document's current revision; append a fresh immutable revision occurrence whenever they differ, including an earlier hash returning. Remove historical hash uniqueness from revisions. Make committed work observations replay-safe without suppressing fresh retrievals. Preserve status/classification history, private permissions, foreign keys and durable commits.

Requirements: R2
Depends on: T1

Acceptance:

- [ ] T2-A1 (R2; covers A5): Database, sidecars and payloads use owner-only local storage and opening the store starts no public listener.
- [ ] T2-A2 (R2; covers A6): Consecutive unchanged retrievals, including after reopening, add neither a document nor a revision occurrence.
- [ ] T2-A3 (R2; covers A7): Every change relative to the current revision appends a new immutable occurrence; A→B→A retains three ordered revisions while reusing A's payload bytes.
- [ ] T2-A4 (R2; covers A8): Status and classification changes remain readable in their chronological revision history.

Proposed verification:

- T2-V1 checks A5, A6, A7, A8: Create private-store, reopen, second-connection and immutable-history tests, porting the relevant persistence cases from E58. Feed fresh observations A,A,B,B,A,A across process/store reopenings: require one document, three increasing revision sequences, hashes A,B,A, two distinct document payload bodies and dispositions new,duplicate,changed,duplicate,changed,duplicate. Replaying an already committed observation must not append again. Create and run `bun run verify:sourcing:store` as part of implementation.
  - Must fail on T2-V1-M1 (A5): Create the raw database with mode 0644. Expected failure: The permissions assertion expects 0600 and receives 0644.
  - Must fail on T2-V1-M2 (A6): Include retrieval time in the source-content hash. Expected failure: Consecutive identical payloads create extra revision occurrences where the test expects none.
  - Must fail on T2-V1-M3 (A7): Overwrite the current revision row when content changes. Expected failure: The immutable-history comparison cannot recover the earlier payload and expects three preserved occurrences.
  - Must fail on T2-V1-M4 (A7): Enforce UNIQUE(document_id, content_hash) and reuse the first A revision after B. Expected failure: The A,A,B,B,A,A case has two revisions instead of three and its final occurrence sequence does not advance.
  - Must fail on T2-V1-M5 (A8): Exclude classification from retained source content and its hash. Expected failure: A classification-only change produces no new snapshot; the test expects both classifications in order.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The local plan requires immutable exact revisions. (`docs/plans/stage1-plan.md#L729-L788`)
- Raw data belongs in private Mac storage. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- SQLite unique insertion is transferable for document/payload identity, not historical revision suppression. ([scrapy/dupefilters.py L1-L244](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/dupefilters.py#L1-L244))
- The comparator tests reopening and committed-row visibility. ([tests/test_dupefilters.py L1-L307](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_dupefilters.py#L1-L307))

### T3: Add non-destructive FDA recall correlations

Create event ID/FEI groups and memberships from explicit identifiers or authoritative cross-references. Keep source-document keys separate: two unclassified iRES product rows sharing event and FEI must use distinct verified upstream row keys and separate revision chains. Never use a shared page URL, event/FEI pair, missing recall number or mutable description as a substitute row key. Retain unresolved raw evidence if identity is not established. Dashboard-shaped fixtures test correlation without adding a Dashboard collector or core Incident decisions.

Requirements: R3
Depends on: T2

Acceptance:

- [ ] T3-A1 (R3; covers A9): Matching press-release, iRES and Dashboard representations share a raw recall group, while different events at one FEI remain separate.
- [ ] T3-A2 (R3; covers A10): Records without recall numbers remain stored and can be linked when event identifiers are available.
- [ ] T3-A3 (R3; covers A11): Every source document and product row retains its own identity, payloads and chronological revision history after grouping.

Proposed verification:

- T3-V1 checks A9, A10, A11: Retain the three-representation, same-firm/different-event, missing-number and partial-identifier cases. Add two unclassified iRES rows with distinct stable row keys but identical event ID/FEI. Update only one row and reopen: require two documents, independent history lengths of two and one, and membership in the same event group. Create and run `bun run verify:sourcing:recall-identity` as part of implementation.
  - Must fail on T3-V1-M1 (A9): Use FEI alone as the event-group key. Expected failure: Two events at one firm produce one group where the test expects two.
  - Must fail on T3-V1-M2 (A10): Require a recall number before adding event membership. Expected failure: The identifier-complete unclassified record remains unlinked; the assertion expects membership.
  - Must fail on T3-V1-M3 (A11): Delete secondary documents after selecting the iRES representation. Expected failure: The three-representation fixture loses source documents and their histories.
  - Must fail on T3-V1-M4 (A11): Key unclassified iRES source documents by event ID plus FEI instead of stable product-row identity. Expected failure: The two-row case contains one document with a combined history instead of two documents with independent history lengths two and one.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Collected documents and core Incidents are separate. (`CONTEXT.md#L1-L145`)
- Event ID is a distinct source field. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113))
- The comparator does not establish safe unclassified row identity. ([openfda/res/pipeline.py L135-L152](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L135-L152))

### T4: Implement credential loading and explicit fixture/live modes

Load keys from an external local file without persisting values. Introduce recorded-response transport and provenance. Default keyless collection to an isolated fixture store; explicit live requests without keys return disabled before I/O. Obtain real recorded samples where available and label generated development doubles synthetic. Attach keys only at the verified iRES request boundary; T7 verifies actual redirect dispatch.

Requirements: R7
Depends on: T1

Acceptance:

- [ ] T4-A1 (R7; covers A24): Keys are read outside git and absent from tracked/staged artifacts, logs, errors, persisted work, fixtures and exports.
- [ ] T4-A2 (R7; covers A25): Collectors consume recorded fixtures without credentials or network access.
- [ ] T4-A3 (R7; covers A26): Explicit live execution without keys returns live_disabled and 'Live collection disabled: FDA keys are not configured.' with zero outbound requests.

Proposed verification:

- T4-V1 checks A24, A25, A26: Create credential-canary, keyless-fixture and exact live-disabled tests. Scan captured outputs and tracked/staged artifacts for the canary. Port the controlled-client approach from E55/E99 without external requests. Create and run `bun run verify:sourcing:credentials` as part of implementation.
  - Must fail on T4-V1-M1 (A24): Log Authorization-Key while constructing requests. Expected failure: The captured-output scan finds the secret canary.
  - Must fail on T4-V1-M2 (A25): Require credentials before selecting fixture transport. Expected failure: The keyless fixture case fails its expected fixture-record output.
  - Must fail on T4-V1-M3 (A26): Silently return fixture_success for an explicit keyless live run. Expected failure: The assertion expects live_disabled and the exact disabled message, but receives fixture_success.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Credentials remain private local inputs. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- The HTTP client provides a header-injection boundary. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
- Controlled responses can be injected. ([test/core/crawlers/http-crawler.test.ts L660-L719](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L660-L719))
- The custom-client test identifies that interface. ([test/core/crawlers/http-crawler.test.ts L607-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L607-L659))

### T5: Implement durable execution, deadlines and polite retry policy

Persist work and append attempts before I/O. Give each attempt one absolute 30-second default deadline, bounded also by the remaining 15-minute run budget, covering response headers, allowed redirects and complete body reading. Pass AbortSignal through native HTTP and body consumption; do not reset deadlines on chunks. On expiry, abort/cancel acquisition, record 'Collection request deadline exceeded' with headers/body stage, retain incomplete evidence as incomplete, keep work recoverable and yield to the next adapter. Ignore late completion so it cannot commit records or checkpoints. Commit successful page effects atomically. Keep one HTTP request active, at least one-second origin spacing or stricter provider limits, finite transient attempts and persisted eligibility times. Retry-After is a minimum even when longer than base spacing or backoff caps. Defer long waits instead of retaining the run lock. Refusals get no immediate retry; a stalled refusal body cannot turn a known 401/403 into an aggressively retried transient error.

Requirements: R8, R9
Depends on: T2, T4

Acceptance:

- [ ] T5-A1 (R8; covers A29): Request timing respects source limits, finite retries and persisted Retry-After, and expired acquisition is actually aborted.
- [ ] T5-A2 (R8; covers A30): Restart, sleep and network interruption resume from committed page progress without skipped records or a clean-shutdown dependency.
- [ ] T5-A3 (R9; covers A33): Stalled headers, a stalled body or endless slow chunks cause a deadline outcome and allow a healthy later adapter to commit.

Proposed verification:

- T5-V1 checks A29, A30, A33: Create fake-clock and subprocess fault tests. Port E100's Retry-After assertion but strengthen it to Retry-After: 120 with ordinary spacing fixed at one second: after reopening, no retry may dispatch before 120000 ms. Include an HTTP-date value beyond base spacing. Port bounded retry/state cases from E56, E70 and E30. Add unresolved-header, headers-then-unresolved-body and chunks-every-20-seconds scenarios with a 30-second deadline. Advance time and assert abort signal, reader cancellation, exact timeout reason, recoverable work and the later adapter's commit; an independent watchdog bounds broken implementations. Resolving the expired response afterward must cause no late writes. Create and run `bun run verify:sourcing:recovery` as part of implementation.
  - Must fail on T5-V1-M1 (A29): Ignore Retry-After while retaining ordinary one-second origin spacing. Expected failure: The 120-second case observes dispatch before 120000 ms or a persisted eligibility time below that minimum.
  - Must fail on T5-V1-M2 (A29): Reset the transient attempt counter after every failure. Expected failure: The test observes a fourth attempt where the configured per-run maximum is three.
  - Must fail on T5-V1-M3 (A29): Return a timeout result without aborting the HTTP request or cancelling its body reader. Expected failure: The expiry assertions find signal.aborted false or an uncancelled body reader.
  - Must fail on T5-V1-M4 (A30): Commit the next-page checkpoint before the current page's records. Expected failure: Termination and reopening skip the current page; the expected record-set comparison reports missing IDs.
  - Must fail on T5-V1-M5 (A30): Persist continuation only at normal shutdown. Expected failure: The killed-process case resumes at the initial page instead of the next uncompleted page.
  - Must fail on T5-V1-M6 (A33): Await response headers without the attempt deadline. Expected failure: After deadline advancement the later adapter has not committed; the watchdog reports that stalled headers blocked source progress.
  - Must fail on T5-V1-M7 (A33): Clear the deadline when headers arrive and await the body indefinitely. Expected failure: The stalled-body case lacks the expected body-stage timeout and later-adapter commit.
  - Must fail on T5-V1-M8 (A33): Restart the 30-second deadline after every received body chunk. Expected failure: The slow-chunk case remains active after the original deadline instead of aborting and allowing the later adapter to commit.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Mac interruption is an explicit operating condition. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- The scheduler persists work. ([scrapy/core/scheduler.py L290-L559](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py#L290-L559))
- Tests expose persistence timing. ([tests/test_scheduler.py L200-L239](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_scheduler.py#L200-L239))
- Retry limits and outcomes are explicit. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))
- Body processing shares a deadline and aborts on failure. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
- Cancellation reaches the HTTP client. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
- The reference timing test is a starting point, strengthened locally beyond base spacing. ([test/core/crawlers/http-crawler.test.ts L720-L761](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L720-L761))

### T6: Add deterministic Pet Food candidate annotations

Implement versioned rules over description and firm. Clear dog/cat complete-diet evidence yields likely, clear excluded-only evidence yields unlikely and missing/conflicting evidence yields unknown. Firm hints cannot override explicit drug or other-animal descriptions. Retain source strings, rule reasons and every record. No AI or final core classification is invoked.

Requirements: R6
Depends on: T1, T2

Acceptance:

- [ ] T6-A1 (R6; covers A20): Every record receives one likely, unlikely or unknown flag with likely restricted to dog/cat complete-diet evidence.
- [ ] T6-A2 (R6; covers A21): Identical input and rule version produce identical flags and reasons.
- [ ] T6-A3 (R6; covers A22): Drug, compounded-medicine, livestock-feed, horse-feed and ambiguous records remain stored.
- [ ] T6-A4 (R6; covers A23): Screening makes no AI call or final core classification.

Proposed verification:

- T6-V1 checks A20, A21, A22, A23: Create positive, excluded, mixed and sparse cases; repeat calls to detect stateful rules. Store every case and assert zero forbidden AI/core calls. Create and run `bun run verify:sourcing:screening` as part of implementation.
  - Must fail on T6-V1-M1 (A20): Default missing descriptions to likely. Expected failure: The sparse-record assertion expects unknown and receives likely.
  - Must fail on T6-V1-M2 (A21): Reuse a global regular expression without resetting lastIndex. Expected failure: Repeated identical assessments produce different flags.
  - Must fail on T6-V1-M3 (A22): Filter unlikely records before storage. Expected failure: The retained-ID comparison is missing excluded drug and horse-feed records.
  - Must fail on T6-V1-M4 (A23): Invoke AI triage for unknown records. Expected failure: The forbidden-interface assertion observes an AI call where the expected count is zero.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Pet Food has a precise domain definition. (`CONTEXT.md#L1-L145`)
- Final filtering and AI belong to later intake. (`docs/flows.md#L1-L198`)

### T7: Implement verified iRES backfill and continuing discovery

Verify the official destination, request method, authorization headers, Veterinary/date filters, pagination, stable product-row identity, event/FEI fields, statuses and change tracking. Obtain responses with provenance. Backfill inclusively from 2012-06-08 and transition only after historical work completes. On every due incremental epoch invoke new-record discovery independently of known-recall refreshes, even with no open targets. Keep open/unclassified records refreshable until termination. If no verified change filter exists, resolve a bounded reconciliation strategy before claiming completeness. Use manual redirects with a bounded same-origin hop count under the original deadline; reject an origin change before dispatch. Verify available fields through actual source decoding, including non-UPC barcodes.

Requirements: R4, R1
Depends on: T3, T4, T5, T6

Acceptance:

- [ ] T7-A1 (R4; covers A12): Verified iRES requests use both required headers and Veterinary filtering, and no authenticated origin-changing redirect is dispatched.
- [ ] T7-A2 (R4; covers A13): All historical windows and continuations from 8 June 2012 complete before transition; subsequent due runs discover newly appearing upstream records rather than only refresh known ones.
- [ ] T7-A3 (R4; covers A14): Open and Not Yet Classified records remain refresh targets until a verified terminated state.
- [ ] T7-A4 (R4; covers A15): Repeated and changed iRES responses use the shared identity and chronological revision-occurrence operations, including returns to earlier content.
- [ ] T7-A5 (R1; covers A4): Actual iRES decoding preserves all supplied extracted fields, including EAN-13 and GTIN-14 barcode values.

Proposed verification:

- T7-V1 checks A12, A13, A14, A15, A4: Create tests from verified API examples and recorded pages, supplemented by labeled synthetic boundary, 1205-record pagination and update cases. Exercise the runner across backfill completion, reopening and later discovery epochs: introduce new records not returned by any known-record refresh, including a case with no open targets. Add a redirect-aware fetch harness that honors redirect options and records every underlying dispatch; test origin-changing 301/302/307/308 responses, assert redirect mode manual, zero destination requests and exact code ires_redirect_origin_changed. Include a permitted same-origin redirect control. Decode raw JSON with non-UPC barcodes and test A→B→A updates. Create and run `bun run verify:sourcing:ires` as part of implementation.
  - Must fail on T7-V1-M1 (A12): Omit Authorization-Key. Expected failure: The captured-request assertion reports the missing Authorization-Key header.
  - Must fail on T7-V1-M2 (A12): Validate only the initial iRES origin, then automatically follow redirects while forwarding both authorization headers. Expected failure: The redirect harness observes a forbidden-origin dispatch or non-manual redirect option; expected zero destination requests and ires_redirect_origin_changed.
  - Must fail on T7-V1-M3 (A13): Stop historical backfill after its first page. Expected failure: The 1205-record case reports missing later-page IDs.
  - Must fail on T7-V1-M4 (A13): Start historical collection on 2012-06-20. Expected failure: The boundary assertion expects 2012-06-08 and finds records from 8–19 June missing.
  - Must fail on T7-V1-M5 (A13): Set phase to incremental but schedule only known-recall refreshes afterward. Expected failure: The post-backfill run makes no incremental-discovery request and fails to retain the newly introduced upstream record.
  - Must fail on T7-V1-M6 (A14): Remove Not Yet Classified records after their first retrieval. Expected failure: The next-run assertion expects their refresh requests and observes none.
  - Must fail on T7-V1-M7 (A14): Continue refreshing a terminated record. Expected failure: The next-run assertion expects zero requests for that terminated target and observes one.
  - Must fail on T7-V1-M8 (A15): Update only last_seen_at when a known record's status changes. Expected failure: The update sequence has no new revision occurrence where one is expected.
  - Must fail on T7-V1-M9 (A4): Apply UPC-only validation to every barcode decoded from iRES. Expected failure: The decoded raw-JSON fixture loses its expected EAN-13 and GTIN-14 values.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The inspected FDA code uses weekly CSV rather than the required authenticated API. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113))
- Its historical boundary is 20 June 2012. ([openfda/res/pipeline.py L258-L283](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L258-L283))
- Its identity strategy does not establish unclassified product-row keys. ([openfda/res/pipeline.py L135-L152](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L135-L152))
- Headers and cancellation pass through the HTTP boundary. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
- The local feature map requires FDA full backfill. (`docs/flows.md#L1-L198`)

### T8: Import the fda.gov pages the owner saves

Re-scoped on 2026-11-01 by [ADR 0003](../adr/0003-sanctioned-fda-access.md). fda.gov refuses automated clients, so the collector no longer fetches listings, XLSX, RSS or detail pages. Instead, the owner saves recall press releases, warning letters, and CVM outbreak, advisory and update pages from a browser into the private inbox folder (`bun src/cli.ts inbox --open`). Every live run, or `bun src/cli.ts import`, imports new files. The fetch-based version of this task is in git history (4e73935). Its A18 and A19, about refusals of fda.gov requests, no longer apply, because the importer sends no requests.

The importer reads Safari web archives, Chrome single-file pages (MHTML) and plain HTML saves. It takes the page URL from the container, the browser's saved-from note, the canonical link or og:url. It takes the save time from the MHTML Date header or the file's creation time. It keeps the saved HTML byte for byte as the payload, takes the document type from the URL path, and fills only the fields the page states; brand, reason and headline stay in the payload (ADR 0002 keeps the format frozen). Every file is logged as imported or rejected with its reason, and each file is imported once.

Requirements: R5, R1
Depends on: T1, T2, T6, T9, T10

Acceptance:

- [ ] T8-A1 (R5; covers A16): A saved recall press release becomes one document whose payload is the saved page HTML, with the page URL and save time. In any save format, the same page saved again unchanged is a duplicate, and a changed page adds one revision.
- [ ] T8-A2 (R5; covers A17): Saved animal-food warning letters and CVM outbreak or advisory pages become records with the correct types and original payloads.
- [ ] T8-A3 (R5): A file the importer can't use (not a web page, not from fda.gov, an unsupported page type, or no address) is logged as rejected with its reason. It is never stored as an empty or guessed record, and the other files still import.
- [ ] T8-A4 (R5): Every live run imports the inbox under the run lock, with no FDA keys and no network request. Fixture runs never read the inbox.
- [ ] T8-A5 (R1; covers A4): Extraction preserves the available fields and every full UPC-A, EAN-13 and GTIN-14 string the source declares.

Verification:

- T8-V1 checks A16, A17, A4: `bun run verify:sourcing:saved-pages` imports synthetic saved pages: plain HTML, a web archive built with plutil, and a Chrome-style MHTML with quoted-printable encoding. It checks payload bytes and hashes, URL, save time, dispositions, page types, fields, rejections with their reasons, keyless scheduled imports with a fetch spy, the run lock, and fixture runs.
  - Must fail on T8-M1 (A16): Ignore web archives. Expected failure: the web-archive save is rejected, so the duplicate is missing.
  - Must fail on T8-M2 (A16): Store the extracted text instead of the saved HTML. Expected failure: the payload bytes and hash differ from the saved file.
  - Must fail on T8-M3 (A17): Omit the warning-letter page type. Expected failure: the warning letter is rejected and its record is absent.
  - Must fail on T8-M4 (T8-A3): Count an unusable file as imported. Expected failure: the summary and health show no rejection.
  - Must fail on T8-M5 (T8-A3): Stop at the first unusable file. Expected failure: the later release is not imported.
  - Must fail on T8-M6 (A4): Drop non-12-digit barcodes during HTML extraction. Expected failure: the declared EAN-13 and GTIN-14 strings are missing.
  - Must fail on T8-M7 (A16): Use the import time as the save time. Expected failure: retrieved_at differs from when the file was saved.
  - Must fail on T8-M8 (T8-A4): Import only when keys exist. Expected failure: the keyless scheduled run imports nothing.
  - Must fail on T8-M9 (T8-A4): Import without the run lock. Expected failure: the import runs while a collection holds the lock.
- T8-V2 (manual, with T11): Replace the synthetic fixtures with pages the owner saved from fda.gov. Confirm that real pages use the labels the importer reads: "Company Name", "Product Description", the announcement and publish dates, "Content current as of", the MARCS-CMS line, and a warning letter's heading.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above.

Source basis:

- fda.gov pages arrive as files the owner saves. (`docs/adr/0003-sanctioned-fda-access.md`)
- A Report is the collected source document. (`CONTEXT.md#L1-L145`)
- Full source material stays private. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- Response status and parsing are distinct transport concerns. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
- The comparator tests configurable errors and a 403 retry. ([test/core/crawlers/http-crawler.test.ts L496-L546](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L496-L546))
- That retry behavior needs a different local refusal policy. ([test/core/crawlers/http-crawler.test.ts L547-L606](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L547-L606))

### T9: Install the Mac schedule and enforce stable-inode exclusion

Build, install, register and enable the per-user Mac schedule at a four-hour interval. Verify its configured program, arguments, private outputs and actual scheduler-initiated launch. Use the same collection entry point for manual and scheduled execution. Verify the Mac advisory-lock binding and hold its descriptor for the entire run. Keep the lock file at one persistent inode: normal release unlocks/closes only and never unlinks or replaces it. Keep ownership across sleep, release it on process death, and report already_running without fetching when contention is lost.

Requirements: R8
Depends on: T5, T7, T8

Acceptance:

- [ ] T9-A1 (R8; covers A27): The four-hour per-user job is installed, registered and enabled, and native scheduler-initiated execution is observed while the Mac is available.
- [ ] T9-A2 (R8; covers A28): Manual and scheduled contenders cannot overlap, including sleep, process death and a contender paused after opening the lock file but before acquiring its lock.

Proposed verification:

- T9-V1 checks A27, A28: Create schedule-artifact assertions and existing contention, paused-owner and killed-owner cases. Add a deterministic three-process race: A holds the lock; B opens the file and pauses before locking; A releases normally; C opens, locks and remains active; B resumes and must receive already_running. Assert stable device/inode identity and maximum active collector count one. Test cleanup removes only isolated test directories after all children exit, never the production release path. Create and run `bun run verify:sourcing:schedule` as part of implementation.
  - Must fail on T9-V1-M1 (A27): Generate an 86400-second interval. Expected failure: The schedule assertion expects 14400 seconds and receives 86400.
  - Must fail on T9-V1-M2 (A28): Use a process-local running boolean instead of the OS lock. Expected failure: The contention test observes two active collectors.
  - Must fail on T9-V1-M3 (A28): Steal ownership after elapsed time while the paused owner remains alive. Expected failure: The paused-owner test observes another successful acquisition instead of already_running.
  - Must fail on T9-V1-M4 (A28): Unlink the advisory-lock file during normal release. Expected failure: In the A/B/C race, B locks the old inode while C holds the new inode; file identity differs and two collectors become active.
- T9-V2 checks A27: Manual check. On the owner's Mac, inspect the native user scheduler to establish the production job is registered and enabled with the configured entry point and 14400-second interval. Observe an automatic startup launch and verify timer-triggered execution using an isolated short-interval verification job through the same installation path; then confirm the production four-hour job remains enabled. Record scheduler-origin run evidence. A keyless automatic live_disabled invocation proves launch without making network requests. A generated file or manually invoked collector is insufficient.
  - Must fail on T9-V2-M1 (A27): Write the correct schedule artifact but skip registering it with the Mac scheduler. Expected failure: Native scheduler inspection cannot find the job and no scheduler-initiated run appears.
  - Must fail on T9-V2-M2 (A27): Register the job but leave it disabled. Expected failure: Native inspection shows disabled status and the automatic-launch/timer observation has no run.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The Mac hosts collection and may sleep. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- The local design includes single-process exclusion. (`docs/plans/stage1-plan.md#L729-L788`)

### T10: Expose complete attempt history and collection health

Implement persisted run/attempt reporting and health output for mode, source, fetched locators, progress, pending work, cooldowns and committed new/changed/duplicate counts. Each retry creates a new attempt; finalize terminal attempts once and retain them after success and reopening. Timeouts include exact stage and reason. Catch failures per adapter and yield on the first stalled attempt instead of awaiting repeated stalls ahead of healthy adapters. Keep successful work from later sources.

Requirements: R9
Depends on: T2, T5, T7, T8, T9

Acceptance:

- [ ] T10-A1 (R9; covers A31): After reopening, health identifies fetched documents and exact committed new, changed and duplicate counts.
- [ ] T10-A2 (R9; covers A32): Every failure/refusal remains inspectable with source, locator, time and outcome, including failed attempts followed by successful retries.
- [ ] T10-A3 (R9; covers A33): Thrown errors, refusals, stalled headers and stalled bodies do not prevent a healthy later adapter from committing within the defined deadline policy.

Proposed verification:

- T10-V1 checks A31, A32, A33: Retain mixed new/changed/duplicate, refusal, parse-error and later-success cases. Add HTTP 500 then success for the same work and refusal then later-run success; reopen and require all earlier terminal attempts with their original reason and timestamps. Add separate stalled-header and stalled-body first adapters, drive the fake clock through the absolute deadline, and assert abort, exact timeout outcome and a committed healthy later source. Use an independent watchdog so an unresolved await fails observably. Port counter/log attribution from E67/E68. Create and run `bun run verify:sourcing:health` as part of implementation.
  - Must fail on T10-V1-M1 (A31): Count every successfully fetched record as new. Expected failure: The summary expects new=1, changed=1, duplicate=1 and receives new=3.
  - Must fail on T10-V1-M2 (A32): Suppress refusal attempts when no documents are returned. Expected failure: The reopened health report lacks the required refusal entry and locator.
  - Must fail on T10-V1-M3 (A32): Delete earlier failed FetchAttempt rows when the work later succeeds. Expected failure: The retry-then-success history expects failure and success attempts with distinct IDs, but only the success remains after reopening.
  - Must fail on T10-V1-M4 (A33): Break the source loop when an adapter throws. Expected failure: The later adapter has no fetch or committed document.
  - Must fail on T10-V1-M5 (A33): Await the first adapter's unresolved headers without enforcing its deadline. Expected failure: The bounded progress assertion reports: healthy later source did not commit after the stalled-header deadline.
  - Must fail on T10-V1-M6 (A33): Await an unresolved body after clearing the timer on header receipt. Expected failure: The stalled-body case has no terminal body-timeout attempt or later-source commit by the expected bound.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The owner operates the local back office. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- Retry outcomes have attributed counts and reasons. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))
- The corresponding test checks counters and logs. ([tests/test_downloadermiddleware_retry.py L310-L335](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_downloadermiddleware_retry.py#L310-L335))
- Exhaustion has an explicit operational outcome. ([tests/test_downloadermiddleware_retry.py L336-L358](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_downloadermiddleware_retry.py#L336-L358))
- Body acquisition is deadline-bounded and aborted. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
- Transport cancellation is propagated. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))

### T11: Complete recorded offline fixtures and guarded live checks

Assemble provenance-bearing recorded iRES pages, press-release listings and destination releases, XLSX/RSS responses, warning letters, CVM advisory/outbreak pages and refusals. Remove request credentials before fixtures enter git. Label generated redirect, stall, pagination and barcode cases synthetic. Deny external network in the default suite, require no keys and provide separately invoked credential-guarded live checks. Missing recordings fail completeness checks instead of silently skipping.

Requirements: R10
Depends on: T7, T8, T9, T10

Acceptance:

- [ ] T11-A1 (R10; covers A34): Offline tests exercise every required recorded response category, including destination-release content, with recording provenance distinct from synthetic cases.
- [ ] T11-A2 (R10; covers A35): The offline suite needs no keys and performs no external network requests.
- [ ] T11-A3 (R10; covers A36): Live checks require explicit selection and existing keys before I/O.

Proposed verification:

- T11-V1 checks A34, A35, A36: Create fixture-manifest completeness, network-denial and live-guard subprocess checks. Use E5's local fixture technique and the controlled-client approach in E55/E99. Ensure newly added redirect and stall doubles cannot invoke real network or masquerade as recorded FDA responses. Create and run `bun run verify:sourcing:offline` as part of implementation.
  - Must fail on T11-V1-M1 (A34): Remove the recorded warning-letter fixture from the manifest. Expected failure: The completeness check reports: Missing recorded fixture: warning_letter.
  - Must fail on T11-V1-M2 (A35): Fall back to global fetch when a fixture is absent. Expected failure: The case expects the exact fixture-not-found error and zero outbound calls but receives Unexpected network access in offline sourcing tests.
  - Must fail on T11-V1-M3 (A36): Probe the live API before checking keys. Expected failure: The keyless live-check case observes an outbound call instead of the exact live-disabled result with zero calls.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The FDA tests load local fixtures. ([openfda/res/tests/extract_test.py L1-L100](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/tests/extract_test.py#L1-L100))
- Controlled responses use an injected client. ([test/core/crawlers/http-crawler.test.ts L660-L719](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L660-L719))
- The custom-client test supplies the interface pattern. ([test/core/crawlers/http-crawler.test.ts L607-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L607-L659))
- Credentials remain private configuration. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

### T12: Verify extension points for the next named sources

Use synthetic conformance inputs for Taiwan's Ministry of Agriculture, EU RASFF, UK, Canada, Australia and Japan regulators and the HK Consumer Council and 消基會 Lab Test sources. Reuse the contract, adapter interface, revision-occurrence store and complete export behavior. Do not implement their live integrations. FDA identifiers remain source-specific and optional; no parallel codec or FDA-only runner branch is required.

Requirements: R11
Depends on: T1, T2, T3, T5, T6, T11

Acceptance:

- [ ] T12-A1 (R11; covers A37): Official Source and Lab Test conformance records retain their identifiers and payloads through one codec and store.
- [ ] T12-A2 (R11; covers A38): All six named future regulator source cases use the same interfaces without FDA-specific shared requirements.
- [ ] T12-A3 (R11; covers A39): HK Consumer Council and 消基會 Lab Test cases fit the same extension points without collector publication authority.

Proposed verification:

- T12-V1 checks A37, A38, A39: Create the reusable adapter conformance suite with labeled synthetic source-shaped cases. Assert no alternate codec, mandatory FDA identifier, FDA credential dependency or shared-store redesign. Create and run `bun run verify:sourcing:extensions` as part of implementation.
  - Must fail on T12-V1-M1 (A37): Require FEI on every collector record. Expected failure: A valid non-FDA conformance record is rejected for lacking FEI.
  - Must fail on T12-V1-M2 (A38): Route every adapter through the iRES request builder. Expected failure: The six regulator cases produce FDA requests instead of their configured work descriptions.
  - Must fail on T12-V1-M3 (A39): Reject Lab Test records in the shared codec. Expected failure: The two named testing-organization cases fail shared-codec acceptance.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Official Sources include testing organizations and named labs. (`CONTEXT.md#L1-L145`)
- The future source stage names these regulators and Lab Test sources. (`docs/flows.md#L1-L198`)
- Shared intake is the planned integration boundary. (`docs/plans/stage1-plan.md#L729-L788`)

### T13: Deliver complete chronological backlog hand-off and operational acceptance

Export a stable private newline-delimited snapshot of every selected revision occurrence through the exact shared codec. Use increasing occurrence sequences for selection and ordering; never DISTINCT by hash or filter by candidate flag. Returning A after B must appear in an incremental export after B with a fresh retrieval/provenance snapshot while reusing A's payload bytes. Confirm issue #14 compatibility and ordered consumption leave the latest state A. Preserve raw data for repeated exports and invoke no core publication or AI operation. Document installation, collection, health, keys, recovery and import. With keys and protocol evidence available, perform guarded live coverage and Mac interruption acceptance; fixture success or live_disabled is not live backfill completion.

Requirements: R12, R4, R8
Depends on: T3, T7, T8, T9, T10, T11, T12

Acceptance:

- [ ] T13-A1 (R12; covers A40): Exported lines are accepted unchanged by the resolved issue #14 contract and ordered consumption correctly applies repeated-content revision occurrences.
- [ ] T13-A2 (R12; covers A41): Full and incremental exports equal the complete selected retained backlog across all candidate flags and revision occurrences, without recollection, mutation or deletion.
- [ ] T13-A3 (R12; covers A42): Collection and hand-off perform no publication, AI Summary generation or core eligibility decisions.
- [ ] T13-A4 (R4; covers A12, A13): A guarded live run uses the verified iRES contract and completes all historical work from 8 June 2012 before continuing incremental discovery.
- [ ] T13-A5 (R8; covers A30): Real process interruption and Mac sleep/wake preserve resumable progress.

Proposed verification:

- T13-V1 checks A40, A41, A42: Create a multi-source backlog containing likely, unlikely and unknown records. Compare the ordered decoded export with the shared-codec projection of every raw revision in the captured sequence range. For one document export A, then B, then freshly collect A again: require a third sequence, an incremental delta after B containing the new A occurrence and final state A in the resolved issue #14 compatibility consumer. Assert repeated exports are identical, later out-of-bound revisions are excluded, payload bytes may be reused, store contents remain unchanged and AI/publication calls remain zero. Create and run `bun run verify:sourcing:handoff` as part of implementation.
  - Must fail on T13-V1-M1 (A40): Wrap exported records in a new sourcing-specific envelope. Expected failure: The unchanged issue #14 decoder rejects an exported line expected to decode directly.
  - Must fail on T13-V1-M2 (A40): Have the compatibility import path discard a new occurrence whenever its content hash appeared anywhere in prior history. Expected failure: After consuming A,B,A the compatibility consumer remains at B; expected latest state A.
  - Must fail on T13-V1-M3 (A41): Delete revisions after exporting them. Expected failure: A repeated export loses records and the raw-store revision count decreases.
  - Must fail on T13-V1-M4 (A41): Export only records flagged likely. Expected failure: The exact backlog comparison reports missing unlikely and unknown document occurrences.
  - Must fail on T13-V1-M5 (A41): Select exported revisions using DISTINCT document_id and content_hash. Expected failure: The incremental export after B omits the fresh return-to-A occurrence; expected exactly that new occurrence.
  - Must fail on T13-V1-M6 (A42): Publish an Official Source record after export. Expected failure: The publication spy records a call or the public-destination sentinel changes; both must remain untouched.
- T13-V2 checks A12, A13, A30: Manual check. Pending registered keys and verified protocol: inspect redacted actual request metadata, run full historical collection, reconcile query windows and provider continuations/totals where available, and confirm no failed or pending historical work. Inspect subsequent incremental-discovery execution independently of recall refreshes. Stop the process and exercise Mac sleep/wake, then inspect resumed progress. Record actual results only when performed; disabled and fixture runs cannot close live coverage acceptance.
  - Must fail on T13-V2-M1 (A12): Omit the Veterinary filter from live requests. Expected failure: The redacted request manifest lacks the required Veterinary restriction.
  - Must fail on T13-V2-M2 (A13): Declare backfill complete with a failed historical window still unresolved. Expected failure: Coverage reconciliation finds an unresolved window despite the completed phase.
  - Must fail on T13-V2-M3 (A30): Save continuation only during clean shutdown. Expected failure: After forced termination, collection restarts at the initial historical window instead of committed progress.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Exact immutable revisions and independent intake/publication gates are required by the local design. (`docs/plans/stage1-plan.md#L729-L788`)
- Issue #14 consumes collector-format records. (`docs/flows.md#L1-L198`)
- Private originals stay on the Mac and interruptions pause collection. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- The inspected comparator does not verify the required live API. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113))

## Reference research

Quality bar: license required; at least 20 stars; pushed within 36 months; created at least 180 days ago; not archived; not a fork; test files required.
Search requests: GitHub 3/9; GitLab 0. Matched 41; passed metadata bar 40; tree-verified shortlist 6; selected 3; host exclusions 35; tree resolutions 6; rate limited no.
Queries:
- github tier 0 `crawler in:name,description,topics archived:false fork:false stars:>=200 pushed:>=2025-10-31` — ok; 20 result(s), 20 new candidate(s).
- github tier 0 `openfda in:name,description,topics archived:false fork:false stars:>=200 pushed:>=2025-10-31` — ok; 1 result(s), 1 new candidate(s).
- github tier 0 `topic:crawler archived:false fork:false stars:>=200 pushed:>=2025-10-31` — ok; 20 result(s), 16 new candidate(s).
- github tier 1 `crawler in:name,description,topics archived:false fork:false stars:>=50 pushed:>=2024-10-31` — skipped; 0 result(s), 0 new candidate(s).
- github tier 1 `openfda in:name,description,topics archived:false fork:false stars:>=50 pushed:>=2024-10-31` — skipped; 0 result(s), 0 new candidate(s).
- github tier 1 `topic:crawler archived:false fork:false stars:>=50 pushed:>=2024-10-31` — skipped; 0 result(s), 0 new candidate(s).
- github tier 2 `crawler in:name,description,topics archived:false fork:false stars:>=20 pushed:>=2023-10-31` — skipped; 0 result(s), 0 new candidate(s).
- github tier 2 `openfda in:name,description,topics archived:false fork:false stars:>=20 pushed:>=2023-10-31` — skipped; 0 result(s), 0 new candidate(s).
- github tier 2 `topic:crawler archived:false fork:false stars:>=20 pushed:>=2023-10-31` — skipped; 0 result(s), 0 new candidate(s).
Code search (Grep by Vercel): 12/12 request(s); 12 repositories matched outside example and documentation paths; 4 new repositories screened with 1 GitHub metadata request(s).
- grep discovery `recalleventid` — ok; 10 result(s).
- grep discovery `recall_number` — ok; 10 result(s).
- grep discovery `recalling_firm` — ok; 10 result(s).
- grep location `recalleventid` in FDA/openfda — ok; 0 result(s).
- grep location `product_description` in FDA/openfda — ok; 6 result(s).
- grep location `recalleventid` in apify/crawlee — ok; 0 result(s).
- grep location `recall_number` in apify/crawlee — ok; 0 result(s).
- grep location `recalleventid` in scrapy/scrapy — ok; 0 result(s).
- grep location `recall_number` in scrapy/scrapy — ok; 0 result(s).
- grep location `recalleventid` in bda-research/node-crawler — ok; 0 result(s).
- grep location `recall_number` in bda-research/node-crawler — ok; 0 result(s).
- grep location `recalleventid` in apify/crawlee-python — ok; 0 result(s).
- grep location `recall_number` in apify/crawlee-python — skipped; 0 result(s).
- grep location `recalleventid` in Norconex/crawler — skipped; 0 result(s).
- grep location `recall_number` in Norconex/crawler — skipped; 0 result(s).

## Repository screening

- Selected [github:FDA/openfda](https://github.com/FDA/openfda), inspected at `fdbe54327901a0c1e30130d1d6a2bbe67b79b77c`, commit dated 2026-06-08T16:15:01.000Z, last activity reported 2026-06-08T16:15:05.000Z. Signals: 721 stars; 172 forks; archived false; fork false; Python; topics none; pushed 2026-06-08T16:15:05.000Z; created 2014-06-01T14:43:10.000Z; license CC0-1.0 (metadata evidence); 112 test files. Code search matched `recall_number`, `recalling_firm`, `product_description`. Closest domain comparator: FDA's own data project. Inspect enforcement ingestion, source identifiers, raw-data handling and updates for R1–R4. The matched recall fields guide inspection but do not establish iRES access, Veterinary coverage or complete backfill.
- Host excluded [github:FreedomIntelligence/OpenClaw-Medical-Skills](https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 3087 stars; 420 forks; archived false; fork false; Python; topics awesome, claude-code, clawhub, medical, nanoclaw, openclaw, openclaw-skills, skills; pushed 2026-07-21T01:01:51.000Z; created 2026-03-08T09:43:52.000Z; license not reported; test count unknown. Code search matched `recall_number`, `recalling_firm`.
- Host excluded [github:nitrocloudofficial/nitrostack](https://github.com/nitrocloudofficial/nitrostack). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 2568 stars; 1519 forks; archived false; fork false; TypeScript; topics agentic-ai, ai, chatgpt, chatgpt-apps, claude, claude-apps, mcp, mcp-client, mcp-server, mcp-servers, mcp-tools, mcpagents, mcpapps, model-context-protocol, modelcontextprotocol; pushed 2026-10-19T12:56:19.000Z; created 2026-03-03T06:51:16.000Z; license Apache-2.0 (metadata evidence); test count unknown. Code search matched `recall_number`, `recalling_firm`.
- Host excluded [github:GoogleCloudPlatform/public-datasets-pipelines](https://github.com/GoogleCloudPlatform/public-datasets-pipelines). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 180 stars; 78 forks; archived false; fork false; Python; topics airflow, bigquery, cloud-composer, cloud-native, cloud-storage, data-architecture, data-engineering, data-pipelines, datasets, google-cloud, open-data; pushed 2026-07-10T12:08:51.000Z; created 2021-04-09T19:17:21.000Z; license Apache-2.0 (metadata evidence); test count unknown. Code search matched `recall_number`, `recalling_firm`.
- Host excluded [github:firecrawl/firecrawl](https://github.com/firecrawl/firecrawl). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 197205 stars; 10415 forks; archived false; fork false; TypeScript; topics ai, ai-agents, ai-crawler, ai-scraping, ai-search, crawler, data-extraction, html-to-markdown, llm, markdown, scraper, scraping, web-crawler, web-data, web-data-extraction, web-scraper, web-scraping, web-search, webscraping; pushed 2026-10-31T05:47:16.000Z; created 2024-04-15T21:02:29.000Z; license AGPL-3.0 (metadata evidence); test count unknown.
- Host excluded [github:D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 90529 stars; 9377 forks; archived false; fork false; Python; topics ai, ai-scraping, automation, crawler, crawling, crawling-python, data, data-extraction, mcp, mcp-server, playwright, python, scraping, selectors, stealth, web-scraper, web-scraping, web-scraping-python, webscraping, xpath; pushed 2026-10-29T14:00:57.000Z; created 2024-10-13T20:29:53.000Z; license BSD-3-Clause (metadata evidence); test count unknown.
- Host excluded [github:unclecode/crawl4ai](https://github.com/unclecode/crawl4ai). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 86624 stars; 9014 forks; archived false; fork false; Python; topics ai, ai-agents, crawler, data-extraction, llm, markdown, mcp, open-source, playwright, python, rag, scraper, web-crawler, web-crawling, web-scraping; pushed 2026-10-30T15:02:02.000Z; created 2024-05-09T09:48:50.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Selected [github:scrapy/scrapy](https://github.com/scrapy/scrapy), inspected at `51c10b14fca6d272587a5c23cf3ae8effdff16cd`, commit dated 2026-10-30T14:10:15.000Z, last activity reported 2026-10-30T14:10:15.000Z. Signals: 65123 stars; 12082 forks; archived false; fork false; Python; topics crawler, crawling, framework, hacktoberfest, python, scraping, web-scraping, web-scraping-python; pushed 2026-10-30T14:10:15.000Z; created 2010-02-22T02:01:14.000Z; license BSD-3-Clause (metadata evidence); 384 test files. An independent crawling framework comparator for R8–R10. Inspect scheduling, duplicate-request handling, interrupted-job recovery, polite error handling and their tests to identify the smallest transferable reliability patterns.
- Host excluded [github:NaiboWang/EasySpider](https://github.com/NaiboWang/EasySpider). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 44758 stars; 5392 forks; archived false; fork false; JavaScript; topics batch-processing, batch-script, code-free, crawler, data-collection, frontend, gui, html, input-parameters, layman, parameters, robotics, rpa, scraper, spider, visual, visualization, visualprogramming, web, www; pushed 2026-10-28T12:06:33.000Z; created 2020-07-18T02:41:27.000Z; license AGPL-3.0 (metadata evidence); test count unknown.
- Host excluded [github:ScrapeGraphAI/Scrapegraph-ai](https://github.com/ScrapeGraphAI/Scrapegraph-ai). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 32385 stars; 3316 forks; archived false; fork false; Python; topics ai-crawler, ai-scraping, ai-search, crawler, data-extraction, firecrawl-alternative, large-language-model, llm, markdown, rag, scraping, scraping-python, web-crawler, web-crawlers, web-data, web-data-extraction, web-scraper, web-scraping, web-search, webscraping; pushed 2026-10-06T08:27:54.000Z; created 2024-01-27T16:54:38.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:iawia002/lux](https://github.com/iawia002/lux). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 31814 stars; 3327 forks; archived false; fork false; Go; topics bilibili, crawler, download, downloader, go, golang, iqiyi, qq, scraper, tumblr, video, youku, youtube; pushed 2026-03-29T18:18:56.000Z; created 2018-02-24T11:29:03.000Z; license MIT (metadata evidence); test count unknown.
- Selected [github:apify/crawlee](https://github.com/apify/crawlee), inspected at `65254412a9f9d84a10b51ef4ada58a3cfd9046fc`, commit dated 2026-10-31T02:46:19.000Z, last activity reported 2026-10-31T02:48:42.000Z. Signals: 26303 stars; 1740 forks; archived false; fork false; TypeScript; topics apify, automation, crawler, crawling, headless, headless-chrome, javascript, nodejs, npm, playwright, puppeteer, scraper, scraping, typescript, web-crawler, web-crawling, web-scraping; pushed 2026-10-31T02:48:42.000Z; created 2016-08-26T18:35:03.000Z; license Apache-2.0 (metadata evidence); 443 test files. Closest stack match: a TypeScript crawling library supporting raw HTTP. Inspect implementation and corresponding tests for persistent request state, retries, backoff, concurrency and collection statistics relevant to R5 and R8–R10. Bun compatibility and SQLite integration remain to be verified.
- Host excluded [github:gocolly/colly](https://github.com/gocolly/colly). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 25572 stars; 1858 forks; archived false; fork false; Go; topics crawler, crawling, framework, go, golang, scraper, scraping, spider; pushed 2026-10-16T13:34:23.000Z; created 2017-09-29T14:08:49.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:jhao104/proxy_pool](https://github.com/jhao104/proxy_pool). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 23779 stars; 5419 forks; archived false; fork false; Python; topics crawler, http, proxy, redis, spider; pushed 2026-06-15T14:36:35.000Z; created 2016-11-25T13:49:07.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:Evil0ctal/Douyin_TikTok_Download_API](https://github.com/Evil0ctal/Douyin_TikTok_Download_API). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 21006 stars; 2931 forks; archived false; fork false; Python; topics bilibili, crawler, data-collection, douyin, douyin-api, downloader, fastapi, mcp-server, model-context-protocol, openapi, rest-api, scraper, social-media, speech-to-text, tiktok, tiktok-api, tiktok-downloader, tiktok-scraper, video-downloader, web-scraping; pushed 2026-10-27T11:31:56.000Z; created 2021-11-07T01:35:09.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:getmaxun/maxun](https://github.com/getmaxun/maxun). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 18112 stars; 1562 forks; archived false; fork false; TypeScript; topics agents, api, automation, browser-automation, crawler, crawling, data-extraction, no-code, nocode, playwright, robotic-process-automation, rpa, scraper, self-hosted, web-scraper, web-scraping, web-search, webscraping; pushed 2026-10-28T06:07:06.000Z; created 2023-10-23T21:40:19.000Z; license AGPL-3.0 (metadata evidence); test count unknown.
- Host excluded [github:projectdiscovery/katana](https://github.com/projectdiscovery/katana). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 17776 stars; 1211 forks; archived false; fork false; Go; topics cli, crawler, gocrawler, hacktoberfest, headless, spider-framework, web-spider; pushed 2026-10-29T22:20:38.000Z; created 2021-01-02T16:56:05.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:codelucas/newspaper](https://github.com/codelucas/newspaper). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 15182 stars; 2104 forks; archived false; fork false; Python; topics crawler, crawling, news, news-aggregator, python, scraper; pushed 2026-10-26T11:24:01.000Z; created 2013-11-25T09:50:50.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:s0md3v/Photon](https://github.com/s0md3v/Photon). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 13317 stars; 1689 forks; archived false; fork false; Python; topics crawler, information-gathering, osint, python, spider; pushed 2026-10-17T22:43:20.000Z; created 2018-03-30T19:38:22.000Z; license GPL-3.0 (metadata evidence); test count unknown.
- Host excluded [github:crawlab-team/crawlab](https://github.com/crawlab-team/crawlab). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 12288 stars; 1884 forks; archived false; fork false; Go; topics crawlab, crawler, crawling-tasks, docker, go, platform, scrapy, scrapyd-ui, spider, spiders-management, web-crawler, webcrawler, webspider; pushed 2026-02-10T00:31:17.000Z; created 2019-02-10T06:01:59.000Z; license BSD-3-Clause (metadata evidence); test count unknown.
- Host excluded [github:code4craft/webmagic](https://github.com/code4craft/webmagic). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 11670 stars; 4086 forks; archived false; fork false; Java; topics crawler, framework, java, scraping; pushed 2025-12-20T14:01:57.000Z; created 2013-04-23T12:57:36.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:injetlee/Python](https://github.com/injetlee/Python). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 10883 stars; 4245 forks; archived false; fork false; Python; topics crawler, excel, python, wechat; pushed 2026-05-09T10:24:08.000Z; created 2016-06-23T15:15:23.000Z; license not reported; test count unknown.
- Rejected [github:apify/crawlee-python](https://github.com/apify/crawlee-python). Search metadata reported last activity 2026-10-31T06:50:26.000Z. Signals: 9636 stars; 820 forks; archived false; fork false; Python; topics apify, automation, beautifulsoup, crawler, crawling, headless, headless-chrome, parsel, pip, playwright, python, scraper, scraping, selenium, web-crawler, web-crawling, web-scraping; pushed 2026-10-31T06:50:26.000Z; created 2024-01-10T08:44:47.000Z; license Apache-2.0 (metadata evidence); 115 test files. Duplicates the Crawlee comparison already selected in the target language. Its supplied metadata identifies no additional domain or workflow fit to justify a separate inspection.
- Host excluded [github:TeamWiseFlow/xiaobei](https://github.com/TeamWiseFlow/xiaobei). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 8668 stars; 1473 forks; archived false; fork false; Python; topics crawler, digital-employee, makemoney, mas, multi-agent, multi-agent-systems, rpa; pushed 2026-10-30T02:00:28.000Z; created 2024-04-24T06:24:33.000Z; license NOASSERTION; test count unknown.
- Host excluded [github:hect0x7/JMComic-Crawler-Python](https://github.com/hect0x7/JMComic-Crawler-Python). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 7843 stars; 12239 forks; archived false; fork false; Python; topics 18comic, asyncio, crawler, downloader, github-actions, jmcomic, pypi, python, readthedocs; pushed 2026-10-31T01:49:53.000Z; created 2023-04-02T14:21:48.000Z; license MIT (metadata evidence); test count unknown.
- Rejected [github:bda-research/node-crawler](https://github.com/bda-research/node-crawler). Search metadata reported last activity 2026-06-18T15:50:22.000Z. Signals: 6796 stars; 862 forks; archived false; fork false; TypeScript; topics cheerio, crawler, extract-data, javascript, jquery, nodejs, spider; pushed 2026-06-18T15:50:22.000Z; created 2010-11-25T11:47:19.000Z; license MIT (metadata evidence); 19 test files. Overlaps C29's Node.js collection role. The supplied evidence shows no distinctive FDA, revision-storage or resumable-backfill fit that warrants another deep inspection.
- Host excluded [github:dataabc/weibo-crawler](https://github.com/dataabc/weibo-crawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 4681 stars; 916 forks; archived false; fork false; Python; topics crawler, weibo, weibo-spider; pushed 2026-10-26T10:23:02.000Z; created 2019-06-25T14:56:20.000Z; license not reported; test count unknown.
- Host excluded [github:kanasimi/work_crawler](https://github.com/kanasimi/work_crawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 4342 stars; 361 forks; archived false; fork false; JavaScript; topics cejs, comic-downloader, comics, crawler, download-comic, downloader, ebook, epub, manga, manga-downloader, narou, novel-downloader, novels, webcomics; pushed 2026-10-12T22:29:41.000Z; created 2016-11-02T09:53:25.000Z; license not reported; test count unknown.
- Host excluded [github:spatie/crawler](https://github.com/spatie/crawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 2831 stars; 368 forks; archived false; fork false; PHP; topics concurrency, crawler, guzzle, php; pushed 2026-10-22T14:58:09.000Z; created 2015-11-02T16:22:09.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:lncrawl/lightnovel-crawler](https://github.com/lncrawl/lightnovel-crawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 2683 stars; 523 forks; archived false; fork false; Python; topics console-app, discord, kindle-books, lightnovel, lightnovel-crawler, python, telegram, termux, web-scraper; pushed 2026-10-26T22:02:45.000Z; created 2018-01-17T11:23:35.000Z; license GPL-3.0 (metadata evidence); test count unknown.
- Host excluded [github:zhegexiaohuozi/SeimiCrawler](https://github.com/zhegexiaohuozi/SeimiCrawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 1986 stars; 682 forks; archived false; fork false; Java; topics none; pushed 2026-10-15T01:54:37.000Z; created 2015-11-06T16:06:36.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:ShilongLee/Crawler](https://github.com/ShilongLee/Crawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 1470 stars; 370 forks; archived false; fork false; JavaScript; topics none; pushed 2026-10-19T02:47:17.000Z; created 2024-05-24T08:52:41.000Z; license NOASSERTION; test count unknown.
- Host excluded [github:dadoonet/fscrawler](https://github.com/dadoonet/fscrawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 1455 stars; 307 forks; archived false; fork false; Java; topics crawler, elasticsearch, java, tika; pushed 2026-10-29T07:37:13.000Z; created 2012-06-08T17:23:03.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:fredwu/crawler](https://github.com/fredwu/crawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 961 stars; 88 forks; archived false; fork false; Elixir; topics crawler, elixir, files, offline, scraper, scraper-engine, spider; pushed 2026-10-20T04:12:45.000Z; created 2016-08-08T13:32:20.000Z; license not reported; test count unknown.
- Host excluded [github:icpd/crawler](https://github.com/icpd/crawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 376 stars; 61 forks; archived false; fork false; Go; topics none; pushed 2026-07-03T03:29:28.000Z; created 2020-02-24T04:17:13.000Z; license not reported; test count unknown.
- Host excluded [github:crwlrsoft/crawler](https://github.com/crwlrsoft/crawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 373 stars; 14 forks; archived false; fork false; PHP; topics crawler, crawling, hacktoberfest, php, scraper, scraping, scraping-websites, web-crawler, web-crawling, web-scraper, web-scraping; pushed 2026-05-03T06:53:45.000Z; created 2022-01-12T22:20:59.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:elastic/crawler](https://github.com/elastic/crawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 223 stars; 50 forks; archived false; fork false; Ruby; topics none; pushed 2026-10-31T03:25:15.000Z; created 2024-04-02T11:57:06.000Z; license NOASSERTION; test count unknown.
- Rejected [github:Norconex/crawler](https://github.com/Norconex/crawler). Search metadata reported last activity 2026-10-31T06:38:23.000Z. Signals: 205 stars; 71 forks; archived false; fork false; Java; topics crawler, crawler-fs, crawler-web, crawlers, filesystem-crawler, flexible, java, search-engine, spider, web-crawler; pushed 2026-10-31T06:38:23.000Z; created 2013-02-20T21:50:42.000Z; license Apache-2.0 (metadata evidence); 600 test files. Its broad web/filesystem-to-repository workflow is less direct than FDA ingestion and the selected crawling libraries. The supplied evidence identifies no distinctive recall-linking or revision-retention pattern that would justify replacing a selected comparator.
- Host excluded [github:NanmiCoder/MediaCrawler](https://github.com/NanmiCoder/MediaCrawler). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 69043 stars; 13132 forks; archived false; fork false; Python; topics none; pushed 2026-10-27T00:36:40.000Z; created 2023-06-09T12:14:34.000Z; license NOASSERTION; test count unknown.
- Host excluded [github:NanmiCoder/CrawlerTutorial](https://github.com/NanmiCoder/CrawlerTutorial). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 4827 stars; 509 forks; archived false; fork false; Python; topics none; pushed 2026-04-03T08:08:07.000Z; created 2024-03-24T01:57:43.000Z; license not reported; test count unknown.
- Host excluded [github:MemTensor/memmy-agent](https://github.com/MemTensor/memmy-agent). Reason: created 2026-07-16, younger than 180 days Signals: 2166 stars; 212 forks; archived false; fork false; TypeScript; topics agent, agentic-ai, ai-agents, chatgpt, claude-code, cli, codex, cursor, desktop-app, desktop-pet, dsh-plugin, hermes-agent, llm, long-term-memory, mcp, memory, openai-api, openclaw, personal-ai, tui; pushed 2026-10-31T02:29:14.000Z; created 2026-07-16T07:57:45.000Z; license MIT (metadata evidence); test count unknown. Code search matched `recalleventid`.

## Reference comparison

### github:FDA/openfda

Commit: `fdbe54327901a0c1e30130d1d6a2bbe67b79b77c`, dated 2026-06-08T16:15:01.000Z; last activity reported 2026-06-08T16:15:05.000Z
Selection reason: Closest domain comparator: FDA's own data project. Inspect enforcement ingestion, source identifiers, raw-data handling and updates for R1–R4. The matched recall fields guide inspection but do not establish iRES access, Veterinary coverage or complete backfill.

Patterns to adopt:

- Normalize and validate optional UPC candidates separately from original source retention. ([openfda/res/extract.py L1-L81](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py#L1-L81))
  - Reference test (read, not run): Tests exercise spaces, dashes, leading zeros, multiple UPCs and best-by exclusion. ([openfda/res/tests/extract_test.py L1-L100](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/tests/extract_test.py#L1-L100))

Patterns to reject:

- Use product type and recall number as complete document identity.: Missing recall numbers cannot identify distinct unclassified rows, and event-level correlation cannot replace individual product-row identity. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113); [openfda/res/pipeline.py L135-L152](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L135-L152))
- Use weekly CSV acquisition and its historical boundary.: R4 requires authenticated iRES and an inclusive 8 June 2012 start. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113); [openfda/res/pipeline.py L258-L283](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L258-L283))
- Discard records lacking normalized prerequisites and load the Elasticsearch pipeline.: The target requires retained raw data and local SQLite. ([openfda/res/pipeline.py L153-L198](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L153-L198); [openfda/res/pipeline.py L199-L257](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L199-L257))
- Use the UPC helper as the universal barcode gate.: Its 12-digit scope would drop available EAN-13 and GTIN-14 values. ([openfda/res/extract.py L1-L81](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py#L1-L81))

Local adaptation: Write original TypeScript helpers and port E5's UPC cases. Add explicitly new EAN-13/GTIN-14 extraction tests through API and detail-document decoders. Preserve E89–E91's contract, exact revision and private-storage semantics. Supplied extraction tests do not establish acquisition, row identity or backfill behavior; no missing FDA manifest is used to infer target commands or dependencies.

### github:scrapy/scrapy

Commit: `51c10b14fca6d272587a5c23cf3ae8effdff16cd`, dated 2026-10-30T14:10:15.000Z; last activity reported 2026-10-30T14:10:15.000Z
Selection reason: An independent crawling framework comparator for R8–R10. Inspect scheduling, duplicate-request handling, interrupted-job recovery, polite error handling and their tests to identify the smallest transferable reliability patterns.

Patterns to adopt:

- Enforce persistent identity uniqueness in SQLite and verify it across reopening. ([scrapy/dupefilters.py L1-L244](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/dupefilters.py#L1-L244))
  - Reference test (read, not run): Tests verify reopening, duplicate recognition and committed-row visibility. ([tests/test_dupefilters.py L1-L307](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_dupefilters.py#L1-L307))
- Represent pending work durably and make synchronization timing explicit. ([scrapy/core/scheduler.py L290-L559](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py#L290-L559))
  - Reference test (read, not run): Tests distinguish close-time state writes from configured in-run synchronization. ([tests/test_scheduler.py L200-L239](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_scheduler.py#L200-L239))
- Bound retries and attribute retry reasons and exhaustion. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))
  - Reference test (read, not run): The basic retry test checks metadata, counters and logs. ([tests/test_downloadermiddleware_retry.py L310-L335](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_downloadermiddleware_retry.py#L310-L335))
  - Reference test (read, not run): The zero-retry test checks exhaustion. ([tests/test_downloadermiddleware_retry.py L336-L358](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_downloadermiddleware_retry.py#L336-L358))
  - Reference test (read, not run): The repeated-retry test checks the terminal give-up result. ([tests/test_downloadermiddleware_retry.py L386-L443](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_downloadermiddleware_retry.py#L386-L443))

Patterns to reject:

- Use a persistent seen-request set as revision or refresh eligibility.: Previously fetched URLs must remain refreshable, and a previously seen content hash may represent a new chronological change occurrence. ([scrapy/dupefilters.py L1-L244](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/dupefilters.py#L1-L244))
- Rely on close-only state saving or memory fallback.: R8 requires recovery without clean shutdown and durable pending work. ([scrapy/extensions/spiderstate.py L1-L94](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/extensions/spiderstate.py#L1-L94); [scrapy/core/scheduler.py L290-L559](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py#L290-L559))

Local adaptation: Use uniqueness for documents, payload bytes and replay-safe observations, not UNIQUE(document_id, content_hash) on revisions. Add fresh sequences for A→B→A, atomic page commits, independent discovery epochs, absolute deadlines and complete terminal attempt history. E58/E30/E67/E68/E70 were read, not run, and do not establish these stronger target guarantees.

### github:apify/crawlee

Commit: `65254412a9f9d84a10b51ef4ada58a3cfd9046fc`, dated 2026-10-31T02:46:19.000Z; last activity reported 2026-10-31T02:48:42.000Z
Selection reason: Closest stack match: a TypeScript crawling library supporting raw HTTP. Inspect implementation and corresponding tests for persistent request state, retries, backoff, concurrency and collection statistics relevant to R5 and R8–R10. Bun compatibility and SQLite integration remain to be verified.

Patterns to adopt:

- Inject an HTTP client for controlled fixture responses. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
  - Reference test (read, not run): The custom-client test constructs the injection. ([test/core/crawlers/http-crawler.test.ts L607-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L607-L659))
  - Reference test (read, not run): The handler observes controlled client content. ([test/core/crawlers/http-crawler.test.ts L660-L719](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L660-L719))
- Process 429 before ordinary parsing, honor Retry-After and bound rate-limit stalls. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
  - Reference test (read, not run): The matching test asserts delay between attempts. ([test/core/crawlers/http-crawler.test.ts L720-L761](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L720-L761))
  - Reference test (read, not run): Persistent throttling cannot hang indefinitely and work remains pending. ([test/core/crawlers/http-crawler.test.ts L762-L821](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L762-L821))
- Cover body consumption with the request deadline and propagate cancellation to acquisition. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659); [packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
  - No reference test: No supplied test excerpt stalls response headers or body consumption and asserts the deadline abort. E56 tests settled 429 responses, not unresolved streams. T5 and T10 therefore add new stalled-header, stalled-body, slow-chunk and later-source-progress tests rather than citing unrelated reference tests.

Patterns to reject:

- Use blocked-session retries for FDA refusals.: R5 requires recorded refusals without aggressive retries or session/proxy evasion. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020); [test/core/crawlers/http-crawler.test.ts L496-L546](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L496-L546); [test/core/crawlers/http-crawler.test.ts L547-L606](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L547-L606))
- Treat decoded or re-encoded handler content as the only raw artifact.: Original JSON/HTML/XML/XLSX bytes must remain recoverable, and incomplete downloads must be labeled incomplete. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
- Import the full framework and HTTP concurrency defaults.: The target needs conservative local execution and atomic SQLite integration, not an unverified Bun dependency or browser/session runtime. ([test/core/crawlers/http-crawler.test.ts L130-L241](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L130-L241); [package.json L1-L148](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/package.json#L1-L148))

Local adaptation: Implement the transport seam, pacing and cancellation behavior in original Bun code under E91's private boundary. Strengthen E100's one-second example with a 120-second Retry-After case, reject authenticated origin-changing redirects, and persist failures and recoverable work. No supplied comparator test is claimed to verify the redirect policy or stalled-stream recovery.

## Design decisions

### D1: Keep one private application and SQLite state owner

Use the requested Bun/TypeScript runtime and one SQLite store for raw collection, progress and operational history.

The owner runs one Mac; a broker, cloud worker or imported pipeline platform adds boundaries without a required capability.

New design reason: R2, R8 and R9 need local durable state rather than distributed infrastructure.
- Collection belongs on the Mac. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- The local design uses Bun/TypeScript and private SQLite. (`docs/plans/stage1-plan.md#L729-L788`)

### D2: Resolve one authoritative import contract

Gate wire serialization on the full issue #14 contract, including ordered repeated-content revision handling.

A semantic field list and the name ReportEnvelopeV1 cannot prove CollectorRecordV1 compatibility.

New design reason: T1 must close the actual R1/R12 compatibility gap without introducing a second format.
- Only a partial planned intake interface is supplied. (`docs/plans/stage1-plan.md#L729-L788`)
- Issue #14 imports collector records. (`docs/flows.md#L1-L198`)

### D3: Keep row identity independent from recall grouping

Use verified stable upstream row/document keys, with event ID/FEI used only for non-destructive correlation.

Several unclassified product rows can belong to one event and must not become revisions of a single document.

New design reason: R3 requires separate row histories within the same event.
- Documents and Incidents have independent identity. (`CONTEXT.md#L1-L145`)
- Event ID and recall number are separate. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113))
- The reference ID hash is unsuitable for missing-number records. ([openfda/res/pipeline.py L135-L152](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L135-L152))

### D4: Deduplicate payload bytes, append change occurrences

Remove UNIQUE(document_id, content_hash) from RawRevision. Append a new sequence whenever content differs from current, including return to a previously seen hash; retain separate byte deduplication.

Reusing the first A revision on A→B→A hides a later change from sequence-based exports.

New design reason: This repairs R2/R4/R12 chronology while retaining stored-once bytes and consecutive-duplicate suppression.
- The local design requires exact immutable revisions and provenance. (`docs/plans/stage1-plan.md#L729-L788`)
- The comparator's unique-insert mechanism does not define chronological revision behavior. ([scrapy/dupefilters.py L1-L244](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/dupefilters.py#L1-L244))

### D5: Commit collection progress atomically

Commit records, revision occurrences, observations, successor work and page checkpoints together; reject late writes from expired attempts.

Separate progress writes can skip data after a crash or allow stale asynchronous responses to advance coverage.

New design reason: Atomic coupling and expired-attempt protection are target guarantees for R4/R8, not claims about the comparator.
- The local design uses transactional related writes. (`docs/plans/stage1-plan.md#L729-L788`)
- The comparator persists queue state. ([scrapy/core/scheduler.py L290-L559](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py#L290-L559))
- Tests expose its persistence timing. ([tests/test_scheduler.py L200-L239](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_scheduler.py#L200-L239))

### D6: Bound the whole acquisition and propagate abort

Use one absolute default 30-second request deadline across headers, redirects and body, bounded by a finite run budget. Abort underlying acquisition on expiry and continue another adapter.

Work counts and retry limits do not bound a promise or body stream that never settles.

New design reason: R8/R9 need bounded source occupancy. New stalled-header, stalled-body and slow-chunk tests verify the stronger local behavior.
- Body processing shares a navigation deadline and aborts on failure. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
- The HTTP client receives cancellation signals. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
- The target has one local collection owner. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

### D7: Reject credential-bearing origin changes

Disable automatic authenticated redirects and validate each bounded same-origin hop; reject a scheme, host or port change before dispatch.

Initial-origin checks and log redaction cannot prevent an HTTP client from forwarding FDA headers during automatic redirects.

New design reason: The redirect-aware A12 test observes all dispatches and exact rejection behavior, closing the identified credential mutant.
- Headers are supplied at a concrete HTTP boundary. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
- Credentials must remain protected. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

### D8: Keep refusal, pacing and attempt history distinct

Record refusals without immediate retry, respect persisted Retry-After beyond base spacing, and retain every failed terminal attempt after later success.

A successful retry does not erase an earlier failure, and ordinary spacing does not implement a longer server-imposed delay.

New design reason: R5/R8/R9 require separate policies and complete observations. Test Retry-After: 120 with one-second base pacing and failure-then-success history after reopening.
- 429 processing reads Retry-After. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
- The reference test checks timing. ([test/core/crawlers/http-crawler.test.ts L720-L761](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L720-L761))
- Retry reasons and exhaustion are separately tracked. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))

### D9: Require continuing discovery and actual detail acquisition

Superseded for fda.gov pages by ADR 0003: they arrive as files the owner saves, imported by T8. The rest of this decision applies to the keyed APIs.

Schedule post-backfill new-record discovery independently from refreshes, and fetch press-release destinations after listing/XLSX/RSS discovery.

A phase label cannot discover new recalls, and a discovered URL or listing summary is not the release document.

New design reason: T7 introduces previously unknown records after backfill; T8 asserts destination requests and exact retained detail bytes.
- The local plan calls for continuing FDA collection. (`docs/flows.md#L1-L198`)
- A Report is the collected source document. (`CONTEXT.md#L1-L145`)
- The inspected acquisition route differs from the required API. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113))

### D10: Activate scheduling and preserve lock-file identity

Install and enable the four-hour native Mac job, observe scheduler-initiated execution, and never unlink or replace the advisory-lock file during release.

Generated configuration alone does not schedule collection. Unlinking allows contenders to lock different inodes at the same path.

New design reason: R8 needs actual activation and a three-process open-before-lock race test, beyond ordinary contention tests.
- The Mac is the collection host and sleep is normal. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- The local design includes single-process exclusion. (`docs/plans/stage1-plan.md#L729-L788`)

### D11: Preserve barcode formats and all screening outcomes

Use UPC extraction as one helper, add source-declared EAN-13/GTIN-14 preservation, and retain likely/unlikely/unknown records through export.

Neither R1 nor R12 limits available barcodes to UPC or backlog transfer to likely Pet Food candidates.

New design reason: Add extraction-path tests for other barcode lengths and exact export equality across all candidate flags; keep final classification in the core.
- The reference helper accepts 12-digit UPC candidates. ([openfda/res/extract.py L1-L81](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py#L1-L81))
- The supplied barcode tests are UPC-specific. ([openfda/res/tests/extract_test.py L1-L100](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/tests/extract_test.py#L1-L100))
- Eligibility and source-document identity are distinct. (`CONTEXT.md#L1-L145`)

### D12: Use a complete ordered private file hand-off

Export every selected revision occurrence with the unchanged shared codec, ordered by occurrence sequence and without hash or candidate filtering.

The selected file interface must make the entire retained backlog available and communicate A→B→A correctly.

New design reason: R12 permits file transfer without a new service or direct table coupling. Incremental export tests must compare complete ordered occurrence sets, not only decoder success and repeatability.
- Exact revisions and core intake/publication gates are separate. (`docs/plans/stage1-plan.md#L729-L788`)
- Issue #14 is the collector-format hand-off. (`docs/flows.md#L1-L198`)
- Private originals are separate from public publication. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

## Risks and open evidence

- The full shared schema and repeated-content import semantics remain unresolved. T1 must establish actual issue #14 compatibility; T13 must verify ordered A→B→A consumption without inventing a wrapper or silently changing the contract. (`docs/plans/stage1-plan.md#L729-L788`; `docs/flows.md#L1-L198`)
- Authenticated iRES protocol, stable product-row keys, earliest coverage and incremental-discovery semantics still need official evidence. The supplied weekly CSV implementation is not proof of those capabilities; T7 gates the adapter accordingly. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113); [openfda/res/pipeline.py L258-L283](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L258-L283); [openfda/res/pipeline.py L135-L152](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L135-L152))
- Current source-specific recordings are missing, including destination press-release bodies. T8 and T11 must obtain them; generic redirect, timeout and extraction doubles validate mechanisms but cannot certify current FDA page structures. ([test/core/crawlers/http-crawler.test.ts L660-L719](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L660-L719); [test/core/crawlers/http-crawler.test.ts L496-L546](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L496-L546))
- Deadline/abort, full attempt retention, stable-inode locking and installed-scheduler behavior require the new planned target checks. The supplied reference tests do not prove those local guarantees, so none is represented as implemented or passed. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659); [packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020); `docs/plans/stage1-plan.md#L729-L788`)
- The Mac intentionally pauses updates while unavailable. Recovery and scheduling must preserve that architecture rather than adding an always-on service; live full-backfill acceptance remains pending keys and actual execution. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

## Architecture and data design

Implement one local Bun/TypeScript collection application with one private SQLite raw store. The owner collects, inspects health and exports through a small CLI. Install and enable a per-user Mac schedule invoking the same entry point every four hours. A process-held advisory lock uses a persistent lock-file inode: release unlocks and closes the descriptor without unlinking or replacing the file. HTTP acquisition uses injected fixture/live transports, manual redirect handling and an absolute per-attempt deadline covering headers, redirects and complete body consumption. The proposed default request deadline is 30 seconds and the run budget is 15 minutes; both are configurable. Timeout aborts the request and body reader, records the failure, defers recoverable work and yields to another adapter. SQLite owns document identity, content-addressed payload bytes, chronological immutable revision occurrences, recall correlations, work, checkpoints, attempts and observations. Compare incoming content with the current revision: unchanged content adds only an observation; changed content always appends a new revision sequence, including A→B→A, while payload A's bytes may be reused. Commit page records, revision occurrences, observations, successor work and checkpoints atomically. After historical completion, schedule incremental discovery independently of known-recall refreshes. FDA listing/XLSX/RSS adapters discover URLs and enqueue separate detail fetches; discovery summaries never substitute for the destination press release. Keep all candidate flags in private storage and export every selected revision occurrence regardless of flag. Export uses the exact shared CollectorRecordV1 codec for later issue #14 processing, with no AI, review UI or publication. Supplied local artifacts are planning documents, not executable interfaces; the proposed wire contract remains gated on T1.

### Modules and interfaces

- **Shared collector contract and extraction helpers:** Own one authoritative CollectorRecordV1 codec and optional extracted-field helpers. Preserve source identifiers and declared barcode strings; support UPC-A, EAN-13 and GTIN-14 without treating a 12-digit UPC validator as a universal barcode gate.
  - Interface: decodeCollectorRecordV1(input: unknown): CollectorRecordV1
  - Interface: encodeCollectorRecordV1(record: CollectorRecordV1): string
  - Interface: validateImportCompatibility(records: Iterable<CollectorRecordV1>): CompatibilityResult
  - Interface: extractAvailableFields(input: SourceDocument): ExtractedFields
  - Interface: extractBarcodes(text: string, declaredValues: DeclaredBarcode[]): BarcodeExtraction
  - Evidence: The local plan proposes a shared intake decoder and immutable revisions but does not supply CollectorRecordV1's definition. (`docs/plans/stage1-plan.md#L729-L788`)
  - Evidence: Source, Market, Echo and Affected Lot already have domain meanings. (`CONTEXT.md#L1-L145`)
  - Evidence: The inspected FDA helper normalizes and validates 12-digit UPC candidates. ([openfda/res/extract.py L1-L81](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py#L1-L81))
  - Evidence: Its tests cover UPC separators, leading zeros and best-by exclusion, not EAN-13 or GTIN-14. ([openfda/res/tests/extract_test.py L1-L100](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/tests/extract_test.py#L1-L100))
  - New design reason: R1 requires available barcodes without a UPC-only restriction. Broader barcode preservation is a proposed local extension, with source-decoding tests, rather than a capability attributed to the comparator. T1 must also resolve how issue #14 consumes repeated-content revision occurrences in order.
- **Private raw store:** Own SQLite migrations, document uniqueness, payload-byte deduplication, chronological revision occurrences, observations, recall associations and atomic page commits.
  - Interface: openRawStore(configuration: PrivateStoreConfiguration): RawStore
  - Interface: putRecord(tx: RawTransaction, record: CollectorRecordV1, observationKey: ObservationKey): StoreOutcome
  - Interface: appendRevisionOccurrence(tx: RawTransaction, documentId: string, snapshot: RevisionSnapshot): RevisionId
  - Interface: commitPage(input: PageCommit): PageCommitResult
  - Interface: linkRecallEvent(tx: RawTransaction, association: VerifiedRecallAssociation): LinkResult
  - Interface: readRevisionOccurrences(selection: RevisionSelection): AsyncIterable<StoredRevision>
  - Evidence: The local design requires immutable document revisions and transactional persistence. (`docs/plans/stage1-plan.md#L729-L788`)
  - Evidence: Collection and full source material remain private on the Mac. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: SQLite primary keys and INSERT OR IGNORE provide a duplicate-detection mechanism. ([scrapy/dupefilters.py L1-L244](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/dupefilters.py#L1-L244))
  - Evidence: Tests exercise duplicate recognition across reopening and committed-row visibility. ([tests/test_dupefilters.py L1-L307](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_dupefilters.py#L1-L307))
  - New design reason: Apply uniqueness to documents, payload bytes and replayed work observations, not to all historical document hashes. R2, R4 and R12 require A→B→A to create three ordered revision occurrences so incremental export communicates the return to A.
- **Credential guard and abortable HTTP transport:** Select fixture/live acquisition, load local credentials, enforce authenticated destination rules and capture complete response bytes under a deadline. Disable automatic redirects for authenticated iRES requests; reject any origin-changing redirect before issuing its destination request.
  - Interface: resolveCollectionMode(requestedMode: CollectionMode, credentials: CredentialAvailability): ModeDecision
  - Interface: loadFdaCredentials(configuration: CredentialFileConfiguration): CredentialAvailability
  - Interface: HttpTransport.sendAndRead(request: PublicRequestDescription, context: { signal: AbortSignal, deadlineAt: Instant, redirectPolicy: RedirectPolicy }): Promise<FetchResult>
  - Interface: validateRedirect(current: URL, location: string, policy: RedirectPolicy): RedirectDecision
  - Interface: classifyFetch(result: FetchResult): FetchDisposition
  - Interface: redactOperationalError(error: unknown): SafeOperationalError
  - Evidence: Credentials and private material remain in the back office. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: The inspected HTTP-client boundary receives cancellation signals and timeout information. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
  - Evidence: Body consumption shares the navigation deadline and failure aborts the download. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
  - Evidence: Tests inject controlled client responses. ([test/core/crawlers/http-crawler.test.ts L660-L719](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L660-L719))
  - New design reason: R4 and R7 require credentials to reach only the verified iRES destination. R8 and R9 require a stalled header or body to release collection capacity. The deadline does not reset on headers, redirects or body chunks; cancellation is not merely a timeout race that leaves acquisition running.
- **Durable collection runner:** Own pending work, checkpoints, finite attempt budgets, persisted pacing, adapter fairness, cancellation and recovery. Schedule incremental discovery separately from known-record refresh and retain every terminal attempt.
  - Interface: runCollection(selection: CollectionSelection): Promise<CollectionRunResult>
  - Interface: claimDueWork(runId: string, now: Instant): CollectionWork | null
  - Interface: planRetry(work: CollectionWork, failure: FetchDisposition, now: Instant): RetryDecision
  - Interface: expireAttempt(attemptId: string, stage: TimeoutStage): TimeoutOutcome
  - Interface: recoverInterruptedWork(ownership: RunOwnership): RecoveryResult
  - Interface: CollectorAdapter.plan(state: CollectionState): PlannedWork[]
  - Interface: CollectorAdapter.decode(response: StoredResponse, work: CollectionWork): DecodedPage
  - Evidence: The Mac may pause collection while unavailable. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: Scrapy persists pending scheduling state and restores it. ([scrapy/core/scheduler.py L290-L559](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py#L290-L559))
  - Evidence: Scheduler tests distinguish close-time from in-run persistence. ([tests/test_scheduler.py L200-L239](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_scheduler.py#L200-L239))
  - Evidence: Retry attempts have bounded counts and attributed outcomes. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))
  - Evidence: The HTTP implementation bounds body processing and handles 429 before parsing. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
  - New design reason: Work-count bounds alone cannot bound a stalled request. On deadline expiry, abort acquisition, finalize a timeout attempt, retain pending work, reject late results and advance to another adapter. Persist Retry-After as an eligibility time and never shorten it to the ordinary one-second pacing interval.
- **FDA adapters and deterministic screening:** Implement verified iRES acquisition, FDA discovery formats and destination-document fetching. Preserve separate product-row identities within a recall, extract available fields and annotate all records without deleting them.
  - Interface: IresAdapter.planBackfill(state: CollectionState): PlannedWork[]
  - Interface: IresAdapter.planIncremental(state: CollectionState): PlannedWork[]
  - Interface: IresAdapter.planRecallRefresh(target: RecallRefreshTarget): PlannedWork
  - Interface: FdaDocumentAdapter.discover(response: StoredResponse): SourceDocumentReference[]
  - Interface: FdaDocumentAdapter.planDetails(references: SourceDocumentReference[]): PlannedWork[]
  - Interface: FdaDocumentAdapter.toRecord(detail: StoredResponse): CollectorRecordV1
  - Interface: screenPetFood(description: string | null, firm: string | null, rules: ScreeningRules): CandidateAssessment
  - Evidence: The local flow calls for FDA full backfill and later collector-format import. (`docs/flows.md#L1-L198`)
  - Evidence: Pet Food and Source have distinct domain definitions. (`CONTEXT.md#L1-L145`)
  - Evidence: The FDA comparator supplies enforcement field mappings but uses weekly CSV acquisition. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113))
  - Evidence: Optional extraction is separate from the original description. ([openfda/res/extract.py L1-L81](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py#L1-L81))
  - New design reason: A recall event can contain multiple unclassified product rows; event ID plus FEI is never a row key. Listing/XLSX/RSS artifacts are discovery evidence, not destination press releases. Both distinctions need new local integration tests because the supplied comparator tests do not establish these FDA workflows.
- **Mac scheduling and collection health:** Install and enable the per-user schedule, hold a stable-inode process lock and expose durable health. Preserve failed attempts even after eventual success.
  - Interface: collect(options: CollectOptions): Promise<CollectionRunResult>
  - Interface: health(selection: HealthSelection): CollectionHealth
  - Interface: acquireRunLock(): RunLockResult
  - Interface: releaseRunLock(lock: RunLock): void
  - Interface: buildMacSchedule(configuration: ScheduleConfiguration): ScheduleArtifact
  - Interface: installMacSchedule(artifact: ScheduleArtifact): InstalledSchedule
  - Interface: inspectInstalledSchedule(): InstalledScheduleStatus
  - Interface: summarizeRun(runId: string): CollectionRunSummary
  - Evidence: Collection runs on the Mac and pauses while it is unavailable. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: The local plan includes a process/store lock but supplies no executable implementation. (`docs/plans/stage1-plan.md#L729-L788`)
  - Evidence: Retry outcomes are counted and attributed. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))
  - Evidence: The matching test checks retry counters and logs. ([tests/test_downloadermiddleware_retry.py L310-L335](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_downloadermiddleware_retry.py#L310-L335))
  - New design reason: R8 requires an installed, enabled scheduler and exclusion across processes, not just a correct artifact or in-memory flag. Keep the lock file permanently at its configured identity; release only unlocks/closes it. R9 requires append-only terminal attempts rather than latest-outcome logging.
- **Complete private backlog export:** Export a stable ordered snapshot of every retained revision occurrence through the shared codec, including likely, unlikely and unknown records and returns to earlier payloads.
  - Interface: exportBacklog(selection: ExportSelection, destination: PrivateDestination): Promise<ExportResult>
  - Interface: captureExportBoundary(): RevisionSequence
  - Interface: streamExportRecords(after: RevisionSequence | null, through: RevisionSequence): AsyncIterable<string>
  - Evidence: Stage 1 requires exact immutable revisions and independent intake/publication gates. (`docs/plans/stage1-plan.md#L729-L788`)
  - Evidence: Issue #14 imports collector-format records. (`docs/flows.md#L1-L198`)
  - Evidence: Private material is separate from public publication. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: R12 selects a file hand-off, so excluding any candidate flag would make retained data inaccessible through that hand-off. Select by revision occurrence sequence, never DISTINCT content_hash, and verify that incremental export after B delivers a newly observed return to A.

### Data model

- **CollectorRecordV1:** Exact wire keys, version discriminator and required/optional types: resolve in T1 against issue #14., Required semantic content: Source, source-specific identifiers, original URL, retrieval time, document type, raw payload, content hash and origin information., FDA types: Enforcement Report recall, recall press release, warning letter and advisory., Available fields: product description, firm, FEI, recall number, event ID, classification, status, dates, distribution, Markets, lot codes, best-by dates and barcodes., Preserve source-declared barcode strings, including UPC-A, EAN-13 and GTIN-14; preserve leading zeros., Preserve original center and product-type values in the raw payload., A repeated payload occurring after another revision has a fresh retrieval/provenance snapshot; exact occurrence semantics must agree with issue #14., No collector-controlled publication, approval or accepted core Link fields.
  - Evidence: A shared intake envelope is planned but not fully defined in the supplied excerpt. (`docs/plans/stage1-plan.md#L729-L788`)
  - Evidence: Source, Market, Echo and Affected Lot have established meanings. (`CONTEXT.md#L1-L145`)
  - Evidence: The available reference helper is specifically a UPC extractor. ([openfda/res/extract.py L1-L81](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py#L1-L81))
  - New design reason: R1 and R12 require an exchange model. Exact wire compatibility, including revision-occurrence ordering, remains a T1 gate; broader barcode preservation is required locally rather than inferred from UPC-only reference tests.
- **SourceDescriptor:** publisher_key and publisher_name, adapter_keys for separate acquisition channels, source-specific identity namespaces, verified protocol version and request policy, request deadline and provider pacing configuration, No collector-owned Official Source List approval
  - Evidence: Source is the publishing organization and official membership is a separate core decision. (`CONTEXT.md#L1-L145`)
  - Evidence: The flow names multiple regulators and Lab Test sources. (`docs/flows.md#L1-L198`)
  - New design reason: Keep FDA publisher identity independent from API, listing, XLSX and RSS adapters, and allow policy differences without redesign.
- **RawPayload:** payload_id, sha256, byte_length and retained body BLOB, UNIQUE(sha256) for identical retained bytes, media_type, encoding metadata and captured_at, purpose: discovery response, detail document, API payload or failure artifact, complete: false for truncated timeout evidence; incomplete payloads cannot become successful document revisions
  - Evidence: Full source texts belong in private Mac storage. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: Parsing can transform response bytes. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
  - Evidence: A body download can be aborted at a deadline. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
  - New design reason: Deduplicate payload bytes separately from revision occurrences. Reuse A's bytes on A→B→A without suppressing the third chronological revision. Partial failure evidence must not be mistaken for a complete source document.
- **RawDocument:** document_id, publisher_key, document_type and identity_namespace, source_document_key: verified stable document or product-row identifier, source identifiers and original URL aliases, first_seen_at, last_seen_at and current_revision_id, UNIQUE(publisher_key, identity_namespace, source_document_key), A document-specific URL may identify a press release; a shared API page URL or event ID/FEI pair cannot identify its product rows
  - Evidence: A collected Report has stored-once document identity. (`CONTEXT.md#L1-L145`)
  - Evidence: SQLite uniqueness can enforce identity. ([scrapy/dupefilters.py L1-L244](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/dupefilters.py#L1-L244))
  - Evidence: The comparator's identity inputs are unsuitable for missing recall numbers. ([openfda/res/pipeline.py L135-L152](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L135-L152))
  - New design reason: R3 requires distinct unclassified rows in the same event/FEI group to retain separate histories. T7 must verify the real upstream row key; unresolved identity is retained as raw evidence rather than collapsed by event.
- **RawRevision:** revision_id and globally increasing revision_sequence, document_id and previous_revision_id, content_hash and hash_algorithm_version, payload_id referencing reusable RawPayload bytes, immutable serialized CollectorRecordV1 snapshot, extraction_version and retrieved_at for this occurrence, UNIQUE(revision_sequence); no UNIQUE(document_id, content_hash), Append when incoming content differs from the current revision, even when its hash appeared earlier
  - Evidence: The local design requires immutable revisions and provenance tied to exact revisions. (`docs/plans/stage1-plan.md#L729-L788`)
  - New design reason: R2, R4 and R12 require chronological change occurrences. A→A→B→B→A→A yields one document, three revision occurrences and two distinct payload bodies.
- **RawRecallEvent:** raw_recall_event_id, publisher_key, upstream_event_id and fei_number, UNIQUE(publisher_key, upstream_event_id, fei_number), Identifiers retained as strings, Separate from RawDocument and core Incident identity
  - Evidence: Core Incident identity is independent from collected documents. (`CONTEXT.md#L1-L145`)
  - Evidence: Event ID and recall number are separate source fields. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113))
  - New design reason: R3 explicitly requests event ID/FEI correlation; the group does not replace individual source-row identity.
- **RawRecallMembership:** raw_recall_event_id, document_id and supporting_revision_id, association basis: explicit upstream identifiers or authoritative source cross-reference, UNIQUE(raw_recall_event_id, document_id, supporting_revision_id)
  - Evidence: A source document and the events it concerns are separate concepts. (`CONTEXT.md#L1-L145`)
  - New design reason: Keep all press releases, individual iRES rows and supplied Dashboard records while associating them, including several product rows within one event.
- **CollectionState:** adapter_key, protocol_version and mode namespace, phase: backfill or incremental, inclusive iRES start: 2012-06-08, initial cutoff, query-window coverage and provider continuations, incremental watermark and incremental_discovery_due_at, known-recall refresh targets with independent due times, refusal cooldown and persisted origin pacing state
  - Evidence: The local flow requires FDA full backfill. (`docs/flows.md#L1-L198`)
  - Evidence: The comparator stores and restores pending-work state. ([scrapy/core/scheduler.py L290-L559](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py#L290-L559))
  - New design reason: Historical completion must activate future discovery, not just refresh existing records. Discovery remains scheduled even when there are no open recalls.
- **CollectionWork:** work_id, adapter_key, collection_epoch and work_key, kind: backfill page, incremental discovery, detail fetch or known-recall refresh, serializable request description without credentials, state: pending, in_flight, deferred or complete, attempt_count, next_attempt_at and owning_run_id, provider continuation, target document reference and discovery provenance, Uniqueness scoped to an epoch rather than permanently suppressing a URL
  - Evidence: Interruptions must not erase collection progress. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: Pending scheduling state is distinct from fetched data. ([scrapy/core/scheduler.py L290-L559](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py#L290-L559))
  - Evidence: Retry work carries explicit attempt state. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))
  - New design reason: R4, R5 and R8 need durable discovery-to-detail work and retryable page processing without suppressing later updates.
- **CollectionRun:** run_id, mode and trigger: manual or scheduled, started_at, run_deadline_at and finished_at, status: running, succeeded, partial, interrupted or live_disabled, per-adapter outcomes, summary counts derived from committed observations, scheduler-origin metadata without credentials
  - Evidence: Collection is local and may be interrupted. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: Operational retry outcomes have explicit counts. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))
  - New design reason: R8 and R9 require inspectable scheduled invocations, finite run ownership and accurate partial outcomes.
- **FetchAttempt:** attempt_id, run_id, work_id and adapter_key, safe request locator, method, started_at, deadline_at and finished_at, HTTP status, timeout stage or network-error category, response_payload_id and response_complete, outcome: success, refusal, rate_limited, timeout, transient_failure, parse_failure, redirect_rejected or interrupted, safe error detail and retry decision, Each retry creates a new attempt; terminal attempt rows are immutable and are not deleted after success
  - Evidence: The transport observes statuses and receives cancellation information. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
  - Evidence: Timeout handling aborts body acquisition. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
  - Evidence: Retry reasons and exhaustion are separately recorded. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))
  - Evidence: Operational data remains private. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: R9 requires every failure, including failures preceding eventual success. Mutable work status cannot substitute for an attempt history.
- **RecordObservation:** observation_id and replay-safe observation_key, attempt_id, run_id, adapter_key, document_id and revision_id, retrieved_at and disposition: new, changed or duplicate, candidate_flag: likely, unlikely or unknown, screening_rule_version and matched-rule reasons, Replaying the same committed work observation has no effect; a fresh fetch returning an older payload after a change is a changed observation
  - Evidence: Eligibility annotations are distinct from document identity. (`CONTEXT.md#L1-L145`)
  - Evidence: Duplicate outcomes are counted separately. ([scrapy/dupefilters.py L1-L244](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/dupefilters.py#L1-L244))
  - Evidence: Tests verify persisted duplicate recognition and counters. ([tests/test_dupefilters.py L1-L307](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_dupefilters.py#L1-L307))
  - New design reason: R2, R6 and R9 require both idempotent work replay and complete fresh-retrieval history without conflating them.

### Invariants

- Source-document identity, individual iRES product-row identity, raw recall grouping and core Incident identity are separate. Two unclassified rows sharing event ID and FEI remain two documents.
  - Evidence: Report and Incident identities differ. (`CONTEXT.md#L1-L145`)
  - Evidence: Event ID and recall number are distinct fields. ([openfda/res/pipeline.py L31-L113](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L31-L113))
  - Evidence: The comparator's identity hash cannot establish missing-number row identity. ([openfda/res/pipeline.py L135-L152](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py#L135-L152))
  - New design reason: R2 and R3 require source-row retention independently of event correlation.
- Deduplicate bytes separately from revision occurrences. Compare a fresh observation with the current revision only: A→B→A appends three increasing revision sequences, while consecutive identical content appends none.
  - Evidence: The local design requires immutable exact revisions. (`docs/plans/stage1-plan.md#L729-L788`)
  - New design reason: Historical hash uniqueness would hide a later change and break R2/R4/R12 incremental hand-off.
- Page records, revision occurrences, observations, completed work, successor work and checkpoints commit atomically. Failed, timed-out or incomplete responses cannot advance successful coverage.
  - Evidence: Related persistence effects are planned transactionally. (`docs/plans/stage1-plan.md#L729-L788`)
  - Evidence: The comparator exposes persisted pending-work state. ([scrapy/core/scheduler.py L290-L559](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py#L290-L559))
  - New design reason: R4 and R8 require a stronger atomic boundary than an independent cursor file.
- Every request has an absolute deadline covering headers, all allowed redirects and full body consumption. Expiry aborts acquisition, records the exact timeout stage, ignores late results and yields recoverable work to another source.
  - Evidence: Body processing shares a deadline and aborts on expiry. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
  - Evidence: Cancellation reaches the HTTP client. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
  - Evidence: Collection ownership remains local. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: R8 and R9 cannot be satisfied by retry counts when an attempt never settles.
- Only one collection process owns the advisory lock. All contenders open the same persistent inode; normal release never unlinks, truncates or replaces the lock file. Sleep does not expire ownership.
  - Evidence: Sleep is a normal operating condition. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: The local design includes single-process exclusion. (`docs/plans/stage1-plan.md#L729-L788`)
  - New design reason: R8 requires exclusion even when a contender opened the file before the preceding owner released it.
- The four-hour schedule must be registered and enabled with the Mac scheduler, and acceptance must observe scheduler-initiated execution rather than only validate a generated artifact.
  - Evidence: Collection operates on the owner's Mac. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: R8 requests scheduled operation, not a configuration file that has never been activated.
- 401/403 remain refusals with no immediate retry loop. Retry-After is an absolute minimum eligibility time independent of ordinary origin spacing, survives restart and is not shortened by a backoff cap.
  - Evidence: 429 processing reads Retry-After before parsing. ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659))
  - Evidence: The matching test checks its timing. ([test/core/crawlers/http-crawler.test.ts L720-L761](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L720-L761))
  - Evidence: Retries have finite explicit state. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))
  - New design reason: R5 and R8 require correct pacing even when Retry-After is much longer than the one-second base interval.
- After historical completion, each due collection epoch plans incremental discovery independently of known-recall refreshes. Empty refresh queues do not disable discovery.
  - Evidence: The local flow requires a continuing FDA collector. (`docs/flows.md#L1-L198`)
  - New design reason: R4 requires new records to be discovered after backfill, not merely an incremental phase label.
- Discovery artifacts and destination press releases are distinct. A release is collected only after its detail response is fetched and retained; listing summaries cannot become its raw payload.
  - Evidence: A Report is one collected source document with its source and link. (`CONTEXT.md#L1-L145`)
  - New design reason: R1 and R5 require the actual release document, not just evidence that its URL appeared in a feed.
- Every record receives a deterministic candidate flag, and all flags remain stored and exportable. Source-declared EAN-13 and GTIN-14 values are not rejected by a UPC-only extraction path.
  - Evidence: Pet Food eligibility and Affected Lot identification are separate domain concerns. (`CONTEXT.md#L1-L145`)
  - Evidence: The reference extraction helper is limited to UPC candidates. ([openfda/res/extract.py L1-L81](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py#L1-L81))
  - New design reason: R1, R6 and R12 require non-destructive extraction, screening and hand-off.
- Authenticated iRES requests use manual redirect handling. Any scheme, host or port change is rejected before dispatch; neither FDA authorization header reaches another origin.
  - Evidence: Headers pass through a concrete HTTP-client boundary. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
  - Evidence: Credentials remain protected local inputs. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: Initial-destination validation alone does not satisfy the R4/R7 credential boundary.
- Terminal FetchAttempt rows survive subsequent success and reopening. Export preserves every selected revision occurrence in sequence, including all candidate flags and repeated content, without deleting records or invoking core/AI/publication effects.
  - Evidence: Failures and retries have attributed operational outcomes. ([scrapy/downloadermiddlewares/retry.py L1-L200](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py#L1-L200))
  - Evidence: Exact revisions and core publication gates remain independent. (`docs/plans/stage1-plan.md#L729-L788`)
  - Evidence: Issue #14 is the later collector-format hand-off. (`docs/flows.md#L1-L198`)
  - New design reason: R9 requires complete failure history, and R12 requires the complete retained backlog through the selected file interface.

### Access control

- **Private Mac storage versus public hosting:** Use owner-only directories and database, sidecar, log and export permissions. Start no public listener and configure no public upload destination. Keep the advisory lock file private and preserve its inode across normal releases.
  - Evidence: Private originals and credentials must not be publicly hosted. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: Only published data moves to the public site. (`docs/flows.md#L1-L198`)
  - New design reason: R2, R8 and R12 need local private operation without adding accounts or a review interface.
- **Local credentials versus requests, redirects and persisted artifacts:** Read keys outside git; inject them only at the verified iRES transport boundary. Disable automatic authenticated redirects. Permit bounded same-origin redirects only after validating each hop; reject origin changes with ires_redirect_origin_changed. Never serialize credential values into work, logs, fixtures or exports.
  - Evidence: Credentials remain private. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: The HTTP-client boundary receives request headers. ([packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020))
  - New design reason: R4 and R7 require checking actual redirected dispatch, not just the initial URL or stored logs.
- **Fixture execution versus live collection:** Use disposable fixture stores and recorded-response transport. Missing keys disable explicitly requested live runs before I/O. Fixture work cannot update live checkpoints or certify live backfill. Synthetic behavioral fixtures remain labeled as such.
  - Evidence: An injected client can supply controlled responses. ([test/core/crawlers/http-crawler.test.ts L660-L719](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts#L660-L719))
  - Evidence: The owner controls private local execution. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: R7 and R10 require meaningful mode separation.
- **Sourcing versus core decisions and publication:** Provide Source references and provenance without approving Official Source membership, making final Pet Food decisions, creating accepted Incident Links, invoking AI or publishing. Export every candidate flag for the core to process later.
  - Evidence: Official Source membership and accepted Links have independent rules. (`CONTEXT.md#L1-L145`)
  - Evidence: The planned intake decoder excludes collector control over reserved approval/publication fields. (`docs/plans/stage1-plan.md#L729-L788`)
  - Evidence: Core triage and publication belong to later workflow stages. (`docs/flows.md#L1-L198`)
  - New design reason: R6 and R12 authorize collection and complete hand-off only.

## Stack

Each brick is a module of the plan or an entity of its data model, from the bottom up. `stack.html` in the run folder shows the files behind each brick.

| Brick | Name | Reference repositories | New design |
| --- | --- | --- | --- |
| 01 (data) | `CollectorRecordV1` | local project, `FDA/openfda` | yes |
| 02 (data) | `SourceDescriptor` | local project | yes |
| 03 (data) | `RawPayload` | local project, `apify/crawlee` | yes |
| 04 (data) | `RawDocument` | local project, `scrapy/scrapy`, `FDA/openfda` | yes |
| 05 (data) | `RawRevision` | local project | yes |
| 06 (data) | `RawRecallEvent` | local project, `FDA/openfda` | yes |
| 07 (data) | `RawRecallMembership` | local project | yes |
| 08 (data) | `CollectionState` | local project, `scrapy/scrapy` | yes |
| 09 (data) | `CollectionWork` | local project, `scrapy/scrapy` | yes |
| 10 (data) | `CollectionRun` | local project, `scrapy/scrapy` | yes |
| 11 (data) | `FetchAttempt` | `apify/crawlee`, `scrapy/scrapy`, local project | yes |
| 12 (data) | `RecordObservation` | local project, `scrapy/scrapy` | yes |
| 13 | `Shared collector contract and extraction helpers` | local project, `FDA/openfda` | yes |
| 14 | `Private raw store` | local project, `scrapy/scrapy` | yes |
| 15 | `Credential guard and abortable HTTP transport` | local project, `apify/crawlee` | yes |
| 16 | `Durable collection runner` | local project, `scrapy/scrapy`, `apify/crawlee` | yes |
| 17 | `FDA adapters and deterministic screening` | local project, `FDA/openfda` | yes |
| 18 | `Mac scheduling and collection health` | local project, `scrapy/scrapy` | yes |
| 19 | `Complete private backlog export` | local project | yes |

## Evidence gaps

- Informational (local): No local test file was found in the bounded file list; the plan should establish the target project's test conventions or add them.
- Informational (file): The file list for model selection left out 325 lower-ranked files to stay within 300,000 characters.
- Informational (local): The local project has no indexed manifest file; new-project verification commands will be planned as to_create.
- Informational (local): The local project has no indexed license file; new-project verification commands will be planned as to_create.
- Informational (local): The local project has no indexed ci file; new-project verification commands will be planned as to_create.
- Material (repository): FDA/openfda has no indexed manifest file at fdbe54327901a0c1e30130d1d6a2bbe67b79b77c.
- Informational (repository): FDA/openfda has no indexed ci file at fdbe54327901a0c1e30130d1d6a2bbe67b79b77c.
- Informational (repository): FDA/openfda has no indexed test configuration file; test conventions must be established from its tests.

## Draft reasons

- The complete issue #14 CollectorRecordV1 definition remains unavailable. E89 names ReportEnvelopeV1 without defining CollectorRecordV1. T1 must establish exact wire types, extension rules and ordered handling of repeated-content revision occurrences before claiming unchanged import compatibility.
- The supplied evidence does not establish the authenticated iRES endpoint, stable product-row identifiers, pagination, incremental-discovery semantics or Veterinary coverage from 8 June 2012. E93 and E4 instead show weekly CSV acquisition starting 20 June 2012. T7 must verify the official protocol and representative responses.
- Actual current FDA listing, XLSX, RSS, press-release detail, warning-letter, advisory and refusal responses were not supplied. T8 and T11 must obtain recorded artifacts with provenance before their source-specific extraction acceptance can close.
- FDA/openfda has no indexed manifest file at fdbe54327901a0c1e30130d1d6a2bbe67b79b77c.

## Independent review

Review 1: 2 finding(s), 12 surviving mutant(s).

- material: RawRevision's UNIQUE(document_id, content_hash) explicitly reuses an earlier revision when content changes A→B→A. Because T13 exports by revision_sequence, the return to A produces no new export event. This violates changed-content revision retention and can leave the later core processing B as the latest state. (R2, R4, R12) (`docs/plans/stage1-plan.md#L729-L788`) Correction: Deduplicate payload bytes separately from revision occurrences. Append a revision sequence whenever content differs from the current revision, including a return to an earlier hash, and verify A→B→A through incremental export.
- material: T5 bounds attempts and work counts but specifies no deadline or abort behavior for stalled response headers or bodies. A request that never settles can retain the single HTTP slot and run lock indefinitely, preventing other sources and scheduled runs from progressing. (R8, R9) ([packages/http-crawler/src/internals/http-crawler.ts L600-L659](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L600-L659); [packages/http-crawler/src/internals/http-crawler.ts L660-L1020](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts#L660-L1020)) Correction: Define an abortable deadline covering headers and body consumption. On expiry, record the failed attempt, retain recoverable work and continue other adapters; verify this with stalled-header and stalled-body fixtures.
- surviving mutant for A12: Validate only the initial iRES destination, then automatically follow redirects while forwarding Authorization-User and Authorization-Key to another origin. Planned checks would pass: T7-V1's ordinary wire examples still observe the correct initial destination, headers and Veterinary filter. T13-V2 can pass against normal responses. No planned check supplies an origin-changing redirect and inspects the redirected request; the credential-canary checks inspect persisted artifacts and operational output.
- surviving mutant for A33: Await each adapter's fetch or body consumption without a deadline, so an indefinitely stalled first source prevents every later adapter from running. Planned checks would pass: T10-V1 exercises refusals, parse failures and thrown errors that settle. Its later adapter still succeeds in those cases. The bounded-retry tests also receive completed failures; none exercises an unresolved request or body stream.
- surviving mutant for A13: Complete historical collection and set phase=incremental, but have the runner schedule only known-recall refreshes afterward, never invoking incremental discovery for newly appearing records. Planned checks would pass: T7-V1 can pass its historical pagination, boundary-date and known-recall refresh cases, including all named mutants. T13-V2 verifies historical completion and recovery. Neither check introduces a new upstream record after backfill completion and requires its discovery.
- surviving mutant for A7: Implement the planned per-document hash uniqueness literally: on A→B→A, reuse the original A revision instead of creating a new revision occurrence. Planned checks would pass: T2-V1's unchanged recollection and first changed-payload cases still produce one document with the expected A and B snapshots. Classification-only changes also work. No planned case requires a new chronological revision when previously seen content returns.
- surviving mutant for A11: For unclassified iRES rows without recall numbers, use event ID plus FEI as the source-document key, merging separate product rows into one document's revision history. Planned checks would pass: T3-V1 retains its press-release, iRES and Dashboard representations because they have different document types or identity namespaces. It also separates different events at one firm. No described case requires two distinct unclassified iRES documents within the same event/FEI association to retain separate histories.
- surviving mutant for A41: Export only records flagged likely, leaving unlikely and unknown records permanently inaccessible through the selected file hand-off. Planned checks would pass: T13-V1 checks decoder acceptance, repeatability and unchanged store contents, but does not require equality between exported IDs and the complete retained backlog across all three candidate flags. Filtering leaves exports repeatable and the raw store untouched. T6's retention checks still pass.
- surviving mutant for A27: Generate a correct four-hour schedule artifact but never register or enable it with the Mac scheduler. Planned checks would pass: T9-V1 validates the generated interval and manually exercises collection processes for locking. T13-V2 also uses explicit invocations. No planned check establishes that the installed scheduler actually launches collection.
- surviving mutant for A28: Unlink the advisory-lock file during normal release. A contender that opened the old file before unlinking can subsequently lock that inode while another process locks a newly created file at the same path. Planned checks would pass: The two-process contention, paused-owner and killed-owner cases can all pass. They do not exercise a contender paused between opening and locking while normal cleanup unlinks the file, followed by another invocation.
- surviving mutant for A16: Discover and deduplicate press-release URLs from listing, XLSX and RSS responses, but never fetch the destination releases; retain listing summaries and listing payloads as the release records. Planned checks would pass: T8-V1 can still assert the exact discovered URL sets, overlapping-reference deduplication and retention of each discovery response's bytes. No planned press-release detail fixture or discovery-to-detail-fetch assertion establishes that the actual release document was collected.
- surviving mutant for A29: T5-V1-M1: Ignore Retry-After when scheduling 429 retries, while retaining the mandatory one-second origin spacing. A Retry-After value longer than one second is consequently violated. Planned checks would pass: The named check and ported E100 case use Retry-After: 1 and assert at least 1000 ms between attempts. Ordinary one-second pacing satisfies that assertion even when Retry-After handling is removed. Configured pacing, retry exhaustion and persisted base-delay checks can also pass.
- surviving mutant for A4: Use the adopted 12-digit UPC validator as the only barcode extraction path, dropping available valid EAN-13 or GTIN-14 values from actual source documents. Planned checks would pass: E5's ported barcode cases are UPC cases. A complete, prepopulated contract fixture can still round-trip every field and preserve leading zeros. No planned extraction case requires a non-UPC barcode to survive source decoding.
- surviving mutant for A32: Delete earlier failed FetchAttempt rows once a retry for that work item succeeds, retaining only the successful attempt. Planned checks would pass: T10-V1's refusal and parse-failure records remain visible because those work items do not subsequently succeed. Retry-exhaustion cases also retain their failures. No planned health check requires transient failures preceding eventual success to remain inspectable after reopening.

Review 2: 0 finding(s), 12 surviving mutant(s).

- surviving mutant for A24: Redact ordinary request logging but serialize an exception's nested cause, including FDA authorization headers, when a live request fails. Planned checks would pass: T4-V1 does not explicitly inject a credential-bearing exception through the production error-reporting path. Ordinary canary requests remain clean, recovery tests use credential-free errors, and redirect tests prevent destination dispatch without testing exception serialization.
- surviving mutant for A13: Traverse mutable offset-based backfill pages without a stable snapshot or reconciliation for records that move between pages during upstream updates, silently skipping a matching record. Planned checks would pass: T7-V1 specifies static pagination and later discovery cases, without changing page membership between historical requests. T13-V2 can pass during a quiet live run; exhausted continuations and window completion cannot expose this omission when authoritative totals are unavailable.
- surviving mutant for A28: On graceful cancellation, release the advisory lock before the in-flight request and its record-application callback have stopped, allowing another collector to start while the first can still write. Planned checks would pass: T9-V1 exercises normal release, paused owners, process death and inode races, but does not cancel a still-running collector. T5-V1 tests deadline expiry, which can retain ownership correctly while the separate CLI cancellation path releases it prematurely.
- surviving mutant for A14: Remove all refresh targets sharing an event ID and FEI when one product row becomes terminated, including sibling rows that remain open or unclassified. Planned checks would pass: T7-V1 checks individual unclassified and terminated targets without specifying mixed lifecycle states within one event. T3-V1 checks independent document histories for sibling rows but does not exercise their refresh scheduling.
- surviving mutant for A6: Give each iRES row a stable document key but calculate its content hash from the entire containing API page. An unrelated row changing then creates a revision for an unchanged document. Planned checks would pass: T2-V1 exercises supplied per-document payloads. T3-V1 can exercise independent row records directly. T7-V1 does not specify an adapter-level assertion that changing one page member leaves every unchanged member's revision count unchanged.
- surviving mutant for A29: Persist pacing and Retry-After eligibility separately for each adapter, allowing another adapter targeting the same FDA origin to dispatch during that origin's cooldown. Planned checks would pass: T5-V1 checks retries and reopening for the throttled work itself. The document and health checks do not specify cross-adapter dispatch-time assertions for a shared origin. Each adapter can therefore pass its individual timing checks while their combined traffic violates the limit.
- surviving mutant for A19: Recognize refusals only after reading the complete response body. If a known 401 or 403 body stalls, classify its deadline failure as transient and immediately retry. Planned checks would pass: T8-V1 tests completed refusal responses. T5-V1 and T10-V1 test stalled acquisition separately, without specifying a refusal status followed by a stalled body. Both sets pass while their combination enters the aggressive retry path.
- surviving mutant for A33: Drain adapters in a fixed order. A large first-source backlog consumes almost the entire run budget before failing, leaving healthy later sources unstarted on every run. Planned checks would pass: T5-V1 and T10-V1 make the first adapter fail or stall immediately, leaving sufficient budget for the healthy adapter. Neither specifies repeated bounded runs with substantial earlier work and an exhausted budget, so persistent source starvation remains undetected.
- surviving mutant for A32: During restart recovery, delete unfinished FetchAttempt rows while returning their work to pending, erasing evidence of requests interrupted by process death. Planned checks would pass: T5-V1 and T13-V2 inspect resumed progress and retained records. T10-V1 preserves already-terminal failures across retries and reopening, but does not require an interrupted in-flight attempt to survive recovery with its original locator and timestamps.
- surviving mutant for A4: Populate Markets from the recalling firm's address country rather than the affected distribution Markets, producing an incorrect Market when the firm and distribution are in different countries. Planned checks would pass: T1-V1 can round-trip correctly prepopulated Markets. T7-V1 and T8-V1 emphasize production barcode extraction without specifying a case that distinguishes firm location from affected Markets. The distribution text can remain intact while the derived Market is wrong.
- surviving mutant for A18: Treat an HTTP 200 access-denied or login-challenge HTML response as a successful empty listing because no document links were found. Planned checks would pass: The refusal scenarios specify status-based refusals, particularly 401 and 403. Valid challenge HTML need not trigger the separate parse-error cases. No planned check explicitly requires a successful HTTP status carrying an access refusal to produce a failure.
- surviving mutant for A37: Enforce document uniqueness using only the source-specific document key, merging records from different publishers or identity namespaces when their local identifiers coincide. Planned checks would pass: The store and extension checks do not specify colliding local identifiers across publishers or namespaces. All named source cases can retain their identifiers and payloads successfully when their fixture keys differ, while a later regulator's record with an existing local key overwrites or joins another source's history.

## Checks performed

The host read and hashed the listed source files and recorded the line range of every excerpt it cut. It checked that each cited excerpt ID is one it created and that each reference comparison cites only its own repository at the pinned commit, checked requirement and acceptance coverage, checked that existing verification commands come from local files it read, and checked that task dependencies exist and form no cycle. It checked that each verification names at least one wrong implementation for every acceptance criterion it covers, and that each reference test cited under an adopted pattern comes from a file it read as a test from that repository at the pinned commit. It did not check that an excerpt supports the claim next to it, and it did not run target project commands or tests.

## Trusted, not checked

- github:FDA/openfda@fdbe54327901a0c1e30130d1d6a2bbe67b79b77c: 721 stars; last push 2026-06-08; created 2014-06-01. The commit is the head of the default branch `master` when this run resolved it, not a release or tag. The tree listing the host received had 112 test-like path(s) by file name; if the evidence gaps say that listing was truncated, this count is a lower bound. The host read 2 production file(s) and 1 test file(s) from it and ran none of them. License: CC0-1.0, as GitHub's SPDX metadata reports it.
- github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: 65123 stars; last push 2026-10-30; created 2010-02-22. The commit is the head of the default branch `master` when this run resolved it, not a release or tag. The tree listing the host received had 384 test-like path(s) by file name; if the evidence gaps say that listing was truncated, this count is a lower bound. The host read 4 production file(s) and 4 test file(s) from it and ran none of them. License: BSD-3-Clause, as GitHub's SPDX metadata reports it.
- github:apify/crawlee@65254412a9f9d84a10b51ef4ada58a3cfd9046fc: 26303 stars; last push 2026-10-31; created 2016-08-26. The commit is the head of the default branch `master` when this run resolved it, not a release or tag. The tree listing the host received had 443 test-like path(s) by file name; if the evidence gaps say that listing was truncated, this count is a lower bound. The host read 2 production file(s) and 2 test file(s) from it and ran none of them. License: Apache-2.0, as GitHub's SPDX metadata reports it.
- The claim next to each citation is written by the model. The host checks only that the excerpt ID exists, and for a reference comparison that the excerpt comes from that repository at the pinned commit and, for a cited reference test, from a file it read as a test; it then shows the line range it recorded when it read the file.
- Local sources are identified by the SHA-256 of the content this run read, taken after any redaction, not by a commit.
- The independent review is the same model in a fresh session.
- Surviving mutants, and the lack of them, are the reviewer model's reasoning: unshit applied and ran none of them, and a review that reports none does not show that the planned checks reject every wrong implementation.
- The plan names 71 wrong implementation(s) under its verification steps. The model wrote them, and unshit did not apply any of them or run any check.
- The plan cites 10 distinct reference test excerpt(s) under adopted patterns. The host recognises a test file by its path name only; it read these at the pinned commit and ran none of them, and that each one exercises its pattern rests on the planner and the independent review.
- The host received brief approval through the agent protocol; it cannot verify who approved it.

## Stages and references

Revision 11 of the stage-and-reference preview; `preview.html` in the run folder shows the same revision. A search result is a discovery hint, not evidence. A listed commit or file was not read. Evidence is source the host read and hashed, or an excerpt it cut from that source.

- **Intake** (`intake`): completed; no references.
- **Material answers** (`answer_gate`): skipped; no references.
- **Brief rebuild** (`brief_rebuild`): skipped; no references.
- **Brief approval** (`brief_approval`): completed; no references.
- **Local baseline** (`local_baseline`): completed; no references.
- **Repository search** (`repository_search`): completed.
  - Found by search: `C21` [`github:FDA/openfda`](<https://github.com/FDA/openfda>) (search result, not evidence)
  - Found by search: `C38` [`github:FreedomIntelligence/OpenClaw-Medical-Skills`](<https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills>) (search result, not evidence)
  - Found by search: `C39` [`github:nitrocloudofficial/nitrostack`](<https://github.com/nitrocloudofficial/nitrostack>) (search result, not evidence)
  - Found by search: `C41` [`github:GoogleCloudPlatform/public-datasets-pipelines`](<https://github.com/GoogleCloudPlatform/public-datasets-pipelines>) (search result, not evidence)
  - Found by search: `C22` [`github:firecrawl/firecrawl`](<https://github.com/firecrawl/firecrawl>) (search result, not evidence)
  - Found by search: `C23` [`github:D4Vinci/Scrapling`](<https://github.com/D4Vinci/Scrapling>) (search result, not evidence)
  - Found by search: `C24` [`github:unclecode/crawl4ai`](<https://github.com/unclecode/crawl4ai>) (search result, not evidence)
  - Found by search: `C25` [`github:scrapy/scrapy`](<https://github.com/scrapy/scrapy>) (search result, not evidence)
  - Found by search: `C26` [`github:NaiboWang/EasySpider`](<https://github.com/NaiboWang/EasySpider>) (search result, not evidence)
  - Found by search: `C27` [`github:ScrapeGraphAI/Scrapegraph-ai`](<https://github.com/ScrapeGraphAI/Scrapegraph-ai>) (search result, not evidence)
  - Found by search: `C28` [`github:iawia002/lux`](<https://github.com/iawia002/lux>) (search result, not evidence)
  - Found by search: `C29` [`github:apify/crawlee`](<https://github.com/apify/crawlee>) (search result, not evidence)
  - Found by search: `C14` [`github:gocolly/colly`](<https://github.com/gocolly/colly>) (search result, not evidence)
  - Found by search: `C30` [`github:jhao104/proxy_pool`](<https://github.com/jhao104/proxy_pool>) (search result, not evidence)
  - Found by search: `C31` [`github:Evil0ctal/Douyin_TikTok_Download_API`](<https://github.com/Evil0ctal/Douyin_TikTok_Download_API>) (search result, not evidence)
  - Found by search: `C32` [`github:getmaxun/maxun`](<https://github.com/getmaxun/maxun>) (search result, not evidence)
  - Found by search: `C33` [`github:projectdiscovery/katana`](<https://github.com/projectdiscovery/katana>) (search result, not evidence)
  - Found by search: `C34` [`github:codelucas/newspaper`](<https://github.com/codelucas/newspaper>) (search result, not evidence)
  - Found by search: `C13` [`github:s0md3v/Photon`](<https://github.com/s0md3v/Photon>) (search result, not evidence)
  - Found by search: `C35` [`github:crawlab-team/crawlab`](<https://github.com/crawlab-team/crawlab>) (search result, not evidence)
  - Found by search: `C11` [`github:code4craft/webmagic`](<https://github.com/code4craft/webmagic>) (search result, not evidence)
  - Found by search: `C19` [`github:injetlee/Python`](<https://github.com/injetlee/Python>) (search result, not evidence)
  - Found by search: `C36` [`github:apify/crawlee-python`](<https://github.com/apify/crawlee-python>) (search result, not evidence)
  - Found by search: `C37` [`github:TeamWiseFlow/xiaobei`](<https://github.com/TeamWiseFlow/xiaobei>) (search result, not evidence)
  - Found by search: `C8` [`github:hect0x7/JMComic-Crawler-Python`](<https://github.com/hect0x7/JMComic-Crawler-Python>) (search result, not evidence)
  - Found by search: `C15` [`github:bda-research/node-crawler`](<https://github.com/bda-research/node-crawler>) (search result, not evidence)
  - Found by search: `C16` [`github:dataabc/weibo-crawler`](<https://github.com/dataabc/weibo-crawler>) (search result, not evidence)
  - Found by search: `C20` [`github:kanasimi/work_crawler`](<https://github.com/kanasimi/work_crawler>) (search result, not evidence)
  - Found by search: `C1` [`github:spatie/crawler`](<https://github.com/spatie/crawler>) (search result, not evidence)
  - Found by search: `C18` [`github:lncrawl/lightnovel-crawler`](<https://github.com/lncrawl/lightnovel-crawler>) (search result, not evidence)
  - Found by search: `C17` [`github:zhegexiaohuozi/SeimiCrawler`](<https://github.com/zhegexiaohuozi/SeimiCrawler>) (search result, not evidence)
  - Found by search: `C2` [`github:ShilongLee/Crawler`](<https://github.com/ShilongLee/Crawler>) (search result, not evidence)
  - Found by search: `C12` [`github:dadoonet/fscrawler`](<https://github.com/dadoonet/fscrawler>) (search result, not evidence)
  - Found by search: `C3` [`github:fredwu/crawler`](<https://github.com/fredwu/crawler>) (search result, not evidence)
  - Found by search: `C4` [`github:icpd/crawler`](<https://github.com/icpd/crawler>) (search result, not evidence)
  - Found by search: `C9` [`github:crwlrsoft/crawler`](<https://github.com/crwlrsoft/crawler>) (search result, not evidence)
  - Found by search: `C6` [`github:elastic/crawler`](<https://github.com/elastic/crawler>) (search result, not evidence)
  - Found by search: `C5` [`github:Norconex/crawler`](<https://github.com/Norconex/crawler>) (search result, not evidence)
  - Found by search: `C7` [`github:NanmiCoder/MediaCrawler`](<https://github.com/NanmiCoder/MediaCrawler>) (search result, not evidence)
  - Found by search: `C10` [`github:NanmiCoder/CrawlerTutorial`](<https://github.com/NanmiCoder/CrawlerTutorial>) (search result, not evidence)
  - Found by search: `C40` [`github:MemTensor/memmy-agent`](<https://github.com/MemTensor/memmy-agent>) (search result, not evidence)
- **Metadata screening** (`metadata_screening`): completed.
  - Passed the metadata bar: `C21` [`github:FDA/openfda`](<https://github.com/FDA/openfda>) (search result, not evidence)
  - Passed the metadata bar: `C38` [`github:FreedomIntelligence/OpenClaw-Medical-Skills`](<https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills>) (search result, not evidence)
  - Passed the metadata bar: `C39` [`github:nitrocloudofficial/nitrostack`](<https://github.com/nitrocloudofficial/nitrostack>) (search result, not evidence)
  - Passed the metadata bar: `C41` [`github:GoogleCloudPlatform/public-datasets-pipelines`](<https://github.com/GoogleCloudPlatform/public-datasets-pipelines>) (search result, not evidence)
  - Passed the metadata bar: `C22` [`github:firecrawl/firecrawl`](<https://github.com/firecrawl/firecrawl>) (search result, not evidence)
  - Passed the metadata bar: `C23` [`github:D4Vinci/Scrapling`](<https://github.com/D4Vinci/Scrapling>) (search result, not evidence)
  - Passed the metadata bar: `C24` [`github:unclecode/crawl4ai`](<https://github.com/unclecode/crawl4ai>) (search result, not evidence)
  - Passed the metadata bar: `C25` [`github:scrapy/scrapy`](<https://github.com/scrapy/scrapy>) (search result, not evidence)
  - Passed the metadata bar: `C26` [`github:NaiboWang/EasySpider`](<https://github.com/NaiboWang/EasySpider>) (search result, not evidence)
  - Passed the metadata bar: `C27` [`github:ScrapeGraphAI/Scrapegraph-ai`](<https://github.com/ScrapeGraphAI/Scrapegraph-ai>) (search result, not evidence)
  - Passed the metadata bar: `C28` [`github:iawia002/lux`](<https://github.com/iawia002/lux>) (search result, not evidence)
  - Passed the metadata bar: `C29` [`github:apify/crawlee`](<https://github.com/apify/crawlee>) (search result, not evidence)
  - Passed the metadata bar: `C14` [`github:gocolly/colly`](<https://github.com/gocolly/colly>) (search result, not evidence)
  - Passed the metadata bar: `C30` [`github:jhao104/proxy_pool`](<https://github.com/jhao104/proxy_pool>) (search result, not evidence)
  - Passed the metadata bar: `C31` [`github:Evil0ctal/Douyin_TikTok_Download_API`](<https://github.com/Evil0ctal/Douyin_TikTok_Download_API>) (search result, not evidence)
  - Passed the metadata bar: `C32` [`github:getmaxun/maxun`](<https://github.com/getmaxun/maxun>) (search result, not evidence)
  - Passed the metadata bar: `C33` [`github:projectdiscovery/katana`](<https://github.com/projectdiscovery/katana>) (search result, not evidence)
  - Passed the metadata bar: `C34` [`github:codelucas/newspaper`](<https://github.com/codelucas/newspaper>) (search result, not evidence)
  - Passed the metadata bar: `C13` [`github:s0md3v/Photon`](<https://github.com/s0md3v/Photon>) (search result, not evidence)
  - Passed the metadata bar: `C35` [`github:crawlab-team/crawlab`](<https://github.com/crawlab-team/crawlab>) (search result, not evidence)
  - Passed the metadata bar: `C11` [`github:code4craft/webmagic`](<https://github.com/code4craft/webmagic>) (search result, not evidence)
  - Passed the metadata bar: `C19` [`github:injetlee/Python`](<https://github.com/injetlee/Python>) (search result, not evidence)
  - Passed the metadata bar: `C36` [`github:apify/crawlee-python`](<https://github.com/apify/crawlee-python>) (search result, not evidence)
  - Passed the metadata bar: `C37` [`github:TeamWiseFlow/xiaobei`](<https://github.com/TeamWiseFlow/xiaobei>) (search result, not evidence)
  - Passed the metadata bar: `C8` [`github:hect0x7/JMComic-Crawler-Python`](<https://github.com/hect0x7/JMComic-Crawler-Python>) (search result, not evidence)
  - Passed the metadata bar: `C15` [`github:bda-research/node-crawler`](<https://github.com/bda-research/node-crawler>) (search result, not evidence)
  - Passed the metadata bar: `C16` [`github:dataabc/weibo-crawler`](<https://github.com/dataabc/weibo-crawler>) (search result, not evidence)
  - Passed the metadata bar: `C20` [`github:kanasimi/work_crawler`](<https://github.com/kanasimi/work_crawler>) (search result, not evidence)
  - Passed the metadata bar: `C1` [`github:spatie/crawler`](<https://github.com/spatie/crawler>) (search result, not evidence)
  - Passed the metadata bar: `C18` [`github:lncrawl/lightnovel-crawler`](<https://github.com/lncrawl/lightnovel-crawler>) (search result, not evidence)
  - Passed the metadata bar: `C17` [`github:zhegexiaohuozi/SeimiCrawler`](<https://github.com/zhegexiaohuozi/SeimiCrawler>) (search result, not evidence)
  - Passed the metadata bar: `C2` [`github:ShilongLee/Crawler`](<https://github.com/ShilongLee/Crawler>) (search result, not evidence)
  - Passed the metadata bar: `C12` [`github:dadoonet/fscrawler`](<https://github.com/dadoonet/fscrawler>) (search result, not evidence)
  - Passed the metadata bar: `C3` [`github:fredwu/crawler`](<https://github.com/fredwu/crawler>) (search result, not evidence)
  - Passed the metadata bar: `C4` [`github:icpd/crawler`](<https://github.com/icpd/crawler>) (search result, not evidence)
  - Passed the metadata bar: `C9` [`github:crwlrsoft/crawler`](<https://github.com/crwlrsoft/crawler>) (search result, not evidence)
  - Passed the metadata bar: `C6` [`github:elastic/crawler`](<https://github.com/elastic/crawler>) (search result, not evidence)
  - Passed the metadata bar: `C5` [`github:Norconex/crawler`](<https://github.com/Norconex/crawler>) (search result, not evidence)
  - Passed the metadata bar: `C7` [`github:NanmiCoder/MediaCrawler`](<https://github.com/NanmiCoder/MediaCrawler>) (search result, not evidence)
  - Passed the metadata bar: `C10` [`github:NanmiCoder/CrawlerTutorial`](<https://github.com/NanmiCoder/CrawlerTutorial>) (search result, not evidence)
  - Excluded: `C40` [`github:MemTensor/memmy-agent`](<https://github.com/MemTensor/memmy-agent>) (search result, not evidence); `created 2026-07-16, younger than 180 days`
- **Preview confirmation** (`preview_confirmation`): completed; no references.
- **Candidate ranking** (`candidate_ranking`): completed.
  - Supplied to the model: `C21` [`github:FDA/openfda`](<https://github.com/FDA/openfda>) (search result, not evidence)
  - Supplied to the model: `C38` [`github:FreedomIntelligence/OpenClaw-Medical-Skills`](<https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills>) (search result, not evidence)
  - Supplied to the model: `C39` [`github:nitrocloudofficial/nitrostack`](<https://github.com/nitrocloudofficial/nitrostack>) (search result, not evidence)
  - Supplied to the model: `C41` [`github:GoogleCloudPlatform/public-datasets-pipelines`](<https://github.com/GoogleCloudPlatform/public-datasets-pipelines>) (search result, not evidence)
  - Supplied to the model: `C22` [`github:firecrawl/firecrawl`](<https://github.com/firecrawl/firecrawl>) (search result, not evidence)
  - Supplied to the model: `C23` [`github:D4Vinci/Scrapling`](<https://github.com/D4Vinci/Scrapling>) (search result, not evidence)
  - Supplied to the model: `C24` [`github:unclecode/crawl4ai`](<https://github.com/unclecode/crawl4ai>) (search result, not evidence)
  - Supplied to the model: `C25` [`github:scrapy/scrapy`](<https://github.com/scrapy/scrapy>) (search result, not evidence)
  - Supplied to the model: `C26` [`github:NaiboWang/EasySpider`](<https://github.com/NaiboWang/EasySpider>) (search result, not evidence)
  - Supplied to the model: `C27` [`github:ScrapeGraphAI/Scrapegraph-ai`](<https://github.com/ScrapeGraphAI/Scrapegraph-ai>) (search result, not evidence)
  - Supplied to the model: `C28` [`github:iawia002/lux`](<https://github.com/iawia002/lux>) (search result, not evidence)
  - Supplied to the model: `C29` [`github:apify/crawlee`](<https://github.com/apify/crawlee>) (search result, not evidence)
  - Supplied to the model: `C14` [`github:gocolly/colly`](<https://github.com/gocolly/colly>) (search result, not evidence)
  - Supplied to the model: `C30` [`github:jhao104/proxy_pool`](<https://github.com/jhao104/proxy_pool>) (search result, not evidence)
  - Supplied to the model: `C31` [`github:Evil0ctal/Douyin_TikTok_Download_API`](<https://github.com/Evil0ctal/Douyin_TikTok_Download_API>) (search result, not evidence)
  - Supplied to the model: `C32` [`github:getmaxun/maxun`](<https://github.com/getmaxun/maxun>) (search result, not evidence)
  - Supplied to the model: `C33` [`github:projectdiscovery/katana`](<https://github.com/projectdiscovery/katana>) (search result, not evidence)
  - Supplied to the model: `C34` [`github:codelucas/newspaper`](<https://github.com/codelucas/newspaper>) (search result, not evidence)
  - Supplied to the model: `C13` [`github:s0md3v/Photon`](<https://github.com/s0md3v/Photon>) (search result, not evidence)
  - Supplied to the model: `C35` [`github:crawlab-team/crawlab`](<https://github.com/crawlab-team/crawlab>) (search result, not evidence)
  - Supplied to the model: `C11` [`github:code4craft/webmagic`](<https://github.com/code4craft/webmagic>) (search result, not evidence)
  - Supplied to the model: `C19` [`github:injetlee/Python`](<https://github.com/injetlee/Python>) (search result, not evidence)
  - Supplied to the model: `C36` [`github:apify/crawlee-python`](<https://github.com/apify/crawlee-python>) (search result, not evidence)
  - Supplied to the model: `C37` [`github:TeamWiseFlow/xiaobei`](<https://github.com/TeamWiseFlow/xiaobei>) (search result, not evidence)
  - Supplied to the model: `C8` [`github:hect0x7/JMComic-Crawler-Python`](<https://github.com/hect0x7/JMComic-Crawler-Python>) (search result, not evidence)
  - Supplied to the model: `C15` [`github:bda-research/node-crawler`](<https://github.com/bda-research/node-crawler>) (search result, not evidence)
  - Supplied to the model: `C16` [`github:dataabc/weibo-crawler`](<https://github.com/dataabc/weibo-crawler>) (search result, not evidence)
  - Supplied to the model: `C20` [`github:kanasimi/work_crawler`](<https://github.com/kanasimi/work_crawler>) (search result, not evidence)
  - Supplied to the model: `C1` [`github:spatie/crawler`](<https://github.com/spatie/crawler>) (search result, not evidence)
  - Supplied to the model: `C18` [`github:lncrawl/lightnovel-crawler`](<https://github.com/lncrawl/lightnovel-crawler>) (search result, not evidence)
  - Supplied to the model: `C17` [`github:zhegexiaohuozi/SeimiCrawler`](<https://github.com/zhegexiaohuozi/SeimiCrawler>) (search result, not evidence)
  - Supplied to the model: `C2` [`github:ShilongLee/Crawler`](<https://github.com/ShilongLee/Crawler>) (search result, not evidence)
  - Supplied to the model: `C12` [`github:dadoonet/fscrawler`](<https://github.com/dadoonet/fscrawler>) (search result, not evidence)
  - Supplied to the model: `C3` [`github:fredwu/crawler`](<https://github.com/fredwu/crawler>) (search result, not evidence)
  - Supplied to the model: `C4` [`github:icpd/crawler`](<https://github.com/icpd/crawler>) (search result, not evidence)
  - Supplied to the model: `C9` [`github:crwlrsoft/crawler`](<https://github.com/crwlrsoft/crawler>) (search result, not evidence)
  - Supplied to the model: `C6` [`github:elastic/crawler`](<https://github.com/elastic/crawler>) (search result, not evidence)
  - Supplied to the model: `C5` [`github:Norconex/crawler`](<https://github.com/Norconex/crawler>) (search result, not evidence)
  - Supplied to the model: `C7` [`github:NanmiCoder/MediaCrawler`](<https://github.com/NanmiCoder/MediaCrawler>) (search result, not evidence)
  - Supplied to the model: `C10` [`github:NanmiCoder/CrawlerTutorial`](<https://github.com/NanmiCoder/CrawlerTutorial>) (search result, not evidence)
  - Ranked for tree checks: `C21` [`github:FDA/openfda`](<https://github.com/FDA/openfda>) (search result, not evidence)
  - Ranked for tree checks: `C29` [`github:apify/crawlee`](<https://github.com/apify/crawlee>) (search result, not evidence)
  - Ranked for tree checks: `C25` [`github:scrapy/scrapy`](<https://github.com/scrapy/scrapy>) (search result, not evidence)
  - Ranked for tree checks: `C15` [`github:bda-research/node-crawler`](<https://github.com/bda-research/node-crawler>) (search result, not evidence)
  - Ranked for tree checks: `C36` [`github:apify/crawlee-python`](<https://github.com/apify/crawlee-python>) (search result, not evidence)
  - Ranked for tree checks: `C5` [`github:Norconex/crawler`](<https://github.com/Norconex/crawler>) (search result, not evidence)
  - Ranked for tree checks: `C14` [`github:gocolly/colly`](<https://github.com/gocolly/colly>) (search result, not evidence)
  - Ranked for tree checks: `C23` [`github:D4Vinci/Scrapling`](<https://github.com/D4Vinci/Scrapling>) (search result, not evidence)
  - Ranked for tree checks: `C9` [`github:crwlrsoft/crawler`](<https://github.com/crwlrsoft/crawler>) (search result, not evidence)
  - Ranked for tree checks: `C11` [`github:code4craft/webmagic`](<https://github.com/code4craft/webmagic>) (search result, not evidence)
  - Ranked for tree checks: `C1` [`github:spatie/crawler`](<https://github.com/spatie/crawler>) (search result, not evidence)
- **Commit-pinned tree checks** (`repository_trees`): completed.
  - Tree checked at a commit: `C21@fdbe54327901` [`github:FDA/openfda@fdbe54327901`](<https://github.com/FDA/openfda/tree/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c>) (listed, not read)
  - Tree checked at a commit: `C29@65254412a9f9` [`github:apify/crawlee@65254412a9f9`](<https://github.com/apify/crawlee/tree/65254412a9f9d84a10b51ef4ada58a3cfd9046fc>) (listed, not read)
  - Tree checked at a commit: `C25@51c10b14fca6` [`github:scrapy/scrapy@51c10b14fca6`](<https://github.com/scrapy/scrapy/tree/51c10b14fca6d272587a5c23cf3ae8effdff16cd>) (listed, not read)
  - Tree checked at a commit: `C15@29d547e34238` [`github:bda-research/node-crawler@29d547e34238`](<https://github.com/bda-research/node-crawler/tree/29d547e3423821088968cf44a784ebd68bde86d3>) (listed, not read)
  - Tree checked at a commit: `C36@6b7c03c65bf1` [`github:apify/crawlee-python@6b7c03c65bf1`](<https://github.com/apify/crawlee-python/tree/6b7c03c65bf1ed348c203d930442c3c068116888>) (listed, not read)
  - Tree checked at a commit: `C5@a688b6fa41ef` [`github:Norconex/crawler@a688b6fa41ef`](<https://github.com/Norconex/crawler/tree/a688b6fa41ef55957cfad51ff8ad1183d5b3dc57>) (listed, not read)
  - Excluded: `C14` [`github:gocolly/colly`](<https://github.com/gocolly/colly>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C23` [`github:D4Vinci/Scrapling`](<https://github.com/D4Vinci/Scrapling>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C9` [`github:crwlrsoft/crawler`](<https://github.com/crwlrsoft/crawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C11` [`github:code4craft/webmagic`](<https://github.com/code4craft/webmagic>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C1` [`github:spatie/crawler`](<https://github.com/spatie/crawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C38` [`github:FreedomIntelligence/OpenClaw-Medical-Skills`](<https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C39` [`github:nitrocloudofficial/nitrostack`](<https://github.com/nitrocloudofficial/nitrostack>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C41` [`github:GoogleCloudPlatform/public-datasets-pipelines`](<https://github.com/GoogleCloudPlatform/public-datasets-pipelines>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C22` [`github:firecrawl/firecrawl`](<https://github.com/firecrawl/firecrawl>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C24` [`github:unclecode/crawl4ai`](<https://github.com/unclecode/crawl4ai>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C26` [`github:NaiboWang/EasySpider`](<https://github.com/NaiboWang/EasySpider>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C27` [`github:ScrapeGraphAI/Scrapegraph-ai`](<https://github.com/ScrapeGraphAI/Scrapegraph-ai>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C28` [`github:iawia002/lux`](<https://github.com/iawia002/lux>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C30` [`github:jhao104/proxy_pool`](<https://github.com/jhao104/proxy_pool>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C31` [`github:Evil0ctal/Douyin_TikTok_Download_API`](<https://github.com/Evil0ctal/Douyin_TikTok_Download_API>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C32` [`github:getmaxun/maxun`](<https://github.com/getmaxun/maxun>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C33` [`github:projectdiscovery/katana`](<https://github.com/projectdiscovery/katana>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C34` [`github:codelucas/newspaper`](<https://github.com/codelucas/newspaper>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C13` [`github:s0md3v/Photon`](<https://github.com/s0md3v/Photon>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C35` [`github:crawlab-team/crawlab`](<https://github.com/crawlab-team/crawlab>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C19` [`github:injetlee/Python`](<https://github.com/injetlee/Python>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C37` [`github:TeamWiseFlow/xiaobei`](<https://github.com/TeamWiseFlow/xiaobei>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C8` [`github:hect0x7/JMComic-Crawler-Python`](<https://github.com/hect0x7/JMComic-Crawler-Python>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C16` [`github:dataabc/weibo-crawler`](<https://github.com/dataabc/weibo-crawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C20` [`github:kanasimi/work_crawler`](<https://github.com/kanasimi/work_crawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C18` [`github:lncrawl/lightnovel-crawler`](<https://github.com/lncrawl/lightnovel-crawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C17` [`github:zhegexiaohuozi/SeimiCrawler`](<https://github.com/zhegexiaohuozi/SeimiCrawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C2` [`github:ShilongLee/Crawler`](<https://github.com/ShilongLee/Crawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C12` [`github:dadoonet/fscrawler`](<https://github.com/dadoonet/fscrawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C3` [`github:fredwu/crawler`](<https://github.com/fredwu/crawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C4` [`github:icpd/crawler`](<https://github.com/icpd/crawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C6` [`github:elastic/crawler`](<https://github.com/elastic/crawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C7` [`github:NanmiCoder/MediaCrawler`](<https://github.com/NanmiCoder/MediaCrawler>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C10` [`github:NanmiCoder/CrawlerTutorial`](<https://github.com/NanmiCoder/CrawlerTutorial>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
- **Comparator selection** (`candidate_selection`): completed.
  - Selected: `C21@fdbe54327901` [`github:FDA/openfda@fdbe54327901`](<https://github.com/FDA/openfda/tree/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c>) (listed, not read)
  - Selected: `C29@65254412a9f9` [`github:apify/crawlee@65254412a9f9`](<https://github.com/apify/crawlee/tree/65254412a9f9d84a10b51ef4ada58a3cfd9046fc>) (listed, not read)
  - Selected: `C25@51c10b14fca6` [`github:scrapy/scrapy@51c10b14fca6`](<https://github.com/scrapy/scrapy/tree/51c10b14fca6d272587a5c23cf3ae8effdff16cd>) (listed, not read)
  - Rejected: `C15@29d547e34238` [`github:bda-research/node-crawler@29d547e34238`](<https://github.com/bda-research/node-crawler/tree/29d547e3423821088968cf44a784ebd68bde86d3>) (listed, not read)
  - Rejected: `C36@6b7c03c65bf1` [`github:apify/crawlee-python@6b7c03c65bf1`](<https://github.com/apify/crawlee-python/tree/6b7c03c65bf1ed348c203d930442c3c068116888>) (listed, not read)
  - Rejected: `C5@a688b6fa41ef` [`github:Norconex/crawler@a688b6fa41ef`](<https://github.com/Norconex/crawler/tree/a688b6fa41ef55957cfad51ff8ad1183d5b3dc57>) (listed, not read)
- **File selection** (`file_selection`): completed; 1324 files offered to the model, not listed.
  - Selected: `LFILE5` `docs/plans/stage1-plan.md` (listed, not read)
  - Selected: `LFILE2` `CONTEXT.md` (listed, not read)
  - Selected: `LFILE3` `docs/adr/0001-mac-back-office-cloud-public-site.md` (listed, not read)
  - Selected: `LFILE4` `docs/flows.md` (listed, not read)
  - Selected: `F-C21-189` [`github:FDA/openfda@fdbe54327901 openfda/res/pipeline.py`](<https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py>) (listed, not read)
  - Selected: `F-C21-188` [`github:FDA/openfda@fdbe54327901 openfda/res/extract.py`](<https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py>) (listed, not read)
  - Selected: `F-C21-204` [`github:FDA/openfda@fdbe54327901 openfda/res/tests/extract_test.py`](<https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/tests/extract_test.py>) (listed, not read)
  - Selected: `F-C21-280` [`github:FDA/openfda@fdbe54327901 schemas/recall_schema.json`](<https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/schemas/recall_schema.json>) (listed, not read)
  - Selected: `F-C29-288` [`github:apify/crawlee@65254412a9f9 packages/basic-crawler/src/internals/basic-crawler.ts`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/basic-crawler/src/internals/basic-crawler.ts>) (listed, not read)
  - Selected: `F-C29-699` [`github:apify/crawlee@65254412a9f9 test/core/crawlers/basic-crawler.test.ts`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/basic-crawler.test.ts>) (listed, not read)
  - Selected: `F-C29-462` [`github:apify/crawlee@65254412a9f9 packages/http-crawler/src/internals/http-crawler.ts`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts>) (listed, not read)
  - Selected: `F-C29-706` [`github:apify/crawlee@65254412a9f9 test/core/crawlers/http-crawler.test.ts`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts>) (listed, not read)
  - Selected: `F-C25-167` [`github:scrapy/scrapy@51c10b14fca6 scrapy/core/scheduler.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py>) (listed, not read)
  - Selected: `F-C25-642` [`github:scrapy/scrapy@51c10b14fca6 tests/test_scheduler.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_scheduler.py>) (listed, not read)
  - Selected: `F-C25-187` [`github:scrapy/scrapy@51c10b14fca6 scrapy/dupefilters.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/dupefilters.py>) (listed, not read)
  - Selected: `F-C25-577` [`github:scrapy/scrapy@51c10b14fca6 tests/test_dupefilters.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_dupefilters.py>) (listed, not read)
  - Selected: `F-C25-182` [`github:scrapy/scrapy@51c10b14fca6 scrapy/downloadermiddlewares/retry.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py>) (listed, not read)
  - Selected: `F-C25-570` [`github:scrapy/scrapy@51c10b14fca6 tests/test_downloadermiddleware_retry.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_downloadermiddleware_retry.py>) (listed, not read)
  - Selected: `F-C25-205` [`github:scrapy/scrapy@51c10b14fca6 scrapy/extensions/spiderstate.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/extensions/spiderstate.py>) (listed, not read)
  - Selected: `F-C25-674` [`github:scrapy/scrapy@51c10b14fca6 tests/test_spiderstate.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_spiderstate.py>) (listed, not read)
- **Source reads** (`source_reads`): completed.
  - Read and hashed: `S1` [`github:FDA/openfda@fdbe54327901 openfda/res/pipeline.py`](<https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py>) (read by the host)
  - Read and hashed: `S2` [`github:FDA/openfda@fdbe54327901 openfda/res/tests/extract_test.py`](<https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/tests/extract_test.py>) (read by the host)
  - Read and hashed: `S3` [`github:FDA/openfda@fdbe54327901 COPYING.txt`](<https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/COPYING.txt>) (read by the host)
  - Read and hashed: `S4` [`github:apify/crawlee@65254412a9f9 packages/basic-crawler/src/internals/basic-crawler.ts`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/basic-crawler/src/internals/basic-crawler.ts>) (read by the host)
  - Read and hashed: `S5` [`github:apify/crawlee@65254412a9f9 test/core/crawlers/basic-crawler.test.ts`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/basic-crawler.test.ts>) (read by the host)
  - Read and hashed: `S6` [`github:apify/crawlee@65254412a9f9 package.json`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/package.json>) (read by the host)
  - Read and hashed: `S7` [`github:apify/crawlee@65254412a9f9 LICENSE.md`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/LICENSE.md>) (read by the host)
  - Read and hashed: `S8` [`github:apify/crawlee@65254412a9f9 .github/workflows/check-pr-title.yml`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/.github/workflows/check-pr-title.yml>) (read by the host)
  - Read and hashed: `S9` [`github:apify/crawlee@65254412a9f9 vitest.config.mts`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/vitest.config.mts>) (read by the host)
  - Read and hashed: `S10` [`github:scrapy/scrapy@51c10b14fca6 scrapy/core/scheduler.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py>) (read by the host)
  - Read and hashed: `S11` [`github:scrapy/scrapy@51c10b14fca6 tests/test_scheduler.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_scheduler.py>) (read by the host)
  - Read and hashed: `S12` [`github:scrapy/scrapy@51c10b14fca6 pyproject.toml`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/pyproject.toml>) (read by the host)
  - Read and hashed: `S13` [`github:scrapy/scrapy@51c10b14fca6 LICENSE`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/LICENSE>) (read by the host)
  - Read and hashed: `S14` [`github:scrapy/scrapy@51c10b14fca6 .github/workflows/ci.yml`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/.github/workflows/ci.yml>) (read by the host)
  - Read and hashed: `S15` [`github:scrapy/scrapy@51c10b14fca6 tox.ini`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tox.ini>) (read by the host)
  - Read and hashed: `S16` [`github:FDA/openfda@fdbe54327901 openfda/res/extract.py`](<https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py>) (read by the host)
  - Read and hashed: `S17` [`github:apify/crawlee@65254412a9f9 packages/http-crawler/src/internals/http-crawler.ts`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts>) (read by the host)
  - Read and hashed: `S18` [`github:apify/crawlee@65254412a9f9 test/core/crawlers/http-crawler.test.ts`](<https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts>) (read by the host)
  - Read and hashed: `S19` [`github:scrapy/scrapy@51c10b14fca6 scrapy/dupefilters.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/dupefilters.py>) (read by the host)
  - Read and hashed: `S20` [`github:scrapy/scrapy@51c10b14fca6 tests/test_dupefilters.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_dupefilters.py>) (read by the host)
  - Read and hashed: `S21` [`github:scrapy/scrapy@51c10b14fca6 scrapy/downloadermiddlewares/retry.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py>) (read by the host)
  - Read and hashed: `S22` [`github:scrapy/scrapy@51c10b14fca6 tests/test_downloadermiddleware_retry.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_downloadermiddleware_retry.py>) (read by the host)
  - Read and hashed: `S23` [`github:scrapy/scrapy@51c10b14fca6 scrapy/extensions/spiderstate.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/extensions/spiderstate.py>) (read by the host)
  - Read and hashed: `S24` [`github:scrapy/scrapy@51c10b14fca6 tests/test_spiderstate.py`](<https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_spiderstate.py>) (read by the host)
- **Evidence requests** (`evidence_requests`): completed.
  - Supplied to the model, 87 excerpt(s): `E1`, `E2`, `E3`, `E4`, `E5`, `E6`, `E7`, `E8`, `E9`, `E10`, `E11`, `E12`, `E13`, `E14`, `E15`, `E16`, `E17`, `E18`, `E19`, `E20`, `E21`, `E22`, `E23`, `E24`, `E25`, `E26`, `E27`, `E28`, `E29`, `E30`, `E31`, `E32`, `E33`, `E34`, `E35`, `E36`, `E37`, `E38`, `E39`, `E40`, `E41`, `E42`, `E43`, `E44`, `E45`, `E46`, `E47`, `E48`, `E49`, `E50`, `E51`, `E52`, `E53`, `E54`, `E55`, `E56`, `E57`, `E58`, `E59`, `E60`, `E61`, `E62`, `E63`, `E64`, `E65`, `E66`, `E67`, `E68`, `E69`, `E70`, `E71`, `E72`, `E73`, `E74`, `E75`, `E76`, `E77`, `E78`, `E79`, `E80`, `E81`, `E82`, `E83`, `E84`, `E85`, `E86`, `E87`
  - Added on request, 13 excerpt(s): `E88`, `E89`, `E90`, `E91`, `E92`, `E93`, `E94`, `E95`, `E96`, `E97`, `E98`, `E99`, `E100`
  - Added on request: `S25` `docs/plans/stage1-plan.md` (read by the host)
  - Added on request: `S26` `CONTEXT.md` (read by the host)
  - Added on request: `S27` `docs/adr/0001-mac-back-office-cloud-public-site.md` (read by the host)
  - Added on request: `S28` `docs/flows.md` (read by the host)
- **Plan and repair** (`plan`): completed.
  - Supplied to the model, 100 excerpt(s): `E1`, `E2`, `E3`, `E4`, `E5`, `E6`, `E7`, `E8`, `E9`, `E10`, `E11`, `E12`, `E13`, `E14`, `E15`, `E16`, `E17`, `E18`, `E19`, `E20`, `E21`, `E22`, `E23`, `E24`, `E25`, `E26`, `E27`, `E28`, `E29`, `E30`, `E31`, `E32`, `E33`, `E34`, `E35`, `E36`, `E37`, `E38`, `E39`, `E40`, `E41`, `E42`, `E43`, `E44`, `E45`, `E46`, `E47`, `E48`, `E49`, `E50`, `E51`, `E52`, `E53`, `E54`, `E55`, `E56`, `E57`, `E58`, `E59`, `E60`, `E61`, `E62`, `E63`, `E64`, `E65`, `E66`, `E67`, `E68`, `E69`, `E70`, `E71`, `E72`, `E73`, `E74`, `E75`, `E76`, `E77`, `E78`, `E79`, `E80`, `E81`, `E82`, `E83`, `E84`, `E85`, `E86`, `E87`, `E88`, `E89`, `E90`, `E91`, `E92`, `E93`, `E94`, `E95`, `E96`, `E97`, `E98`, `E99`, `E100`
  - Cited by the model, 30 excerpt(s): `E89`, `E90`, `E45`, `E5`, `E91`, `E57`, `E58`, `E93`, `E94`, `E97`, `E55`, `E99`, `E96`, `E30`, `E59`, `E50`, `E100`, `E92`, `E4`, `E98`, `E54`, `E67`, `E68`, `E3`, `E95`, `E70`, `E86`, `E56`, `E52`, `E13`
- **Independent review** (`review`): completed.
  - Supplied to the model, 100 excerpt(s): `E1`, `E2`, `E3`, `E4`, `E5`, `E6`, `E7`, `E8`, `E9`, `E10`, `E11`, `E12`, `E13`, `E14`, `E15`, `E16`, `E17`, `E18`, `E19`, `E20`, `E21`, `E22`, `E23`, `E24`, `E25`, `E26`, `E27`, `E28`, `E29`, `E30`, `E31`, `E32`, `E33`, `E34`, `E35`, `E36`, `E37`, `E38`, `E39`, `E40`, `E41`, `E42`, `E43`, `E44`, `E45`, `E46`, `E47`, `E48`, `E49`, `E50`, `E51`, `E52`, `E53`, `E54`, `E55`, `E56`, `E57`, `E58`, `E59`, `E60`, `E61`, `E62`, `E63`, `E64`, `E65`, `E66`, `E67`, `E68`, `E69`, `E70`, `E71`, `E72`, `E73`, `E74`, `E75`, `E76`, `E77`, `E78`, `E79`, `E80`, `E81`, `E82`, `E83`, `E84`, `E85`, `E86`, `E87`, `E88`, `E89`, `E90`, `E91`, `E92`, `E93`, `E94`, `E95`, `E96`, `E97`, `E98`, `E99`, `E100`
  - Cited by the model, 3 excerpt(s): `E89`, `E50`, `E97`
- **Readiness** (`readiness`): completed; no references.
- **Save** (`save`): completed; no references.

## Source registry

- S1 github:FDA/openfda@fdbe54327901a0c1e30130d1d6a2bbe67b79b77c: [openfda/res/pipeline.py](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/pipeline.py); commit 2026-06-08T16:15:01.000Z; last activity 2026-06-08T16:15:05.000Z; SHA-256 `48671d377e57d2cdddf4251b1b50bdf1921931e607ad3abb25104a6b246c5908`; 285 lines; E1 L1-L30, E2 L114-L134, E3 L153-L198, E4 L258-L283, E93 L31-L113, E94 L135-L152, E95 L199-L257. Snapshot: `sources/S1.txt`.
- S2 github:FDA/openfda@fdbe54327901a0c1e30130d1d6a2bbe67b79b77c: [openfda/res/tests/extract_test.py](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/tests/extract_test.py); commit 2026-06-08T16:15:01.000Z; last activity 2026-06-08T16:15:05.000Z; SHA-256 `dc99c475b438df6a1146f37d17f167e62e01818c05c736fb094decb6736630a6`; 100 lines; E5 L1-L100. Snapshot: `sources/S2.txt`.
- S3 github:FDA/openfda@fdbe54327901a0c1e30130d1d6a2bbe67b79b77c: [COPYING.txt](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/COPYING.txt); commit 2026-06-08T16:15:01.000Z; last activity 2026-06-08T16:15:05.000Z; SHA-256 `6d489af6292662d9e36d34ce49423784984a5f6e41d7b58f49b01264df59fa03`; 121 lines; E6 L1-L121. Snapshot: `sources/S3.txt`.
- S4 github:apify/crawlee@65254412a9f9d84a10b51ef4ada58a3cfd9046fc: [packages/basic-crawler/src/internals/basic-crawler.ts](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/basic-crawler/src/internals/basic-crawler.ts); commit 2026-10-31T02:46:19.000Z; last activity 2026-10-31T02:48:42.000Z; SHA-256 `edffe65a2c8cc3a2067388b700f3630987540bafcfa929a3170b3cf7cad3dcea`; 3187 lines; E7 L1-L30, E8 L339-L398, E9 L499-L558. Snapshot: `sources/S4.txt`.
- S5 github:apify/crawlee@65254412a9f9d84a10b51ef4ada58a3cfd9046fc: [test/core/crawlers/basic-crawler.test.ts](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/basic-crawler.test.ts); commit 2026-10-31T02:46:19.000Z; last activity 2026-10-31T02:48:42.000Z; SHA-256 `e0ee0101889ee5e0739ff22417ebe5f83e860c98e4aabd94727076178a2fa197`; 4824 lines; E10 L1-L143, E11 L460-L519, E12 L2657-L2716. Snapshot: `sources/S5.txt`.
- S6 github:apify/crawlee@65254412a9f9d84a10b51ef4ada58a3cfd9046fc: [package.json](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/package.json); commit 2026-10-31T02:46:19.000Z; last activity 2026-10-31T02:48:42.000Z; SHA-256 `dde081366447a7bf727c54968fd42521d372d415523ab1ee192fd9ca201988dd`; 148 lines; E13 L1-L148. Snapshot: `sources/S6.txt`.
- S7 github:apify/crawlee@65254412a9f9d84a10b51ef4ada58a3cfd9046fc: [LICENSE.md](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/LICENSE.md); commit 2026-10-31T02:46:19.000Z; last activity 2026-10-31T02:48:42.000Z; SHA-256 `37c9b417332af22e146d381766f284649483fb6ece17ca566584bf6adcf89135`; 201 lines; E14 L1-L30, E15 L33-L92, E16 L108-L167. Snapshot: `sources/S7.txt`.
- S8 github:apify/crawlee@65254412a9f9d84a10b51ef4ada58a3cfd9046fc: [.github/workflows/check-pr-title.yml](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/.github/workflows/check-pr-title.yml); commit 2026-10-31T02:46:19.000Z; last activity 2026-10-31T02:48:42.000Z; SHA-256 `4eb25140a7f7fe68bd619f3d28b20581c20089c01a3f06a008420fe140c4b158`; 12 lines; E17 L1-L12. Snapshot: `sources/S8.txt`.
- S9 github:apify/crawlee@65254412a9f9d84a10b51ef4ada58a3cfd9046fc: [vitest.config.mts](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/vitest.config.mts); commit 2026-10-31T02:46:19.000Z; last activity 2026-10-31T02:48:42.000Z; SHA-256 `da87aa925f1ec1b98e208e96d67148fcc6b723cdb1f1e9e411cca5681c29a42e`; 101 lines; E18 L1-L101. Snapshot: `sources/S9.txt`.
- S10 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [scrapy/core/scheduler.py](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/core/scheduler.py); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `67d42a30fa04227ab2ebaa364f774627597954e00e9b8ff8a748adc108213209`; 559 lines; E19 L1-L30, E20 L48-L139, E21 L140-L289, E96 L290-L559. Snapshot: `sources/S10.txt`.
- S11 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [tests/test_scheduler.py](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_scheduler.py); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `fad6105d5e782c6a6ac13ed7beb9dae0036a4c9df05f32b31fb29ddfd6bc5ffe`; 483 lines; E22 L1-L30, E23 L33-L47, E24 L49-L63, E25 L81-L88, E26 L101-L103, E27 L108-L112, E28 L158-L172, E29 L196-L199, E30 L200-L239, E31 L252-L268, E32 L269-L293, E33 L294-L337, E34 L354-L358, E35 L379-L387, E36 L389-L398, E37 L400-L409, E38 L423-L443. Snapshot: `sources/S11.txt`.
- S12 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [pyproject.toml](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/pyproject.toml); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `823dbdd405e9bb05f160e87ba811831b2a4a6730551e48bb07c054631f56e756`; 523 lines; E39 L1-L30, E40 L70-L184, E41 L206-L367. Snapshot: `sources/S12.txt`.
- S13 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [LICENSE](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/LICENSE); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `fd331af3ccb8776bbe7f317821e5e0b91c2ab7c73464e77425d52204f7b5d980`; 27 lines; E42 L1-L27. Snapshot: `sources/S13.txt`.
- S14 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [.github/workflows/ci.yml](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/.github/workflows/ci.yml); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `89a6978d51e7d05abd2c8eca356363aaac103b5edf4d3575392ce60fc227a24a`; 269 lines; E43 L1-L269. Snapshot: `sources/S14.txt`.
- S15 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [tox.ini](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tox.ini); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `c8c43d652d8d99c2b618cd054ecb324432df0d77344aa05b7f6add07763dafef`; 383 lines; E44 L1-L383. Snapshot: `sources/S15.txt`.
- S16 github:FDA/openfda@fdbe54327901a0c1e30130d1d6a2bbe67b79b77c: [openfda/res/extract.py](https://github.com/FDA/openfda/blob/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c/openfda/res/extract.py); commit 2026-06-08T16:15:01.000Z; last activity 2026-06-08T16:15:05.000Z; SHA-256 `83b354308ec47f0d3c3b4c6ebab30c5a57253f19a28f36eef5a35b9dcf4692ff`; 81 lines; E45 L1-L81. Snapshot: `sources/S16.txt`.
- S17 github:apify/crawlee@65254412a9f9d84a10b51ef4ada58a3cfd9046fc: [packages/http-crawler/src/internals/http-crawler.ts](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/packages/http-crawler/src/internals/http-crawler.ts); commit 2026-10-31T02:46:19.000Z; last activity 2026-10-31T02:48:42.000Z; SHA-256 `62bd046125fc892c3c08e9019cd056df61c5cd4843a2782cd3d69de98898e461`; 1020 lines; E46 L1-L30, E47 L94-L153, E48 L281-L340, E49 L408-L467, E50 L600-L659, E97 L660-L1020. Snapshot: `sources/S17.txt`.
- S18 github:apify/crawlee@65254412a9f9d84a10b51ef4ada58a3cfd9046fc: [test/core/crawlers/http-crawler.test.ts](https://github.com/apify/crawlee/blob/65254412a9f9d84a10b51ef4ada58a3cfd9046fc/test/core/crawlers/http-crawler.test.ts); commit 2026-10-31T02:46:19.000Z; last activity 2026-10-31T02:48:42.000Z; SHA-256 `149e0337c12f066dcf8988aa95711f30a8ab0e9794fc62febf725f7a7a783399`; 920 lines; E51 L1-L30, E52 L130-L241, E53 L436-L495, E54 L547-L606, E55 L660-L719, E56 L762-L821, E98 L496-L546, E99 L607-L659, E100 L720-L761. Snapshot: `sources/S18.txt`.
- S19 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [scrapy/dupefilters.py](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/dupefilters.py); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `ae3d3d5d28bd44116d237657c8ba77fa53b3d0b011f1575700d95e75f3ffd972`; 244 lines; E57 L1-L244. Snapshot: `sources/S19.txt`.
- S20 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [tests/test_dupefilters.py](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_dupefilters.py); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `a7841dc3cbd62207871b2cbdd5f62e091a016c0bc8679dcbef7e759bd19bcccb`; 307 lines; E58 L1-L307. Snapshot: `sources/S20.txt`.
- S21 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [scrapy/downloadermiddlewares/retry.py](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/downloadermiddlewares/retry.py); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `809c7455e516eb553d2fa36ba123092008a6fba513103bec2b85b4cab628c0b9`; 200 lines; E59 L1-L200. Snapshot: `sources/S21.txt`.
- S22 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [tests/test_downloadermiddleware_retry.py](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_downloadermiddleware_retry.py); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `3e2592285f7c48199e655dfac81a067f1be36b28751e2fd04d888889c71e305c`; 833 lines; E60 L1-L30, E61 L34-L39, E62 L40-L46, E63 L101-L117, E64 L118-L129, E65 L152-L162, E66 L186-L190, E67 L310-L335, E68 L336-L358, E69 L359-L385, E70 L386-L443, E71 L482-L492, E72 L493-L504, E73 L505-L514, E74 L515-L525, E75 L526-L547, E76 L548-L572, E77 L573-L599, E78 L600-L624, E79 L625-L651, E80 L652-L669, E81 L670-L684, E82 L685-L702, E83 L703-L720, E84 L721-L735, E85 L823-L833. Snapshot: `sources/S22.txt`.
- S23 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [scrapy/extensions/spiderstate.py](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/scrapy/extensions/spiderstate.py); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `e2bba594efcafcc19dc906000ba8c9e98d31c81de914496b6bd9433a170f7d68`; 94 lines; E86 L1-L94. Snapshot: `sources/S23.txt`.
- S24 github:scrapy/scrapy@51c10b14fca6d272587a5c23cf3ae8effdff16cd: [tests/test_spiderstate.py](https://github.com/scrapy/scrapy/blob/51c10b14fca6d272587a5c23cf3ae8effdff16cd/tests/test_spiderstate.py); commit 2026-10-30T14:10:15.000Z; last activity 2026-10-30T14:10:15.000Z; SHA-256 `3395cc129ba609f89a29d14ce10a4c94a051b917d93d7ee1d86f3c2b9274490a`; 95 lines; E87 L1-L95. Snapshot: `sources/S24.txt`.
- S25 local: `docs/plans/stage1-plan.md`; SHA-256 `cca4eda6444c3712374cc95db0b8883a65416495c04a62c3113cec480f6d64b6`; 1339 lines; E88 L1-L30, E89 L729-L788. Snapshot: `sources/S25.txt`.
- S26 local: `CONTEXT.md`; SHA-256 `9b0065d8cda3cb47e9848e1adbf31683c397cc60342e09f49d3e2086ca22e6e7`; 145 lines; E90 L1-L145. Snapshot: `sources/S26.txt`.
- S27 local: `docs/adr/0001-mac-back-office-cloud-public-site.md`; SHA-256 `3bb3040c5c83ab15f67d9c18ebfc51ac38db8ff15ad354dbcf8d55f2e4c60f1e`; 14 lines; E91 L1-L14. Snapshot: `sources/S27.txt`.
- S28 local: `docs/flows.md`; SHA-256 `2503441b804e5a70eff2a35a352c8e48b4ca6800d2694f18adfa186b277293e4`; 198 lines; E92 L1-L198. Snapshot: `sources/S28.txt`.

