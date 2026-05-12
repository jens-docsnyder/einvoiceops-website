---
country: Hungary
code: HU
flag: "🇭🇺"

mandate_type: CTC
vida_alignment: DRR-compliant
future_direction: "Hungary is planning a full B2B e-invoicing mandate for 2028-2030 using a 5-corner Peppol model, building on the existing RTIR (Online Szamla) real-time reporting infrastructure. B2C digital receipt reporting becomes mandatory from September 1, 2026. The 2028-2030 transition will layer structured e-invoice exchange onto the existing NAV reporting obligation."

b2b: mandatory
b2g: mandatory
b2c_scope: "Digital receipt reporting mandatory from September 1, 2026 for B2C transactions (NAV Online Szamla system)"
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2021-04-01
    description: "All B2B invoices above HUF 100,000 mandatory in RTIR (Online Szamla v3.0)"
  - date: 2021-04-01
    description: "All B2C invoices mandatory in RTIR (Online Szamla v3.0)"
  - date: 2025-05-15
    description: "Online Szamla XML v3.0 mandatory for all submissions (v2.0 retired)"
  - date: 2026-09-01
    description: "B2C digital receipt reporting mandatory (NAV Online Szamla)"

formats: [EN-16931, UBL-2.1]
cius: "Online Szamla XML v3.0 (Hungarian national RTIR schema, not EN 16931 core invoice)"
platform: NAV-Online-Szamla
platform_model: CTC
transport_protocol: REST-API
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2021-04-01
outbound_mandate_date: 2021-04-01
outbound_mandate_date_phase2: null
mandate_hardness: hard-both

master_data_id: "11-digit Tax Number (adoszam): 8-digit tax ID + 1 VAT code digit + 2 area code digits. Required in all Online Szamla submissions. Format: XXXXXXXX-X-XX."
mandatory_pdf_bundle: none
foreign_resident_scope: true
archiving_years: 8
penalty_max: "HUF 1,000,000 for legal entities per violation; HUF 400,000 for natural persons per violation (Act CL of 2017, Art. 220, paragraph 1 - verified 2026-05-12)"
reporting_window: "Real-time for software-issued invoices; 24-hour deadline for manual/human-issued invoices above HUF 100,000 VAT; 7-day deadline for other manual invoices"
correction_mechanism: correction_invoice

document_lifecycle_states:
  - SUBMITTED
  - PROCESSING
  - DONE
  - ABORTED

has_sandbox: true
last_verified: null
mandate_phase: live-stable
mandate_version: 1
confidence_summary: amber
unresolved_high: 1
unresolved_amber: 1
---

## Preparation Timeline

Hungary's Online Szamla (Online Invoice) system has been mandatory for all B2B and B2C invoices since April 1, 2021. The system is operated by NAV (Nemzeti Ado- es Vamhivatal), the Hungarian Tax and Customs Authority. Every invoice must be reported to NAV in real-time (for software-generated invoices) or within 24 hours (for manual invoices above HUF 100,000 VAT). The Online Szamla XML v3.0 schema became the mandatory format from May 15, 2025.

This is a real-time reporting (post-audit / CTC) model - invoices are issued and simultaneously reported, but NAV does not pre-approve (clear) invoices before they reach the recipient. NAV validates the submission and returns status codes.

For B2G, mandatory reception of EN 16931-compliant e-invoices has been required for contracts above EU thresholds since November 1, 2019.

Foreign entities with Hungarian VAT registration are in scope.

For a group that is not yet connected:

**NAV API integration (6-10 weeks).** The billing engine must connect to the NAV Online Szamla REST API, authenticate per entity using NAV-issued credentials, submit XML v3.0 invoice data, and process the NAV response status. Standard ERP products require a custom connector or certified middleware.

**Tax number (adoszam) master data (2-4 weeks).** The 11-digit adoszam must be available for every Hungarian customer and vendor. The format (XXXXXXXX-X-XX) differs from the EU-format VAT number (HU + 8 digits) and must be stored in a dedicated field. Incorrect formatting causes NAV API submission rejections.

**v3.0 schema migration (4-6 weeks if previously on v2.0).** Online Szamla v2.0 was retired May 15, 2025. Any group still submitting on v2.0 is out of compliance. The migration requires XML schema mapping updates and validation against the v3.0 XSD.

**Minimum:** 8-12 weeks for a single entity with an existing ERP connector to update. **Stretched:** 16-24 weeks for multi-entity groups implementing from zero or migrating legacy connectors.

---

## Operational Ownership

**Finance Systems** owns the NAV Online Szamla API connector: credential management per Hungarian entity, XML v3.0 invoice generation, real-time submission, and NAV response processing. Every invoicing scenario - standard invoice, credit note, modification invoice - must produce valid Online Szamla XML. The modification invoice format (MODOSITO_SZAMLA) is the required correction mechanism, not a standard credit note.

**Tax/Compliance** owns scope determination: which Hungarian entities and transactions are in scope, the correct application of the 11-digit adoszam VAT code digit (which indicates VAT status), and the 8-year archiving obligation under Act C of 2000 on Accounting (Sec. 169) for accounting records. VAT records have a separate 5-year archiving requirement. The longer period (8 years for accounting) governs for invoices.

**Master Data/IT** owns adoszam scrubbing: sourcing the correct 11-digit adoszam for all Hungarian customers and vendors, validating format (including hyphen positions), and maintaining a dedicated adoszam field in ERP records. The EU VAT number (HU + 8 digits) does not satisfy the NAV submission requirement for the full 11-digit adoszam.

**IT** owns NAV API credential management, sandbox testing (using the NAV demo environment at onlineszamla.nav.gov.hu), monitoring of NAV service availability, and the business continuity procedure for NAV outages (24-hour buffer after service restoration).

**Where it breaks:** The v3.0 schema gap. Groups that implemented Online Szamla connectors before May 2025 on v2.0 may be submitting on a retired schema. NAV may accept submissions during a grace period and then retroactively flag non-compliance. The v3.0 migration is a mandatory upgrade, not optional.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**11-digit adoszam.** The Hungarian Tax Number has three segments: 8-digit core tax ID, 1-digit VAT code (1 = VAT payer, 2 = VAT-exempt, 3 = special VAT payer), and 2-digit area code (county). The EU-format VAT number used for intra-community transactions (HU + 8 digits) is the core ID only. NAV requires the full 11-digit adoszam for Online Szamla submissions. ERP master data must store both.

**Online Szamla XML v3.0.** The NAV XML schema is the Hungarian national format for real-time reporting. It is not EN 16931. The interface specification (v3.0) is published at onlineszamla.nav.gov.hu. ERP connectors must validate against the current XSD before submission. NAV rejects submissions with schema validation errors; the rejection reason is returned in the API response.

**Real-time reporting windows.** Software-issued invoices must be reported in real-time (at the moment of issuance). Manual invoices with VAT above HUF 100,000 have a 24-hour deadline. Other manual invoices have a 7-day deadline. Groups with mixed software/manual issuance must configure different submission queues for each category.

**Archiving split.** Act C of 2000 (Sec. 169) requires 8 years for accounting records. VAT Act has a separate 5-year requirement. The longer 8-year period should be applied to invoice records. NAV does not provide a government-run archiving service - archiving is the entity's own obligation.

**Business continuity.** If the NAV Online Szamla API is unavailable, invoices may be issued locally and submitted within 24 hours of service restoration. Groups without a documented local queue-and-submit procedure are exposed to gaps when NAV has outages.

---

## The Friction Map

**v2.0 connector still in production.** The Online Szamla v2.0 schema was retired May 15, 2025. ERP connectors built before 2025 that have not been updated are submitting on a retired format. NAV may not immediately reject all v2.0 submissions, but compliance risk accumulates. The v3.0 migration is a mandatory update with no grace period extension.

**Adoszam not available in vendor master.** Procurement teams typically collect EU VAT numbers (HU prefix + 8 digits) for intra-community trade. The 11-digit adoszam is a domestic-use identifier. AP and procurement processes that have not collected adoszam from Hungarian vendors cannot satisfy the NAV submission requirement. Sourcing adoszam retroactively for the full Hungarian vendor portfolio is a data enrichment project, not a one-time fix.

**B2C digital receipt scope from September 2026.** Groups with Hungarian retail or consumer-facing operations must add B2C digital receipt reporting to the NAV system from September 1, 2026. This is separate from B2B invoice reporting and may require a different integration path depending on the POS system.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
