---
country: Malta
code: MT
flag: "🇲🇹"

mandate_type: interoperability
vida_alignment: DRR-inquiry
future_direction: "Malta's B2G e-invoicing is mandated under L.N. 403/2018 (Public Procurement Electronic Invoicing Regulations) and L.N. 404/2018 (Financial Administration and Audit Electronic Invoicing Regulations), both on legislation.mt. Peppol BIS 3.0 is the required format. MFIN (Ministry for Finance and Employment) is the Maltese Peppol Authority. No B2B mandate exists."

b2b: none
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines: []

formats: [Peppol-BIS-3.0, UBL-2.1]
cius: null
platform: none
platform_model: interoperability
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: null
outbound_mandate_date: null
outbound_mandate_date_phase2: null
mandate_hardness: "B2G hard-outbound for public procurement; no B2B mandate"

master_data_id: "Maltese VAT number (MT + 8 digits). Peppol participant ID for Maltese entities uses the VAT number scheme."
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
mandate_phase: transposition-stable
mandate_version: 1
confidence_summary: amber
unresolved_high: 0
unresolved_amber: 2
---

## Preparation Timeline

Malta's B2G e-invoicing is established by two legal notices: L.N. 403/2018 (Public Procurement (Electronic Invoicing) Regulations) and L.N. 404/2018 (Financial Administration and Audit (Electronic Invoicing) Regulations). Both are confirmed on legislation.mt. Peppol BIS 3.0 is the required format for B2G submissions.

MFIN (Ministry for Finance and Employment) is the Maltese Peppol Authority. DoC (Department of Contracts) is the operational lead for B2G procurement. MIA (Malta Institute of Accountants) is the professional body.

No B2B mandate exists.

For groups with Maltese public sector customers:

**Peppol BIS 3.0 via standard Peppol routing (2-4 weeks with existing Peppol).** Malta uses Peppol BIS 3.0 for B2G. If the group is already on Peppol for other EU countries, Maltese B2G is an incremental routing registration.

**Maltese VAT number in Peppol routing.** The Peppol participant ID for Maltese entities uses the Maltese VAT number (MT + 8 digits). Ensuring the correct scheme is configured in the ERP Peppol routing is the primary setup step.

**Minimum:** 2-4 weeks with existing Peppol capability.

---

## Operational Ownership

**Finance Systems** owns Peppol BIS 3.0 / UBL 2.1 output and Peppol routing configuration for Malta using MT VAT number-based participant IDs.

**Tax/Compliance** owns 10-year archiving under VAT Act Chapter 406, Art. 53, and monitoring of any B2B mandate developments.

**Master Data/IT** owns Maltese VAT number data quality (MT + 8 digits) for all Maltese customers and vendors, and Peppol Directory lookup for Maltese public sector buyer IDs.

**IT** owns Peppol access point registration, MFIN (Peppol Authority) registration, and DoC portal monitoring for B2G submission requirements.

**Where it breaks:** Peppol participant ID not registered. Small markets like Malta are sometimes skipped in multi-country Peppol rollouts. If the Maltese entity's Peppol participant ID is not registered, B2G routing fails for all Maltese public sector buyers.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**Peppol for Malta.** Standard Peppol BIS 3.0. Maltese public sector entities are registered in the Peppol Directory. The Maltese VAT number (MT + 8 digits) is the primary participant identifier.

**Archiving.** 10 years under VAT Act Chapter 406, Art. 53. This is one of the longer archiving periods in the EU.

**L.N. 403/2018 and L.N. 404/2018.** Both legal notices are confirmed on legislation.mt. L.N. 403 covers public procurement; L.N. 404 covers financial administration and audit entities. Both require Peppol BIS 3.0 format.

---

## The Friction Map

**Malta omitted from multi-country rollouts.** Malta's small market size means it is sometimes excluded from initial scope in multi-country Peppol implementations. Groups that roll out Peppol B2G across 10 EU countries but skip Malta find the gap when a Maltese public sector buyer requests a structured e-invoice.

**10-year archiving not in standard policy.** If the group applies a standard 7-year EU archiving policy, Malta's 10-year requirement (VAT Act Chapter 406, Art. 53) creates a compliance gap. A Malta-specific archiving policy override is needed.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
