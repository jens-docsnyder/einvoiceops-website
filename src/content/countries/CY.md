---
country: Cyprus
code: CY
flag: "🇨🇾"

mandate_type: interoperability
vida_alignment: DRR-inquiry
future_direction: "Cyprus B2G e-invoicing is mandated under Law 89(I)/2019 (Gazette No. 4717, June 26, 2019), implemented in phases based on tender value thresholds. The Treasury of the Republic is the Peppol implementation body (treasury.gov.cy). The platform is the Cyprus Government Gateway (gov.cy / Ariadni portal) plus the Peppol network. No B2B mandate exists."

b2b: none
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: "Phase-in by tender value: >=EUR 215k from November 2022; >=EUR 30k from May 2023; <EUR 30k from November 2023; <EUR 3k exempt. Phase-in complete as of November 2023."

key_deadlines:
  - date: 2022-11-01
    description: "B2G mandatory for tenders >= EUR 215,000"
  - date: 2023-05-01
    description: "B2G mandatory for tenders >= EUR 30,000"
  - date: 2023-11-01
    description: "B2G mandatory for tenders < EUR 30,000 (tenders < EUR 3,000 exempt)"

formats: [Peppol-BIS-3.0, UBL-2.1]
cius: null
platform: "Cyprus Government Gateway (Ariadni portal)"
platform_model: interoperability
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2023-11-01
outbound_mandate_date: 2023-11-01
outbound_mandate_date_phase2: null
mandate_hardness: "B2G hard-both for tenders above EUR 3,000; tenders below EUR 3,000 exempt"

master_data_id: "Cyprus company registration number and VAT number (CY + 8 digits + 1 letter). Peppol routing uses VAT number or registration number depending on buyer setup."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 7
penalty_max: null
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED
  - ACCEPTED
  - REJECTED

has_sandbox: false
last_verified: null
mandate_phase: transposition-stable
mandate_version: 1
confidence_summary: amber
unresolved_high: 0
unresolved_amber: 2
---

## Preparation Timeline

Cyprus B2G e-invoicing is mandated under Law 89(I)/2019 (Gazette No. 4717, June 26, 2019), with a phased rollout by tender value threshold. The Treasury of the Republic is the Peppol implementation body (treasury.gov.cy). The platform is the Cyprus Government Gateway (gov.cy / Ariadni portal) operating via Peppol.

Phase-in is complete as of November 2023 for all tenders above EUR 3,000. Tenders below EUR 3,000 remain exempt. The mandate covers suppliers to Cypriot public procurement - not just central government. No B2B mandate exists.

For groups with Cypriot public sector customers:

**Peppol BIS 3.0 via treasury.gov.cy (3-5 weeks with existing Peppol).** Cyprus uses Peppol BIS 3.0 for all B2G invoices above the EUR 3,000 threshold. If the group is already on Peppol for other EU countries, Cypriot B2G is an incremental routing registration.

**Tender value threshold check.** Not all Cypriot public procurement is in scope. For contracts below EUR 3,000, the e-invoice obligation does not apply. Groups should confirm which Cypriot public contracts are above or below the threshold before scoping implementation.

**Minimum:** 2-4 weeks with existing Peppol capability.

---

## Operational Ownership

**Finance Systems** owns Peppol BIS 3.0 / UBL 2.1 output and routing configuration for Cyprus using VAT number-based or registration number-based Peppol participant IDs.

**Tax/Compliance** owns threshold compliance (EUR 3,000 exemption applies transaction-by-transaction for tender value, not entity-level), 7-year archiving, and monitoring of any B2B mandate developments.

**Master Data/IT** owns Cyprus VAT number (CY + 8 digits + 1 letter) and company registration number data quality for Cypriot public sector buyers, Peppol Directory lookup, and treasury.gov.cy platform monitoring.

**IT** owns Peppol access point registration with Treasury of the Republic, Cyprus Government Gateway (Ariadni) integration if required, and cylaw.org monitoring for legal updates (cylaw.org/nomoi/arith/2019_1_89.pdf is the Law 89(I)/2019 URL).

**Where it breaks:** EUR 3,000 threshold misapplied. Groups that treat the EUR 3,000 exemption as an entity-level rather than transaction-level threshold incorrectly exclude contracts above EUR 3,000 from the e-invoice obligation. The threshold applies to the value of the individual tender/contract, not the entity's total volume.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**Treasury of the Republic.** treasury.gov.cy is the Peppol implementation body for Cyprus. The Cyprus Government Gateway (gov.cy / Ariadni portal) provides the buyer-side infrastructure. Suppliers connect via Peppol BIS 3.0.

**Phase-in by tender value.** The threshold figures (EUR 215k, EUR 30k, EUR 3k) are sourced from Marosa VAT (AMBER confidence) - they require verification against Gazette No. 4717 (gazettes.gov.cy). The structure is consistent with the EC factsheet but the exact threshold amounts need source verification.

**Archiving.** 7 years under standard Cypriot VAT law.

---

## The Friction Map

**Threshold-by-contract scope.** The EUR 3,000 exemption applies per contract/tender value, not per entity. Groups that have established a blanket exemption for a Cypriot public sector customer below EUR 3,000 and then win a larger contract may not have Peppol routing configured.

**Ariadni portal integration.** Some Cypriot public buyers operate via the Ariadni portal rather than standard Peppol Directory lookup. Groups that connect to Peppol but have not specifically verified Ariadni routing may find that some Cypriot buyers cannot be reached via standard Peppol Directory.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
