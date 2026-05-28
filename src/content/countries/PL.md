---
country: Poland
code: PL
flag: "🇵🇱"

mandate_type: centralized-clearance
vida_alignment: ctc-national
future_direction: "Both mandatory phases now live (February 1 and April 1, 2026), per Act of May 9, 2024 (Dz.U. 2024 poz. 852). Penalties (Art. 106ni ust. 1-3, 5-7) suspended until December 31, 2026; enforcement begins January 1, 2027 per Act of August 5, 2025 (Dz.U. 2025 poz. 1203). January 1, 2027 proposed for micro-businesses - pending secondary legislation. FA(3) schema is the current standard; FA(2) invalid from January 31, 2026."

b2b: mandatory
b2g: mandatory
b2c_scope: none
status: live
phase_in: true
phase_in_scope: by_size

key_deadlines:
  - date: 2022-01-01
    description: KSeF voluntary phase live
  - date: 2026-02-01
    description: Mandatory Phase 1 - entities with 2024 total sales exceeding PLN 200 million
  - date: 2026-04-01
    description: Mandatory Phase 2 - all other VAT-registered entities
  - date: 2027-01-01
    description: Penalty enforcement begins — Art. 106ni ust. 1-3, 5-7 per Act of August 5, 2025 (Dz.U. 2025 poz. 1203 Art. 23 pkt 4)
  - date: 2027-01-01
    description: Proposed mandatory date for micro-businesses (pending secondary legislation)

formats: [FA-3]
cius: null
platform: "KSeF (Krajowy System e-Faktur)"
platform_model: centralized
transport_protocol: API-OAuth2
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2026-02-01
outbound_mandate_date: 2026-02-01
outbound_mandate_date_phase2: 2026-04-01
mandate_hardness: hard-both

master_data_id: "NIP (Numer Identyfikacji Podatkowej) — 10-digit, no PL prefix for domestic KSeF routing"
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 10
penalty_max: "Up to 100% of VAT amount on invoice; or 18.7% of total if no VAT shown — VAT Act Art. 106ni ust. 1-3, 5-7. Suspended until December 31, 2026; enforcement begins January 1, 2027 per Act of August 5, 2025 (Dz.U. 2025 poz. 1203 Art. 23 pkt 4). Ministry of Finance clarification (March 2026): maximum penalties do not have to apply automatically; assessment is case-by-case based on nature, scale, frequency, and corrective actions taken by the taxpayer."
reporting_window: null
correction_mechanism: correction_invoice

document_lifecycle_states:
  - SUBMITTED
  - PROCESSING
  - ACCEPTED
  - REJECTED

has_sandbox: true
last_verified: 2026-05-19
mandate_phase: active-rollout
mandate_version: 2
confidence_summary: green
unresolved_high: 0
unresolved_amber: 0
---

## Preparation Timeline

Both KSeF mandatory phases are now live. Phase 1 (entities with 2024 total sales exceeding PLN 200 million) went mandatory February 1, 2026. Phase 2 (all other VAT-registered entities) went mandatory April 1, 2026, per the Act of May 9, 2024 (Dz.U. 2024 poz. 852: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240000852). Penalty enforcement starts January 1, 2027 per Act of August 5, 2025 (Dz.U. 2025 poz. 1203) - giving companies a formal grace window on penalties until then.

KSeF was delayed from its original 2024 launch following a technical audit. The current schedule is legally fixed. One open uncertainty: the reference year for Phase 1 threshold is stated as 2024 in the enacted law, but the Ministry of Finance held consultations on shifting it to 2025 - the enacted law remains 2024.

Implementation from a standing start takes 4-8 months for a Polish entity embedded in a foreign group ERP.

**KSeF API integration (6-10 weeks).** All invoices must reach the KSeF REST API (v2.0) directly. Unlike France's PA model, there is no certified intermediary requirement - companies may use service providers but the API endpoint is the same for all. Authentication uses OAuth2 tokens linked to the Polish entity's NIP, generated via the ZAW-FA authorization form that registers which systems or individuals may act on behalf of the entity in KSeF.

**Authentication transition - tokens to certificates.** OAuth2 tokens are valid only through 31 December 2026. From 1 January 2027, only KSeF certificates may authenticate API calls. Certificate functionality has been available in KSeF API 2.0 since February 2026, in parallel with tokens during the transition window. Migration requires Tax + IT coordination: certificate requests and retrieval are handled in the Certificates and Permissions Module (MCU), with the certificate serving solely as authentication (not as a permissions store like the token). Source: ksef.podatki.gov.pl certificates documentation.

**FA(3) schema mapping (6-8 weeks).** FA(3) is a pure Polish XML standard with no relation to EN 16931 or Peppol BIS 3.0. Every ERP billing scenario must map to the FA(3) structure. Fields that standard global ERP templates do not contain: GTU goods classification codes (01-13), Split Payment flag for transactions exceeding PLN 15,000 in specific goods categories, related-party indicator for intragroup transactions, and NIP routing for both sender and recipient without the "PL" country prefix.

**Master data scrubbing (3-4 weeks).** The NIP is a 10-digit number used without the "PL" prefix for domestic KSeF routing. Multi-country ERPs store Polish entities' VAT IDs with the "PL" prefix (required for VIES). KSeF rejects submissions where the NIP includes the country prefix. The NIP and the VAT ID must be stored in separate ERP fields.

**Minimum:** 3-4 months for a single Polish entity with clean ERP and dedicated integration resource. **Stretched:** 6-9 months for SAP S/4HANA environments, SSC billing models, or entities with thin ERP configurations.

## Operational Ownership

**Finance Systems** owns FA(3) schema mapping and billing engine reconfiguration. Every billing scenario must produce valid FA(3) XML. The schema is more demanding than Peppol BIS 3.0: GTU classification, Split Payment flags, and related-party indicators are absent from any standard ERP global template. Last-mile configuration per entity is unavoidable.

**Tax/Compliance** owns GTU code mapping (which material groups map to which of the 13 Polish goods classification codes - a Tax judgment), scope determination (Fixed Establishment test, Phase 1 threshold per entity), and JPK_V7 VAT filing alignment with KSeF numbers after August 2026.

**AP Operations** must download inbound invoices from the KSeF buyer inbox. Under KSeF, the buyer retrieves the sealed XML from the platform - invoices are not delivered to a buyer endpoint. AP processes that depend on supplier-sent PDFs are processing informational copies, not legal originals. VAT deduction requires the KSeF-accepted XML.

**IT** owns the REST API connection, token management, ZAW-FA authorization setup for each Polish entity or SSC billing on its behalf, and the callback loop that writes the KSeF number back into the ERP document header.

**Where it breaks:** SSC billing models where one centre bills on behalf of multiple Polish subsidiaries. Each subsidiary's NIP requires its own KSeF authorization token and ZAW-FA registration. A single token for multiple entities is not structurally possible. Groups that design around a single-entity token cannot extend it without restarting the authorization process.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

## Data & Infrastructure

**The NIP problem.** The NIP is Poland's domestic tax number, 10 digits, no country prefix. The VAT ID used for EU VIES reporting is the same number prefixed "PL." KSeF routing for domestic transactions uses the NIP without the prefix. Standard ERP master data fields conflate these two identifiers. Submitting with the "PL" prefix causes immediate KSeF rejection.

**The GTU mapping gap.** GTU codes (01-13) classify specific goods and services including electronics, fuel, vehicles, alcohol, tobacco, precious metals, pharmaceuticals, and professional services. These do not align with any standard ERP material group taxonomy. Every product and service line must be mapped to the correct GTU code or flagged as no-GTU for standard goods. This requires Tax review - it cannot be automated.

**The Split Payment flag.** Invoices exceeding PLN 15,000 (gross) for specific goods and services require an explicit Split Payment (MPP) flag in the FA(3) XML. Standard ERP payment term configurations do not include this field. Missing the flag on a qualifying transaction produces a KSeF schema error and a tax liability risk simultaneously.

**KSeF number flow.** Once accepted, KSeF assigns a KSeF number (35 characters). This must be stored in the ERP invoice header and cross-referenced in the monthly JPK_V7 VAT filing. ERPs must be configured to receive the KSeF number via API callback and write it back to the posted document.

**The Midnight Gap.** KSeF records the date and time of acceptance as the legal invoice date - not the ERP entry date. Invoices generated at month-end in a non-Polish time zone, or in overnight batch runs, may arrive at KSeF after midnight Polish time, pushing the legal invoice date into the next tax period. Month-end batch billing processes must align with the KSeF timestamp, not the ERP post date.

## Correction & Business Continuity

**Correction:** Poland uses correction invoices (Faktura korygująca), not credit notes (VAT Act Art. 106j). The correction must be a valid FA(3) XML submitted to KSeF, referencing the KSeF ID of the original. No correction can be issued for a rejected invoice - a rejected invoice has no KSeF ID and legally does not exist.

**Offline Mode (Tryb Offline24):** When KSeF is unavailable, invoices may be issued offline with a QR code containing a verification link. Once KSeF is back online, offline invoices must be uploaded by the next business day (VAT Act Art. 106nf). For an officially declared system failure, the deadline extends to 7 business days after resolution.

**ERP rejection flow:** When a KSeF submission is rejected, the ERP document is typically already posted and locked. Standard ERP transactional integrity prevents re-editing. Correct process: cancel the original document (reversal posting), fix the data issue, post a new document with a new internal number.

## The Friction Map

**The NIP/VAT ID confusion.** The most common KSeF rejection in the first weeks. The "PL" prefix required for VIES reporting must be stripped for domestic KSeF NIP routing. ERP master data that was never separated between the EU VAT ID and the domestic NIP produces immediate platform rejection.

**GTU code gaps.** Companies with large product catalogues discover mid-implementation that half their materials have no GTU mapping. Schema validation returns a generic error that does not identify which line item caused the rejection. Tax teams brought in late to do GTU mapping block go-live.

**SSC token architecture.** An SSC billing for three Polish subsidiaries needs three separate KSeF authorization tokens and three ZAW-FA registrations. Groups that designed the KSeF integration around a single entity's NIP cannot extend the same connection to additional Polish entities without re-architecting.

**The Midnight Gap.** Month-end batch billing runs that cross midnight Polish time shift the legal KSeF invoice date into the next period. The ERP books the accrual in the correct period; the VAT period is one month later. This surfaces at the first JPK_V7 filing after go-live.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

## The "Ready" Definition

A Polish KSeF operation is ready when four conditions hold:

- Every Polish entity's KSeF API connection is live with a valid NIP-linked authorization token, and the ZAW-FA form has been filed for every billing entity or SSC acting on its behalf
- Every billing scenario produces valid FA(3) XML with correct GTU codes, Split Payment flags, and related-party indicators - confirmed by successful KSeF acceptance, not only schema pre-validation
- The KSeF number flows automatically back into the ERP header record and is included in JPK_V7 filings and Split Payment transfer descriptions
- AP Operations downloads and archives the KSeF-sealed XML for all inbound supplier invoices, not the PDF copy

The audit test: if a Polish tax inspector asks for the legal original of any invoice from the past two years, can you produce the KSeF-sealed XML with the KSeF ID? If AP is archiving PDFs and not the KSeF XML, the operation is not compliant.
