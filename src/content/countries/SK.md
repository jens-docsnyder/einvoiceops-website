---
country: Slovakia
code: SK
flag: "🇸🇰"

mandate_type: CTC
vida_alignment: DRR-compliant
future_direction: "Law No. 385/2025 Z.z. (enacted December 9, 2025; published December 19, 2025) establishes mandatory B2B e-invoicing from January 2027 using a CTC/reporting model. Voluntary adoption opens May 2026. Non-established entities join the obligation in July 2030 under the ViDA timeline. The Financial Directorate is the Slovak Peppol Authority."

b2b: announced
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2026-05-01
    description: "Voluntary adoption of B2B e-invoicing opens under Law 385/2025 Z.z."
  - date: 2027-01-01
    description: "B2B e-invoicing mandatory for established entities (Law 385/2025 Z.z.)"
  - date: 2030-07-01
    description: "B2B e-invoicing mandatory for non-established entities (ViDA alignment)"

formats: [UBL-2.1, Peppol-BIS-3.0]
cius: null
platform: "Digital Postal Service (Digitalny postal)"
platform_model: CTC
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2027-01-01
outbound_mandate_date: 2027-01-01
outbound_mandate_date_phase2: null
mandate_hardness: "announced - mandatory from January 2027 (Law 385/2025 Z.z.)"

master_data_id: "Peppol Participant ID using scheme 0245 (SG:DIC - Slovak DIc, Tax Identification Number). Distinct from scheme 0158 (ICO, company registration number). ERPs often store both separately - the Peppol routing uses DIC (0245), not ICO."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 10
penalty_max: "Up to EUR 10,000 per violation; up to EUR 100,000 for repeat violations (Law 385/2025 Z.z. Čl. I — confirmed slov-lex.sk 2026-05-12)"
reporting_window: "Near real-time reporting of Tax Data Document (TDD) to tax authority"
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - TDD_REPORTED
  - DELIVERED
  - ACCEPTED
  - REJECTED

has_sandbox: true
last_verified: 2026-05-12
mandate_phase: active-rollout
mandate_version: 1
confidence_summary: amber
unresolved_high: 0
unresolved_amber: 4
---

## Preparation Timeline

Slovakia's B2B e-invoicing mandate is established by Law No. 385/2025 Z.z. (enacted December 9, 2025, published December 19, 2025). The law introduces a CTC/reporting model: invoices are transmitted via the certified "Digitalny postal" (Digital Postman) platform or via Peppol, with a Tax Data Document (TDD) reported to the tax authority in near real-time. The Financial Directorate is the Slovak Peppol Authority.

The mandate timeline: voluntary adoption from May 2026, mandatory for established entities from January 2027, mandatory for non-established entities from July 2030 (aligned with the EU ViDA timeline). B2G is already live; B2B is the new obligation.

For groups with Slovak established entities:

**Peppol scheme 0245 configuration (3-4 weeks).** Slovak Peppol routing uses scheme 0245 (SG:DIC - Slovak DIC, Tax Identification Number). This is distinct from scheme 0158 (IČO, company registration number) - most multi-country ERP setups store both, but the Peppol routing requires DIC. Access point providers must explicitly support scheme 0245, not just standard GLN (0088) or VAT-based schemes.

**Digital Postman accreditation (4-8 weeks).** Slovakia uses a 5-corner Peppol model - the Slovak Financial Directorate sits as an intermediary between sender and receiver. Both sender-side and receiver-side Access Points must hold specific Slovak Financial Directorate accreditation to operate as Digitalny postal (Digital Postmen). Standard Peppol Access Point registration is not sufficient. Accreditation requirements were published January 14, 2026. Groups using an existing multi-country Peppol provider must confirm Slovak accreditation status before beginning integration work - this is commonly missed when Slovakia is scoped as an extension of an existing Peppol implementation.

**TDD integration (6-10 weeks).** The Tax Data Document (TDD) is a structured report of invoice data submitted to the Slovak tax authority alongside the invoice transmission. This is separate from the Peppol transmission to the buyer. ERP systems must generate the TDD and submit it in near real-time. No standard ERP has TDD generation out of the box.

**Voluntary adoption window (May 2026 - January 2027).** The 8-month voluntary period provides a production testing window. Groups that use this period can identify integration gaps before mandatory enforcement begins. Groups that do not begin implementation until after January 2027 have no grace period.

**Minimum:** 8-12 weeks for a single entity with Peppol capability. **Stretched:** 16-20 weeks from zero Peppol capability plus TDD connector development.

---

## Operational Ownership

**Finance Systems** owns the Peppol BIS 3.0 / UBL 2.1 invoice output using scheme 0245 routing, TDD generation and near-real-time submission to the Slovak tax authority, and Digitalny postal platform integration.

**Tax/Compliance** owns scope determination for the January 2027 mandate (which Slovak entities are established and in scope), the 10-year archiving obligation (standard and 20-year for real estate transactions), and monitoring of penalty enforcement once mandatory.

**Master Data/IT** owns DIC (scheme 0245) data scrubbing for all Slovak customers and vendors, Peppol participant ID registration with the Financial Directorate, and the Financial Directorate certified provider registry monitoring (financnasprava.sk).

**IT** owns Peppol access point registration with scheme 0245, TDD API integration with the Slovak tax authority, and Peppol Testbed environment for SK-specific test cases.

**Where it breaks:** Scheme 0245 is non-standard. Access points that support common Peppol schemes (0088 GLN, 9925 Austrian VAT) may not support 0245 out of the box. Slovak entity routing fails silently if the scheme is not registered with the correct certified provider.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**Scheme 0245.** Slovakia uses Peppol participant identifier scheme 0245 (SG:DIC), based on the Slovak DIC (Danove Identifikacne Cislo, Tax Identification Number). This is distinct from scheme 0158 (IČO, company registration number) - both are stored in ERP master data but serve different purposes. The Peppol routing uses DIC (0245). ERP routing must be explicitly configured for 0245, not the more common GLN (0088) or VAT-based schemes.

**5-corner model.** Slovakia runs a 5-corner Peppol model, not the standard 4-corner. The Slovak Financial Directorate (Financna sprava) sits as an intermediary between sender and receiver, receiving the Tax Data Document in near real-time. Both sender-side and receiver-side Access Points must be specifically accredited as Digitalny postal (Digital Postmen) by the Financial Directorate. Standard Peppol AP certification alone is insufficient. Accreditation requirements published January 14, 2026.

**Tax Data Document (TDD).** The TDD is a structured report accompanying each B2B invoice submission. The specification (version 1.0.0, published April 14, 2026) defines the schema, semantic model, syntax binding, and Schematron validation rules. It is submitted to the Slovak tax authority in near real-time via the Digitalny postal platform. Standard ERP products have no TDD generation module - this is a custom integration requirement, not a configuration of existing functionality.

**Voluntary period.** Law 385/2025 Z.z. permits voluntary B2B e-invoicing from May 2026. The Financial Directorate maintains two registries at https://www.financnasprava.sk/sk/podnikatelia/dane/dan-z-pridanej-hodnoty/e-faktura: "Zoznam certifikovaných poskytovateľov doručovacej služby" (certified Digital Postman providers) and "Zoznam poskytovateľov doručovacej služby v procese akreditácie" (providers in accreditation process). Both lists most recently updated 18 May 2026.

**Archiving.** 10 years for standard records; 20 years for real estate transactions.

---

## The Friction Map

**Scheme 0245 not in access point scope.** Most multi-country Peppol access points are configured for the most common schemes (GLN, national VAT schemes). Scheme 0245 is Slovak-specific and may require a configuration extension or a Slovak-specific access point. Groups that select an access point provider for other EU countries without checking scheme 0245 support find this gap during Slovak onboarding.

**TDD not in ERP scope.** The Tax Data Document requirement is separate from the invoice and requires its own integration. Implementation teams that scope Slovak e-invoicing as a Peppol format task only find the TDD requirement in the regulatory detail, not in standard ERP documentation.

**8-month voluntary window.** Groups that begin in May 2026 have 8 months of production testing before mandatory enforcement. Groups that begin after January 2027 face immediate penalty exposure. The voluntary period is a readiness advantage that expires.

**Digital Postman accreditation gap.** Standard Peppol Access Point registration does not qualify for Slovakia. Access Points must hold specific Slovak Financial Directorate accreditation (Digitalny postal status). Groups that select an access point provider based on existing multi-country Peppol coverage and assume Slovakia is included will discover this gap during Slovak onboarding. This is separate from format and scheme 0245 configuration - both must be confirmed independently.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
