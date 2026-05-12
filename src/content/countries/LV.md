---
country: Latvia
code: LV
flag: "🇱🇻"

mandate_type: CTC
vida_alignment: DRR-compliant
future_direction: "Latvia implemented a CTC/reporting model for B2G and G2G from January 1, 2026, using Cabinet Regulation No. 749 (December 9, 2025). B2B scope extension is under consideration but not yet enacted. Latvia intentionally chose a reporting model over clearance to preserve business continuity if VID (State Revenue Service) systems are unavailable. EU ViDA Directive 2025/516/EU confirmed at EUR-Lex (OJ:L_202500516, Augur SIG-005 2026-05-12): Digital Reporting Requirements (DRR) and cross-border e-invoice mandatory from July 1, 2030. This is the primary legal basis for future B2B e-invoicing obligations in countries currently at policy/planning stage."

b2b: not-yet
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2026-01-01
    description: "B2G and G2G e-invoicing mandatory; voluntary for non-budget B2G from same date (Cabinet Regulation No. 749)"

formats: [UBL-2.1, Peppol-BIS-3.0]
cius: null
platform: none
platform_model: CTC
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2026-01-01
outbound_mandate_date: 2026-01-01
outbound_mandate_date_phase2: null
mandate_hardness: "hard-both for B2G; voluntary for non-budget B2G entities from January 1, 2026"

master_data_id: "Peppol Participant ID using scheme 0218 (company registration number) or scheme 9939 (VAT number). Business registration number is the primary identifier for Latvian entities."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 10
penalty_max: "Up to EUR 20,000 for systemic non-compliance (general accounting and tax penalty framework)"
reporting_window: "5 working days for structured e-invoice submission (Cabinet Regulation 749 Point 14)"
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED
  - ACCEPTED
  - REJECTED

has_sandbox: false
last_verified: null
mandate_phase: active-rollout
mandate_version: 1
confidence_summary: amber
unresolved_high: 1
unresolved_amber: 0
---

## Preparation Timeline

Latvia's e-invoicing framework covers B2G and G2G transactions under Cabinet Regulation No. 749 (December 9, 2025), which implements the Accounting Law amendment of October 2024 (amended again June 2025 with a postponement provision). The effective date is January 1, 2026.

This is a reporting model: invoices are transmitted and reported to VID (Valsts ienemumu dienests - State Revenue Service) within 5 working days of issuance. Latvia explicitly rejected a clearance model to maintain business continuity if VID systems are unavailable - invoices can be issued and sent to the buyer without VID pre-approval.

The mandate covers budget institutions (central government, municipalities) as buyer-side recipients. Non-budget public entities may participate voluntarily from January 1, 2026. No B2B mandate has been enacted. Foreign entities are out of scope for the current mandate.

For a group with Latvian public sector customers:

**Peppol access point setup (3-5 weeks).** Latvia uses Peppol BIS 3.0 for B2G transmission and UBL 2.1 as the supported format. If the group is already on Peppol for another EU country, Latvian B2G is an incremental Peppol routing configuration. The Latvian entity's Peppol ID uses scheme 0218 (registration number) or 9939 (VAT number).

**5-working-day reporting queue (2-4 weeks).** The 5-working-day window (Cabinet Regulation 749 Point 14) means invoices must be submitted to VID within 5 working days of issuance. A submission queue and monitoring process is required to ensure all invoices meet this window.

**Minimum:** 4-8 weeks with existing Peppol capability. **Stretched:** 10-14 weeks from zero Peppol presence.

---

## Operational Ownership

**Finance Systems** owns Peppol BIS 3.0 / UBL 2.1 output for Latvian B2G and the 5-working-day submission queue to VID. The submission uses the EDS portal (eps.vid.gov.lv) or direct API.

**Tax/Compliance** owns the 5-working-day reporting compliance check, the 10-year archiving requirement under Accounting Law Section 28, and the VID submission monitoring process.

**Master Data/IT** owns Peppol participant ID setup using Latvian registration numbers (scheme 0218) or VAT numbers (scheme 9939) for each Latvian entity and for Latvian public sector buyers.

**IT** owns Peppol access point registration, VID EDS portal integration or API connection, and submission monitoring.

**Where it breaks:** The 5-working-day submission window requires an automated queue with monitoring. Manual submission processes exceed the window during high-volume periods or holiday weeks. Groups without an automated submission pipeline discover compliance gaps retroactively via VID queries.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**Peppol schemes.** Latvian entities are identified in Peppol using scheme 0218 (company registration number, 11-digit format for legal persons) or scheme 9939 (VAT number without LV prefix). The registration number is the primary identifier. Buyer-side Peppol IDs for Latvian government entities are available via the Peppol Directory.

**5-working-day window.** The reporting window is 5 working days from invoice issuance date (Cabinet Regulation 749 Point 14 - confirmed via WebFetch). This is a reporting obligation to VID, separate from the transmission to the buyer. Both must occur: the invoice is sent to the buyer via Peppol, and the invoice data is reported to VID via EDS submission portal.

**Accounting Law archiving.** 10-year archiving is required under Accounting Law Section 28. This covers invoice records including structured XML - not PDF exports.

---

## The Friction Map

**5-working-day window missed during volume peaks.** The 5-working-day reporting obligation to VID is separate from the invoice transmission to the buyer. Groups that have not set up an automated VID submission queue may meet Peppol transmission deadlines but miss VID reporting deadlines during high-volume periods.

**Peppol ID scheme confusion.** Latvia uses scheme 0218 (registration number) as primary, not the VAT number scheme used in many other EU countries. ERP Peppol routing configurations that default to VAT number routing must be reconfigured for Latvian public sector buyers.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
