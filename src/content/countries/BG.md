---
country: Bulgaria
code: BG
flag: "🇧🇬"

mandate_type: interoperability
vida_alignment: DRR-inquiry
future_direction: "Bulgaria's B2G e-invoicing is mandated under the Public Procurement Act (ZOP) Art. 115a (State Gazette No. 86/2018), with Peppol as the transport infrastructure for invoice exchange. SAF-T reporting is being phased in from 2026 to 2030 by entity size. No B2B e-invoicing mandate exists and no formal consultation has been announced as of May 2026."

b2b: none
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2026-01-01
    description: "SAF-T phase 1: large enterprises with turnover >BGN 300M or tax >BGN 3.5M"
  - date: 2027-01-01
    description: "SAF-T phase 2: enterprises with turnover >BGN 150M or tax >BGN 3.5M"
  - date: 2028-01-01
    description: "SAF-T phase 3: enterprises with turnover >BGN 15M or tax >BGN 1.5M"
  - date: 2029-01-01
    description: "SAF-T phase 4: all remaining SMEs"
  - date: 2030-01-01
    description: "SAF-T phase 5: micro-enterprises"

formats: [Peppol-BIS-3.0, UBL-2.1]
cius: null
platform: "CAIS EPP (Central Administration Information System - Electronic Public Procurement)"
platform_model: interoperability
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: null
outbound_mandate_date: null
outbound_mandate_date_phase2: null
mandate_hardness: "B2G hard-outbound (suppliers to public procurement); no B2B mandate"

master_data_id: "EIK (Edinen identifikatsionen kod) - Unified Identification Code, 9-digit company registration number. Used for Peppol participant identification."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 10
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
mandate_version: 1
confidence_summary: amber
unresolved_high: 0
unresolved_amber: 3
---

## Preparation Timeline

Bulgaria's B2G e-invoicing is mandated under the Public Procurement Act (ZOP) Art. 115a (State Gazette No. 86/2018). The platform is CAIS EPP, and Peppol is used for invoice exchange. No B2B mandate exists. The primary near-term compliance development is SAF-T (Standard Audit File for Tax), which is being phased in from 2026 to 2030 based on entity size.

SAF-T uses the OECD SAF-T Standard v2.0 via NRA (National Revenue Agency) XML/XSD schema. This is a reporting obligation, separate from e-invoice exchange. Large enterprises (turnover >BGN 300M) must report from January 1, 2026.

For groups with Bulgarian public sector customers:

**Peppol/CAIS EPP registration (3-5 weeks).** Suppliers to Bulgarian public procurement must be registered for electronic invoice exchange via Peppol or CAIS EPP. The Bulgarian entity's identifier is the EIK (9-digit company registration code).

**SAF-T compliance (timeline varies by entity size).** SAF-T reporting to NRA is a separate obligation from e-invoice exchange. The NRA XML/XSD schema must be used. Large Bulgarian entities should assess their 2026 SAF-T obligation immediately.

**Minimum:** 3-5 weeks for B2G with existing Peppol capability. SAF-T is a separate track with its own implementation timeline per entity size threshold.

---

## Operational Ownership

**Finance Systems** owns Peppol BIS 3.0 / UBL 2.1 output for Bulgarian B2G and CAIS EPP integration.

**Tax/Compliance** owns SAF-T obligation assessment per entity (which threshold applies, which year), NRA XML/XSD schema compliance, and 10-year archiving. SAF-T reporting is a standing periodic obligation once the entity's threshold phase begins.

**Master Data/IT** owns EIK data quality for all Bulgarian customers and vendors, Peppol participant ID setup, and NRA schema versioning monitoring.

**IT** owns Peppol access point registration for Bulgaria, CAIS EPP API integration, and NRA SAF-T submission portal (EDS or equivalent).

**Where it breaks:** SAF-T scope underestimated. Groups with multiple Bulgarian entities may have entities at different SAF-T threshold levels, triggering compliance in different years. Entity-level threshold assessment is required before a single implementation timeline can be set.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**EIK.** Bulgaria's Unified Identification Code (Edinen identifikatsionen kod, EIK) is a 9-digit company registration number issued by the Trade Register. It is the primary identifier for Bulgarian legal entities - distinct from the Bulgarian VAT number (BG prefix + 9 digits). Peppol participant IDs for Bulgarian entities are typically based on the EIK.

**CAIS EPP.** The Central Administration Information System for Electronic Public Procurement is the Bulgarian public procurement platform. It handles both procurement and invoice exchange. Suppliers registered for public procurement are automatically in scope for CAIS EPP invoice submission.

**SAF-T NRA schema.** The Bulgarian SAF-T format uses the OECD SAF-T Standard v2.0 implemented via NRA-specific XML/XSD schema. This schema is maintained by NRA (Natsionalna agentsiya za prihodite). lex.bg and dv.parliament.bg are the authoritative sources for Bulgarian law consolidated texts.

---

## The Friction Map

**SAF-T threshold surprise.** Bulgarian SAF-T phases in over 5 years. Groups with Bulgarian subsidiaries at different size levels will have different SAF-T start years. A holding company above BGN 300M threshold must start 2026; a smaller subsidiary may not start until 2028 or 2029. Without entity-level threshold mapping, groups assume all Bulgarian entities have the same timeline and miss the large-entity 2026 obligation.

**EIK vs. VAT number confusion.** Bulgarian public procurement uses the EIK, not the VAT number, as the primary company identifier. ERP master records that store only VAT numbers for Bulgarian entities cannot populate EIK-based Peppol participant IDs without dedicated field setup.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
