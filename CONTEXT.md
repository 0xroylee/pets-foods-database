# Pet Foods Database

A public database of pet food safety reports (FDA and other regulators' notices, lab tests, expert articles, news and social posts) grouped into incidents, so that pet owners worldwide, AI assistants and search engines can find and cite them in English and Traditional Chinese.

## Language

### Collected material

**Report**:
One collected document about pet food safety, stored once with its source and link: an FDA notice, a Lab Test, an Expert Article, a news story or a social post.
_Avoid_: record, entry, post (for the general case)

**Lab Test** (分析):
A Report of a laboratory analysis of a pet food, such as contaminant levels, nutrient content or label accuracy.
_Avoid_: analysis, test report

**Expert Article** (分析):
A Report in which a vet, nutritionist or journalist explains why an Incident happened or how risky a product is. It is opinion, not primary evidence.
_Avoid_: analysis, commentary

**Echo**:
Material whose information comes from this database itself, such as an AI chatbot answer or an article citing the database. Echoes are not collected, and never count toward an Evidence Level.
_Avoid_: duplicate, repost

### Pet foods

**Pet Food**:
A complete diet for dogs or cats: dry, wet, raw, freeze-dried or prescription. Treats, chews, supplements and food for other animals are out of scope.
_Avoid_: feed, animal food

**Manufacturer**:
The company that actually makes a pet food. It may make food for Brands it does not own.
_Avoid_: maker, producer, co-packer

**Brand**:
The name a pet food is sold under, such as Kirkland Signature. One Brand may be made by several Manufacturers. A Brand counts only Incidents Linked to its own Products; an Incident at one of its Manufacturers that names none of its Products appears on its page as Manufacturer context and is not counted.
_Avoid_: label, company

**Product**:
One specific pet food formula sold under a Brand. Incidents link to Products; Brands and Manufacturers inherit Incidents through their Products. Products, Brands and Manufacturers enter the database only through Reports that mention them.
_Avoid_: item, SKU, food

**Market**:
A country or region where a Product is sold. An Incident records its affected Markets, so a recall in one Market is not shown as a problem in another.
_Avoid_: region, territory, country (as a field name)

### Events

**Incident** (出事):
A real-world event in which a pet food harmed animals or was found able to harm them, such as an illness outbreak, deaths or a contamination finding. One outbreak or contamination episode is one Incident, however many Products, Brands, Markets or recall updates it spans. One Incident groups every Report about that event; a Report may belong to no Incident, or to several.
_Avoid_: case, event, issue

**Incident Date**:
The date of the earliest Published Report Linked to an Incident. It places the Incident in a year for statistics and does not change when the Incident is Confirmed.
_Avoid_: occurrence date, recall date

**Affected Lot**:
A production batch that an Incident's Reports name as affected, identified by lot code, best-by date or barcode.
_Avoid_: batch number, SKU

**Hazard**:
What made a Pet Food harmful in an Incident, such as aflatoxin, Salmonella, excess vitamin D, melamine or H5N1.
_Avoid_: cause, contaminant, defect

**Harm Count**:
The number of animals reported sick, and separately dead, in an Incident, split by dogs and cats. It counts animals, not Reports. The headline Harm Count is the latest one from an Official Source, dated and credited; other counts stay attributed to their own Reports. Without an official count, it is the number of distinct animals described in approved owner Reports, shown as "owners report at least N"; an animal described in several Reports, or possibly so, counts once.
_Avoid_: casualties, victims, death toll

**Evidence Level**:
How strongly an Incident is supported: Reported, Corroborated or Confirmed. Shown with the Incident wherever it appears.
_Avoid_: confidence, severity, verified

**Reported**:
The Evidence Level of an Incident supported only by unofficial Published Reports, such as owner posts.

**Corroborated**:
The Evidence Level of an Incident supported by independent unofficial Reports that a Reviewer judges sufficient (there is no fixed number), by a Lab Test from a lab that is not an Official Source, or by an Official Source Report that only collects complaints without a finding. Independent means from different people, not reposts of each other, and not Echoes.

**Confirmed**:
The Evidence Level of an Incident backed by an Official Finding that supports it.

**Ruled Out**:
An Incident contradicted by an Official Finding, such as an investigation that found no link, or judged disproven by a Reviewer. It stays public as history and is left out of statistics.

**Disputed**:
A mark on an Incident that has at least one Published Report contradicting it, such as a brand's statement or lab results. Shown beside its Evidence Level.

**Stance**:
Whether a Report linked to an Incident supports or contradicts it.

**Official Finding**:
An Official Source acting on, or making a finding about, a specific product: a recall or withdrawal, a safety alert naming it, a Lab Test finding the hazard, or a warning letter about it. An official list of complaints is not an Official Finding.
_Avoid_: official mention

### Publication

**Source**:
The organization, outlet or account that published a Report.
_Avoid_: publisher, origin, feed

**Official Source**:
A Source on the Official Source List: a government regulator (national, EU or state), a government-established consumer body such as the HK Consumer Council, a consumer testing organization such as 消基會, or a named accredited lab. Its Reports are published without review, except Commissioned Tests.
_Avoid_: trusted source, authority

**Official Source List**:
The named list of Official Sources, maintained by Reviewers. Being accredited does not put a lab on it.

**Commissioned Test**:
A Lab Test paid for by a Brand or Manufacturer, about its own Product or a rival's. It is never treated as an Official Source Report, whoever ran it, and waits for a Reviewer.
_Avoid_: sponsored test, private test

**Pending Report**:
A Report waiting for a Reviewer's decision, because its Source is not an Official Source or because it is a Commissioned Test. It is not public.
_Avoid_: draft, candidate

**Published Report**:
A Report visible to the public: either from an Official Source and not a Commissioned Test, or approved by a Reviewer.

**Rejected Report**:
A Report a Reviewer declined. It never becomes public.

**Reviewer**:
A person who approves or rejects Pending Reports, Proposed Links, AI Analyses and Correction Requests.
_Avoid_: moderator, admin

**Link**:
A Reviewer-accepted connection from a Report to a Product or an Incident. Only Links change Incidents, Evidence Levels and statistics; even an Official Source Report affects no Incident until it is Linked.
_Avoid_: tag, match, attribution

**Proposed Link**:
A Link suggested by AI, waiting for a Reviewer. It has no public effect.

**Correction Request**:
A public submission asking to correct, contest or remove something in the database. It waits for a Reviewer; an approved brand statement becomes a Report that contradicts the Incident.
_Avoid_: complaint, ticket, takedown

### AI-written content

**AI Summary**:
A short AI-written description of one Report, published with the Report and labeled as AI-written.
_Avoid_: abstract, description

**AI Analysis** (分析):
An AI-written explanation of an Incident or a Brand, built from Published Reports. Each new version is public only after a Reviewer approves it; the public sees the last approved version, always labeled as AI-written.
_Avoid_: analysis (alone), report, summary
