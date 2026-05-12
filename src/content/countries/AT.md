---
country: Austria
code: AT
flag: "🇦🇹"

mandate_type: interoperability
vida_alignment: DRR-compliant
future_direction: "Abgabenänderungsgesetz 2025 (AbgÄG 2025, BGBl. I) establishes mandatory B2B e-invoicing from January 1, 2028. This is enacted law, not a parliamentary resolution. Two national CIUS exist: CIUS-AT-NAT (B2B domestic) and CIUS-AT-GOV (B2G). GLN is the primary routing identifier for B2G. The Austrian Peppol Authority is BRZ (Bundesrechenzentrum), hosted at e-rechnung.gv.at."

b2b: announced
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2028-01-01
    description: "B2B e-invoicing mandatory (Abgabenänderungsgesetz 2025 - enacted law)"

formats: [UBL-2.1, CII-UN-CEFACT, Peppol-BIS-3.0, ebInterface-6.1]
cius: "CIUS-AT-NAT (B2B domestic); CIUS-AT-GOV (B2G)"
platform: e-rechnung.gv.at
platform_model: interoperability
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2028-01-01
outbound_mandate_date: 2028-01-01
outbound_mandate_date_phase2: null
mandate_hardness: "B2G hard-both (live); B2B announced January 2028 (AbgÄG 2025 enacted)"

master_data_id: "GLN (Global Location Number) - primary routing identifier for B2G. Austrian VAT number (ATU + 8 digits) for VAT identification. For Peppol: scheme 0088 (GLN)."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 7
penalty_max: "EUR 5,000 per violation (FinStrG - Finanzstrafgesetz)"
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED
  - ACCEPTED
  - REJECTED

has_sandbox: true
last_verified: null
mandate_phase: active-rollout
mandate_version: 1
confidence_summary: amber
unresolved_high: 2
unresolved_amber: 2
---

## Preparation Timeline

Austria's B2G e-invoicing has been mandatory for federal government since 2014 via the e-rechnung.gv.at platform, operated by BRZ (Bundesrechenzentrum). The platform accepts Peppol BIS 3.0, UBL 2.1, CII, and the Austrian national format ebInterface 6.1. GLN is the primary routing identifier for B2G. The Austrian Peppol Authority is BRZ, accessible at e-rechnung.gv.at - there is no standalone peppol.at authority.

B2B e-invoicing becomes mandatory from January 1, 2028 under the Abgabenänderungsgesetz 2025 (AbgÄG 2025). This is enacted law. Two national CIUS apply: CIUS-AT-NAT for domestic B2B and CIUS-AT-GOV for B2G. Both are maintained by AUSTRIAPRO (WKO association) at ebinterface.at.

WKO (Wirtschaftskammer Osterreich) publishes the "Leitfaden E-Rechnung" implementation guide. A certified service provider list is maintained at usp.gv.at.

For groups with Austrian public sector customers (B2G, currently live):

**e-rechnung.gv.at registration (2-4 weeks).** Suppliers to Austrian federal government must register on the platform. The test environment is at test.erechnung.gv.at. GLN must be pre-registered and linked to the Austrian entity.

**ebInterface vs. Peppol choice.** The platform accepts both ebInterface 6.1 (Austrian national format) and Peppol BIS 3.0. Groups already on Peppol for other EU countries can use Peppol BIS 3.0 for Austrian B2G without implementing ebInterface. Groups implementing Austria as a first Peppol country face a choice between ebInterface (simpler for Austria-only) and Peppol (better for multi-country scale).

**B2B mandate preparation (now to January 2028).** AbgÄG 2025 is enacted. Groups should begin B2B readiness planning: CIUS-AT-NAT scope, format requirements, and access point configuration for domestic B2B.

**Minimum:** 3-6 weeks for B2G with existing Peppol capability. **Stretched:** 10-16 weeks for B2B from zero Austrian implementation starting 2027.

---

## Operational Ownership

**Finance Systems** owns Peppol BIS 3.0 / UBL 2.1 / ebInterface 6.1 output, e-rechnung.gv.at transmission, and the CIUS-AT-NAT format configuration for January 2028 B2B.

**Tax/Compliance** owns scope determination for both B2G (current) and B2B (January 2028), BAO §132 archiving compliance (7 years), and penalty monitoring under FinStrG (EUR 5,000 per violation).

**Master Data/IT** owns GLN registration and maintenance for Austrian entities (e-rechnung.gv.at requires pre-registered GLN), Austrian VAT number (ATU + 8 digits) data quality, and Peppol scheme 0088 configuration.

**IT** owns BRZ/e-rechnung.gv.at access point integration, test environment (test.erechnung.gv.at) validation, and BMF RSS monitoring (bmf.gv.at/service/news.html) for regulatory updates.

**Where it breaks:** GLN not registered. Austrian federal government buyers look up suppliers by GLN. If the supplier's GLN is not registered in the e-rechnung.gv.at directory before the first invoice, routing fails. GLN registration is a prerequisite that must happen before any test invoice is submitted.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**GLN as primary B2G routing identifier.** Austrian federal B2G routing uses GLN (Global Location Number, scheme 0088) rather than VAT number-based Peppol IDs. Groups without GLNs for their Austrian entities must obtain GLNs from GS1 Austria and register them in the e-rechnung.gv.at directory before any B2G transmission.

**ebInterface 6.1.** The Austrian national invoice format, maintained by AUSTRIAPRO (ebinterface.at). ebInterface is accepted alongside Peppol BIS 3.0 at e-rechnung.gv.at. For multi-country Peppol implementations, Peppol BIS 3.0 is typically preferred over ebInterface. For Austria-only implementations, ebInterface may be simpler.

**CIUS-AT-NAT and CIUS-AT-GOV.** Two national CIUS exist. CIUS-AT-GOV governs B2G format requirements. CIUS-AT-NAT will govern domestic B2B under the 2028 mandate. Both are maintained at ebinterface.at. The specific field extensions in each CIUS must be mapped in ERP output.

**Archiving.** 7 years under BAO (Bundesabgabenordnung) §132. Invoice records must be stored in the original electronic format, not converted to PDF only.

---

## The Friction Map

**GLN not in ERP master data.** GLN is the primary Austrian B2G routing identifier. ERP customer/vendor master records typically store VAT numbers and company registration numbers. GLN is an additional field that must be sourced from each Austrian public sector buyer, registered in GS1 Austria's registry, and stored in a dedicated ERP field.

**ebInterface vs. CIUS-AT-NAT confusion.** Groups implementing Austria for B2G using ebInterface may assume the same format covers B2B under the 2028 mandate. CIUS-AT-NAT is the B2B standard - it differs from ebInterface in structure. The format strategy for January 2028 must be explicitly decided before ERP configuration begins.

**B2B mandate planning gap.** AbgÄG 2025 is enacted for January 2028. Groups with Austrian subsidiaries that have not begun B2B readiness planning have less than 20 months from May 2026. Multi-entity Austrian groups (common for manufacturing and retail) require entity-level scoping before CIUS-AT-NAT implementation can begin.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
