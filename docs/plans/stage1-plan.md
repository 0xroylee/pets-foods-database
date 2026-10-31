# Stage 1: private pet food safety Incident database

**Readiness: Draft**

Repaired implementation plan covering R1–R12 and A1–A51. The repairs add immutable AI input provenance, Incident-specific Harm attribution, durable AI work recovery, adversarial verification and corrected feature sequencing. Build one local Bun/TypeScript application with SQLite and authenticated Reviewer forms. Collectors, public hosting, public APIs, MCP, downloads and automated AI Analysis generation remain later stages. Comparator code and tests were read, not run. No target commands or executed checks are supplied; every command below is work to create.

This is a proposed implementation plan. The target application has not been changed, and its tests or scripts were not run.

Saved report: `.unshit/2026-10-29T16-04-01-403Z-52073dc1/plan.md`
Evidence manifest: `.unshit/2026-10-29T16-04-01-403Z-52073dc1/manifest.json`

## Scope

**Final plan scope.** Repaired implementation plan covering R1–R12 and A1–A51. The repairs add immutable AI input provenance, Incident-specific Harm attribution, durable AI work recovery, adversarial verification and corrected feature sequencing. Build one local Bun/TypeScript application with SQLite and authenticated Reviewer forms. Collectors, public hosting, public APIs, MCP, downloads and automated AI Analysis generation remain later stages. Comparator code and tests were read, not run. No target commands or executed checks are supplied; every command below is work to create.
**Initial intake summary (before material answers and source review).** Build stage 1 of a pet food safety incident database: the core data model and a password-protected Reviewer page on the owner's Mac, using Bun, TypeScript and SQLite. Implement the following 12 requirements in their stated priority order. Use the owner's Codex login for private AI triage and summaries. Prepare reviewed data and publication-ready content for later collectors and public services without deploying those services. Private material stays on the Mac except for the explicitly allowed private AI processing.

**Out of scope.**

- Collectors, source discovery and historical backfills, including FDA, other regulators, Lab Test sources, Grok, Threads and Muse integrations.
- Deploying public pages, the public correction form, JSON API, MCP server or downloads; stage 1 prepares the data they will consume.
- Automated AI Analysis generation, scheduled for stage 8; stage 1 supports its records, versions and review gates.
- Treats, chews, supplements, food for animals other than dogs and cats, and imported catalogs.
- PTT, Dcard, Facebook groups, Simplified Chinese, public user accounts and alerts.
- Hosting private material outside the owner's Mac, except for the explicitly permitted private AI processing through the owner's Codex login.

## Brief approval

The host received approved true through the agent protocol; it cannot verify who approved this brief. Recorded 2026-10-30T00:34:57.100Z; brief SHA-256 `5e44988d5ccefb5e0cfbf15d73c38850c35397bd4db61f30f95fe7cf0602fa4a`.

## Requirement map

- **R1.** Maintain the Official Source List and apply the confirmed publication gates. (you said: "Official Sources and publication gates. The Official Source List is a named list maintained by Reviewers: government regulators (national, EU, state), government-established consumer bodies such as the HK Consumer Council, consumer testing organizations such as 消基會, and named accredited labs; accreditation alone does not put a lab on it. Reports from Official Sources are Published immediately with an AI Summary labeled as AI-written. All other Reports, and Commissioned Tests (lab tests paid for by a Brand or Manufacturer about its own or a rival's Product, even from a listed lab), wait as Pending Reports until a Reviewer approves or rejects them. Pending and Rejected Reports never become public.") → T4, T12
  - A1: Reviewers can maintain a named Official Source List covering the specified regulators, consumer bodies, testing organizations and individually named accredited labs; accreditation alone does not qualify a lab. → T4 → T4-V1
  - A2: An Official Source Report becomes Published immediately with an AI Summary labeled as AI-written, unless it is a Commissioned Test. → T4 → T4-V1
  - A3: Every other Report, including a Commissioned Test about the paying Brand or Manufacturer's own or a rival's Product, remains Pending until a Reviewer approves or rejects it. → T4 → T4-V1
  - A4: Pending and Rejected Reports are excluded from all publication-ready output. → T4, T12 → T4-V1, T12-V1
- **R2.** Keep AI proposals subject to Reviewer decisions and enforce the stated private AI processing boundary. (you said: "AI proposes, a Reviewer decides. Every Link from a Report to a Product or Incident, every Evidence Level change, every new Manufacturer, Brand or Product, and every AI Analysis version waits for Reviewer approval. An Official Source Report affects no Incident until a Reviewer accepts its Link. For each Report, AI proposes either a new Incident or an existing one to Link it to, and the Reviewer decides; the first Report about an episode creates its Incident only when the Reviewer accepts that proposal. AI processing (owner's answer): AI triage, AI Summaries and analysis through the owner's Codex login count as private processing, not publishing, so they are an allowed exception to keeping private material on the Mac. Their inputs may include Pending Reports, private full text and owner handles, which are needed to recognize the same pet across posts and to anonymize owners. API keys and passwords are never sent, and nothing AI produces becomes public without the normal Reviewer gates.") → T1, T5, T12, T15
  - A5: Report-to-Product and Report-to-Incident Links, Evidence Level changes, new Manufacturers, Brands and Products, and each AI Analysis version require Reviewer approval before taking effect. → T5, T15 → T5-V1, T15-V1
  - A6: AI proposes an existing or new Incident for a Report; the first accepted proposal creates the Incident. A Report can receive multiple proposed Links where it covers several Incidents. → T5 → T5-V1
  - A7: An Official Source Report has no effect on an Incident before its Link is accepted. → T5 → T5-V1
  - A8: Private AI processing through the owner's Codex login may receive Pending Reports, private full text and owner handles for animal matching and anonymization. → T1 → T1-V1
  - A9: AI inputs exclude API keys and passwords, and AI output follows the applicable publication and approval gates. → T1, T12 → T1-V1, T1-V2, T12-V1
- **R3.** Apply the defined Evidence Levels and exclude Echoes. (you said: "Evidence Levels and Echoes. Reported: supported only by unofficial Reports. Corroborated: independent unofficial Reports that the Reviewer judges sufficient (owner's answer: no fixed number; independent means different people, not reposts of each other, and not Echoes), or a Lab Test from a lab that is not an Official Source, or an official list of complaints without a finding. Confirmed: an Official Finding that supports it: a recall or withdrawal, a safety alert naming the product, a Lab Test finding the hazard, or a warning letter about it. Echoes (material whose information comes from this database, such as AI chatbot answers or articles citing it) are not collected and never count toward an Evidence Level.") → T8
  - A10: Reported denotes support only from unofficial Reports. → T8 → T8-V1
  - A11: Corroborated can be supported by Reviewer-judged sufficient independent unofficial Reports, a Lab Test from a lab outside the Official Source List, or an official complaint list without a finding. → T8 → T8-V1
  - A12: Independent Reports come from different people, exclude reposts and Echoes, and have no fixed numerical threshold. → T8 → T8-V1
  - A13: Confirmed requires a supporting Official Finding: a recall or withdrawal, a safety alert naming the Product, a Lab Test finding the hazard, or a relevant warning letter. → T8 → T8-V1
  - A14: Material derived from this database is excluded from collection and never contributes to an Evidence Level. → T8 → T8-V1
- **R4.** Represent supporting and contradicting Links, Disputed Incidents and Ruled Out history. (you said: "Disputed and Ruled Out. Each Link from a Report to an Incident has a Stance, supports or contradicts. A Published Report with an approved contradicting Link marks the Incident Disputed; an approved brand statement from a Correction Request becomes such a contradicting Report. An Official Finding of no link, or a Reviewer decision, makes the Incident Ruled Out: still public as history, excluded from statistics.") → T9
  - A15: Every Report-to-Incident Link records a Stance of supports or contradicts. → T9 → T9-V1
  - A16: A Published Report with an approved contradicting Link marks its Incident Disputed. → T9 → T9-V1
  - A17: An approved brand statement from a Correction Request becomes a contradicting Report and follows the Report publication and Link approval gates. → T9 → T9-V1
  - A18: An accepted Official Finding of no link, or a Reviewer decision, makes an Incident Ruled Out; it remains available as public history and is excluded from statistics. → T9 → T9-V1
- **R5.** Model Reports separately from real-world Incidents and restrict the domain to complete dog and cat diets. (you said: "Reports, Incidents and Pet Food. A Report is one collected document (official notice, Lab Test, Expert Article, news story, social post), stored once with its Source and link. 分析 means Lab Tests and Expert Articles (collected Report types), statistics (computed) and AI Analysis (AI-written, per Incident and per Brand). An Incident (出事) is one real-world outbreak or contamination episode: a single Incident however many Products, Brands, Markets or recall expansions and updates it spans (owner's answer). A Report may belong to no Incident, one, or several, such as a news roundup of three recalls (owner's answer). Statistics count Incidents, not Reports. Pet Food means complete diets for dogs and cats (dry, wet, raw, freeze-dried, prescription); treats, chews, supplements and food for other animals are out of scope.") → T3, T5, T10
  - A19: Each collected document is stored once as a Report with its Source and original link, including official notices, Lab Tests, Expert Articles, news stories and social posts. → T3 → T3-V1
  - A20: One outbreak or contamination episode remains one Incident across multiple Products, Brands, Markets, recall expansions and updates. → T5 → T5-V1
  - A21: A Report can have zero, one or multiple approved Incident Links. → T5, T10 → T5-V1, T10-V1
  - A22: Lab Tests and Expert Articles remain collected Report types; statistics are computed; AI Analysis is AI-written and belongs to an Incident or Brand. → T3 → T3-V1
  - A23: Statistics count Incidents. The food scope includes complete dry, wet, raw, freeze-dried and prescription diets for dogs and cats, excluding treats, chews, supplements and other animals' food. → T3 → T3-V1
- **R6.** Prepare bilingual public content while protecting owner identities and private source material. (you said: "Publication-ready content and owner privacy. Stage 1 prepares, but does not deploy, what the public site will show: for each Published Report the AI Summary, a short quote and a link; full text stays private. Owners appear anonymized ("an owner in Taiwan"), never by name or photo. Links to owner posts must not reveal the owner either (owner's answer): use a handle-free link form where one exists, such as x.com/i/status/<id> for X; where none exists, such as Threads, show the platform and date without a link and keep the original URL private. If an original is deleted, the summary stays marked "original removed". Public-domain official notices may be shown in full. Text is prepared in English and Traditional Chinese, with AI translations labeled. The public sees only the last approved AI Analysis version.") → T12
  - A24: Publication-ready content for each Published Report contains an AI Summary, a short quote and an eligible public link; full text remains private except for public-domain official notices. → T12 → T12-V1
  - A25: Owners are anonymized, and publication-ready content contains no owner names or photos. → T12 → T12-V1
  - A26: Owner-post links use a handle-free form where available, including x.com/i/status/<id> for X. Otherwise only the platform and date are shown, and the original URL stays private. → T12 → T12-V1
  - A27: A deleted original retains its summary with the marker "original removed". → T12 → T12-V1
  - A28: Content is prepared in English and Traditional Chinese, AI translations are labeled, and only the latest approved AI Analysis version is eligible for public output. → T12 → T12-V1
- **R7.** Count harmed animals conservatively and preserve the attribution of competing counts. (you said: "Harm Counts (owner's answer). A Harm Count counts animals, not Reports, with sick and dead kept separate and split by dogs and cats. The headline is the latest Official Source count, dated and credited; other counts stay attributed to their own Reports. With no official count the headline is "owners report at least N", counting distinct animals in approved owner Reports: the same pet described in several Reports counts once, and when it is unclear whether two Reports describe the same animal, it counts once.") → T10
  - A29: Harm Counts count animals, separating sick from dead and dogs from cats. → T10 → T10-V1
  - A30: When an Official Source count exists, the headline uses the latest such count with its date and attribution; other counts remain attributed to their Reports. → T10 → T10-V1
  - A31: Without an official count, the headline uses "owners report at least N" based on distinct animals in approved owner Reports. → T10 → T10-V1
  - A32: Repeated descriptions of one animal count once, and uncertain matches between Reports are conservatively counted once. → T10 → T10-V1
- **R8.** Compute Incident statistics using the approved Evidence Level and the defined Incident Date. (you said: "Statistics and Incident Date. Statistics count Incidents by Brand, Manufacturer, Hazard, Market and year, split by Evidence Level, never summed across levels, with Ruled Out excluded. An Incident's year comes from its Incident Date, the date of the earliest Published Report Linked to it (owner's answer); it does not change when the Incident is later Confirmed, and moves earlier only if an older Report is Linked.") → T11
  - A33: Statistics count Incidents by Brand, Manufacturer, Hazard, Market and year, separated by Evidence Level without summing across levels. → T11 → T11-V1
  - A34: Ruled Out Incidents are excluded from statistics. → T11 → T11-V1
  - A35: The Incident Date is the date of its earliest Published Report with an approved Incident Link, and that date determines its statistical year. → T11 → T11-V1
  - A36: Later Confirmation does not change the Incident Date or year; linking an older Published Report can move them earlier. → T11 → T11-V1
- **R9.** Provide authenticated Reviewer accounts, attributable decisions and an AI-prioritized daily queue. (you said: "Reviewer accounts and the daily queue. One Reviewer (the owner) at first, with real Reviewer accounts so more can be added later; every decision records which Reviewer made it. AI collapses duplicates and ranks the queue so a short daily session is enough. The queue holds Pending Reports, Proposed Links, proposed catalog entries, Evidence Level changes, AI Analysis versions and Correction Requests.") → T2, T1, T13, T15
  - A37: The password-protected review page initially serves the owner's Reviewer account and supports adding more real Reviewer accounts later. → T2 → T2-V1
  - A38: Every Reviewer decision records the responsible Reviewer account. → T15 → T15-V1
  - A39: AI collapses duplicates and ranks pending work for daily review. → T13 → T13-V1
  - A40: The queue includes Pending Reports, Proposed Links, proposed catalog entries, Evidence Level changes, AI Analysis versions and Correction Requests. → T13 → T13-V1
- **R10.** Build the catalog from reviewed Reports and avoid attributing a Manufacturer's Incidents to unaffected Brands. (you said: "Catalog built only from Reports. Manufacturer, Brand, Product. Products, Brands and Manufacturers are created only from Reports that mention them (AI proposes, Reviewer confirms); no imported catalog. Incidents link to Products; Brands and Manufacturers inherit Incidents through their Products. Shared Manufacturer (owner's answer): context only, not counted. Brand B's page shows that its Manufacturer had an Incident, with a link, but Brand B's statistics count only Incidents Linked to Brand B's own Products, so Brands whose food was not affected are not penalized.") → T6
  - A41: A new Manufacturer, Brand or Product must be mentioned in a Report and confirmed by a Reviewer after AI proposes it. → T6 → T6-V1
  - A42: No external catalog is imported. → T6 → T6-V1
  - A43: Incidents connect to Products; Brand and Manufacturer Incident associations follow their Products. → T6 → T6-V1
  - A44: Publication-ready Brand information can show linked context about another Product's Incident at the shared Manufacturer. → T6 → T6-V1
  - A45: A Brand's statistics include only Incidents connected to its own Products, excluding Incidents involving only other Brands at the same Manufacturer. → T6 → T6-V1
- **R11.** Support manual Report entry and an import contract compatible with later collectors. (you said: "Getting Reports in before collectors exist (owner's answer: both). The review page has a manual "add Report" form, also used for Reports people send the owner such as a vet report, plus an import that accepts records in the same format the stage 2 collectors will produce, so collectors plug in later without changing the core.") → T14
  - A46: The review page provides a manual "add Report" form, including Reports privately sent to the owner such as vet reports. → T14 → T14-V1
  - A47: An import accepts the same Report record format that stage 2 collectors will produce. → T14 → T14-V1
  - A48: Manual and imported Reports enter the same core publication, proposal and review workflows, and later collectors can use that contract without redesigning the core. → T14 → T14-V1
- **R12.** Record Product Markets, affected Incident Markets and reported Affected Lots. (you said: "Markets and Affected Lots. Each Product records the Markets where it is sold; each Incident records its affected Markets, and Affected Lots (lot code, best-by date, barcode) when Reports list them.") → T7
  - A49: Each Product can record the Markets where it is sold. → T7 → T7-V1
  - A50: Each Incident can separately record its affected Markets. → T7 → T7-V1
  - A51: Affected Lots retain lot codes, best-by dates and barcodes when Reports supply them. → T7 → T7-V1

## Ordered tasks

### T2: Create the private runtime and Reviewer access

Create Bun/TypeScript scaffolding and the planned scripts. Initialize private SQLite migrations and transactions. Implement local account provisioning, password hashing, independent expiring sessions, loopback binding, private attachment authorization and same-origin mutation checks. Establish the shared decision transaction wrapper as a prerequisite to all review workflows.

Requirements: R9
Depends on: none

Acceptance:

- [ ] T2-A1 (R9; covers A37): The owner and a second locally provisioned Reviewer use independent identities and credentials. Unauthenticated requests cannot read private pages or attachments or invoke decisions.

Proposed verification:

- T2-V1 checks A37: Create HTTP and SQLite access tests for independent accounts, wrong passwords, expired sessions, direct attachment requests and mutation authorization. Port E24's direct server-side denial principle using only the target's Reviewer capability. Create and run `bun run verify:access` as part of implementation.
  - Must fail on T2-V1-M1 (A37): The private attachment handler omits session authorization. Expected failure: An unauthenticated attachment request returns 200; the test expects 401 with AUTH_REQUIRED.
  - Must fail on T2-V1-M2 (A37): All Reviewer logins are checked against the owner's password hash. Expected failure: The second account accepts the owner's password; the test expects 401 with INVALID_CREDENTIALS.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The back office is local and private. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- Comparator tests exercise server authorization directly. ([site/gatsby-site/server/tests/submissionAuthorization.spec.ts L1-L132](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/submissionAuthorization.spec.ts#L1-L132))

### T3: Establish domain persistence and immutable provenance

Create the core schema and foreign keys for documents/revisions, Sources, decisions, proposals, Incidents, accepted Links and the minimal referenced catalog, Hazard and Market facts. Include explicit affected pairs, content manifests, Analysis versions, scoped Harm contributions and durable AIWork fields. These are shared data prerequisites, not completion dependencies on the lower-priority catalog or Market/Lot interfaces. Implement stored-once Report identity, collected types and food scope.

Requirements: R5
Depends on: T2

Acceptance:

- [ ] T3-A1 (R5; covers A19): Repeated intake of one source document resolves to one Report with its Source and original URL or private document reference.
- [ ] T3-A2 (R5; covers A22, A23): Lab Tests and Expert Articles remain Reports, Analysis versions have Incident or Brand subjects, and statistical contracts count Incidents. Only the specified complete dog/cat diets qualify as Products.

Proposed verification:

- T3-V1 checks A19, A22, A23: Create temporary-SQLite tests for duplicate document identity, immutable revision references, collected types, Analysis subject constraints and the included/excluded Pet Food matrix. Create and run `bun run verify:domain` as part of implementation.
  - Must fail on T3-V1-M1 (A19): Repeated document intake inserts another Report identity. Expected failure: The two attempts return different IDs or store two Reports; the test expects one ID and one Report.
  - Must fail on T3-V1-M2 (A22): An Expert Article is stored as AI Analysis instead of a collected Report. Expected failure: The fixture has no Expert Article Report and an unexpected Analysis version.
  - Must fail on T3-V1-M3 (A23): The eligibility validator accepts treats as complete diets. Expected failure: The treat fixture succeeds; the test expects OUT_OF_SCOPE_PET_FOOD and no accepted Product.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The glossary establishes the domain types and scope. (`CONTEXT.md#L1-L145`)
- Reports have independent source-document identity. ([site/gatsby-site/server/types/report.ts L1-L89](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts#L1-L89))
- Incidents have separate identity and Report associations. ([site/gatsby-site/server/types/incidents.ts L1-L118](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/incidents.ts#L1-L118))

### T1: Verify the isolated Codex adapter and durable work lifecycle

Inspect supported native interfaces before choosing the login-based transport. Require empty effective model tool capabilities and complete context provenance; refuse unsupported isolation. Implement queued→running→result_ready→completed, running→retry_wait on timeout/transport failure, blocked_auth on authentication failure, cancelled on cancellation and failed_validation for invalid output. Persist cancellation and invalidate its attempt token before native cancellation. The sole worker reclaims orphaned running work on startup under the store lock, preserves blocked/cancelled states, and resumes result_ready application. Retry uses a new attempt token; stale or duplicate results cannot apply. Use native session/cancellation support where verified. Do not add a paid-key fallback or Analysis generator.

Requirements: R2, R9
Depends on: T3

Acceptance:

- [ ] T1-A1 (R2; covers A8, A9): The verified interface processes synthetic Pending full text and owner handles through the existing login while credentials remain outside all model-visible context. Errors, cancellation, restart and late output preserve the normal gates and immutable input lineage.

Proposed verification:

- T1-V1 checks A8, A9: Manual check. After native-interface inspection, demonstrate one synthetic existing-login round trip. Inspect effective capabilities and complete model-visible messages/context, not just the constructed prompt. Supply a hostile Report requesting a credential-canary file read and exfiltration; verify no read/shell/network/MCP capability is exposed and no canary enters context, results or diagnostics. Verify native cancellation where supported. Use synthetic credential files, never real credentials. These checks are planned.
  - Must fail on T1-V1-M1 (A8): The adapter strips owner handles from every task input. Expected failure: The matching task's captured input lacks the required synthetic owner-handle marker.
  - Must fail on T1-V1-M2 (A9): The adapter appends the process environment to the prompt. Expected failure: The model-visible input contains the synthetic credential canary; the expected canary occurrence count is zero.
  - Must fail on T1-V1-M3 (A9): The prompt is credential-free but the native session exposes filesystem or shell tools able to read credential-bearing files. Expected failure: The effective capability assertion expects an empty set and finds a file/shell tool; the hostile tool-read fixture can also introduce the canary into model-visible tool results.
- T1-V2 checks A9: Create deterministic adapter/work tests with temporary SQLite, controlled clocks and a transport double matching the verified native protocol. Assert AI_TIMEOUT→retry_wait, AI_AUTH_REQUIRED→blocked_auth without key fallback, AI_RESULT_INVALID→failed_validation, cancellation before late completion, stale-token refusal with AI_RESULT_STALE, duplicate delivery once, orphan recovery and result_ready recovery. Assert exact codes, stored states and unchanged approved values on each failure. Create and run `bun run verify:ai-work` as part of implementation.
  - Must fail on T1-V2-M1 (A9): A cancelled attempt's late response is accepted because result application checks work ID but not attempt token and state. Expected failure: The late response changes content/proposal rows; the test expects AI_RESULT_STALE, cancelled state and unchanged rows.
  - Must fail on T1-V2-M2 (A9): Authentication failure falls back to API-key processing. Expected failure: A fallback invocation occurs; the test expects AI_AUTH_REQUIRED, blocked_auth and zero fallback calls.
  - Must fail on T1-V2-M3 (A9): A timeout is persisted as completed. Expected failure: The timeout case stores completed; the test expects AI_TIMEOUT and retry_wait with no applied output.
  - Must fail on T1-V2-M4 (A9): Invalid structured output is applied without validation. Expected failure: Malformed output creates suggestions; the test expects AI_RESULT_INVALID, failed_validation and unchanged approved state.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The owner-login exception excludes credentials and the Mac can pause processing. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

### T4: Implement Official Sources and resilient publication gates

Deliver the R1 workflow first after shared prerequisites: authenticated named-list maintenance, central effective Official Report classification, labeled summary preparation and automatic publication without human approval for qualifying official material. Use the durable work ledger for interruption and authentication recovery. Apply a validated current result and its automatic publication atomically and idempotently. Other Reports and all Commissioned Tests remain Pending until reviewed; retain Rejected Reports privately. Establish the shared source-eligibility guard used later by derived content.

Requirements: R1
Depends on: T1

Acceptance:

- [ ] T4-A1 (R1; covers A1): Reviewers maintain individually named qualifying Sources; lab accreditation alone creates no membership.
- [ ] T4-A2 (R1; covers A2, A3): Qualifying official intake publishes with its labeled summary without Reviewer approval, including after recovery from interruption. Unofficial Reports and Commissioned Tests follow Pending approval/rejection.
- [ ] T4-A3 (R1; covers A4): Pending and Rejected Reports are absent from publication readers, and the common content-eligibility predicate refuses their revisions as public derived-content inputs.

Proposed verification:

- T4-V1 checks A1, A2, A3, A4: Create the Source/publication matrix, summary-label assertions, commissioning overrides and direct/nested visibility checks. Port E24's server-controlled promotion cases. Add child-process tests terminating official intake while queued, running, result_ready and during application; reopen the same SQLite store with usable authentication and drive the recovery cycle. Expect one Published Report, one applied summary and no accepted Links or human approval. Test replay after commit and retry after blocked_auth. Create and run `bun run verify:publication-gates` as part of implementation.
  - Must fail on T4-V1-M1 (A1): Accreditation automatically creates Official Source membership. Expected failure: The unlisted accredited lab appears on the list; the test expects no membership and a Pending Report.
  - Must fail on T4-V1-M2 (A2): All Reports remain Pending regardless of official qualification. Expected failure: The qualifying official fixture remains Pending after preparation; the expected state is Published without a Reviewer decision.
  - Must fail on T4-V1-M3 (A2): Startup never reclaims running work owned by the terminated process. Expected failure: After reopening and the controlled recovery cycle, intake remains running/preparing; the test expects one automatically Published Report.
  - Must fail on T4-V1-M4 (A2): Automatic official summaries omit their AI-written label. Expected failure: The Published official summary has aiWritten=false or no label; the test expects the label.
  - Must fail on T4-V1-M5 (A3): Listed-lab status overrides Commissioned Test status. Expected failure: The commissioned own-product or rival-product fixture is Published; the expected state is Pending.
  - Must fail on T4-V1-M6 (A4): Publication readers exclude Rejected but include Pending Reports. Expected failure: A Pending Report ID appears in the direct or nested result; the expected result contains Published Reports only.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Named Source qualification and the Commissioned Test exception determine publication. (`CONTEXT.md#L1-L145`)
- The comparator guards publication transitions. ([site/gatsby-site/server/fields/submissions.ts L1-L297](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts#L1-L297))
- Mac interruptions are an accepted operating condition. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

### T5: Implement typed approval gates, Links and episode creation

Deliver the shared R2 gate for every proposal kind, with gated extension points for subsequent domain handlers. Implement existing/new Incident proposals, first-acceptance creation and both Link types. Preserve existing associations and retain explicit affected-pair selections rather than inferring a Cartesian product. Accept initial Evidence proposals only through the same gate; R3 adds their eligibility rules next. Use minimal catalog identities as shared references, without waiting for full catalog or Market/Lot workflows.

Requirements: R2, R5
Depends on: T4

Acceptance:

- [ ] T5-A1 (R2; covers A5): The shared command boundary prevents all specified proposal kinds from changing approved state without a Reviewer decision; later handlers cannot gain authority from AI rank or Source status.
- [ ] T5-A2 (R2; covers A6, A7): AI proposals alone create no Incident. The first accepted new-episode proposal creates one; an official Report with only a Proposed Link changes no Incident-derived value.
- [ ] T5-A3 (R5; covers A20, A21): One episode can span multiple Products, Brands, Markets and updates. One stored Report retains zero, one or several accepted Incident Links.

Proposed verification:

- T5-V1 checks A5, A6, A7, A20, A21: Create approval-boundary and real-SQLite Link tests. Port E21's preservation/nonexistent-reference cases and E27's multi-Incident case. Check proposed official Links have no effects, concurrent acceptance creates one episode and a roundup preserves exact selected affected pairs without adding cross-pairs. T15 repeats the gate matrix against every completed handler. Create and run `bun run verify:incident-links` as part of implementation.
  - Must fail on T5-V1-M1 (A5): High-confidence Product Link proposals are written as accepted Links immediately. Expected failure: Before review the test finds an accepted Product Link; the expected accepted count is zero.
  - Must fail on T5-V1-M2 (A6): Saving a new-episode proposal inserts its Incident immediately. Expected failure: Incident count becomes one before acceptance; the test expects zero.
  - Must fail on T5-V1-M3 (A7): Incident readers include official Reports with proposed Incident Links. Expected failure: The pre-acceptance Incident snapshot changes; the test expects the original content, evidence and derived values.
  - Must fail on T5-V1-M4 (A20): Recall expansion creates one Incident for each added Product. Expected failure: The expansion fixture produces multiple episode IDs; the test expects one.
  - Must fail on T5-V1-M5 (A21): Adding another Incident association replaces earlier associations. Expected failure: The roundup retains only the final Incident ID; the test expects all three and one Report.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Only accepted Links affect Incidents and episode identity spans updates. (`CONTEXT.md#L1-L145`)
- Existing associations are preserved. ([site/gatsby-site/server/fields/incidents.ts L1-L191](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/incidents.ts#L1-L191))
- Tests assert one Report remains associated with both Incidents. ([site/gatsby-site/server/tests/incidentExistingReports.spec.ts L1-L118](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/incidentExistingReports.spec.ts#L1-L118))

### T8: Enforce Evidence Levels and Echo exclusion

Implement R3 immediately after the shared Report/Link prerequisites; it has no dependency on T6 catalog views or T7 Market/Lot functionality. Validate typed evidence bases against effective Published supporting Links. Official findings must support the relevant Product and Hazard; Commissioned Tests remain nonofficial. Record the Reviewer's independence judgment without a fixed count. Exclude Echo candidates before accepting collected Reports.

Requirements: R3
Depends on: T5

Acceptance:

- [ ] T8-A1 (R3; covers A10, A11, A12): Reported and Corroborated follow the specified bases; independent means different people, with reposts/Echoes excluded and no fixed numerical threshold.
- [ ] T8-A2 (R3; covers A13, A14): Confirmed requires a supporting qualifying finding matching the Incident's relevant Product/Hazard. Echoes become neither collected Reports nor evidence.

Proposed verification:

- T8-V1 checks A10, A11, A12, A13, A14: Create the evidence matrix for every positive basis and finding type, insufficient Reviewer judgments, independent people, reposts, complaint lists, commissioned results and Echoes. Include both a generic alert with no relevant Product and an official Salmonella Lab Test naming the same Product as an aflatoxin Incident. The latter must fail with OFFICIAL_FINDING_SCOPE_MISMATCH; a matching Hazard positive control must succeed. Create and run `bun run verify:evidence` as part of implementation.
  - Must fail on T8-V1-M1 (A10): Unofficial-only support defaults to Confirmed. Expected failure: The owner-only fixture has Confirmed; the expected accepted level is Reported.
  - Must fail on T8-V1-M2 (A11): Non-Official Source Lab Tests are omitted from Corroborated bases. Expected failure: The eligible lab fixture is refused instead of receiving the reviewed Corroborated assessment.
  - Must fail on T8-V1-M3 (A12): Corroborated requires three independent owner Reports. Expected failure: The sufficient two-person Reviewer judgment is rejected; the test expects Corroborated.
  - Must fail on T8-V1-M4 (A13): A generic official safety alert qualifies without naming the relevant Product. Expected failure: Confirmation succeeds; the test expects OFFICIAL_FINDING_REQUIRED.
  - Must fail on T8-V1-M5 (A13): Official Lab Test validation checks Product identity but ignores Hazard scope. Expected failure: The Salmonella finding confirms the aflatoxin Incident; the test expects OFFICIAL_FINDING_SCOPE_MISMATCH and unchanged Evidence Level.
  - Must fail on T8-V1-M6 (A14): Identified database-derived Echoes are inserted as Reports. Expected failure: Report count increases; the test expects excluded_echo and no collected payload.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Evidence depends on supporting findings and independence, separately from Markets and Lots. (`CONTEXT.md#L1-L145`)

### T9: Implement disputes, corrections and Ruled Out history

Implement R4 next, without Market/Lot dependencies. Preserve Stance per Incident Link and derive Disputed from effective Published contradicting Reports. Provide private Correction Request handling; an explicit decision can accept a brand statement and its contradicting Link together. Record no-link findings or Reviewer rule-out decisions without deleting history.

Requirements: R4
Depends on: T8

Acceptance:

- [ ] T9-A1 (R4; covers A15, A16, A17, A18): Stance survives persistence; only Published accepted contradicting Links mark Disputed. Approved brand statements become contradicting Reports through explicit gates. Ruled Out history remains visible and statistically ineligible.

Proposed verification:

- T9-V1 checks A15, A16, A17, A18: Create command/read tests for both Stances, every publication/Link combination, correction approval/rejection, official no-link findings and Reviewer rule-out. Check history and statistical eligibility independently. Create and run `bun run verify:disputes-corrections` as part of implementation.
  - Must fail on T9-V1-M1 (A15): The Link writer saves supports for every selected Stance. Expected failure: Reloading a contradicting Link returns supports instead of contradicts.
  - Must fail on T9-V1-M2 (A16): Disputed calculation omits the Published predicate. Expected failure: A Pending contradicting Report marks the Incident Disputed; the expected value is false.
  - Must fail on T9-V1-M3 (A17): Correction approval updates only the request and omits the Report. Expected failure: The approved request has no resulting Published contradicting Report/Link; both are expected.
  - Must fail on T9-V1-M4 (A18): Ruled Out Incidents remain statistically eligible. Expected failure: The retained history has eligibility=true; the test expects visible history and eligibility=false.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Stance, Disputed and Ruled Out are distinct local concepts. (`CONTEXT.md#L1-L145`)

### T12: Enforce content provenance and safe bilingual publication

Complete R6 after the earlier domain gates, without waiting for Harm, statistics or full catalog views. Implement immutable content/output hashes and complete manifests including inherited context and transformed-content ancestors. Stage 1 accepts Analysis versions only with verifiable processing envelopes; untracked pasted drafts remain private, and generation remains stage 8. Approval and emission validate every contributing exact Report revision and applicable accepted Link. A Report's own summary may publish atomically with its normal Report gate. Anonymization cannot make Pending input eligible. Implement safe bilingual DTOs, public-domain exceptions, removed-original markers and deny-by-default owner links. Every successful later Analysis approval advances the pointer atomically; pending/rejected versions do not.

Requirements: R1, R2, R6
Depends on: T9

Acceptance:

- [ ] T12-A1 (R1; covers A4): Neither anonymized Analysis prose nor transformed summaries can publish allegations contributed by Pending or Rejected source revisions, even without visible identifiers or citations.
- [ ] T12-A2 (R2; covers A9): Private-processing permission and prior AI context cannot bypass public provenance eligibility; missing lineage, content-hash mismatch or unaccepted applicable Links prevent approval/emission.
- [ ] T12-A3 (R6; covers A24, A25, A26): Publication-ready summaries/quotes are safe in both languages, private full text and owner identities/photos are excluded, and owner links use a verified handle-free form or show only platform/date.
- [ ] T12-A4 (R6; covers A27, A28): Removed originals retain marked summaries. AI labels are present in English and Traditional Chinese. A second approved Analysis replaces the first; pending/rejected versions do not, and ineligible provenance prevents emission.

Proposed verification:

- T12-V1 checks A4, A9, A24, A25, A26, A27, A28: Create approval, serialized-projection and rendered-preview tests. Port E2's language-isolated retrieval and E43's history-display cases. Generate an anonymized allegation from a Pending Report, remove citations, retain its captured lineage and expect CONTENT_SOURCE_NOT_PUBLIC on approval with no pointer change. Seed an approved-but-now-ineligible version and require null emission with no allegation prose. Test missing/forged manifests, inherited Pending context, output-hash changes, unaccepted subject Links and eligibility changes after approval. Cover X, Threads, Mastodon and an unknown platform; unsupported owner links must be null. Exercise v1 approved→v2 pending→v2 approved→v3 rejected for both Analysis subjects and locales. Create and run `bun run verify:public-projections` as part of implementation.
  - Must fail on T12-V1-M1 (A4): The shared content eligibility check ignores Pending input lineage once the Analysis has been approved and anonymized. Expected failure: The Pending-derived allegation is approved or emitted; the test expects CONTENT_SOURCE_NOT_PUBLIC at approval and no emitted allegation from the invalid seeded pointer.
  - Must fail on T12-V1-M2 (A9): Provenance validation uses displayed citation IDs instead of the processing envelope's complete inherited input set. Expected failure: A draft whose prior context contains Pending material passes approval; the test expects CONTENT_SOURCE_NOT_PUBLIC and unchanged approved state.
  - Must fail on T12-V1-M3 (A24): The public DTO spreads the stored Report before adding safe content. Expected failure: Serialized output contains the private full-text canary; the expected occurrence count is zero.
  - Must fail on T12-V1-M4 (A25): Anonymization is skipped for short quotes. Expected failure: The quote contains OwnerNameCanary; the test expects anonymized owner wording and no identity/photo.
  - Must fail on T12-V1-M5 (A26): Unsupported owner-post platforms fall back to the original URL. Expected failure: The Mastodon and unknown-platform previews contain identifying hyperlinks; the test expects null links and platform/date only.
  - Must fail on T12-V1-M6 (A26): Threads falls back to its original owner URL when no safe form exists. Expected failure: The Threads preview has an identifying link; the expected link is null.
  - Must fail on T12-V1-M7 (A27): Marking an original removed deletes its summary. Expected failure: The summary disappears; the test expects retained content marked "original removed".
  - Must fail on T12-V1-M8 (A28): Creating a pending Analysis version advances the public pointer. Expected failure: After v2 creation the preview shows v2; the test expects approved v1.
  - Must fail on T12-V1-M9 (A28): The public Analysis pointer is set only on the first approval. Expected failure: After approving v2 the preview still shows v1; the test expects v2 in both locales and for both subject types.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Analysis is based on Published Reports and only its last approved version is public. (`CONTEXT.md#L1-L145`)
- Private processing does not bypass publication gates. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- The comparator represents language-specific Report content. ([site/gatsby-site/server/types/report.ts L1-L89](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts#L1-L89))
- Historical content has separate modification identity. ([site/gatsby-site/server/types/reportHistory.ts L1-L41](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/reportHistory.ts#L1-L41))
- Reference tests exercise history display, not the target's provenance or approved-pointer rules. ([site/gatsby-site/playwright/e2e/reportHistory.spec.ts L1-L247](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/playwright/e2e/reportHistory.spec.ts#L1-L247))

### T10: Implement Incident-scoped Harm assertions and animal identity constraints

Bind each count assertion, animal observation and cohort to the specific accepted Report/Incident Link and source revision that describes it. Never join a Report's entire animal set to every Incident. Store four independent species/outcome measures and attributed dates. Select the latest eligible non-Commissioned Official Report assertion. For approved owner Reports, calculate a minimum feasible number of animals preserving confirmed-same, known-different and cohort-distinctness constraints. Possible matches permit alternative assignments rather than transitive merging. A small exact constraint search in TypeScript is sufficient initially; do not publish an unproven approximate count.

Requirements: R5, R7
Depends on: T12

Acceptance:

- [ ] T10-A1 (R7; covers A29, A30): Animal counts remain separate by species/outcome and Incident. The latest eligible official assertion supplies its date and Source; a subsequently published Commissioned Test cannot replace it as an official count.
- [ ] T10-A2 (R7; covers A31, A32): The owner fallback uses only that Incident's approved owner observations. Known and possible duplicates produce a conservative lower bound without violating known distinctness across Reports.
- [ ] T10-A3 (R5; covers A21): A single stored multi-Incident Report retains separate Harm contribution scopes for its Incident Links.

Proposed verification:

- T10-V1 checks A21, A29, A30, A31, A32: Create fixtures for multiplicity, all four measures, later smaller official counts, zero/unknown counts, unlinked/Pending material and approved commissioned tests from listed labs. One official document reports 4 sick dogs for I1 and 9 for I2; expect exactly those separate headlines. One approved owner document describes 2 animals for I1 and 3 for I2; expect separate lower bounds, not 5 each. Preserve repeated-pet and overlapping 3/5-cohort cases. Add A and B known different across separate Reports with C possibly matching either: expected minimum is 2, not 1. Reject contradictory identity constraints with ANIMAL_IDENTITY_CONFLICT. Create and run `bun run verify:harm-counts` as part of implementation.
  - Must fail on T10-V1-M1 (A21): Count assertions are attached only to Report ID and copied to each of its accepted Incident Links. Expected failure: The two-Incident official document produces combined or duplicated totals; the test expects I1=4 and I2=9 from one stored Report.
  - Must fail on T10-V1-M2 (A29): Owner counts count Report rows rather than described animals. Expected failure: One Report describing three sick dogs produces one; the expected count is three.
  - Must fail on T10-V1-M3 (A30): The official headline selects the largest total rather than the latest assertion. Expected failure: The older count of twelve wins; the test expects the later count of four with its date and Source.
  - Must fail on T10-V1-M4 (A30): A published Commissioned Test is classified as official solely through its listed lab's membership. Expected failure: The later commissioned count replaces the genuine official headline; the test expects the genuine count and the commissioned value only as an attributed Report assertion.
  - Must fail on T10-V1-M5 (A31): Pending owner observations contribute to the fallback. Expected failure: Two approved animals plus one Pending animal produce "at least 3"; the expected headline is "owners report at least 2".
  - Must fail on T10-V1-M6 (A31): Every animal in a multi-Incident owner Report contributes to every linked Incident. Expected failure: Both Incidents receive five animals; the test expects I1=2 and I2=3.
  - Must fail on T10-V1-M7 (A32): Possible matches are ignored unless identity is certain. Expected failure: Two possibly identical descriptions count as two; the expected lower bound is one.
  - Must fail on T10-V1-M8 (A32): Possible-match connected components use only their largest within-Report distinct count and discard cross-Report known-different constraints. Expected failure: The A-different-B/C-possibly-either fixture returns one; the expected lower bound is two.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Harm measures animals in an Incident; Reports can cover several Incidents and Commissioned Tests are nonofficial. (`CONTEXT.md#L1-L145`)

### T11: Implement Incident Dates and distinct scoped statistics

Implement R8 using the shared schema rather than waiting for full Market/Lot or catalog interfaces. Count distinct Incidents by Brand, Manufacturer, Hazard, Market and year with separate Evidence buckets and Ruled Out exclusion. Incident Date uses the minimum source date over effective accepted Report/Incident Links of either Stance; only evidence-support calculations filter supports. Brand counts traverse explicit affected Products.

Requirements: R8
Depends on: T10

Acceptance:

- [ ] T11-A1 (R8; covers A33, A34, A35, A36): Statistics count distinct eligible Incidents by each required dimension and separate Evidence Level. The earliest linked Published Report of either Stance determines year; Confirmation/newer Reports do not change it and older accepted Reports can move it earlier.

Proposed verification:

- T11-V1 checks A33, A34, A35, A36: Create dimensional bucket fixtures with multiple Reports/Products, separate Evidence Levels and Ruled Out history. Test old backfilled documents and later Confirmation. Include a Published 2022 contradicting Report accepted before a supporting 2023 Report: Incident Date/year must be 2022 despite Stance, while support qualification remains separate. Create and run `bun run verify:statistics` as part of implementation.
  - Must fail on T11-V1-M1 (A33): Statistics count joined Report rows instead of distinct Incident IDs. Expected failure: Three Reports about one Incident produce a bucket count of three; the expected count is one.
  - Must fail on T11-V1-M2 (A34): The Ruled Out filter is omitted. Expected failure: The bucket contains the ruled-out fixture and returns two instead of one.
  - Must fail on T11-V1-M3 (A35): Incident year uses collection date. Expected failure: A 2023 document collected in 2026 is bucketed in 2026; the expected year is 2023.
  - Must fail on T11-V1-M4 (A35): Incident Date considers only supporting Links. Expected failure: The earlier accepted contradicting Report is ignored and the year is 2023; the test expects 2022.
  - Must fail on T11-V1-M5 (A36): Confirmation resets Incident Date to its decision date. Expected failure: The established date changes on Confirmation; the expected date is unchanged.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Incident Date uses the earliest Published linked Report without a Stance restriction. (`CONTEXT.md#L1-L145`)

### T13: Complete AI triage and the daily queue

Unify the review kinds on the authenticated page using the existing typed gates. Validate AI suggestions for episode targets, catalog mentions, evidence candidates, duplicate groups and ranking. Keep distinct documents and episodes separate. Show current approved state, immutable input provenance, proposed changes and processing diagnostics. A recovered AI attempt can add suggestions only once and cannot silently approve queued work.

Requirements: R9
Depends on: T11

Acceptance:

- [ ] T13-A1 (R9; covers A39, A40): Validated AI grouping collapses repeated work and ranks the daily queue. The queue includes Pending Reports, both Link types, catalog proposals, Evidence changes, Analysis versions and Correction Requests, including Links for already-Published official Reports.

Proposed verification:

- T13-V1 checks A39, A40: Create triage-contract and browser tests with deterministic validated AI results, malformed references, duplicate receipts, distinct same-Brand episodes and stable rank ties. Verify recovered result replay creates one group/proposal set. Port E27's explicit queue review/navigation cases without destructive rejection. Create and run `bun run verify:review-queue` as part of implementation.
  - Must fail on T13-V1-M1 (A39): The queue ignores validated duplicate-group identifiers. Expected failure: Duplicate receipts render as unrelated groups; the test expects one expandable group and the specified ranking.
  - Must fail on T13-V1-M2 (A39): Recovered result application recreates the same proposal set. Expected failure: Replaying the completed work produces duplicate queue items; the expected proposal/group IDs and counts are unchanged.
  - Must fail on T13-V1-M3 (A40): The queue omits Analysis versions and Correction Requests. Expected failure: Those seeded work items cannot be found or opened; both are expected in the queue.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The comparator has a filtered review queue. ([site/gatsby-site/src/components/submissions/SubmissionList.js L1-L778](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/src/components/submissions/SubmissionList.js#L1-L778))
- Browser tests exercise explicit queue review actions. ([site/gatsby-site/playwright/e2e/apps/submitted.spec.ts L87-L385](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/playwright/e2e/apps/submitted.spec.ts#L87-L385))
- Private triage may process originals and owner identifiers. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

### T6: Complete the Report-derived catalog and Brand attribution

Complete R10's catalog proposal/confirmation forms and provenance checks, Product/Manufacturer relationships and Brand previews. Require a mentioning Report revision and quoted mention; provide no catalog import. Build inherited Incident associations through exactly the accepted affected pairs. Show shared-Manufacturer Incidents as labeled context separate from Brand statistics.

Requirements: R10
Depends on: T13

Acceptance:

- [ ] T6-A1 (R10; covers A41, A42, A43): Catalog entries arise only from confirmed Report mentions, no imported catalog is accepted, and Brand/Manufacturer Incident inheritance follows affected Products.
- [ ] T6-A2 (R10; covers A44, A45): Brand previews include linked Manufacturer context without counting unrelated Products' Incidents. A roundup affects only the expressly reviewed Incident/Product pairs.

Proposed verification:

- T6-V1 checks A41, A42, A43, A44, A45: Create catalog command, attribution-query and safe Brand-preview tests. Cover missing mentions, pending entries, multiple Manufacturers and forbidden catalog records. Retain the unaffected shared-Manufacturer Brand fixture. Add one Report explicitly assigning Product A to I1 and Product B to I2; drive production Link/pair approval and assert the exact pair set {(I1,A),(I2,B)}, Brand A counts only I1 and Brand B only I2. Assert absent cross-pairs and context labels. Create and run `bun run verify:catalog` as part of implementation.
  - Must fail on T6-V1-M1 (A41): Approval skips checking that the cited Report contains the catalog mention. Expected failure: An unrelated Report creates a Brand; the test expects CATALOG_MENTION_REQUIRED and no Brand row.
  - Must fail on T6-V1-M2 (A42): The importer accepts standalone catalog records. Expected failure: Catalog row counts change; the test expects CATALOG_IMPORT_FORBIDDEN and unchanged counts.
  - Must fail on T6-V1-M3 (A43): Inherited Incident queries require direct Brand/Manufacturer Incident keys. Expected failure: The Product-linked Incident is absent from its owning Brand/Manufacturer results.
  - Must fail on T6-V1-M4 (A44): Brand context searches only the Brand's own affected Products. Expected failure: The shared-Manufacturer contextual Incident/link is missing despite an expected context-only entry.
  - Must fail on T6-V1-M5 (A45): Brand counts traverse all Products made by a shared Manufacturer. Expected failure: Unaffected Brand C receives another Brand's Incident count; the expected count is zero.
  - Must fail on T6-V1-M6 (A45): The roundup pair writer creates the Cartesian product of accepted Incident and Product Links. Expected failure: The pair set contains (I1,B) or (I2,A), and Brand results include an unrelated Incident; the test expects exactly the two reviewed pairs and one proper Incident per Brand.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Catalog provenance and Brand-only affected-Product counts are explicit requirements. (`CONTEXT.md#L1-L145`)
- A Report legitimately spans several Incidents, requiring careful attribution. ([site/gatsby-site/server/tests/incidentExistingReports.spec.ts L1-L118](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/incidentExistingReports.spec.ts#L1-L118))

### T14: Expose manual Report intake and the shared import contract

Complete R11 with a manual add-Report form, private vet attachments and an import action. Both call the same ReportEnvelopeV1 pipeline. Decode raw inputs into an allowlist; discard reserved publication_state, approval, Reviewer, accepted-Link and official-status fields with private ignored-field diagnostics. After ingestion returns, never copy raw fields onto stored entities. Publish representative collector contract fixtures without implementing a collector.

Requirements: R11
Depends on: T6

Acceptance:

- [ ] T14-A1 (R11; covers A46, A47, A48): Manual vet documents and conforming collector records enter the same identity, source, publication and proposal pipeline. Reserved caller fields cannot alter authoritative results, including after the shared service returns.

Proposed verification:

- T14-V1 checks A46, A47, A48: Create browser and producer/consumer contract tests for official, commissioned, social and private vet inputs, retries and equivalent manual/import effects. Add a valid unofficial record with forged publication_state=Published plus approval/Reviewer/official flags; expect successful decoding with those fields reported ignored, stored Pending state, no accepted Links and no forged decision. Reload the store after the complete importer returns. Repeat with a commissioned listed-lab record. Create and run `bun run verify:intake-contract` as part of implementation.
  - Must fail on T14-V1-M1 (A46): The manual form requires a public URL and cannot accept a private vet reference. Expected failure: The vet submission is refused; the test expects a private Report in the normal Pending workflow.
  - Must fail on T14-V1-M2 (A47): Import validation requires a frontend-only field outside ReportEnvelopeV1. Expected failure: A conforming collector fixture is rejected instead of imported without the frontend field.
  - Must fail on T14-V1-M3 (A48): Import bypasses the Commissioned Test override. Expected failure: The imported commissioned record becomes Published while the equivalent manual record remains Pending.
  - Must fail on T14-V1-M4 (A48): After shared ingestion, the importer copies raw publication_state onto the stored Report. Expected failure: Reloading the forged unofficial import finds Published; the test expects Pending, ignored reserved fields and no approval decision.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Report publication and catalog creation have controlled provenance. (`CONTEXT.md#L1-L145`)
- Private intake stays on the Mac. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

### T7: Complete Market and Affected Lot workflows

Complete R12 last among independent feature workflows. Add Product sale-Market and Incident affected-Market editing with Report provenance. Add Incident/Product-scoped Affected Lots. Preserve lot codes and barcodes as strings and retain partial identifiers without invention. Earlier evidence and dispute workflows use only shared schema prerequisites and do not depend on this task.

Requirements: R12
Depends on: T14

Acceptance:

- [ ] T7-A1 (R12; covers A49, A50, A51): Sale Markets and affected Markets remain independent. Report-listed lot codes, best-by dates and barcodes round-trip exactly, including partial Lots and leading zeros.

Proposed verification:

- T7-V1 checks A49, A50, A51: Create persistence/form tests for a Product sold in HK and Taiwan but affected only in Taiwan, complete/partial Lots and leading-zero barcodes. Verify dimensional statistics still use affected Incident Markets. Create and run `bun run verify:markets-lots` as part of implementation.
  - Must fail on T7-V1-M1 (A49): Adding another sale Market replaces the previous Product Market. Expected failure: Only Taiwan remains; the expected sale Markets are HK and Taiwan.
  - Must fail on T7-V1-M2 (A50): Affected Markets are copied from every Product sale Market. Expected failure: The Taiwan-only Incident also affects HK; the expected affected set is Taiwan only.
  - Must fail on T7-V1-M3 (A51): Barcodes are converted to numbers. Expected failure: Leading zeros disappear; the round-trip test expects the original barcode string.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- Sale Markets, affected Markets and Report-named Lots are separate concepts. (`CONTEXT.md#L1-L145`)

### T15: Verify complete approval and attribution coverage

Repeat the shared gate matrix against every completed production handler: Source membership, Report approval/rejection, both Links, episode creation, catalog confirmation, Evidence changes, Analysis versions and corrections. Include immutable content lineage, stale revisions, duplicate commands, failure injection and current AI attempt checks. This is final integration verification, not a dependency delaying implementation of higher-priority features until lower-priority ones exist.

Requirements: R2, R9
Depends on: T7

Acceptance:

- [ ] T15-A1 (R2; covers A5): Every required proposed change remains ineffective until its Reviewer decision. Source status, AI rank, recovered work and preexisting content approval cannot bypass the relevant gate.
- [ ] T15-A2 (R9; covers A38): Every human decision records the authenticated Reviewer and relationship-aware effects atomically. Failed or repeated commands leave no partial approval or misleading history.

Proposed verification:

- T15-V1 checks A5, A38: Create the complete handler matrix through real HTTP/domain boundaries and SQLite. Port E24's direct unauthorized promotion cases and E45's association-only snapshots. Test spoofed actor IDs, failure during decision history, repeated command IDs, exact STALE_REVIEW conflicts and AI output replay. Require the same source-provenance checks used by T12 before Analysis approval. Create and run `bun run verify:approval-boundaries` as part of implementation.
  - Must fail on T15-V1-M1 (A5): High-confidence AI Product Links are inserted as accepted without a Reviewer. Expected failure: The pre-review matrix finds accepted associations; the expected accepted count is zero.
  - Must fail on T15-V1-M2 (A38): Decision reviewer_id comes from the form instead of the session. Expected failure: Reviewer A submits a form naming B and history records B; the test expects A.
  - Must fail on T15-V1-M3 (A38): Domain writes commit before the decision-history insert. Expected failure: Injected history failure leaves approved state changed; the test expects both domain and decision counts unchanged.

Done when: each wrong implementation named above, applied alone to the finished code, makes its check fail, while the unmodified code passes every check above. unshit has not applied any of them or run any check.

Source basis:

- The reference tests direct publication authorization. ([site/gatsby-site/server/tests/submissionAuthorization.spec.ts L1-L132](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/submissionAuthorization.spec.ts#L1-L132))
- Domain and audit writes share a transaction. ([packages/services/src/status-report/create.ts L1-L132](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts#L1-L132))
- Tests assert relationship changes in audit snapshots. ([packages/services/src/status-report/__tests__/status-report.test.ts L886-L1411](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/__tests__/status-report.test.ts#L886-L1411))
- Accepted changes require the target's Reviewer gates. (`CONTEXT.md#L1-L145`)

## Reference research

Quality bar: license required; at least 20 stars; pushed within 36 months; created at least 180 days ago; not archived; not a fork; test files required.
Search requests: GitHub 3/9; GitLab 0. Matched 44; passed metadata bar 43; tree-verified shortlist 6; selected 2; host exclusions 38; tree resolutions 8; rate limited no.
Queries:
- github tier 0 `incident in:name,description,topics archived:false fork:false stars:>=200 pushed:>=2025-10-30` — ok; 20 result(s), 20 new candidate(s).
- github tier 0 `report in:name,description,topics archived:false fork:false stars:>=200 pushed:>=2025-10-30` — ok; 20 result(s), 20 new candidate(s).
- github tier 0 `topic:food-safety archived:false fork:false stars:>=200 pushed:>=2025-10-30` — ok; 0 result(s), 0 new candidate(s).
- github tier 1 `incident in:name,description,topics archived:false fork:false stars:>=50 pushed:>=2024-10-30` — skipped; 0 result(s), 0 new candidate(s).
- github tier 1 `report in:name,description,topics archived:false fork:false stars:>=50 pushed:>=2024-10-30` — skipped; 0 result(s), 0 new candidate(s).
- github tier 1 `topic:food-safety archived:false fork:false stars:>=50 pushed:>=2024-10-30` — skipped; 0 result(s), 0 new candidate(s).
- github tier 2 `incident in:name,description,topics archived:false fork:false stars:>=20 pushed:>=2023-10-30` — skipped; 0 result(s), 0 new candidate(s).
- github tier 2 `report in:name,description,topics archived:false fork:false stars:>=20 pushed:>=2023-10-30` — skipped; 0 result(s), 0 new candidate(s).
- github tier 2 `topic:food-safety archived:false fork:false stars:>=20 pushed:>=2023-10-30` — skipped; 0 result(s), 0 new candidate(s).
Code search (Grep by Vercel): 12/12 request(s); 13 repositories matched outside example and documentation paths; 4 new repositories screened with 1 GitHub metadata request(s).
- grep discovery `evidence_level` — ok; 10 result(s).
- grep discovery `official_source` — ok; 10 result(s).
- grep discovery `incident_id` — ok; 10 result(s).
- grep location `evidence_level` in responsible-ai-collaborative/aiid — ok; 0 result(s).
- grep location `official_source` in responsible-ai-collaborative/aiid — ok; 0 result(s).
- grep location `evidence_level` in dfirtrack/dfirtrack — ok; 0 result(s).
- grep location `official_source` in dfirtrack/dfirtrack — ok; 0 result(s).
- grep location `evidence_level` in keephq/keep — ok; 0 result(s).
- grep location `official_source` in keephq/keep — ok; 0 result(s).
- grep location `evidence_level` in openstatusHQ/openstatus — ok; 0 result(s).
- grep location `official_source` in openstatusHQ/openstatus — ok; 0 result(s).
- grep location `evidence_level` in pwndoc/pwndoc — skipped; 0 result(s).
- grep location `official_source` in pwndoc/pwndoc — skipped; 0 result(s).
- grep location `evidence_level` in roxy-wi/IncidentRelay — skipped; 0 result(s).
- grep location `official_source` in roxy-wi/IncidentRelay — skipped; 0 result(s).

## Repository screening

- Host excluded [github:ruvnet/RuView](https://github.com/ruvnet/RuView). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 101572 stars; 13198 forks; archived false; fork false; Rust; topics awesome, claude, densepose, esp32, firmware, home-assistant, home-automation, iot, monitoring, networking, npm, pose-estimation, react, rf, self-learning, skills, spatial-intelligence, typescript, wifi, wifi-security; pushed 2026-10-30T00:30:03.000Z; created 2025-06-07T04:32:30.000Z; license MIT (metadata evidence); test count unknown. Code search matched `evidence_level`.
- Host excluded [github:Chuyu-Team/Dism-Multi-language](https://github.com/Chuyu-Team/Dism-Multi-language). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 20687 stars; 1246 forks; archived false; fork false; HTML; topics none; pushed 2026-10-09T08:19:25.000Z; created 2016-11-26T06:45:37.000Z; license MIT (metadata evidence); test count unknown.
- Rejected [github:keephq/keep](https://github.com/keephq/keep). Search metadata reported last activity 2026-10-22T09:18:26.000Z. Signals: 12459 stars; 1539 forks; archived false; fork false; Python; topics aiops, alarm, alarms, alerting, alerts, monitoring, monitoring-tool, python, python3, workflow-automation; pushed 2026-10-22T09:18:26.000Z; created 2023-02-04T18:43:27.000Z; license NOASSERTION (tree evidence); 201 test files. Code search matched `incident_id`. AIOps alert management targets operational alerts rather than curated documentary Reports. The incident_id matches do not establish review, evidence assessment or publication controls.
- Host excluded [github:TwiN/gatus](https://github.com/TwiN/gatus). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 12444 stars; 883 forks; archived false; fork false; Go; topics alerting, container, dashboard, devops, docker, go, golang, health, monitor, monitoring, monitoring-tool, notifications, self-hosted, selfhosted, slack, status, status-page, statuspage, uptime, uptime-monitoring; pushed 2026-10-29T06:23:05.000Z; created 2019-09-04T02:35:40.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:juliocesarfort/public-pentesting-reports](https://github.com/juliocesarfort/public-pentesting-reports). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 9795 stars; 2194 forks; archived false; fork false; HTML; topics none; pushed 2026-06-07T18:38:18.000Z; created 2016-08-05T13:11:22.000Z; license not reported; test count unknown.
- Host excluded [github:meirwah/awesome-incident-response](https://github.com/meirwah/awesome-incident-response). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 9513 stars; 1763 forks; archived false; fork false; language unknown; topics awesome, awesome-list, cybersecurity, dfir, incident-response, incident-response-tooling, list, security; pushed 2026-10-13T05:08:25.000Z; created 2015-11-10T22:10:58.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Selected [github:openstatusHQ/openstatus](https://github.com/openstatusHQ/openstatus), inspected at `f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62`, commit dated 2026-10-28T10:49:53.000Z, last activity reported 2026-10-28T20:29:30.000Z. Signals: 9241 stars; 801 forks; archived false; fork false; TypeScript; topics alerting, incident-management, mcp, mcp-server, monitoring, monitoring-as-code, observability, on-call, open-source, sre, status-page, statuspage, synthetic-monitoring, terraform, tinybird, turso, uptime, uptime-checker, uptime-monitor; pushed 2026-10-28T20:29:30.000Z; created 2023-06-19T15:32:41.000Z; license AGPL-3.0 (metadata evidence); 515 test files. Complementary TypeScript comparator with incident management, public status pages and a Turso topic. Inspect incident persistence and the boundary between authenticated management and public output for R6 and R9; exclude monitoring and on-call features.
- Host excluded [github:SunWeb3Sec/DeFiHackLabs](https://github.com/SunWeb3Sec/DeFiHackLabs). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 6830 stars; 1492 forks; archived false; fork false; Solidity; topics defi, ethereum, foundry, solidity, web3; pushed 2026-10-29T03:01:25.000Z; created 2022-06-10T09:57:11.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:reddelexc/hackerone-reports](https://github.com/reddelexc/hackerone-reports). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 6642 stars; 1163 forks; archived false; fork false; Python; topics bugbounty, csrf, hackerone, idor, rce, reports, security, sql-injection, ssrf, writeups, xss, xxe; pushed 2026-10-12T15:40:32.000Z; created 2019-04-19T06:11:04.000Z; license not reported; test count unknown.
- Host excluded [github:ACRA/acra](https://github.com/ACRA/acra). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 6501 stars; 1126 forks; archived false; fork false; Kotlin; topics acra, android, android-developers, crash-reports; pushed 2026-10-29T12:14:32.000Z; created 2012-09-20T18:13:49.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:vllm-project/semantic-router](https://github.com/vllm-project/semantic-router). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 6327 stars; 1090 forks; archived false; fork false; Go; topics ai-gateway, guardrails, inference, kubernetes, llm, llmrouter, mixture-of-models, pytorch, semantic-router, transformer, vllm; pushed 2026-10-29T19:19:12.000Z; created 2025-08-26T21:49:50.000Z; license Apache-2.0 (metadata evidence); test count unknown. Code search matched `evidence_level`.
- Host excluded [github:google/grr](https://github.com/google/grr). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 5107 stars; 794 forks; archived false; fork false; Python; topics none; pushed 2026-10-01T16:04:33.000Z; created 2013-12-04T00:17:53.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:A-poc/BlueTeam-Tools](https://github.com/A-poc/BlueTeam-Tools). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 4547 stars; 700 forks; archived false; fork false; language unknown; topics blue-team, blueteam, cheatsheet, cyber-security, defender, incident, incident-response, malware-analysis, resources, tools, vulnerability-management, wiki; pushed 2026-08-23T17:01:16.000Z; created 2023-01-02T20:08:16.000Z; license not reported; test count unknown.
- Host excluded [github:noraj/OSCP-Exam-Report-Template-Markdown](https://github.com/noraj/OSCP-Exam-Report-Template-Markdown). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 4216 stars; 834 forks; archived false; fork false; Ruby; topics exam, exam-report, latex, markdown, markdown-template, markdown-to-pdf, offensive-security, osce, oscp, oscp-prep, osee, osert, oswe, oswp, pandoc, report, reporting-tool; pushed 2026-08-12T22:09:49.000Z; created 2019-06-30T19:48:49.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:guaguaguaxia/weekly_report](https://github.com/guaguaguaxia/weekly_report). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 3232 stars; 475 forks; archived false; fork false; TypeScript; topics none; pushed 2026-10-17T08:02:33.000Z; created 2023-02-09T03:44:39.000Z; license not reported; test count unknown.
- Host excluded [github:blackorbird/APT_REPORT](https://github.com/blackorbird/APT_REPORT). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 3106 stars; 577 forks; archived false; fork false; Python; topics apt, cybersecurity, exploit, malware, oisint, security, threat-hunting; pushed 2026-10-28T15:17:44.000Z; created 2019-04-02T01:58:52.000Z; license not reported; test count unknown.
- Host excluded [github:danielpalme/ReportGenerator](https://github.com/danielpalme/ReportGenerator). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 3106 stars; 297 forks; archived false; fork false; C#; topics code-coverage, dotnet-core, reporting, tdd-utilities, testing; pushed 2026-10-27T20:54:00.000Z; created 2015-02-03T10:50:41.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:FastReports/FastReport](https://github.com/FastReports/FastReport). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 3102 stars; 682 forks; archived false; fork false; C#; topics csharp, dotnet, dotnet-core, dotnet5, dotnet6, dotnetcore, fastreport, opensource, pdf, pdf-generation, report, report-generator, reporting, reporting-engine, reporting-tool; pushed 2026-10-29T14:47:21.000Z; created 2018-10-25T08:36:04.000Z; license MIT (metadata evidence); test count unknown.
- Rejected [github:pwndoc/pwndoc](https://github.com/pwndoc/pwndoc). Search metadata reported last activity 2026-10-26T16:25:28.000Z. Signals: 2916 stars; 518 forks; archived false; fork false; JavaScript; topics audit, collaboration, infosec, penetration-testing, pentest, pentesting-tool, reporting, reporting-tool, security, security-audit, security-tool, vulnerabilities; pushed 2026-10-26T16:25:28.000Z; created 2020-01-13T23:42:23.000Z; license MIT (metadata evidence); 151 test files. Pentest document generation and collaboration differ from collecting source Reports and linking them to Incidents. The supplied signals do not establish a distinct review or publication pattern worth inspecting.
- Host excluded [github:certsocietegenerale/FIR](https://github.com/certsocietegenerale/FIR). Reason: no test file at ed479a1b93bba9fa7dd59379ba1f46add11e4eb7 Signals: 2049 stars; 510 forks; archived false; fork false; JavaScript; topics none; pushed 2026-09-14T06:03:22.000Z; created 2015-03-11T16:23:34.000Z; license GPL-3.0 (metadata evidence); 0 test files.
- Host excluded [github:CcSimple/vue-plugin-hiprint](https://github.com/CcSimple/vue-plugin-hiprint). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 1740 stars; 319 forks; archived false; fork false; JavaScript; topics design, print, report, vue; pushed 2026-10-08T06:40:59.000Z; created 2021-12-13T07:52:13.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:ariacom/Seal-Report](https://github.com/ariacom/Seal-Report). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 1640 stars; 508 forks; archived false; fork false; C#; topics ai-agents, ai-tools, business-intelligence, chart, dashboards, etl, excel, html-report, linq, mongodb, mysql, pdf, report-generator, reporting-engine, sqlserver, task-scheduler, tasks; pushed 2026-10-28T15:46:53.000Z; created 2015-08-11T15:21:31.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:dfir-iris/iris-web](https://github.com/dfir-iris/iris-web). Reason: no test file at 37c5521ac009bd018a2fac7bc01d70735d130c6c Signals: 1615 stars; 335 forks; archived false; fork false; Shell; topics csirt-tooling, digital-forensics, digital-forensics-incident-response, forensic, forensic-analysis, forensic-tools, incident-response, python; pushed 2026-10-22T15:47:15.000Z; created 2021-12-20T08:19:15.000Z; license LGPL-3.0 (metadata evidence); 0 test files.
- Host excluded [github:raodv/report](https://github.com/raodv/report). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 1423 stars; 356 forks; archived false; fork false; JavaScript; topics none; pushed 2026-08-13T02:41:17.000Z; created 2021-06-22T01:48:07.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:xinglie/report-designer](https://github.com/xinglie/report-designer). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 1290 stars; 314 forks; archived false; fork false; HTML; topics cloud-print, data-analysis, data-visualization, editor, h5-creator, h5-editor, h5-maker, iot-demo, layouts-and-renderings, online-design, online-printing, printer, snapshot, visiual-editor, xinglie; pushed 2026-10-07T10:21:37.000Z; created 2018-10-25T01:55:50.000Z; license not reported; test count unknown.
- Host excluded [github:aws-samples/aws-incident-response-playbooks](https://github.com/aws-samples/aws-incident-response-playbooks). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 1117 stars; 232 forks; archived false; fork false; language unknown; topics none; pushed 2026-08-28T02:00:59.000Z; created 2020-06-11T06:02:41.000Z; license MIT-0 (metadata evidence); test count unknown.
- Host excluded [github:PagerDuty/incident-response-docs](https://github.com/PagerDuty/incident-response-docs). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 1052 stars; 218 forks; archived false; fork false; Dockerfile; topics documentation, incident-response, oncall, pagerduty, team-security; pushed 2026-07-02T15:10:20.000Z; created 2016-11-28T17:58:18.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:VersusControl/versus-incident](https://github.com/VersusControl/versus-incident). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 917 stars; 171 forks; archived false; fork false; Go; topics ai, ai-agent, ai-tools, alert, aws, devops, devops-agent, golang, helm, kubernetes, monitoring-tool, on-call, pagerduty, slack, sre, telegram; pushed 2026-10-27T16:34:32.000Z; created 2025-02-04T15:20:06.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:Bert-JanP/Incident-Response-Powershell](https://github.com/Bert-JanP/Incident-Response-Powershell). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 825 stars; 119 forks; archived false; fork false; PowerShell; topics forensics-tools, incident-response, powershell; pushed 2026-05-26T17:46:26.000Z; created 2022-07-06T16:16:32.000Z; license BSD-3-Clause (metadata evidence); test count unknown.
- Host excluded [github:ramimac/aws-customer-security-incidents](https://github.com/ramimac/aws-customer-security-incidents). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 820 stars; 62 forks; archived false; fork false; language unknown; topics none; pushed 2026-10-27T14:39:47.000Z; created 2021-08-28T03:48:24.000Z; license GPL-3.0 (metadata evidence); test count unknown.
- Host excluded [github:Just-Hack-For-Fun/Windows-INCIDENT-RESPONSE-COOKBOOK](https://github.com/Just-Hack-For-Fun/Windows-INCIDENT-RESPONSE-COOKBOOK). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 748 stars; 47 forks; archived false; fork false; language unknown; topics none; pushed 2026-01-20T06:08:29.000Z; created 2024-02-03T12:48:13.000Z; license not reported; test count unknown.
- Host excluded [github:easystats/report](https://github.com/easystats/report). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 720 stars; 73 forks; archived false; fork false; R; topics anovas, apa, automated-report-generation, automatic, bayesian, describe, easystats, hacktoberfest, manuscript, models, r, r-package, report, reporting, reports, rstats, scientific, statsmodels; pushed 2026-10-22T00:41:18.000Z; created 2019-01-21T10:35:49.000Z; license NOASSERTION; test count unknown.
- Host excluded [github:vz-risk/veris](https://github.com/vz-risk/veris). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 652 stars; 178 forks; archived false; fork false; HTML; topics none; pushed 2026-10-14T19:34:36.000Z; created 2013-01-04T17:19:19.000Z; license NOASSERTION; test count unknown.
- Host excluded [github:veebch/photon](https://github.com/veebch/photon). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 601 stars; 62 forks; archived false; fork false; Python; topics none; pushed 2026-09-06T06:56:41.000Z; created 2022-06-21T18:04:39.000Z; license GPL-3.0 (metadata evidence); test count unknown.
- Host excluded [github:manymore13/report](https://github.com/manymore13/report). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 548 stars; 44 forks; archived false; fork false; HTML; topics report; pushed 2026-10-29T18:22:37.000Z; created 2024-01-30T12:24:32.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Rejected [github:dfirtrack/dfirtrack](https://github.com/dfirtrack/dfirtrack). Search metadata reported last activity 2026-01-13T14:54:31.000Z. Signals: 540 stars; 88 forks; archived false; fork false; Python; topics dfir, digital-forensics, incident-management, incident-response, incident-response-tooling; pushed 2026-01-13T14:54:31.000Z; created 2018-11-11T22:14:36.000Z; license NOASSERTION (tree evidence); 367 test files. Digital-forensics response tracking offers a weaker fit than C20, without metadata indicating collected source Reports or editorial publication gates. It adds no distinct inspection question.
- Host excluded [github:SREGym/SREGym](https://github.com/SREGym/SREGym). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 387 stars; 128 forks; archived false; fork false; Python; topics none; pushed 2026-10-29T17:44:18.000Z; created 2025-05-19T18:38:08.000Z; license MIT (metadata evidence); test count unknown.
- Selected [github:responsible-ai-collaborative/aiid](https://github.com/responsible-ai-collaborative/aiid), inspected at `97d184c5b22dc5b47e72b51bd597e1b735ce6028`, commit dated 2026-10-26T12:10:10.000Z, last activity reported 2026-10-28T17:23:13.000Z. Signals: 275 stars; 49 forks; archived false; fork false; JavaScript; topics ai, trustworthy-ai; pushed 2026-10-28T17:23:13.000Z; created 2019-01-27T20:07:47.000Z; license NOASSERTION (tree evidence); 123 test files. Closest domain fit: a database for identifying and cataloging incidents. Inspect how it distinguishes Reports from Incidents, groups source documents, reviews submissions and controls publication to inform R1, R2, R5 and R9.
- Rejected [github:roxy-wi/IncidentRelay](https://github.com/roxy-wi/IncidentRelay). Search metadata reported last activity 2026-10-29T05:16:57.000Z. Signals: 223 stars; 19 forks; archived false; fork false; Python; topics alert-routing, alerting, calendar, devops, incident-response, monitoring, on-call, on-call-management, on-call-rotation, on-call-scheduling, oncall, oncall-engineers, pagerduty-alternative, self-hosted, sheduling, shifter, sre; pushed 2026-10-29T05:16:57.000Z; created 2026-04-29T04:56:07.000Z; license NOASSERTION (tree evidence); 289 test files. On-call scheduling, alert routing and escalation address workflows outside stage 1, rather than evidence-backed incident cataloging and editorial review.
- Host excluded [github:reportportal/reportportal](https://github.com/reportportal/reportportal). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 2040 stars; 504 forks; archived false; fork false; Makefile; topics automated-testing, automation, reporting-engine, testing-tools; pushed 2026-10-27T09:07:53.000Z; created 2016-09-16T09:59:27.000Z; license Apache-2.0 (metadata evidence); test count unknown.
- Host excluded [github:dorny/test-reporter](https://github.com/dorny/test-reporter). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 1184 stars; 309 forks; archived false; fork false; TypeScript; topics ci-cd, github-actions, reporting, testing; pushed 2026-10-29T23:53:13.000Z; created 2020-10-01T20:53:23.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:microsoft/ReportingServicesTools](https://github.com/microsoft/ReportingServicesTools). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 516 stars; 220 forks; archived false; fork false; PowerShell; topics none; pushed 2026-10-28T18:41:50.000Z; created 2016-10-08T22:08:12.000Z; license MIT (metadata evidence); test count unknown.
- Host excluded [github:OCA/reporting-engine](https://github.com/OCA/reporting-engine). Reason: Passed the quality bar but was outside the shortlist of 6 tree-verified candidates. Signals: 445 stars; 940 forks; archived false; fork false; Python; topics erp, hacktoberfest, odoo, python; pushed 2026-10-29T13:58:36.000Z; created 2014-06-19T07:53:41.000Z; license AGPL-3.0 (metadata evidence); test count unknown.
- Host excluded [github:xai-org/grok-build](https://github.com/xai-org/grok-build). Reason: created 2026-07-14, younger than 180 days Signals: 27602 stars; 5206 forks; archived false; fork false; Rust; topics none; pushed 2026-09-29T16:57:13.000Z; created 2026-07-14T20:04:23.000Z; license Apache-2.0 (metadata evidence); test count unknown. Code search matched `official_source`.

## Reference comparison

### github:responsible-ai-collaborative/aiid

Commit: `97d184c5b22dc5b47e72b51bd597e1b735ce6028`, dated 2026-10-26T12:10:10.000Z; last activity reported 2026-10-28T17:23:13.000Z
Selection reason: Closest domain fit: a database for identifying and cataloging incidents. Inspect how it distinguishes Reports from Incidents, groups source documents, reviews submissions and controls publication to inform R1, R2, R5 and R9.

Patterns to adopt:

- Separate Report and Incident identity and preserve existing multi-Incident associations. ([site/gatsby-site/server/types/report.ts L1-L89](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts#L1-L89); [site/gatsby-site/server/types/incidents.ts L1-L118](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/incidents.ts#L1-L118); [site/gatsby-site/server/fields/incidents.ts L1-L191](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/incidents.ts#L1-L191))
  - Reference test (read, not run): The test asserts an existing Report remains associated with both Incidents and rejects nonexistent Report references. ([site/gatsby-site/server/tests/incidentExistingReports.spec.ts L1-L118](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/incidentExistingReports.spec.ts#L1-L118))
  - Reference test (read, not run): The multi-Incident promotion test asserts the same Report appears in both selected Incidents. ([site/gatsby-site/playwright/e2e/apps/submitted.spec.ts L87-L385](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/playwright/e2e/apps/submitted.spec.ts#L87-L385))
- Enforce publication authority in server mutations. ([site/gatsby-site/server/fields/submissions.ts L1-L297](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts#L1-L297); [site/gatsby-site/server/rules.ts L1-L366](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/rules.ts#L1-L366))
  - Reference test (read, not run): Non-editor promotion is refused while editor promotion succeeds. ([site/gatsby-site/server/tests/submissionAuthorization.spec.ts L1-L132](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/submissionAuthorization.spec.ts#L1-L132))
- Separate language-specific content and inspectable historical versions from current Report identity. ([site/gatsby-site/server/types/report.ts L1-L89](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts#L1-L89); [site/gatsby-site/server/types/reportHistory.ts L1-L41](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/reportHistory.ts#L1-L41))
  - Reference test (read, not run): Translation tests preserve language isolation and missing-language behavior. ([site/gatsby-site/server/tests/reports.spec.ts L1-L211](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/reports.spec.ts#L1-L211))
  - Reference test (read, not run): History tests exercise version dates, modifiers, display and restricted restoration. ([site/gatsby-site/playwright/e2e/reportHistory.spec.ts L1-L247](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/playwright/e2e/reportHistory.spec.ts#L1-L247))

Patterns to reject:

- Combine publication and Incident creation/linking in one promotion.: Official Report publication must be independent of accepted associations. ([site/gatsby-site/server/fields/submissions.ts L1-L297](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts#L1-L297))
- Expose the collected Report schema as publication content.: Full text, names, images and identifying URLs require a separate safe projection; immutable input provenance is also needed for derived prose. ([site/gatsby-site/server/types/report.ts L1-L89](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts#L1-L89); [site/gatsby-site/server/fields/reports.ts L1-L271](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/reports.ts#L1-L271))
- Delete rejected submissions.: The target retains private Rejected Reports and attributable decisions. ([site/gatsby-site/src/components/submissions/SubmissionList.js L1-L778](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/src/components/submissions/SubmissionList.js#L1-L778); [site/gatsby-site/playwright/e2e/apps/submitted.spec.ts L87-L385](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/playwright/e2e/apps/submitted.spec.ts#L87-L385))

Local adaptation: Keep E33/E34's local domain and Mac boundary. Use SQLite join tables, independent publication/Link gates, retained rejection history and safe bilingual projections. Immutable complete content provenance and Incident-scoped Harm are target designs, not behaviors established by these comparator tests. All cited tests were read, not run.

### github:openstatusHQ/openstatus

Commit: `f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62`, dated 2026-10-28T10:49:53.000Z; last activity reported 2026-10-28T20:29:30.000Z
Selection reason: Complementary TypeScript comparator with incident management, public status pages and a Turso topic. Inspect incident persistence and the boundary between authenticated management and public output for R6 and R9; exclude monitoring and on-call features.

Patterns to adopt:

- Validate contextual mutations and commit related rows with relationship-aware audit snapshots. ([packages/services/src/status-report/create.ts L1-L132](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts#L1-L132); [packages/services/src/status-report/update.ts L1-L253](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/update.ts#L1-L253); [packages/services/src/incident/link-status-report.ts L1-L163](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/incident/link-status-report.ts#L1-L163))
  - Reference test (read, not run): Creation tests assert related rows, associations and audits. ([packages/services/src/status-report/__tests__/status-report.test.ts L51-L236](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/__tests__/status-report.test.ts#L51-L236))
  - Reference test (read, not run): Tests assert membership-only and impact changes appear in audit snapshots. ([packages/services/src/status-report/__tests__/status-report.test.ts L886-L1411](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/__tests__/status-report.test.ts#L886-L1411))
  - Reference test (read, not run): The Link test exercises link/unlink values and associated events. ([packages/services/src/incident/__tests__/incident.test.ts L95-L608](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/incident/__tests__/incident.test.ts#L95-L608))

Patterns to reject:

- Enforce a one-to-one Incident/status-report association.: The target requires many Reports per Incident and potentially several Incidents per Report. ([packages/db/src/schema/incidents/incident.ts L1-L126](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/db/src/schema/incidents/incident.ts#L1-L126); [packages/services/src/incident/link-status-report.ts L1-L163](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/incident/link-status-report.ts#L1-L163))
- Adopt operational outage lifecycles, workspace roles and cloud deployment.: Those capabilities do not implement the local documentary review workflow. ([packages/db/src/schema/incidents/incident.ts L1-L126](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/db/src/schema/incidents/incident.ts#L1-L126); [package.json L1-L41](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/package.json#L1-L41); [.github/workflows/api-preview.yml L1-L80](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/.github/workflows/api-preview.yml#L1-L80))
- Use mutable updates and cascade deletion as the publication-version model.: The target needs immutable content/provenance and a last-approved Analysis pointer, plus retained rejection and rule-out history. ([packages/services/src/status-report/update.ts L1-L253](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/update.ts#L1-L253); [packages/services/src/status-report/__tests__/status-report.test.ts L298-L825](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/__tests__/status-report.test.ts#L298-L825))

Local adaptation: Implement the transaction/audit idea using native Bun SQLite and the Reviewer context required by E33/E34. Use one decision history, explicit many-to-many scoped contributions and target-specific failure injection. The cited tests do not establish native Codex isolation, durable AI-work recovery, animal deduplication or public-content provenance.

## Design decisions

### D1: Keep one local application

Use native Bun SQLite, server-rendered forms and one private store; retain the local domain and placement decisions.

The supplied local evidence establishes a Mac back office, not a runtime platform to reuse. Additional databases, worker services or comparator monorepos are unnecessary.

New design reason: Bun, TypeScript and SQLite are explicit constraints; native access is sufficient.
- The architecture places private processing on the Mac. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- The application is an Incident/Report database. (`CONTEXT.md#L1-L145`)
- Transactional relational patterns transfer independently of the comparator platform. ([packages/services/src/status-report/create.ts L1-L132](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts#L1-L132))

### D2: Enforce source eligibility through content lineage

Bind immutable content bytes to complete captured input revisions and transitive context. Validate current publication and applicable accepted Links at approval and emission; do not trust citation lists.

An anonymized Pending allegation remains private even after its identifiers disappear. Reviewer approval of an Analysis does not publish its underlying Pending Reports.

New design reason: The existing plan's inputReportIds and approved pointer did not prove complete input provenance. A bound processing envelope and read-time revalidation close that gap.
- Analysis is built from Published Reports and Pending Reports remain private. (`CONTEXT.md#L1-L145`)
- Private AI processing cannot bypass publication gates. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

### D3: Separate publication from associations

Official publication remains automatic where qualified, while Links, catalog changes, Evidence and Analysis versions require explicit decisions.

The target's official-unlinked workflow differs from comparator promotion that combines publication and Incident linking.
- Comparator promotion combines Report creation and optional Incident creation/linking. ([site/gatsby-site/server/fields/submissions.ts L1-L297](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts#L1-L297))
- Official Reports have no Incident effect until their Links are accepted. (`CONTEXT.md#L1-L145`)

### D4: Use explicit episode contribution scope

Persist reviewed affected Product pairs and bind every Harm assertion, observation and cohort to its own Report/Incident Link.

One document may describe unrelated Products and animal totals for several episodes. Report-level joins alone cannot allocate those facts safely.

New design reason: Explicit contribution provenance prevents Cartesian Product attribution and duplicated animal totals.
- Reports can cover several Incidents, but Harm and affected Products concern particular Incidents. (`CONTEXT.md#L1-L145`)
- Multiple Incident associations are legitimate. ([site/gatsby-site/server/fields/incidents.ts L1-L191](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/incidents.ts#L1-L191))

### D5: Preserve animal constraints instead of merging possible-match components

Calculate the minimum feasible animal assignment under confirmed-same, known-different and cohort constraints. Possible matches allow alternatives and do not force transitive union.

A possible-match bridge must not collapse two animals known to be distinct across separate Reports.

New design reason: Use a small exact TypeScript constraint search with explicit contradictions reported as ANIMAL_IDENTITY_CONFLICT; a component maximum loses cross-Report distinctness.
- Harm Counts measure distinct animals conservatively. (`CONTEXT.md#L1-L145`)

### D6: Persist work recovery independently of native conversations

Use the local AIWork state machine, process ownership, attempt tokens and transactional result application. Persist cancellation before native cancellation and reject obsolete results.

The Mac can stop between model invocation, receipt and publication. Native conversation history alone cannot establish which application effects committed.

New design reason: This prevents orphaned running work and duplicate/late effects without introducing another service.
- Processing pauses when the Mac is unavailable. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- Transactional related writes provide a transferable integrity pattern. ([packages/services/src/status-report/create.ts L1-L132](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts#L1-L132))

### D7: Verify the native credential boundary

Require a verified login-based interface with empty model tool capabilities and complete input-context capture. Keep credential use inside host authentication transport.

Inspecting only the initial prompt cannot detect credentials read through tools or inherited context.

New design reason: Supported native isolation remains the specific Draft gap. T1 verifies it and refuses invocation when unavailable.
- API keys and passwords are excluded from AI input. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

### D8: Restore priority-respecting feature sequencing

Keep shared schema, authentication and approval primitives early, then implement independent workflows in requirement priority order. R3/R4 depend on Reports and accepted Links, never on completed Market/Lot or catalog views.

Product/Hazard identifiers needed to validate a finding are minimal shared data prerequisites; completing R12 interfaces is not an evidence prerequisite.

New design reason: The repaired topological list places T8/T9 before T7 and removes lower-priority feature dependencies from T12, T10 and T11.
- Evidence and disputes depend on Report findings and Links; Markets/Lots are separately defined. (`CONTEXT.md#L1-L145`)

### D9: Deny unsafe owner links by default

Only verified handle-free platform forms produce owner hyperlinks; all unsupported forms produce platform/date attribution without a link.

The privacy rule applies beyond the two named examples.

New design reason: R6's general owner-link requirement needs a deny-by-default policy; tests include Mastodon and unknown platforms.
- Private owner material cannot be published. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

### D10: Use references as behavioral comparators

Write original target code using inspected identity, authorization, translation/history and transactional-audit patterns.

AIID is Apache-2.0 and Openstatus is AGPL-3.0 in the supplied evidence; neither whole platform is required. The uninspected Openstatus list implementation and missing AIID manifest are not used to establish target commands or adopted dependency behavior.
- AIID's supplied license is Apache-2.0. ([LICENSE.txt L1-L15](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/LICENSE.txt#L1-L15))
- Openstatus's supplied license is AGPL-3.0. ([LICENSE L1-L30](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/LICENSE#L1-L30))
- The target has its own local architecture. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

## Risks and open evidence

- The supported native Codex controls remain unverified. T1 must demonstrate login authentication, effective empty tool capabilities, complete input lineage and cancellation behavior; inability to establish them blocks dependent invocation rather than triggering a paid-key fallback. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- Generated prose can leak private allegations without exposing source IDs or owner names. T12 rejects ineligible immutable lineage at approval and emission, including inherited context and anonymized Pending allegations. (`CONTEXT.md#L1-L145`; `docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- Multi-Incident documents can misallocate Products, animals and official totals. Explicit pair and contribution scopes plus the T6/T10 negative fixtures prevent whole-Report joins from assigning every fact to every Incident. (`CONTEXT.md#L1-L145`; [site/gatsby-site/server/tests/incidentExistingReports.spec.ts L1-L118](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/incidentExistingReports.spec.ts#L1-L118))
- Possible-match bridges can erase known-distinct animals. T10 preserves cross-Report constraints and tests the three-observation bridge rather than relying on connected-component maxima. (`CONTEXT.md#L1-L145`)
- A Mac interruption can strand official intake or replay obsolete output. T1 defines persisted ownership and attempt states, and T4 explicitly terminates and restarts processing against the same store before expecting one automatic publication. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)

## Architecture and data design

Use one Bun process bound to loopback, server-rendered authenticated forms and one private SQLite database. Retain the domain definitions in E33 and the Mac/cloud boundary in E34. Report publication, accepted Links, Evidence decisions and Analysis approval remain independent gates. All human decisions derive their Reviewer from the session and atomically commit their effects and decision history. The application captures immutable document revisions and complete AI input manifests, including prior context and derived-content ancestors; displayed citations are not a substitute for provenance. Analysis approval and every publication projection revalidate exact source revisions and applicable accepted Links. Private processing may use Pending material, but that permission cannot make derived allegations public. Harm assertions, animal observations and cohorts bind to a particular Report/Incident Link. A single application-owned SQLite AI-work ledger handles attempts, cancellation, restart recovery and idempotent result application; native Codex retains responsibility for login and supported session/cancellation mechanisms. After shared persistence, identity and adapter prerequisites, deliver the R1 publication workflow, R2 gates and Links, R3 evidence, R4 disputes, R6 content, R7 Harm, R8 statistics, R9 queue, R10 catalog views, R11 intake forms and R12 Market/Lot workflows. R5 identity and relationships are shared prerequisites completed through T3/T5. Minimal referenced catalog, Hazard and Market records belong to those prerequisites; full lower-priority workflows do not block higher-priority features. The listed tasks are topologically ordered while retaining their existing IDs. Public projections are prepared and previewed locally; stage 1 deploys no public service.

### Modules and interfaces

- **Local runtime and persistence:** Own private SQLite migrations, document revisions, foreign keys, prepared queries, transactions and the single-process store lock.
  - Interface: openPrivateStore(configuration): Store
  - Interface: migrate(store): void
  - Interface: transaction<T>(work: (tx: Transaction) => T): T
  - Interface: upsertDocument(tx, identity, immutableRevision): ReportId
  - Evidence: The local decision places private collection, processing and review on the Mac. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: Reports have stored-once identity and Incidents have independent episode identity. (`CONTEXT.md#L1-L145`)
  - Evidence: The comparator uses SQLite relationships and actor references. ([packages/db/src/schema/status_reports/status_reports.ts L1-L119](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/db/src/schema/status_reports/status_reports.ts#L1-L119))
  - Evidence: Related writes and audit records share a transaction. ([packages/services/src/status-report/create.ts L1-L132](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts#L1-L132))
  - New design reason: The requested Bun/TypeScript/SQLite stack needs no distributed database, separate worker service or imported platform. Immutable revisions preserve the exact evidence used by approved content.
- **Reviewer access and decisions:** Authenticate independent Reviewer accounts, enforce handler access and apply typed decisions with revision checks, idempotency and actor-attributed history.
  - Interface: authenticate(login, password): ReviewSession
  - Interface: requireReviewer(session): ReviewerContext
  - Interface: decide(context, {proposalId, outcome, expectedRevision, commandId, reason}): DecisionResult
  - Interface: recordDecision(tx, context, before, after): ReviewDecision
  - Evidence: The comparator guards queued publication in the server mutation. ([site/gatsby-site/server/fields/submissions.ts L1-L297](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts#L1-L297))
  - Evidence: Mutations derive actors from context and write audit records transactionally. ([packages/services/src/status-report/create.ts L1-L132](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts#L1-L132))
  - Evidence: Association changes appear in before/after audit snapshots. ([packages/services/src/status-report/update.ts L1-L253](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/update.ts#L1-L253))
  - Evidence: The local Reviewer capability controls acceptance decisions. (`CONTEXT.md#L1-L145`)
  - New design reason: Use the single requested Reviewer capability, local provisioning and opaque sessions. A shared decision transaction prevents repeated clicks, stale review and partial approval without introducing another role or workflow engine.
- **Report intake and publication:** Decode the shared intake contract, deduplicate documents, exclude Echoes, resolve Source qualification and apply automatic official publication or Pending review.
  - Interface: decodeReportEnvelope(raw): {envelope: ReportEnvelopeV1, ignoredReservedFields: string[]}
  - Interface: ingest(context, envelope): IntakeResult
  - Interface: isOfficialReport(reportRevision, membership): boolean
  - Interface: publishEligibleReport(tx, reportRevision, contentVersion, publicationBasis): Report
  - Evidence: Named Source membership, Commissioned Tests, Echoes and publication states have separate meanings. (`CONTEXT.md#L1-L145`)
  - Evidence: The comparator separates queued material from published Reports. ([site/gatsby-site/server/fields/submissions.ts L1-L297](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts#L1-L297))
  - Evidence: Private originals and intake processing belong on the Mac. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: Decode into an explicit allowlist and discard reserved publication, approval, Reviewer and official-status fields, recording their names privately. Importers never write raw input back after ingestion. Centralize effective Official Report qualification so commissioned material cannot regain official status in evidence or Harm queries.
- **Incident, catalog and evidence commands:** Own episode identity, accepted Links, explicit affected Product pairs, evidence eligibility, Stance, corrections and Ruled Out history. Add full catalog and Market/Lot workflows in priority order.
  - Interface: proposeIncidentLink(reportId, target): ProposalId
  - Interface: acceptIncidentLink(context, proposalId, expectedRevision): IncidentLinkResult
  - Interface: approveAffectedPairs(context, explicitlySelectedPairs): IncidentProduct[]
  - Interface: assessEvidence(incidentId, level, supportingClaims, rationale): EvidenceAssessment
  - Interface: approveCorrectionStatement(context, requestId, explicitDecisions): CorrectionResult
  - Evidence: The comparator preserves existing Report associations when another Incident is created. ([site/gatsby-site/server/fields/incidents.ts L1-L191](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/incidents.ts#L1-L191))
  - Evidence: Reports and Incidents have separate types. ([site/gatsby-site/server/types/incidents.ts L1-L118](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/incidents.ts#L1-L118))
  - Evidence: The relational comparator validates associations before committing them. ([packages/services/src/status-report/create.ts L1-L132](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts#L1-L132))
  - Evidence: The target requires episode identity, accepted Links and Report-derived catalog associations. (`CONTEXT.md#L1-L145`)
  - New design reason: Affected pairs must be selected explicitly from a Report's scoped claims. Neither two accepted Link lists nor a shared Manufacturer establishes every possible Incident/Product combination. Evidence matching uses the finding's Product and Hazard scope.
- **Private AI adapter and work recovery:** Invoke the verified native login interface using bounded inputs and no model-accessible filesystem, shell, network or MCP tools. Capture full input lineage, persist work attempts and recover interrupted processing without granting approval authority.
  - Interface: buildPrivateInput(task, explicitMaterial): ImmutableInputManifest
  - Interface: runPrivateTask(manifest, {attemptToken, abortSignal}): Promise<ValidatedAIResult>
  - Interface: cancelWork(workId): void
  - Interface: recoverInterruptedWork(store, processOwner): RecoveryResult
  - Interface: applyAIResult(tx, workId, attemptToken, resultHash): ApplyResult
  - Evidence: Private Codex processing may read Pending material, but credentials are excluded and the Mac may pause processing. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: AI output remains subject to publication and Reviewer gates. (`CONTEXT.md#L1-L145`)
  - New design reason: T1 must verify the native transport and effective tool restrictions. Credential access needed by the native authentication transport stays outside model context. The application ledger, attempt tokens and transactional result application are necessary because native conversation history alone does not establish that a local Report was published or a proposal applied.
- **Publication content and provenance:** Store immutable bilingual content versions, bind them to complete input lineage, validate source and Link eligibility on approval and emission, anonymize content and select the last approved Analysis version.
  - Interface: submitAnalysisVersion(subject, processingEnvelopeId, contentHash): ProposalId
  - Interface: validateContentProvenance(tx, version, publicationContext): EligibilityResult
  - Interface: approveAnalysisVersion(context, versionId, expectedRevision): ReviewDecision
  - Interface: projectPublishedReport(reportId, locale): PublicReport | null
  - Interface: getLastApprovedAnalysis(subject, locale): PublicAIAnalysis | null
  - Interface: publicOwnerLink(platform, originalUrl): SafeUrl | null
  - Evidence: The comparator separates Report translations by language. ([site/gatsby-site/server/types/report.ts L1-L89](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts#L1-L89))
  - Evidence: The comparator separates historical Report content from current identity. ([site/gatsby-site/server/types/reportHistory.ts L1-L41](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/reportHistory.ts#L1-L41))
  - Evidence: AI Analysis is built from Published Reports and each public version needs approval. (`CONTEXT.md#L1-L145`)
  - Evidence: Private processing permission does not bypass publication gates. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: Caller-supplied citation IDs cannot establish what the model read. Require an immutable processing envelope binding output bytes to all input revisions and inherited context; untracked pasted content stays private. Revalidation prevents an approved pointer from laundering Pending allegations or stale eligibility.
- **Harm and statistics queries:** Compute Incident-scoped official assertions and owner lower bounds, preserve animal identity constraints, derive dates from all accepted Stances and count distinct Incidents by dimension and Evidence Level.
  - Interface: getHarmHeadline(incidentId): AttributedOfficialCount | OwnerLowerBound
  - Interface: minimumDistinctAnimals(incidentId, species, outcome, identityConstraints): number
  - Interface: getIncidentDate(incidentId): SourceDocumentDate | null
  - Interface: getStatistics(filters): EvidenceLevelBuckets
  - Interface: getBrandManufacturerContext(brandId): ContextIncident[]
  - Evidence: Harm belongs to a particular Incident; a Report can cover several Incidents, and Incident Date uses its earliest linked Published Report. (`CONTEXT.md#L1-L145`)
  - New design reason: Scope every count contribution through its Report/Incident Link. Calculate a minimum feasible animal assignment that preserves known-same, known-different and cohort constraints; possible-match edges are not transitive identity. Use direct distinct-Incident queries rather than summed Report rows.
- **Review page and daily queue:** Present authenticated inline review forms, ranked duplicate groups, private supporting evidence, processing diagnostics, manual intake, import and safe publication previews.
  - Interface: getQueue(context, filters): ReviewQueuePage
  - Interface: getReviewItem(context, reference): ReviewItem
  - Interface: handleReviewForm(context, form): DecisionResult
  - Interface: renderPublicationPreview(context, subject, locale): HTML
  - Evidence: The comparator provides a filtered submission queue and explicit review actions. ([site/gatsby-site/src/components/submissions/SubmissionList.js L1-L778](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/src/components/submissions/SubmissionList.js#L1-L778))
  - Evidence: Server permissions enforce authority independently of visible controls. ([site/gatsby-site/server/fields/submissions.ts L1-L297](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts#L1-L297))
  - Evidence: The local workflow distinguishes Pending Reports, Proposed Links, Analysis versions and Correction Requests. (`CONTEXT.md#L1-L145`)
  - New design reason: One server-rendered workspace completes the requested journey. Queue rows reference owning records instead of duplicating their decision states; processing diagnostics do not become additional publication approvals.

### Data model

- **Reviewer and ReviewSession:** Reviewer: id, unique login, display_name, password_hash, enabled, ReviewSession: hashed opaque token, reviewer_id, expires_at, One Reviewer capability; local provisioning and no public signup
  - Evidence: Reviewer identifies the person deciding approvals. (`CONTEXT.md#L1-L145`)
  - Evidence: Review remains private on the Mac. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: R9 requires independent accounts and attributable sessions rather than a shared password.
- **Source and OfficialSourceMembership:** Source: id, name, category, original-origin identifiers, Membership: source_id, explicit named-list qualification, accreditation note, decision_id, Report qualification records the relevant membership and Commissioned Test exclusion
  - Evidence: Accreditation alone is insufficient and Commissioned Tests are never Official Source Reports. (`CONTEXT.md#L1-L145`)
- **Report and ReportRevision:** Report: id, source_id, unique document identity, publication_state, published_revision_id, published_content_version_id, revision, ReportRevision: immutable revision_id, report_id, source_document_date, original reference, full-text hash, private text/attachments, owner identifiers, Collected document type, commissioning details, finding kind, Product/Hazard scope and result, Publication eligibility identifies the exact reviewed or automatically qualified revision; changing content creates a new revision, A removed original changes availability metadata without erasing the retained document or approved summary
  - Evidence: The comparator retains document identity, source metadata, dates and original content. ([site/gatsby-site/server/types/report.ts L1-L89](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts#L1-L89))
  - Evidence: The target stores each collected document once with distinct publication states. (`CONTEXT.md#L1-L145`)
  - New design reason: Immutable revision references prevent approved content from silently acquiring newly edited Pending material while preserving one Report identity.
- **IntakeReceipt:** id, schema_version, entry_method, document identity, fingerprint, received_at, private candidate revision reference, work_id, resulting_report_id, ignored_reserved_field_names, Echo exclusion retains only an outcome and fingerprint, not collected content
  - Evidence: Reports are stored once and Echoes are excluded. (`CONTEXT.md#L1-L145`)
  - Evidence: Mac processing can pause. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: Receipts make retry and import identity durable before successful content preparation without introducing another collected Report.
- **AIWork:** id, task_kind, immutable_manifest_id, input_hash, unique application_key, state: queued, running, retry_wait, blocked_auth, result_ready, completed, cancelled or failed_validation, attempt_number, unpredictable attempt_token, process_owner, lease_expiry, next_retry_at, native operation reference, cancellation timestamp, validated_result_hash, private result reference, applied_at, redacted error_code, Startup recovery owns orphaned running attempts; result_ready resumes application; cancelled/completed work is not reclaimed, Only the current attempt token and unchanged input revision may apply; completed is written in the same transaction as its effects
  - Evidence: Processing pauses while the Mac is unavailable and private processing cannot bypass review. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: Persisted states, ownership and generation tokens prevent permanently running official intake, duplicate results and late output after cancellation. One local table is sufficient.
- **ContentProvenance:** immutable manifest_id, task purpose, subject, complete input revision references and hashes, Prior model-context and derived-content parent manifests; acyclic transitive lineage, Effective model capabilities, native operation reference where verifiable, captured input hash and output content hash, Application-captured lineage cannot be replaced by model citations or caller-provided inputReportIds, Analysis eligibility requires every contributing Report revision to remain Published and applicable subject Links to be accepted, A Report summary can publish its own bound revision atomically through that Report's normal gate; unrelated Pending inputs remain forbidden
  - Evidence: Analysis is built from Published Reports and Pending Reports are private. (`CONTEXT.md#L1-L145`)
  - Evidence: The private AI exception does not authorize publication. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: Complete immutable lineage closes the gap where anonymized prose republishes a Pending allegation after citations are removed. Unverifiable input context fails closed.
- **LocalizedReportContent:** id, report_revision_id, manifest_id, immutable content_hash, English and zh-Hant summary and quote, AI-written and AI-translation labels, Privacy validation, source availability marker and normal Report publication basis, No embedded raw owner URL or private source-field serialization
  - Evidence: Language-specific Report content is represented separately. ([site/gatsby-site/server/types/report.ts L1-L89](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts#L1-L89))
  - Evidence: The local Summary is Report-specific and AI-labeled. (`CONTEXT.md#L1-L145`)
  - New design reason: R6 needs safe bilingual snippets bound to the source revision and processing lineage.
- **Incident:** id, episode identity, title, created_at, revision, approved_evidence_assessment_id, ruled_out_decision_id, approved_analysis_version_id, Disputed is derived from effective contradicting Links, Incident Date is the minimum source date across effective accepted Links of either Stance
  - Evidence: The comparator represents independent Incidents associated with Reports. ([site/gatsby-site/server/types/incidents.ts L1-L118](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/incidents.ts#L1-L118))
  - Evidence: A Report can retain associations with several Incidents. ([site/gatsby-site/server/fields/incidents.ts L1-L191](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/incidents.ts#L1-L191))
  - Evidence: The local episode, date, evidence and dispute concepts are separate. (`CONTEXT.md#L1-L145`)
  - New design reason: Create the row only on accepted episode proposal; public visibility also requires eligible Published evidence and an approved initial assessment.
- **Proposal:** id, typed kind, subject or proposed-new-entity payload, input provenance, expected_subject_revision, AIWork reference, proposed episode key, decision_id, Kinds include both Link types, catalog entries, Evidence changes and Analysis versions, No accepted domain row is implied by a high AI rank
  - Evidence: Proposed Links have no public effect. (`CONTEXT.md#L1-L145`)
  - New design reason: Typed payloads retain suggestions without a generic patch engine or duplicate queue state.
- **ReviewDecision:** id, authenticated reviewer_id, unique command_id, target, action, outcome, reason, decided_at, expected_revision, before_snapshot, after_snapshot including relationships, Append-only and atomic with its effects, Automatic publication records policy provenance separately from human decisions
  - Evidence: Contextual actor attribution and audit writes accompany related changes. ([packages/services/src/status-report/create.ts L1-L132](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts#L1-L132))
  - Evidence: Association-only changes are included in snapshots. ([packages/services/src/status-report/update.ts L1-L253](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/update.ts#L1-L253))
  - Evidence: Accepted changes require Reviewer authority. (`CONTEXT.md#L1-L145`)
  - New design reason: Session-derived attribution, expected revisions and idempotent command IDs address spoofed, stale and repeated decisions.
- **ReportIncidentLink and ReportProductLink:** Incident Link: id, report_id, accepted_report_revision_id, incident_id, Stance, decision_id, Product Link: id, report_id, accepted_report_revision_id, product_id, decision_id, Unique Report/target pairs and foreign keys, Public effects require the bound Report revision to be eligible
  - Evidence: The comparator provides explicit Report/Incident association operations. ([site/gatsby-site/server/fields/incidents.ts L1-L191](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/incidents.ts#L1-L191))
  - Evidence: The target requires accepted Links and allows multiple Incidents per Report. (`CONTEXT.md#L1-L145`)
  - New design reason: Revision binding prevents accepted Links from silently validating a different source revision.
- **Manufacturer, Brand and Product:** Manufacturer: id, name, mentioning_report_revision_id, quoted mention, decision_id, Brand: id, name, mentioning_report_revision_id, quoted mention, decision_id, approved_analysis_version_id, Product: id, brand_id, formula, dog/cat scope, complete-diet form, mentioning_report_revision_id, quoted mention, decision_id
  - Evidence: Catalog entities arise from Report mentions; Products are complete dog/cat formulas under Brands. (`CONTEXT.md#L1-L145`)

### Invariants

- Report identity is stored once and does not change when publication state, revisions or Incident associations change.
  - Evidence: Reports are stored-once documents and can belong to several Incidents. (`CONTEXT.md#L1-L145`)
  - Evidence: Existing Report associations can survive another Incident association. ([site/gatsby-site/server/fields/incidents.ts L1-L191](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/incidents.ts#L1-L191))
- Effective official qualification requires named-list membership and a non-Commissioned Report. The same predicate governs automatic publication, Official Findings and official Harm headlines; later Reviewer publication does not turn a Commissioned Test into an Official Source Report.
  - Evidence: Commissioned Tests are never treated as Official Source Reports, whoever performs them. (`CONTEXT.md#L1-L145`)
- Every public content version has complete immutable input lineage. Analysis approval and projection reject a contributing Pending, Rejected, retired or mismatched Report revision and any missing applicable accepted Link. Removing identifiers or citations does not remove lineage.
  - Evidence: Pending material is private and Analysis is built from Published Reports. (`CONTEXT.md#L1-L145`)
  - Evidence: Private processing does not bypass normal publication gates. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: Approval status and anonymization alone cannot prove that an allegation was eligible for publication.
- Report publication never implicitly approves Links, catalog entries, Evidence changes or Analysis versions. Human decisions use the authenticated Reviewer and atomically commit their effects and history.
  - Evidence: Only accepted Links affect Incidents, even for official Reports. (`CONTEXT.md#L1-L145`)
  - Evidence: Domain changes and audit records share a transaction. ([packages/services/src/status-report/create.ts L1-L132](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts#L1-L132))
  - Evidence: Relationship effects are included in audit snapshots. ([packages/services/src/status-report/update.ts L1-L253](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/update.ts#L1-L253))
  - New design reason: Expected revisions and unique command IDs make stale decisions and repeated submissions explicit.
- Accepted affected Product pairs are exactly the reviewed scoped pairs, never the Cartesian product of a Report's Incident and Product Links.
  - Evidence: A Report can cover several Incidents affecting different Products. (`CONTEXT.md#L1-L145`)
  - New design reason: Independent accepted Link lists establish membership, not which Product belongs to which episode.
- Confirmed evidence supports the particular Incident's Product and Hazard. An official lab finding of Salmonella cannot confirm an aflatoxin Incident solely because the Product matches.
  - Evidence: Confirmed requires a supporting Official Finding, including a Lab Test finding the Hazard. (`CONTEXT.md#L1-L145`)
- Harm assertions, observations and cohorts contribute only through their own effective Report/Incident Link. A Report's other accepted Incident Links receive none of that contribution automatically.
  - Evidence: Harm Counts concern a particular Incident while Reports may cover several. (`CONTEXT.md#L1-L145`)
  - New design reason: Explicit scope prevents both official aggregate counts and individual animals from being copied across episodes.
- Possible animal matches are not transitive identity. Compute a minimum feasible assignment preserving all known-same, known-different and cohort-distinctness constraints; reject contradictory constraints rather than silently merging them.
  - Evidence: Known or possible duplicate animals count conservatively once, while counts measure distinct animals. (`CONTEXT.md#L1-L145`)
  - New design reason: Two known-different animals remain at least two when a third observation could match either. A connected-component maximum cannot preserve that constraint.
- The worker owns AIWork transitions. Cancelled, superseded or expired attempts cannot apply late results. Startup reclaims orphaned running work, and result effects plus completed state commit once in the same transaction.
  - Evidence: The Mac can stop processing and private AI output retains normal gates. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: Persisted ownership and attempt tokens prevent stuck official intake and post-cancellation mutations.
- The effective model tool capability set is empty for these tasks. Credentials remain in host authentication transport and never enter prompts, model-readable files, inherited context or tool results.
  - Evidence: API keys and passwords must never be sent to AI. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: A clean initial prompt is insufficient if document instructions can invoke credential-reading tools.
- Disputed and Ruled Out remain separate from Evidence Level. Ruled Out history stays visible but is statistically excluded. Evidence calculations require supporting Stance; Incident Date considers accepted Links of either Stance.
  - Evidence: The glossary separately defines Stance, disputes, rule-out, Evidence Level and the earliest linked Report date. (`CONTEXT.md#L1-L145`)
- Publication projections exclude private fields and embedded owner identifiers in both languages. Owner hyperlinks are denied by default unless a verified handle-free form is available; unsupported platforms show platform/date only.
  - Evidence: Private material must not be published. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: AI content is labeled and publication-controlled. (`CONTEXT.md#L1-L145`)
  - New design reason: An X/Threads special case is insufficient for arbitrary owner-post platforms.

### Access control

- **Browser to private back office:** Bind to loopback; authenticate private pages, attachments, previews and actions. Use password hashing, expiring opaque sessions, HttpOnly SameSite cookies and same-origin/CSRF checks. Provision real Reviewer accounts locally without public signup.
  - Evidence: The back office remains private on the Mac. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - Evidence: Reviewer is the decision-making capability. (`CONTEXT.md#L1-L145`)
  - New design reason: Page-only protection would leave private handlers and attachments exposed.
- **AI to approved application state:** AI returns validated suggestions or prepared content. It cannot call Reviewer decision commands or provide actor identity. Automatic official publication is a narrow application policy and never approves associations or Analysis versions.
  - Evidence: Publication authority is guarded server-side. ([site/gatsby-site/server/fields/submissions.ts L1-L297](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts#L1-L297))
  - Evidence: Proposals have no public effect. (`CONTEXT.md#L1-L145`)
  - Evidence: Private AI processing retains normal gates. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
- **Mac to native Codex processing:** Use the existing login through a verified native transport. Supply explicit Report material only, with no model filesystem, shell, network, MCP tools or inherited unrelated session context. Verify effective capabilities and model-visible context, not just the initial prompt. If isolation cannot be established, refuse invocation with AI_ISOLATION_UNAVAILABLE.
  - Evidence: Private text and owner handles are allowed inputs, but credentials are forbidden. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: T1 must establish enforceable native controls; the supplied evidence does not prove their availability.
- **Raw import to authoritative state:** Decode raw records once into an allowlisted envelope. Discard and report reserved state/approval/Reviewer/official-status fields; never merge raw records after the shared service returns. Resolve Source qualification from the maintained list. Reject catalog-record imports.
  - Evidence: Catalog creation and publication have explicit provenance and review rules. (`CONTEXT.md#L1-L145`)
  - New design reason: This prevents a caller-supplied publication_state from overriding a correct shared-service decision.
- **Private content to publication projection:** Check version approval, complete immutable lineage, exact published source revisions, relevant accepted Links and privacy on both approval and emission. Fail closed without emitting affected prose when provenance is missing or ineligible. Private triage results remain private.
  - Evidence: Analysis draws from Published Reports and Pending Reports remain private. (`CONTEXT.md#L1-L145`)
  - Evidence: Processing permission is distinct from publishing. (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`)
  - New design reason: Anonymization and an approved pointer cannot substitute for source eligibility.

## Stack

Each brick is a module of the plan or an entity of its data model, from the bottom up. `stack.html` in the run folder shows the files behind each brick.

| Brick | Name | Reference repositories | New design |
| --- | --- | --- | --- |
| 01 (data) | `Reviewer and ReviewSession` | local project | yes |
| 02 (data) | `Source and OfficialSourceMembership` | local project | no |
| 03 (data) | `Report and ReportRevision` | `responsible-ai-collaborative/aiid`, local project | yes |
| 04 (data) | `IntakeReceipt` | local project | yes |
| 05 (data) | `AIWork` | local project | yes |
| 06 (data) | `ContentProvenance` | local project | yes |
| 07 (data) | `LocalizedReportContent` | `responsible-ai-collaborative/aiid`, local project | yes |
| 08 (data) | `Incident` | `responsible-ai-collaborative/aiid`, local project | yes |
| 09 (data) | `Proposal` | local project | yes |
| 10 (data) | `ReviewDecision` | `openstatusHQ/openstatus`, local project | yes |
| 11 (data) | `ReportIncidentLink and ReportProductLink` | `responsible-ai-collaborative/aiid`, local project | yes |
| 12 (data) | `Manufacturer, Brand and Product` | local project | no |
| 13 | `Local runtime and persistence` | local project, `openstatusHQ/openstatus` | yes |
| 14 | `Reviewer access and decisions` | `responsible-ai-collaborative/aiid`, `openstatusHQ/openstatus`, local project | yes |
| 15 | `Report intake and publication` | local project, `responsible-ai-collaborative/aiid` | yes |
| 16 | `Incident, catalog and evidence commands` | `responsible-ai-collaborative/aiid`, `openstatusHQ/openstatus`, local project | yes |
| 17 | `Private AI adapter and work recovery` | local project | yes |
| 18 | `Publication content and provenance` | `responsible-ai-collaborative/aiid`, local project | yes |
| 19 | `Harm and statistics queries` | local project | yes |
| 20 | `Review page and daily queue` | `responsible-ai-collaborative/aiid`, local project | yes |

## Evidence gaps

- Informational (local): No local test file was found in the bounded file list; the plan should establish the target project's test conventions or add them.
- Informational (file): The file list for model selection left out 152 lower-ranked files to stay within 300,000 characters.
- Informational (local): The local project has no indexed manifest file; new-project verification commands will be planned as to_create.
- Informational (local): The local project has no indexed license file; new-project verification commands will be planned as to_create.
- Informational (local): The local project has no indexed ci file; new-project verification commands will be planned as to_create.
- Material (repository): responsible-ai-collaborative/aiid has no indexed manifest file at 97d184c5b22dc5b47e72b51bd597e1b735ce6028.
- Material (repository): The selected file packages/services/src/status-report/list.ts from openstatusHQ/openstatus exceeded the 24-file remote source budget.

## Draft reasons

- The supplied evidence does not establish a supported Codex-login invocation interface with enforceable model-tool isolation, complete input-context provenance and cancellation behavior. T1 must inspect the supported native interfaces and demonstrate those controls before finalizing the adapter. The remaining application design and verification are specified below.
- responsible-ai-collaborative/aiid has no indexed manifest file at 97d184c5b22dc5b47e72b51bd597e1b735ce6028.
- The selected file packages/services/src/status-report/list.ts from openstatusHQ/openstatus exceeded the 24-file remote source budget.
- Independent review left blocking or material findings unresolved.

## Independent review

Review 1: 4 finding(s), 12 surviving mutant(s).

- material: The public-content boundary does not specify how AI content provenance is checked. submitAnalysisVersion accepts inputReportIds, but approval and projection checks focus on version status and anonymization. An approved Analysis could therefore republish allegations taken from a still-Pending Report, despite the invariant forbidding Pending material from contributing public content. (R1, R2, R6) (`CONTEXT.md#L1-L145`; `docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`) Correction: Bind each content version to immutable input provenance and validate applicable Report publication and Link eligibility before approving or emitting it; add a case where anonymized Analysis prose incorporates a Pending Report's allegation.
- material: Harm assertions and animal observations are described as Report-attributed, without an explicit association identifying which Incident each assertion concerns. Because one Report can cover several Incidents, joining its entire animal set to every accepted Incident Link would assign unrelated animals and official totals to each Incident. (R5, R7) (`CONTEXT.md#L1-L145`) Correction: Define Incident-specific provenance for count assertions, animal observations and cohorts through the relevant accepted Report/Incident Link, and verify a single document containing different counts for two Incidents.
- material: T1 promises cancellation and error verification, but T1-V1 specifies only a successful synthetic round trip. The persisted AIWork lifecycle, interrupted-work recovery and treatment of late results are also undefined. T4's retry check does not require reopening the application after interruption, so automatic official publication can remain permanently stuck. (R1, R2, R9) (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`) Correction: Define persisted work states, recovery ownership and idempotent result application, then add timeout, authentication failure, cancellation, late-result and process-restart checks that preserve review gates.
- material: The task dependencies impose lower-priority feature completion before higher-priority requirements: T8 implements R3 only after T7 completes R12, and consequently R4 also waits for Markets and Lots. This contradicts the clarified instruction to implement the requirements in their stated priority order; no Evidence Level rule requires completed Market or Lot functionality. (R3, R4, R12) (`CONTEXT.md#L1-L145`) Correction: Replace these dependencies with the minimal shared data prerequisites and sequence independent feature completion according to the required priority order.
- surviving mutant for A9: Construct a credential-free prompt but invoke native Codex with filesystem tools able to read credential-bearing files; instructions embedded in a Report can cause those credentials to enter model context through tool results. Planned checks would pass: T1-V1 inspects application-owned input before invocation and uses benign synthetic material. Its environment-canary mutant exercises prompt construction, without testing document-driven tool access or credential-bearing tool results. The approved-state snapshot can remain unchanged.
- surviving mutant for A48: After calling the shared intake service, the importer copies a caller-supplied publication_state from the raw record onto the stored Report, allowing an unofficial Report to become Published. Planned checks would pass: T14-V1 compares ordinary conforming records that omit reserved state fields. Those records, commissioned-test cases and retries behave correctly. T6's forbidden catalog-record case and T15's decision-handler matrix do not exercise an import containing a forged publication state.
- surviving mutant for A4: Allow an Analysis version to incorporate a Pending Report's allegation, remove its identifiers and citations, and publish that prose when the Analysis version is approved while leaving the Report Pending. Planned checks would pass: T4-V1 can omit every Pending Report ID and nested reference while the allegation survives as prose. T12-V1 checks privacy canaries and approved-version selection, and T15-V1 checks approval boundaries; none specifies rejection of an approved Analysis whose input provenance includes Pending material.
- surviving mutant for A45: For a multi-recall roundup, populate affected Incident/Product pairs using the Cartesian product of its accepted Incident Links and Product Links, assigning each mentioned Product to every covered Incident. Planned checks would pass: T5-V1 checks preserved Incident associations and one stored Report without specifying exact affected Product pairs. T6's association fixtures and T11's shared-Manufacturer fixture can still pass: the faulty mapping only appears when one document covers different Products in different Incidents. The named shared-Manufacturer query mutant remains rejected.
- surviving mutant for A13: Validate that an official Lab Test names the Incident's Product but ignore whether its finding concerns the Incident's Hazard, allowing a Salmonella finding to Confirm an aflatoxin Incident. Planned checks would pass: T8-V1 names qualifying finding types and generic alerts without a relevant Product, but no same-Product, different-Hazard negative case. Matching positive fixtures pass, and the named generic-alert mutant is still rejected because Product matching remains enforced.
- surviving mutant for A30: Once a Reviewer publishes a Commissioned Test from a listed lab, classify its animal count as official solely through the lab's Source List membership and let it replace a genuine official headline. Planned checks would pass: T4-V1 correctly keeps the commissioned test Pending initially, and T8-V1 can independently exclude it from Official Finding qualification. T10-V1 does not specify a subsequently approved commissioned-count fixture; its latest-date, smaller-count, attribution and unknown-value cases all pass.
- surviving mutant for A31: Count every animal described in an approved owner Report toward every Incident linked to that Report, even when the document explicitly assigns different animals to different episodes. Planned checks would pass: T10-V1's described fixtures exercise animal multiplicity and deduplication within an Incident. T5-V1's roundup checks association cardinality, without Incident-specific Harm assertions. Publication and statistics checks do not specify the expected animal allocation for such a roundup.
- surviving mutant for A32: Merge possible matches into connected components and use the largest within-Report distinct count as each component's lower bound. Two animals known to be different across separate Reports collapse to one when a third observation could match either. Planned checks would pass: The listed T10-V1 cases can all pass separately: repeated pets, possible pairs, known different pets, within-Report distinct animals and overlapping cohorts of three and five. No planned case combines a possible-match bridge with a known-distinct constraint spanning Reports.
- surviving mutant for A2: Persist an official intake's AI work as running, but never reclaim running work after application termination. Restarting leaves the official Report indefinitely in intake preparation. Planned checks would pass: T4-V1 can demonstrate retry after a caught failure within one process. T1-V1 performs a successful invocation, and T14-V1 retries completed imports. No planned check terminates the process during work and verifies automatic publication after reopening the same store.
- surviving mutant for A28: Set the public Analysis pointer on the first approval and never advance it when a later version is approved. Planned checks would pass: T12-V1's stated cases establish that Pending and Rejected newer versions cannot replace approved version 1. T15-V1 can verify a first approval correctly. Neither explicitly requires two successive approved versions and an assertion that the second replaces the first.
- surviving mutant for A35: Compute Incident Date from Published Reports with accepted supporting Links only, excluding an earlier Published Report whose accepted Stance is contradicts. Planned checks would pass: T11-V1 specifies backfilled documents and Confirmation changes without an earlier contradicting Report. T9-V1 checks Stance and Disputed behavior separately, without checking Incident Date. Collection-date and Confirmation-reset mutants are still rejected.
- surviving mutant for A26: Normalize X links, omit Threads links, and otherwise return the original URL for owner posts, exposing a Mastodon owner's handle through its post URL. Planned checks would pass: T12-V1 explicitly exercises X and Threads, so both platform cases and the named Threads fallback mutant are handled correctly. No planned fixture exercises another owner-post platform lacking an eligible handle-free link.

Review 2: 4 finding(s), 12 surviving mutant(s).

- material: T12 binds Report content and Analysis versions to provenance, but Incident.title and other AI-proposed public Incident facts have no specified content-manifest binding. Accepting a Link could therefore expose an allegation drawn from another Pending Report despite the Report and Analysis checks. (R1, R2, R6) (`CONTEXT.md#L1-L145`; `docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`) Correction: Apply provenance eligibility to publicly emitted Incident titles and claims, and add a fixture where triage derives an Incident title from mixed Published and Pending inputs.
- material: The review page displays untrusted Report material and AI output, but the plan specifies no inert rendering boundary for these fields or active attachments. Script execution in the authenticated page could invoke approval commands using the Reviewer's session and defeat the intended human decision boundary. (R2, R6, R9) (`CONTEXT.md#L1-L145`; `docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`) Correction: Specify escaped text rendering, sanitization for permitted markup and isolation of active attachments; add a browser check that malicious Report and AI content cannot execute or submit decisions.
- material: The credential checks cover environment injection and tool-mediated file reads, but not credentials already present in permitted Report fields. A credential-bearing original URL could enter model context while satisfying the empty-tool and explicit-material restrictions. (R2) (`docs/adr/0001-mac-back-office-cloud-public-site.md#L1-L14`; `CONTEXT.md#L1-L145`) Correction: Define credential-safe model serialization for source references and add credential canaries inside allowlisted Report URLs and material, checking complete model context and diagnostics.
- material: The explicit catalog data model gives Product a brand_id but defines no persisted Product-to-Manufacturer relationship. T6 requires Manufacturer inheritance and multiple-Manufacturer fixtures, yet the documented schema cannot express the join those queries require. (R10) (`CONTEXT.md#L1-L145`) Correction: Specify the persisted Product-to-Manufacturer association, its Report and decision provenance, and its use in Manufacturer inheritance and shared-Manufacturer context queries.
- surviving mutant for A5: Render collected Report HTML or AI output directly in the authenticated review page. An embedded script reads the page's CSRF token and submits approval commands using the Reviewer's session. Planned checks would pass: T5-V1 and T15-V1 test command authorization, proposal states, actor spoofing and replay. The malicious requests carry a valid session and valid command fields. No planned browser fixture checks that untrusted displayed content cannot execute those requests.
- surviving mutant for A4: Validate lineage for Report summaries and Analysis versions, but copy an AI-proposed Incident title directly into the Incident. A title derived from a Pending allegation becomes public after an unrelated Published Report is Linked. Planned checks would pass: T4-V1 excludes Pending Report records from readers. T12-V1 tests tainted Analysis and transformed summary versions. Neither specifies a mixed-input triage title fixture or provenance validation for the separately stored Incident.title field.
- surviving mutant for A9: Keep environment variables and tools out of model context, but serialize an original Report URL containing an API key or password unchanged into the private AI input. Planned checks would pass: T1-V1 places credential canaries in environment or credential files and tests attempted tool reads. T1-V2 checks work lifecycle behavior, and T12-V1 checks publication provenance. None places a credential inside otherwise permitted Report material.
- surviving mutant for A13: Check Hazard scope for Lab Tests, but accept any warning letter naming the Product as Confirmation, including a letter about labeling violations unrelated to the Incident's contamination. Planned checks would pass: T8-V1's explicit scope negatives are an alert lacking the Product and a Lab Test with the wrong Hazard. This implementation rejects both and accepts every valid positive finding fixture. No unrelated-Hazard warning-letter negative is specified.
- surviving mutant for A25: Anonymize summaries and quotes, but use an unredacted full-text rendering path for public-domain official notices, exposing an owner name or photo contained in such a notice. Planned checks would pass: T12-V1's named privacy cases cover private full-text leakage and owner identity in quotes. Normal summaries, quotes and owner links remain safe. No fixture combines the public-domain full-text exception with an owner identity or photo.
- surviving mutant for A12: Treat distinct Source accounts as distinct people. Two known accounts belonging to the same owner on different platforms qualify as independent when neither Report is marked as a repost. Planned checks would pass: T8-V1 can pass its different-person, repost, Echo and sufficient-two-person cases when those fixtures use one account per person. It specifies no same-person, cross-account negative that distinguishes person identity from Source identity.
- surviving mutant for A30: Select the official Harm headline by newest inserted assertion ID rather than the assertion's source date. Importing an older official document later replaces a newer official count. Planned checks would pass: T10-V1's later-smaller-count fixture rejects selecting the maximum total, but insertion order can agree with source chronology in that fixture. Attribution, commissioning exclusions and Incident scoping still pass. No reverse-order historical import is specified.
- surviving mutant for A32: Allow conservative merging only when an explicit possible-match edge exists; treat observations with unresolved identity and no recorded edge as different animals. Planned checks would pass: T10-V1 explicitly supplies repeated-pet, possible-match, overlapping-cohort and known-different bridge constraints. The implementation handles those correctly while overcounting unresolved observations lacking an explicit edge, a default case the checks do not specify.
- surviving mutant for A19: Preserve identity and revisions for known document references, but globally deduplicate previously unseen documents by body hash. Separate social posts with identical wording but different authors and URLs become one Report. Planned checks would pass: T3-V1 checks repeated intake and immutable revisions, which remain correct. No specified fixture requires equal-body documents with distinct source identities to remain separate. Queue grouping and ordinary manual/import retries also remain correct.
- surviving mutant for A35: Cache Incident Date when accepting a Link, ignoring a Pending linked Report at that moment, and never refresh the cache when that Report subsequently becomes Published. Planned checks would pass: T11-V1 links already-Published older, newer and contradicting Reports and tests later Confirmation. Those paths update or preserve the cache correctly. It does not specify accepting an older Pending Report's Link before publishing that Report.
- surviving mutant for A38: Use the authenticated actor for the listed approval handlers, but hard-code the owner's account as the actor in the direct Reviewer rule-out handler. Planned checks would pass: T15-V1's enumerated handler matrix omits direct rule-out decisions. T9-V1 checks rule-out history and statistical eligibility without specifying a second-Reviewer attribution assertion. All listed spoofing and transaction tests still pass.
- surviving mutant for A51: Use lot_code as a globally unique key, causing a second Product or Incident with the same printed lot code to overwrite or reject the first Lot's best-by date and barcode. Planned checks would pass: T7-V1 verifies complete and partial Lots, string preservation and leading zeros. Those round trips pass for noncolliding codes. No fixture reuses one lot code across different Product/Incident scopes.

## Checks performed

The host read and hashed the listed source files and recorded the line range of every excerpt it cut. It checked that each cited excerpt ID is one it created and that each reference comparison cites only its own repository at the pinned commit, checked requirement and acceptance coverage, checked that existing verification commands come from local files it read, and checked that task dependencies exist and form no cycle. It checked that each verification names at least one wrong implementation for every acceptance criterion it covers, and that each reference test cited under an adopted pattern comes from a file it read as a test from that repository at the pinned commit. It did not check that an excerpt supports the claim next to it, and it did not run target project commands or tests.

## Trusted, not checked

- github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: 9241 stars; last push 2026-10-28; created 2023-06-19. The commit is the head of the default branch `main` when this run resolved it, not a release or tag. The tree listing the host received had 515 test-like path(s) by file name; if the evidence gaps say that listing was truncated, this count is a lower bound. The host read 5 production file(s) and 2 test file(s) from it and ran none of them. License: AGPL-3.0, as GitHub's SPDX metadata reports it.
- github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: 275 stars; last push 2026-10-28; created 2019-01-27. The commit is the head of the default branch `main` when this run resolved it, not a release or tag. The tree listing the host received had 123 test-like path(s) by file name; if the evidence gaps say that listing was truncated, this count is a lower bound. The host read 8 production file(s) and 6 test file(s) from it and ran none of them. License: the root file `LICENSE.txt`; the host did not identify which license it is.
- The claim next to each citation is written by the model. The host checks only that the excerpt ID exists, and for a reference comparison that the excerpt comes from that repository at the pinned commit and, for a cited reference test, from a file it read as a test; it then shows the line range it recorded when it read the file.
- Local sources are identified by the SHA-256 of the content this run read, taken after any redaction, not by a commit.
- The independent review is the same model in a fresh session.
- Surviving mutants, and the lack of them, are the reviewer model's reasoning: unshit applied and ran none of them, and a review that reports none does not show that the planned checks reject every wrong implementation.
- The plan names 74 wrong implementation(s) under its verification steps. The model wrote them, and unshit did not apply any of them or run any check.
- The plan cites 8 distinct reference test excerpt(s) under adopted patterns. The host recognises a test file by its path name only; it read these at the pinned commit and ran none of them, and that each one exercises its pattern rests on the planner and the independent review.
- The host received brief approval through the agent protocol; it cannot verify who approved it.

## Stages and references

Revision 11 of the stage-and-reference preview; `preview.html` in the run folder shows the same revision. A search result is a discovery hint, not evidence. A listed commit or file was not read. Evidence is source the host read and hashed, or an excerpt it cut from that source.

- **Intake** (`intake`): completed; no references.
- **Material answers** (`answer_gate`): skipped; no references.
- **Brief rebuild** (`brief_rebuild`): skipped; no references.
- **Brief approval** (`brief_approval`): completed; no references.
- **Local baseline** (`local_baseline`): completed; no references.
- **Repository search** (`repository_search`): completed.
  - Found by search: `C41` [`github:ruvnet/RuView`](<https://github.com/ruvnet/RuView>) (search result, not evidence)
  - Found by search: `C31` [`github:Chuyu-Team/Dism-Multi-language`](<https://github.com/Chuyu-Team/Dism-Multi-language>) (search result, not evidence)
  - Found by search: `C43` [`github:keephq/keep`](<https://github.com/keephq/keep>) (search result, not evidence)
  - Found by search: `C11` [`github:TwiN/gatus`](<https://github.com/TwiN/gatus>) (search result, not evidence)
  - Found by search: `C24` [`github:juliocesarfort/public-pentesting-reports`](<https://github.com/juliocesarfort/public-pentesting-reports>) (search result, not evidence)
  - Found by search: `C1` [`github:meirwah/awesome-incident-response`](<https://github.com/meirwah/awesome-incident-response>) (search result, not evidence)
  - Found by search: `C9` [`github:openstatusHQ/openstatus`](<https://github.com/openstatusHQ/openstatus>) (search result, not evidence)
  - Found by search: `C2` [`github:SunWeb3Sec/DeFiHackLabs`](<https://github.com/SunWeb3Sec/DeFiHackLabs>) (search result, not evidence)
  - Found by search: `C26` [`github:reddelexc/hackerone-reports`](<https://github.com/reddelexc/hackerone-reports>) (search result, not evidence)
  - Found by search: `C33` [`github:ACRA/acra`](<https://github.com/ACRA/acra>) (search result, not evidence)
  - Found by search: `C44` [`github:vllm-project/semantic-router`](<https://github.com/vllm-project/semantic-router>) (search result, not evidence)
  - Found by search: `C10` [`github:google/grr`](<https://github.com/google/grr>) (search result, not evidence)
  - Found by search: `C7` [`github:A-poc/BlueTeam-Tools`](<https://github.com/A-poc/BlueTeam-Tools>) (search result, not evidence)
  - Found by search: `C38` [`github:noraj/OSCP-Exam-Report-Template-Markdown`](<https://github.com/noraj/OSCP-Exam-Report-Template-Markdown>) (search result, not evidence)
  - Found by search: `C32` [`github:guaguaguaxia/weekly_report`](<https://github.com/guaguaguaxia/weekly_report>) (search result, not evidence)
  - Found by search: `C28` [`github:blackorbird/APT_REPORT`](<https://github.com/blackorbird/APT_REPORT>) (search result, not evidence)
  - Found by search: `C25` [`github:danielpalme/ReportGenerator`](<https://github.com/danielpalme/ReportGenerator>) (search result, not evidence)
  - Found by search: `C27` [`github:FastReports/FastReport`](<https://github.com/FastReports/FastReport>) (search result, not evidence)
  - Found by search: `C34` [`github:pwndoc/pwndoc`](<https://github.com/pwndoc/pwndoc>) (search result, not evidence)
  - Found by search: `C3` [`github:certsocietegenerale/FIR`](<https://github.com/certsocietegenerale/FIR>) (search result, not evidence)
  - Found by search: `C30` [`github:CcSimple/vue-plugin-hiprint`](<https://github.com/CcSimple/vue-plugin-hiprint>) (search result, not evidence)
  - Found by search: `C35` [`github:ariacom/Seal-Report`](<https://github.com/ariacom/Seal-Report>) (search result, not evidence)
  - Found by search: `C4` [`github:dfir-iris/iris-web`](<https://github.com/dfir-iris/iris-web>) (search result, not evidence)
  - Found by search: `C21` [`github:raodv/report`](<https://github.com/raodv/report>) (search result, not evidence)
  - Found by search: `C39` [`github:xinglie/report-designer`](<https://github.com/xinglie/report-designer>) (search result, not evidence)
  - Found by search: `C8` [`github:aws-samples/aws-incident-response-playbooks`](<https://github.com/aws-samples/aws-incident-response-playbooks>) (search result, not evidence)
  - Found by search: `C6` [`github:PagerDuty/incident-response-docs`](<https://github.com/PagerDuty/incident-response-docs>) (search result, not evidence)
  - Found by search: `C5` [`github:VersusControl/versus-incident`](<https://github.com/VersusControl/versus-incident>) (search result, not evidence)
  - Found by search: `C12` [`github:Bert-JanP/Incident-Response-Powershell`](<https://github.com/Bert-JanP/Incident-Response-Powershell>) (search result, not evidence)
  - Found by search: `C13` [`github:ramimac/aws-customer-security-incidents`](<https://github.com/ramimac/aws-customer-security-incidents>) (search result, not evidence)
  - Found by search: `C16` [`github:Just-Hack-For-Fun/Windows-INCIDENT-RESPONSE-COOKBOOK`](<https://github.com/Just-Hack-For-Fun/Windows-INCIDENT-RESPONSE-COOKBOOK>) (search result, not evidence)
  - Found by search: `C22` [`github:easystats/report`](<https://github.com/easystats/report>) (search result, not evidence)
  - Found by search: `C17` [`github:vz-risk/veris`](<https://github.com/vz-risk/veris>) (search result, not evidence)
  - Found by search: `C18` [`github:veebch/photon`](<https://github.com/veebch/photon>) (search result, not evidence)
  - Found by search: `C23` [`github:manymore13/report`](<https://github.com/manymore13/report>) (search result, not evidence)
  - Found by search: `C19` [`github:dfirtrack/dfirtrack`](<https://github.com/dfirtrack/dfirtrack>) (search result, not evidence)
  - Found by search: `C15` [`github:SREGym/SREGym`](<https://github.com/SREGym/SREGym>) (search result, not evidence)
  - Found by search: `C20` [`github:responsible-ai-collaborative/aiid`](<https://github.com/responsible-ai-collaborative/aiid>) (search result, not evidence)
  - Found by search: `C14` [`github:roxy-wi/IncidentRelay`](<https://github.com/roxy-wi/IncidentRelay>) (search result, not evidence)
  - Found by search: `C29` [`github:reportportal/reportportal`](<https://github.com/reportportal/reportportal>) (search result, not evidence)
  - Found by search: `C40` [`github:dorny/test-reporter`](<https://github.com/dorny/test-reporter>) (search result, not evidence)
  - Found by search: `C37` [`github:microsoft/ReportingServicesTools`](<https://github.com/microsoft/ReportingServicesTools>) (search result, not evidence)
  - Found by search: `C36` [`github:OCA/reporting-engine`](<https://github.com/OCA/reporting-engine>) (search result, not evidence)
  - Found by search: `C42` [`github:xai-org/grok-build`](<https://github.com/xai-org/grok-build>) (search result, not evidence)
- **Metadata screening** (`metadata_screening`): completed.
  - Passed the metadata bar: `C41` [`github:ruvnet/RuView`](<https://github.com/ruvnet/RuView>) (search result, not evidence)
  - Passed the metadata bar: `C31` [`github:Chuyu-Team/Dism-Multi-language`](<https://github.com/Chuyu-Team/Dism-Multi-language>) (search result, not evidence)
  - Passed the metadata bar: `C43` [`github:keephq/keep`](<https://github.com/keephq/keep>) (search result, not evidence)
  - Passed the metadata bar: `C11` [`github:TwiN/gatus`](<https://github.com/TwiN/gatus>) (search result, not evidence)
  - Passed the metadata bar: `C24` [`github:juliocesarfort/public-pentesting-reports`](<https://github.com/juliocesarfort/public-pentesting-reports>) (search result, not evidence)
  - Passed the metadata bar: `C1` [`github:meirwah/awesome-incident-response`](<https://github.com/meirwah/awesome-incident-response>) (search result, not evidence)
  - Passed the metadata bar: `C9` [`github:openstatusHQ/openstatus`](<https://github.com/openstatusHQ/openstatus>) (search result, not evidence)
  - Passed the metadata bar: `C2` [`github:SunWeb3Sec/DeFiHackLabs`](<https://github.com/SunWeb3Sec/DeFiHackLabs>) (search result, not evidence)
  - Passed the metadata bar: `C26` [`github:reddelexc/hackerone-reports`](<https://github.com/reddelexc/hackerone-reports>) (search result, not evidence)
  - Passed the metadata bar: `C33` [`github:ACRA/acra`](<https://github.com/ACRA/acra>) (search result, not evidence)
  - Passed the metadata bar: `C44` [`github:vllm-project/semantic-router`](<https://github.com/vllm-project/semantic-router>) (search result, not evidence)
  - Passed the metadata bar: `C10` [`github:google/grr`](<https://github.com/google/grr>) (search result, not evidence)
  - Passed the metadata bar: `C7` [`github:A-poc/BlueTeam-Tools`](<https://github.com/A-poc/BlueTeam-Tools>) (search result, not evidence)
  - Passed the metadata bar: `C38` [`github:noraj/OSCP-Exam-Report-Template-Markdown`](<https://github.com/noraj/OSCP-Exam-Report-Template-Markdown>) (search result, not evidence)
  - Passed the metadata bar: `C32` [`github:guaguaguaxia/weekly_report`](<https://github.com/guaguaguaxia/weekly_report>) (search result, not evidence)
  - Passed the metadata bar: `C28` [`github:blackorbird/APT_REPORT`](<https://github.com/blackorbird/APT_REPORT>) (search result, not evidence)
  - Passed the metadata bar: `C25` [`github:danielpalme/ReportGenerator`](<https://github.com/danielpalme/ReportGenerator>) (search result, not evidence)
  - Passed the metadata bar: `C27` [`github:FastReports/FastReport`](<https://github.com/FastReports/FastReport>) (search result, not evidence)
  - Passed the metadata bar: `C34` [`github:pwndoc/pwndoc`](<https://github.com/pwndoc/pwndoc>) (search result, not evidence)
  - Passed the metadata bar: `C3` [`github:certsocietegenerale/FIR`](<https://github.com/certsocietegenerale/FIR>) (search result, not evidence)
  - Passed the metadata bar: `C30` [`github:CcSimple/vue-plugin-hiprint`](<https://github.com/CcSimple/vue-plugin-hiprint>) (search result, not evidence)
  - Passed the metadata bar: `C35` [`github:ariacom/Seal-Report`](<https://github.com/ariacom/Seal-Report>) (search result, not evidence)
  - Passed the metadata bar: `C4` [`github:dfir-iris/iris-web`](<https://github.com/dfir-iris/iris-web>) (search result, not evidence)
  - Passed the metadata bar: `C21` [`github:raodv/report`](<https://github.com/raodv/report>) (search result, not evidence)
  - Passed the metadata bar: `C39` [`github:xinglie/report-designer`](<https://github.com/xinglie/report-designer>) (search result, not evidence)
  - Passed the metadata bar: `C8` [`github:aws-samples/aws-incident-response-playbooks`](<https://github.com/aws-samples/aws-incident-response-playbooks>) (search result, not evidence)
  - Passed the metadata bar: `C6` [`github:PagerDuty/incident-response-docs`](<https://github.com/PagerDuty/incident-response-docs>) (search result, not evidence)
  - Passed the metadata bar: `C5` [`github:VersusControl/versus-incident`](<https://github.com/VersusControl/versus-incident>) (search result, not evidence)
  - Passed the metadata bar: `C12` [`github:Bert-JanP/Incident-Response-Powershell`](<https://github.com/Bert-JanP/Incident-Response-Powershell>) (search result, not evidence)
  - Passed the metadata bar: `C13` [`github:ramimac/aws-customer-security-incidents`](<https://github.com/ramimac/aws-customer-security-incidents>) (search result, not evidence)
  - Passed the metadata bar: `C16` [`github:Just-Hack-For-Fun/Windows-INCIDENT-RESPONSE-COOKBOOK`](<https://github.com/Just-Hack-For-Fun/Windows-INCIDENT-RESPONSE-COOKBOOK>) (search result, not evidence)
  - Passed the metadata bar: `C22` [`github:easystats/report`](<https://github.com/easystats/report>) (search result, not evidence)
  - Passed the metadata bar: `C17` [`github:vz-risk/veris`](<https://github.com/vz-risk/veris>) (search result, not evidence)
  - Passed the metadata bar: `C18` [`github:veebch/photon`](<https://github.com/veebch/photon>) (search result, not evidence)
  - Passed the metadata bar: `C23` [`github:manymore13/report`](<https://github.com/manymore13/report>) (search result, not evidence)
  - Passed the metadata bar: `C19` [`github:dfirtrack/dfirtrack`](<https://github.com/dfirtrack/dfirtrack>) (search result, not evidence)
  - Passed the metadata bar: `C15` [`github:SREGym/SREGym`](<https://github.com/SREGym/SREGym>) (search result, not evidence)
  - Passed the metadata bar: `C20` [`github:responsible-ai-collaborative/aiid`](<https://github.com/responsible-ai-collaborative/aiid>) (search result, not evidence)
  - Passed the metadata bar: `C14` [`github:roxy-wi/IncidentRelay`](<https://github.com/roxy-wi/IncidentRelay>) (search result, not evidence)
  - Passed the metadata bar: `C29` [`github:reportportal/reportportal`](<https://github.com/reportportal/reportportal>) (search result, not evidence)
  - Passed the metadata bar: `C40` [`github:dorny/test-reporter`](<https://github.com/dorny/test-reporter>) (search result, not evidence)
  - Passed the metadata bar: `C37` [`github:microsoft/ReportingServicesTools`](<https://github.com/microsoft/ReportingServicesTools>) (search result, not evidence)
  - Passed the metadata bar: `C36` [`github:OCA/reporting-engine`](<https://github.com/OCA/reporting-engine>) (search result, not evidence)
  - Excluded: `C42` [`github:xai-org/grok-build`](<https://github.com/xai-org/grok-build>) (search result, not evidence); `created 2026-07-14, younger than 180 days`
- **Preview confirmation** (`preview_confirmation`): completed; no references.
- **Candidate ranking** (`candidate_ranking`): completed.
  - Supplied to the model: `C41` [`github:ruvnet/RuView`](<https://github.com/ruvnet/RuView>) (search result, not evidence)
  - Supplied to the model: `C31` [`github:Chuyu-Team/Dism-Multi-language`](<https://github.com/Chuyu-Team/Dism-Multi-language>) (search result, not evidence)
  - Supplied to the model: `C43` [`github:keephq/keep`](<https://github.com/keephq/keep>) (search result, not evidence)
  - Supplied to the model: `C11` [`github:TwiN/gatus`](<https://github.com/TwiN/gatus>) (search result, not evidence)
  - Supplied to the model: `C24` [`github:juliocesarfort/public-pentesting-reports`](<https://github.com/juliocesarfort/public-pentesting-reports>) (search result, not evidence)
  - Supplied to the model: `C1` [`github:meirwah/awesome-incident-response`](<https://github.com/meirwah/awesome-incident-response>) (search result, not evidence)
  - Supplied to the model: `C9` [`github:openstatusHQ/openstatus`](<https://github.com/openstatusHQ/openstatus>) (search result, not evidence)
  - Supplied to the model: `C2` [`github:SunWeb3Sec/DeFiHackLabs`](<https://github.com/SunWeb3Sec/DeFiHackLabs>) (search result, not evidence)
  - Supplied to the model: `C26` [`github:reddelexc/hackerone-reports`](<https://github.com/reddelexc/hackerone-reports>) (search result, not evidence)
  - Supplied to the model: `C33` [`github:ACRA/acra`](<https://github.com/ACRA/acra>) (search result, not evidence)
  - Supplied to the model: `C44` [`github:vllm-project/semantic-router`](<https://github.com/vllm-project/semantic-router>) (search result, not evidence)
  - Supplied to the model: `C10` [`github:google/grr`](<https://github.com/google/grr>) (search result, not evidence)
  - Supplied to the model: `C7` [`github:A-poc/BlueTeam-Tools`](<https://github.com/A-poc/BlueTeam-Tools>) (search result, not evidence)
  - Supplied to the model: `C38` [`github:noraj/OSCP-Exam-Report-Template-Markdown`](<https://github.com/noraj/OSCP-Exam-Report-Template-Markdown>) (search result, not evidence)
  - Supplied to the model: `C32` [`github:guaguaguaxia/weekly_report`](<https://github.com/guaguaguaxia/weekly_report>) (search result, not evidence)
  - Supplied to the model: `C28` [`github:blackorbird/APT_REPORT`](<https://github.com/blackorbird/APT_REPORT>) (search result, not evidence)
  - Supplied to the model: `C25` [`github:danielpalme/ReportGenerator`](<https://github.com/danielpalme/ReportGenerator>) (search result, not evidence)
  - Supplied to the model: `C27` [`github:FastReports/FastReport`](<https://github.com/FastReports/FastReport>) (search result, not evidence)
  - Supplied to the model: `C34` [`github:pwndoc/pwndoc`](<https://github.com/pwndoc/pwndoc>) (search result, not evidence)
  - Supplied to the model: `C3` [`github:certsocietegenerale/FIR`](<https://github.com/certsocietegenerale/FIR>) (search result, not evidence)
  - Supplied to the model: `C30` [`github:CcSimple/vue-plugin-hiprint`](<https://github.com/CcSimple/vue-plugin-hiprint>) (search result, not evidence)
  - Supplied to the model: `C35` [`github:ariacom/Seal-Report`](<https://github.com/ariacom/Seal-Report>) (search result, not evidence)
  - Supplied to the model: `C4` [`github:dfir-iris/iris-web`](<https://github.com/dfir-iris/iris-web>) (search result, not evidence)
  - Supplied to the model: `C21` [`github:raodv/report`](<https://github.com/raodv/report>) (search result, not evidence)
  - Supplied to the model: `C39` [`github:xinglie/report-designer`](<https://github.com/xinglie/report-designer>) (search result, not evidence)
  - Supplied to the model: `C8` [`github:aws-samples/aws-incident-response-playbooks`](<https://github.com/aws-samples/aws-incident-response-playbooks>) (search result, not evidence)
  - Supplied to the model: `C6` [`github:PagerDuty/incident-response-docs`](<https://github.com/PagerDuty/incident-response-docs>) (search result, not evidence)
  - Supplied to the model: `C5` [`github:VersusControl/versus-incident`](<https://github.com/VersusControl/versus-incident>) (search result, not evidence)
  - Supplied to the model: `C12` [`github:Bert-JanP/Incident-Response-Powershell`](<https://github.com/Bert-JanP/Incident-Response-Powershell>) (search result, not evidence)
  - Supplied to the model: `C13` [`github:ramimac/aws-customer-security-incidents`](<https://github.com/ramimac/aws-customer-security-incidents>) (search result, not evidence)
  - Supplied to the model: `C16` [`github:Just-Hack-For-Fun/Windows-INCIDENT-RESPONSE-COOKBOOK`](<https://github.com/Just-Hack-For-Fun/Windows-INCIDENT-RESPONSE-COOKBOOK>) (search result, not evidence)
  - Supplied to the model: `C22` [`github:easystats/report`](<https://github.com/easystats/report>) (search result, not evidence)
  - Supplied to the model: `C17` [`github:vz-risk/veris`](<https://github.com/vz-risk/veris>) (search result, not evidence)
  - Supplied to the model: `C18` [`github:veebch/photon`](<https://github.com/veebch/photon>) (search result, not evidence)
  - Supplied to the model: `C23` [`github:manymore13/report`](<https://github.com/manymore13/report>) (search result, not evidence)
  - Supplied to the model: `C19` [`github:dfirtrack/dfirtrack`](<https://github.com/dfirtrack/dfirtrack>) (search result, not evidence)
  - Supplied to the model: `C15` [`github:SREGym/SREGym`](<https://github.com/SREGym/SREGym>) (search result, not evidence)
  - Supplied to the model: `C20` [`github:responsible-ai-collaborative/aiid`](<https://github.com/responsible-ai-collaborative/aiid>) (search result, not evidence)
  - Supplied to the model: `C14` [`github:roxy-wi/IncidentRelay`](<https://github.com/roxy-wi/IncidentRelay>) (search result, not evidence)
  - Supplied to the model: `C29` [`github:reportportal/reportportal`](<https://github.com/reportportal/reportportal>) (search result, not evidence)
  - Supplied to the model: `C40` [`github:dorny/test-reporter`](<https://github.com/dorny/test-reporter>) (search result, not evidence)
  - Supplied to the model: `C37` [`github:microsoft/ReportingServicesTools`](<https://github.com/microsoft/ReportingServicesTools>) (search result, not evidence)
  - Supplied to the model: `C36` [`github:OCA/reporting-engine`](<https://github.com/OCA/reporting-engine>) (search result, not evidence)
  - Ranked for tree checks: `C20` [`github:responsible-ai-collaborative/aiid`](<https://github.com/responsible-ai-collaborative/aiid>) (search result, not evidence)
  - Ranked for tree checks: `C4` [`github:dfir-iris/iris-web`](<https://github.com/dfir-iris/iris-web>) (search result, not evidence)
  - Ranked for tree checks: `C3` [`github:certsocietegenerale/FIR`](<https://github.com/certsocietegenerale/FIR>) (search result, not evidence)
  - Ranked for tree checks: `C19` [`github:dfirtrack/dfirtrack`](<https://github.com/dfirtrack/dfirtrack>) (search result, not evidence)
  - Ranked for tree checks: `C43` [`github:keephq/keep`](<https://github.com/keephq/keep>) (search result, not evidence)
  - Ranked for tree checks: `C9` [`github:openstatusHQ/openstatus`](<https://github.com/openstatusHQ/openstatus>) (search result, not evidence)
  - Ranked for tree checks: `C34` [`github:pwndoc/pwndoc`](<https://github.com/pwndoc/pwndoc>) (search result, not evidence)
  - Ranked for tree checks: `C14` [`github:roxy-wi/IncidentRelay`](<https://github.com/roxy-wi/IncidentRelay>) (search result, not evidence)
- **Commit-pinned tree checks** (`repository_trees`): completed.
  - Tree checked at a commit: `C20@97d184c5b22d` [`github:responsible-ai-collaborative/aiid@97d184c5b22d`](<https://github.com/responsible-ai-collaborative/aiid/tree/97d184c5b22dc5b47e72b51bd597e1b735ce6028>) (listed, not read)
  - Tree checked at a commit: `C19@e2b134f1ebbb` [`github:dfirtrack/dfirtrack@e2b134f1ebbb`](<https://github.com/dfirtrack/dfirtrack/tree/e2b134f1ebbb5e03c101f4c835a568619fccd4af>) (listed, not read)
  - Tree checked at a commit: `C43@e5cd8698c890` [`github:keephq/keep@e5cd8698c890`](<https://github.com/keephq/keep/tree/e5cd8698c89071d00635e6f0f544c748ae7c6b60>) (listed, not read)
  - Tree checked at a commit: `C9@f8057fbe1f17` [`github:openstatusHQ/openstatus@f8057fbe1f17`](<https://github.com/openstatusHQ/openstatus/tree/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62>) (listed, not read)
  - Tree checked at a commit: `C34@844e50e012d5` [`github:pwndoc/pwndoc@844e50e012d5`](<https://github.com/pwndoc/pwndoc/tree/844e50e012d59a180cf11b3bde08907601996f76>) (listed, not read)
  - Tree checked at a commit: `C14@21ea27d92927` [`github:roxy-wi/IncidentRelay@21ea27d92927`](<https://github.com/roxy-wi/IncidentRelay/tree/21ea27d92927242ed499b7584a276f47cb1c68cd>) (listed, not read)
  - Excluded: `C4` [`github:dfir-iris/iris-web`](<https://github.com/dfir-iris/iris-web>) (search result, not evidence); `no test file at 37c5521ac009bd018a2fac7bc01d70735d130c6c`
  - Excluded: `C3` [`github:certsocietegenerale/FIR`](<https://github.com/certsocietegenerale/FIR>) (search result, not evidence); `no test file at ed479a1b93bba9fa7dd59379ba1f46add11e4eb7`
  - Excluded: `C41` [`github:ruvnet/RuView`](<https://github.com/ruvnet/RuView>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C31` [`github:Chuyu-Team/Dism-Multi-language`](<https://github.com/Chuyu-Team/Dism-Multi-language>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C11` [`github:TwiN/gatus`](<https://github.com/TwiN/gatus>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C24` [`github:juliocesarfort/public-pentesting-reports`](<https://github.com/juliocesarfort/public-pentesting-reports>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C1` [`github:meirwah/awesome-incident-response`](<https://github.com/meirwah/awesome-incident-response>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C2` [`github:SunWeb3Sec/DeFiHackLabs`](<https://github.com/SunWeb3Sec/DeFiHackLabs>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C26` [`github:reddelexc/hackerone-reports`](<https://github.com/reddelexc/hackerone-reports>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C33` [`github:ACRA/acra`](<https://github.com/ACRA/acra>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C44` [`github:vllm-project/semantic-router`](<https://github.com/vllm-project/semantic-router>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C10` [`github:google/grr`](<https://github.com/google/grr>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C7` [`github:A-poc/BlueTeam-Tools`](<https://github.com/A-poc/BlueTeam-Tools>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C38` [`github:noraj/OSCP-Exam-Report-Template-Markdown`](<https://github.com/noraj/OSCP-Exam-Report-Template-Markdown>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C32` [`github:guaguaguaxia/weekly_report`](<https://github.com/guaguaguaxia/weekly_report>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C28` [`github:blackorbird/APT_REPORT`](<https://github.com/blackorbird/APT_REPORT>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C25` [`github:danielpalme/ReportGenerator`](<https://github.com/danielpalme/ReportGenerator>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C27` [`github:FastReports/FastReport`](<https://github.com/FastReports/FastReport>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C30` [`github:CcSimple/vue-plugin-hiprint`](<https://github.com/CcSimple/vue-plugin-hiprint>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C35` [`github:ariacom/Seal-Report`](<https://github.com/ariacom/Seal-Report>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C21` [`github:raodv/report`](<https://github.com/raodv/report>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C39` [`github:xinglie/report-designer`](<https://github.com/xinglie/report-designer>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C8` [`github:aws-samples/aws-incident-response-playbooks`](<https://github.com/aws-samples/aws-incident-response-playbooks>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C6` [`github:PagerDuty/incident-response-docs`](<https://github.com/PagerDuty/incident-response-docs>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C5` [`github:VersusControl/versus-incident`](<https://github.com/VersusControl/versus-incident>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C12` [`github:Bert-JanP/Incident-Response-Powershell`](<https://github.com/Bert-JanP/Incident-Response-Powershell>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C13` [`github:ramimac/aws-customer-security-incidents`](<https://github.com/ramimac/aws-customer-security-incidents>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C16` [`github:Just-Hack-For-Fun/Windows-INCIDENT-RESPONSE-COOKBOOK`](<https://github.com/Just-Hack-For-Fun/Windows-INCIDENT-RESPONSE-COOKBOOK>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C22` [`github:easystats/report`](<https://github.com/easystats/report>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C17` [`github:vz-risk/veris`](<https://github.com/vz-risk/veris>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C18` [`github:veebch/photon`](<https://github.com/veebch/photon>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C23` [`github:manymore13/report`](<https://github.com/manymore13/report>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C15` [`github:SREGym/SREGym`](<https://github.com/SREGym/SREGym>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C29` [`github:reportportal/reportportal`](<https://github.com/reportportal/reportportal>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C40` [`github:dorny/test-reporter`](<https://github.com/dorny/test-reporter>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C37` [`github:microsoft/ReportingServicesTools`](<https://github.com/microsoft/ReportingServicesTools>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
  - Excluded: `C36` [`github:OCA/reporting-engine`](<https://github.com/OCA/reporting-engine>) (search result, not evidence); `Passed the quality bar but was outside the shortlist of 6 tree-verified candidates.`
- **Comparator selection** (`candidate_selection`): completed.
  - Selected: `C20@97d184c5b22d` [`github:responsible-ai-collaborative/aiid@97d184c5b22d`](<https://github.com/responsible-ai-collaborative/aiid/tree/97d184c5b22dc5b47e72b51bd597e1b735ce6028>) (listed, not read)
  - Selected: `C9@f8057fbe1f17` [`github:openstatusHQ/openstatus@f8057fbe1f17`](<https://github.com/openstatusHQ/openstatus/tree/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62>) (listed, not read)
  - Rejected: `C19@e2b134f1ebbb` [`github:dfirtrack/dfirtrack@e2b134f1ebbb`](<https://github.com/dfirtrack/dfirtrack/tree/e2b134f1ebbb5e03c101f4c835a568619fccd4af>) (listed, not read)
  - Rejected: `C43@e5cd8698c890` [`github:keephq/keep@e5cd8698c890`](<https://github.com/keephq/keep/tree/e5cd8698c89071d00635e6f0f544c748ae7c6b60>) (listed, not read)
  - Rejected: `C34@844e50e012d5` [`github:pwndoc/pwndoc@844e50e012d5`](<https://github.com/pwndoc/pwndoc/tree/844e50e012d59a180cf11b3bde08907601996f76>) (listed, not read)
  - Rejected: `C14@21ea27d92927` [`github:roxy-wi/IncidentRelay@21ea27d92927`](<https://github.com/roxy-wi/IncidentRelay/tree/21ea27d92927242ed499b7584a276f47cb1c68cd>) (listed, not read)
- **File selection** (`file_selection`): completed; 1450 files offered to the model, not listed.
  - Selected: `LFILE1` `CONTEXT.md` (listed, not read)
  - Selected: `LFILE2` `docs/adr/0001-mac-back-office-cloud-public-site.md` (listed, not read)
  - Selected: `F-C20-735` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/types/report.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts>) (listed, not read)
  - Selected: `F-C20-733` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/types/incidents.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/incidents.ts>) (listed, not read)
  - Selected: `F-C20-664` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/fields/reports.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/reports.ts>) (listed, not read)
  - Selected: `F-C20-718` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/tests/reports.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/reports.spec.ts>) (listed, not read)
  - Selected: `F-C20-660` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/fields/incidents.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/incidents.ts>) (listed, not read)
  - Selected: `F-C20-706` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/tests/incidents.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/incidents.spec.ts>) (listed, not read)
  - Selected: `F-C20-705` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/tests/incidentExistingReports.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/incidentExistingReports.spec.ts>) (listed, not read)
  - Selected: `F-C20-666` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/fields/submissions.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts>) (listed, not read)
  - Selected: `F-C20-678` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/rules.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/rules.ts>) (listed, not read)
  - Selected: `F-C20-719` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/tests/submissionAuthorization.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/submissionAuthorization.spec.ts>) (listed, not read)
  - Selected: `F-C20-897` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/src/components/submissions/SubmissionList.js`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/src/components/submissions/SubmissionList.js>) (listed, not read)
  - Selected: `F-C20-508` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/playwright/e2e/apps/submitted.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/playwright/e2e/apps/submitted.spec.ts>) (listed, not read)
  - Selected: `F-C9-3024` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/db/src/schema/incidents/incident.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/db/src/schema/incidents/incident.ts>) (listed, not read)
  - Selected: `F-C9-3098` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/db/src/schema/status_reports/status_reports.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/db/src/schema/status_reports/status_reports.ts>) (listed, not read)
  - Selected: `F-C9-3980` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/services/src/status-report/create.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts>) (listed, not read)
  - Selected: `F-C9-3989` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/services/src/status-report/update.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/update.ts>) (listed, not read)
  - Selected: `F-C9-3985` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/services/src/status-report/list.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/list.ts>) (listed, not read)
  - Selected: `F-C9-3978` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/services/src/status-report/__tests__/status-report.test.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/__tests__/status-report.test.ts>) (listed, not read)
- **Source reads** (`source_reads`): completed.
  - Read and hashed: `S1` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/types/report.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts>) (read by the host)
  - Read and hashed: `S2` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/tests/reports.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/reports.spec.ts>) (read by the host)
  - Read and hashed: `S3` [`github:responsible-ai-collaborative/aiid@97d184c5b22d LICENSE.txt`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/LICENSE.txt>) (read by the host)
  - Read and hashed: `S4` [`github:responsible-ai-collaborative/aiid@97d184c5b22d .github/workflows/briefing-production.yml`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/.github/workflows/briefing-production.yml>) (read by the host)
  - Read and hashed: `S5` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/jest.config.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/jest.config.ts>) (read by the host)
  - Read and hashed: `S6` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/db/src/schema/incidents/incident.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/db/src/schema/incidents/incident.ts>) (read by the host)
  - Read and hashed: `S7` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/services/src/status-report/__tests__/status-report.test.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/__tests__/status-report.test.ts>) (read by the host)
  - Read and hashed: `S8` [`github:openstatusHQ/openstatus@f8057fbe1f17 package.json`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/package.json>) (read by the host)
  - Read and hashed: `S9` [`github:openstatusHQ/openstatus@f8057fbe1f17 LICENSE`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/LICENSE>) (read by the host)
  - Read and hashed: `S10` [`github:openstatusHQ/openstatus@f8057fbe1f17 .github/workflows/api-preview.yml`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/.github/workflows/api-preview.yml>) (read by the host)
  - Read and hashed: `S11` [`github:openstatusHQ/openstatus@f8057fbe1f17 apps/dashboard/vitest.config.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/apps/dashboard/vitest.config.ts>) (read by the host)
  - Read and hashed: `S12` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/types/incidents.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/incidents.ts>) (read by the host)
  - Read and hashed: `S13` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/fields/reports.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/reports.ts>) (read by the host)
  - Read and hashed: `S14` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/fields/incidents.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/incidents.ts>) (read by the host)
  - Read and hashed: `S15` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/tests/incidents.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/incidents.spec.ts>) (read by the host)
  - Read and hashed: `S16` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/tests/incidentExistingReports.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/incidentExistingReports.spec.ts>) (read by the host)
  - Read and hashed: `S17` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/fields/submissions.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts>) (read by the host)
  - Read and hashed: `S18` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/rules.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/rules.ts>) (read by the host)
  - Read and hashed: `S19` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/tests/submissionAuthorization.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/submissionAuthorization.spec.ts>) (read by the host)
  - Read and hashed: `S20` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/src/components/submissions/SubmissionList.js`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/src/components/submissions/SubmissionList.js>) (read by the host)
  - Read and hashed: `S21` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/playwright/e2e/apps/submitted.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/playwright/e2e/apps/submitted.spec.ts>) (read by the host)
  - Read and hashed: `S22` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/db/src/schema/status_reports/status_reports.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/db/src/schema/status_reports/status_reports.ts>) (read by the host)
  - Read and hashed: `S23` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/services/src/status-report/create.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts>) (read by the host)
  - Read and hashed: `S24` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/services/src/status-report/update.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/update.ts>) (read by the host)
- **Evidence requests** (`evidence_requests`): completed.
  - Supplied to the model, 32 excerpt(s): `E1`, `E2`, `E3`, `E4`, `E5`, `E6`, `E7`, `E8`, `E9`, `E10`, `E11`, `E12`, `E13`, `E14`, `E15`, `E16`, `E17`, `E18`, `E19`, `E20`, `E21`, `E22`, `E23`, `E24`, `E25`, `E26`, `E27`, `E28`, `E29`, `E30`, `E31`, `E32`
  - Added on request, 13 excerpt(s): `E33`, `E34`, `E35`, `E36`, `E37`, `E38`, `E39`, `E40`, `E41`, `E42`, `E43`, `E44`, `E45`
  - Added on request: `S25` `CONTEXT.md` (read by the host)
  - Added on request: `S26` `docs/adr/0001-mac-back-office-cloud-public-site.md` (read by the host)
  - Added on request: `S27` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/services/src/incident/link-status-report.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/incident/link-status-report.ts>) (read by the host)
  - Added on request: `S28` [`github:openstatusHQ/openstatus@f8057fbe1f17 packages/services/src/incident/__tests__/incident.test.ts`](<https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/incident/__tests__/incident.test.ts>) (read by the host)
  - Added on request: `S29` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/server/types/reportHistory.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/reportHistory.ts>) (read by the host)
  - Added on request: `S30` [`github:responsible-ai-collaborative/aiid@97d184c5b22d site/gatsby-site/playwright/e2e/reportHistory.spec.ts`](<https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/playwright/e2e/reportHistory.spec.ts>) (read by the host)
- **Plan and repair** (`plan`): completed.
  - Supplied to the model, 45 excerpt(s): `E1`, `E2`, `E3`, `E4`, `E5`, `E6`, `E7`, `E8`, `E9`, `E10`, `E11`, `E12`, `E13`, `E14`, `E15`, `E16`, `E17`, `E18`, `E19`, `E20`, `E21`, `E22`, `E23`, `E24`, `E25`, `E26`, `E27`, `E28`, `E29`, `E30`, `E31`, `E32`, `E33`, `E34`, `E35`, `E36`, `E37`, `E38`, `E39`, `E40`, `E41`, `E42`, `E43`, `E44`, `E45`
  - Cited by the model, 28 excerpt(s): `E34`, `E24`, `E33`, `E1`, `E17`, `E22`, `E19`, `E21`, `E42`, `E43`, `E25`, `E27`, `E31`, `E45`, `E3`, `E12`, `E30`, `E32`, `E23`, `E2`, `E18`, `E35`, `E8`, `E39`, `E6`, `E11`, `E15`, `E44`
- **Independent review** (`review`): completed.
  - Supplied to the model, 45 excerpt(s): `E1`, `E2`, `E3`, `E4`, `E5`, `E6`, `E7`, `E8`, `E9`, `E10`, `E11`, `E12`, `E13`, `E14`, `E15`, `E16`, `E17`, `E18`, `E19`, `E20`, `E21`, `E22`, `E23`, `E24`, `E25`, `E26`, `E27`, `E28`, `E29`, `E30`, `E31`, `E32`, `E33`, `E34`, `E35`, `E36`, `E37`, `E38`, `E39`, `E40`, `E41`, `E42`, `E43`, `E44`, `E45`
  - Cited by the model, 2 excerpt(s): `E33`, `E34`
- **Readiness** (`readiness`): completed; no references.
- **Save** (`save`): completed; no references.

## Source registry

- S1 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/types/report.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/report.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `9ad33d8fca3fbd0882d3de56857c4e8432d4fd8fdc06a8621fe0d601eac11ef6`; 89 lines; E1 L1-L89. Snapshot: `sources/S1.txt`.
- S2 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/tests/reports.spec.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/reports.spec.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `ba9f20050959270c17a939a3f786289da2ad3f1837e9a380246dfc3cd298454e`; 211 lines; E2 L1-L211. Snapshot: `sources/S2.txt`.
- S3 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [LICENSE.txt](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/LICENSE.txt); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `d49df1239d26d5b614712f7ff52e9ec1a1067e0bc471f45f92e8813e2f76bafc`; 15 lines; E3 L1-L15. Snapshot: `sources/S3.txt`.
- S4 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [.github/workflows/briefing-production.yml](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/.github/workflows/briefing-production.yml); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `955d7676eb4de1e7383e2913b1b2d6569875b990e6338c80361a5d0450cfb2d2`; 13 lines; E4 L1-L13. Snapshot: `sources/S4.txt`.
- S5 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/jest.config.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/jest.config.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `227fe63990bdaa330a3e80334bad5b4028b7649273ef787a1951ac3a2a7e0f6d`; 32 lines; E5 L1-L32. Snapshot: `sources/S5.txt`.
- S6 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [packages/db/src/schema/incidents/incident.ts](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/db/src/schema/incidents/incident.ts); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `930ec48bd877d9a992f85dd1365405072979adb96d6e42d356b697876509da89`; 126 lines; E6 L1-L126. Snapshot: `sources/S6.txt`.
- S7 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [packages/services/src/status-report/__tests__/status-report.test.ts](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/__tests__/status-report.test.ts); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `b97f486bcd1690588e0603c42fbe97f4cf9be6fd7bc33a1521fa2e1c0434213c`; 1411 lines; E7 L1-L30, E8 L51-L236, E9 L238-L297, E10 L826-L885, E44 L298-L825, E45 L886-L1411. Snapshot: `sources/S7.txt`.
- S8 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [package.json](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/package.json); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `ed209dda39642abcbeef984dada950faa1f511db1eb65238ea18e6fede3ca55d`; 41 lines; E11 L1-L41. Snapshot: `sources/S8.txt`.
- S9 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [LICENSE](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/LICENSE); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `8486a10c4393cee1c25392769ddd3b2d6c242d6ec7928e1414efff7dfb2f07ef`; 661 lines; E12 L1-L30, E13 L63-L171, E14 L204-L263. Snapshot: `sources/S9.txt`.
- S10 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [.github/workflows/api-preview.yml](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/.github/workflows/api-preview.yml); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `168f3e76187df48cfef8c7680ec33b144dec0f060da104edb59c7f4161fec4d2`; 80 lines; E15 L1-L80. Snapshot: `sources/S10.txt`.
- S11 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [apps/dashboard/vitest.config.ts](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/apps/dashboard/vitest.config.ts); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `2f68dcf294383410e182574bd072f9acd118ecbd2867d97610100582da994d0d`; 6 lines; E16 L1-L6. Snapshot: `sources/S11.txt`.
- S12 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/types/incidents.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/incidents.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `da2471f650b835d6b60d47114dadfbbf88ac2e349c6724abc5df7242c3b8c195`; 118 lines; E17 L1-L118. Snapshot: `sources/S12.txt`.
- S13 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/fields/reports.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/reports.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `e6ed4ddf5f222661633b04ad29a1fdfe327270736269b96f33eb5f0992a63055`; 271 lines; E18 L1-L271. Snapshot: `sources/S13.txt`.
- S14 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/fields/incidents.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/incidents.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `654aa4e810bb2268ffd684e2ac5fd577c26705e667122ac3f7dadf144822caad`; 191 lines; E19 L1-L191. Snapshot: `sources/S14.txt`.
- S15 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/tests/incidents.spec.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/incidents.spec.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `a07c1425905758df69819257ccf7966a27df3be71ca807f2c9612a931fce4fde`; 220 lines; E20 L1-L220. Snapshot: `sources/S15.txt`.
- S16 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/tests/incidentExistingReports.spec.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/incidentExistingReports.spec.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `ef45dc658f50461dd8b3f1ce536cac5e9bfaf65a83dc64395323052e4cea8e1e`; 118 lines; E21 L1-L118. Snapshot: `sources/S16.txt`.
- S17 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/fields/submissions.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/fields/submissions.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `78bf4f4f40692e1131653d9f5fd77a4ad3a6b87e0fa4c500551acd5160acb5bf`; 297 lines; E22 L1-L297. Snapshot: `sources/S17.txt`.
- S18 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/rules.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/rules.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `3bb557988980b21dfe273cd368c1ede556308e20bdb8c626130b7ac00f2a65e9`; 366 lines; E23 L1-L366. Snapshot: `sources/S18.txt`.
- S19 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/tests/submissionAuthorization.spec.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/tests/submissionAuthorization.spec.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `e366dcb0e4987a0d0b8e7b10341b10f317aa610a471a1c719ab65fa711ca0fa8`; 132 lines; E24 L1-L132. Snapshot: `sources/S19.txt`.
- S20 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/src/components/submissions/SubmissionList.js](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/src/components/submissions/SubmissionList.js); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `959023eba21f041cc44ac534f921a0d6d9718d254b0fc9dddf34c60b5fa60c6d`; 778 lines; E25 L1-L778. Snapshot: `sources/S20.txt`.
- S21 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/playwright/e2e/apps/submitted.spec.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/playwright/e2e/apps/submitted.spec.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `9ac32cf3ad5c688b5e83a1885bd7a9e23ef44b46a6672cd089d2613fa5aa7ea7`; 1192 lines; E26 L1-L30, E27 L87-L385, E28 L775-L834, E29 L837-L948. Snapshot: `sources/S21.txt`.
- S22 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [packages/db/src/schema/status_reports/status_reports.ts](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/db/src/schema/status_reports/status_reports.ts); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `a5a31a366d51a8297c329224e6903bea5090190dbe3b79e2771902f7bede0ca9`; 119 lines; E30 L1-L119. Snapshot: `sources/S22.txt`.
- S23 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [packages/services/src/status-report/create.ts](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/create.ts); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `85763ed64ed0f7b92e2b47c63dc8570e39754030d060fef97c9f510d6118245d`; 132 lines; E31 L1-L132. Snapshot: `sources/S23.txt`.
- S24 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [packages/services/src/status-report/update.ts](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/status-report/update.ts); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `281e351ff640aba755cb14f543f2ecd432e66c4318cf8bca5ef545e4acc64a27`; 253 lines; E32 L1-L253. Snapshot: `sources/S24.txt`.
- S25 local: `CONTEXT.md`; SHA-256 `9b0065d8cda3cb47e9848e1adbf31683c397cc60342e09f49d3e2086ca22e6e7`; 145 lines; E33 L1-L145. Snapshot: `sources/S25.txt`.
- S26 local: `docs/adr/0001-mac-back-office-cloud-public-site.md`; SHA-256 `3bb3040c5c83ab15f67d9c18ebfc51ac38db8ff15ad354dbcf8d55f2e4c60f1e`; 14 lines; E34 L1-L14. Snapshot: `sources/S26.txt`.
- S27 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [packages/services/src/incident/link-status-report.ts](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/incident/link-status-report.ts); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `7b3880fec78f1923c6033ee7dfae413d94fc247249dde649912893bfa85a2cbf`; 163 lines; E35 L1-L163. Snapshot: `sources/S27.txt`.
- S28 github:openstatusHQ/openstatus@f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62: [packages/services/src/incident/__tests__/incident.test.ts](https://github.com/openstatusHQ/openstatus/blob/f8057fbe1f17e8eef6b0fc7c28b73cbccdaa0a62/packages/services/src/incident/__tests__/incident.test.ts); commit 2026-10-28T10:49:53.000Z; last activity 2026-10-28T20:29:30.000Z; SHA-256 `46cce3aae61716e6c5dba81228c7d60a7e06ed388c240578761d9a9195cfe7f4`; 958 lines; E36 L1-L76, E37 L79-L84, E38 L86-L93, E39 L95-L608, E40 L761-L820, E41 L899-L958. Snapshot: `sources/S28.txt`.
- S29 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/server/types/reportHistory.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/server/types/reportHistory.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `ba54974e5dbf6b03205d6641abe3125a59079d1470146e305479aabc46a88add`; 41 lines; E42 L1-L41. Snapshot: `sources/S29.txt`.
- S30 github:responsible-ai-collaborative/aiid@97d184c5b22dc5b47e72b51bd597e1b735ce6028: [site/gatsby-site/playwright/e2e/reportHistory.spec.ts](https://github.com/responsible-ai-collaborative/aiid/blob/97d184c5b22dc5b47e72b51bd597e1b735ce6028/site/gatsby-site/playwright/e2e/reportHistory.spec.ts); commit 2026-10-26T12:10:10.000Z; last activity 2026-10-28T17:23:13.000Z; SHA-256 `e633342e213db3ba53cf0df112a8548db0e9687bce10f60bb35343c18459fcab`; 247 lines; E43 L1-L247. Snapshot: `sources/S30.txt`.

