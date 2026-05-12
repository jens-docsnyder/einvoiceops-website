---
country: Ireland
code: IE
flag: "🇮🇪"

mandate_type: interoperability
vida_alignment: DRR-compliant
future_direction: "Ireland's Revenue Commissioners confirmed a phased B2B e-invoicing mandate in October 2026. Phase 1 (November 1, 2028): large corporates managed by Revenue's Large Corporates Division. Phase 2 (November 1, 2029): all VAT-registered entities in domestic and intra-EU B2B trade. OGP (Office of Government Procurement) is the Irish Peppol Authority; einvoicingireland.ie is the Peppol operations domain. EU ViDA Directive 2025/516/EU confirmed at EUR-Lex (OJ:L_202500516): Digital Reporting Requirements (DRR) and cross-border e-invoice mandatory from July 1, 2030. This is the primary legal basis for future B2B e-invoicing obligations in countries currently at policy/planning stage."

b2b: announced
b2g: mandatory
b2c_scope: none
status: live
phase_in: true
phase_in_scope: "Phase 1: large corporates (Revenue's Large Corporates Division) - November 1, 2028. Phase 2: all VAT-registered entities in domestic/intra-EU B2B - November 1, 2029."

key_deadlines:
  - date: 2028-11-01
    description: "B2B Phase 1: large corporates mandatory (Revenue press release October 2026)"
  - date: 2029-11-01
    description: "B2B Phase 2: all VAT-registered entities in domestic/intra-EU B2B mandatory"

formats: [Peppol-BIS-3.0, UBL-2.1]
cius: null
platform: none
platform_model: interoperability
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2028-11-01
outbound_mandate_date: 2028-11-01
outbound_mandate_date_phase2: 2029-11-01
mandate_hardness: "B2G hard-both (live); B2B Phase 1 announced November 2028"

master_data_id: "Peppol Participant ID using scheme ISO6523:9935 (Ireland VAT Number). Irish VAT number (IE prefix + 8-9 characters) is the primary Peppol routing identifier."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 6
penalty_max: null
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED
  - ACCEPTED
  - REJECTED

has_sandbox: false
last_verified: 2026-05-12
mandate_phase: active-rollout
mandate_version: 1
confidence_summary: green
unresolved_high: 0
unresolved_amber: 0
---

## Preparation Timeline

Ireland's B2G e-invoicing is mandatory under S.I. No. 258/2019 (European Union (Electronic Invoicing in Public Procurement) Regulations 2019), which transposed the EU B2G directive. The Irish Peppol Authority is OGP (Office of Government Procurement), operating via einvoicingireland.ie. B2G uses Peppol BIS 3.0 with the Irish VAT number as the Peppol participant identifier (scheme ISO6523:9935).

B2B e-invoicing will be mandatory in two phases: November 1, 2028 for large corporates (Revenue's Large Corporates Division), and November 1, 2029 for all VAT-registered entities in domestic and intra-EU B2B trade. The Revenue Commissioners announced this in October 2026. Phase 2 scope for non-established entities has not been fully confirmed as of May 2026.

For groups with Irish public sector customers (B2G, currently live):

**Peppol BIS 3.0 via Irish VAT scheme (3-5 weeks with existing Peppol).** Irish B2G uses scheme ISO6523:9935 for Peppol participant IDs based on the Irish VAT number. If the group is already on Peppol for other EU countries, Irish B2G is an incremental routing and registration configuration.

**B2B Phase 1 preparation.** Large corporates should begin readiness planning now: Phase 1 applies in November 2028, giving approximately 30 months from May 2026. The Large Corporates Division threshold and precise scope will be confirmed closer to legislation publication.

**Minimum:** 3-5 weeks for B2G with existing Peppol capability. **Stretched:** 8-14 weeks from zero Peppol presence.

---

## Operational Ownership

**Finance Systems** owns Peppol BIS 3.0 / UBL 2.1 output, Irish VAT number-based Peppol participant ID configuration (scheme ISO6523:9935), and the B2B Phase 1 readiness configuration for November 2028.

**Tax/Compliance** owns scope determination: which Irish entities are in Revenue's Large Corporates Division (Phase 1), 6-year archiving obligation, and monitoring of Revenue's B2B mandate legislation as it progresses from announcement to enacted law.

**Master Data/IT** owns Irish VAT number data quality for Peppol routing (scheme 9935), OGP/einvoicingireland.ie registration, and monitoring of Peppol Directory for Irish public sector buyer IDs.

**IT** owns Peppol access point registration with OGP, test environment verification via Peppol test network, and Revenue RSS/press office monitoring for B2B mandate updates.

**Where it breaks:** Phase 1 scope definition. Large Corporates Division membership is determined by Revenue. Groups that assume Phase 1 does not apply to them without confirming their Revenue division classification may face unexpected Phase 1 obligations.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**Peppol scheme ISO6523:9935.** Ireland uses the VAT number as the Peppol participant identifier. The scheme code is ISO6523:9935 (IE VAT). This differs from the VAT-based scheme used in some other EU countries (e.g., 9925 for Austria). ERP Peppol routing must use the correct scheme code for Irish participants.

**No central B2B platform.** Ireland's B2B model is interoperability-based (Peppol network), not a central clearance or reporting platform. This is the same architectural model as Belgium, Netherlands, and Germany - network-based exchange without a government-operated clearance hub.

**Archiving.** 6-year archiving under Irish VAT law. Records must be kept in a form that allows Revenue to verify compliance.

---

## The Friction Map

**Large Corporates Division classification.** Revenue's B2B Phase 1 applies to entities managed by the Large Corporates Division. Not all large companies are in this division - Revenue determines membership. Groups with Irish operations should confirm their Revenue division classification before assuming Phase 1 or Phase 2 applies.

**Phase 2 non-established scope unconfirmed.** The November 2029 Phase 2 description as of May 2026 covers "all VAT-registered entities in domestic/intra-EU B2B trade." Whether non-established entities with Irish VAT registration are included in Phase 2 has not been confirmed. Groups with Irish VAT registrations but no physical presence should monitor Revenue announcements for Phase 2 scope clarification.

**30 months to Phase 1.** Phase 1 applies November 2028. Groups in Revenue's Large Corporates Division that wait for enacted legislation before beginning implementation may find 12-18 months of runway after publication - tight for multi-entity groups starting from zero Peppol capability.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
