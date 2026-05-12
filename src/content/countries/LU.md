---
country: Luxembourg
code: LU
flag: "🇱🇺"

mandate_type: interoperability
vida_alignment: DRR-inquiry
future_direction: "Luxembourg B2G is fully mandatory for suppliers under Law of 13 December 2021 (legilux.public.lu/eli/etat/leg/loi/2021/12/13/a869/jo). SME phase-in completed March 18, 2023. No B2B mandate has been enacted. CTIE (Centre des technologies de l'information de l'Etat) operates the B2G platform (efacturation.public.lu). MDL (Ministry for Digitalisation) is the Luxembourg Peppol Authority."

b2b: none
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2021-12-13
    description: "Law of 13 December 2021 - B2G suppliers must send e-invoices (not just government must receive)"
  - date: 2023-03-18
    description: "SME phase-in completed - all suppliers to Luxembourg public administration mandatory"

formats: [Peppol-BIS-3.0, UBL-2.1]
cius: null
platform: efacturation.public.lu
platform_model: interoperability
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2023-03-18
outbound_mandate_date: 2023-03-18
outbound_mandate_date_phase2: null
mandate_hardness: hard-both

master_data_id: "Matricule (Luxembourg company registration number). Luxembourg VAT number: LU + 8 digits. Both used for identification."
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
mandate_phase: live-stable
mandate_version: 1
confidence_summary: amber
unresolved_high: 0
unresolved_amber: 1
---

## Preparation Timeline

Luxembourg's B2G e-invoicing has been fully mandatory since March 18, 2023 (SME phase-in complete). The Law of 13 December 2021 requires suppliers - not just the government side - to send e-invoices. The CTIE platform (efacturation.public.lu) handles B2G invoice exchange via Peppol. Contact is info@efact.public.lu.

No B2B mandate exists. The MDL (Ministère de la Digitalisation) is the Luxembourg Peppol Authority. OEC Luxembourg is the accounting professional body.

For groups with Luxembourg public sector customers:

**Peppol BIS 3.0 / efacturation.public.lu access (3-5 weeks with existing Peppol).** Luxembourg B2G uses Peppol AS4 via the CTIE platform. If the group is already on Peppol for other EU countries, Luxembourg B2G is an incremental routing and registration step.

**Matricule in ERP routing.** The Luxembourg Matricule (company registration number) is distinct from the Luxembourg VAT number (LU + 8 digits). B2G routing may use either, depending on the specific public buyer. Confirming the Peppol participant ID format used by each Luxembourg public buyer is a prerequisite.

**Minimum:** 2-4 weeks with existing Peppol capability. **Stretched:** 8-12 weeks from zero Peppol presence.

---

## Operational Ownership

**Finance Systems** owns Peppol BIS 3.0 / UBL 2.1 output, efacturation.public.lu integration, and routing configuration for Luxembourg public sector buyers.

**Tax/Compliance** owns 10-year archiving under the Law of 25 July 2015 on electronic archiving, and monitoring of any B2B mandate developments.

**Master Data/IT** owns Matricule and Luxembourg VAT number data quality, Peppol participant ID lookup for Luxembourg public buyers via the CTIE platform directory, and Peppol access point configuration.

**IT** owns efacturation.public.lu API integration, Peppol access point registration with MDL (Luxembourg Peppol Authority), and CTIE platform documentation monitoring (updated March 2026).

**Where it breaks:** Archiving format requirement. Luxembourg's Law of 25 July 2015 on electronic archiving may specify requirements for the format and integrity of electronically archived documents. Groups that archive PDF conversions rather than original XML may not satisfy the archiving law requirements.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**efacturation.public.lu.** CTIE operates the Luxembourg B2G e-invoice platform. Documentation was updated March 2026. The platform handles Peppol AS4 transmission for all Luxembourg public administration buyers. Contact: info@efact.public.lu.

**Peppol routing for Luxembourg.** MDL (Ministere de la Digitalisation) is the Peppol Authority. Luxembourg public sector entities are registered in the Peppol Directory. The Matricule or VAT number may be used as Peppol participant identifier depending on the buyer.

**Archiving.** 10 years under the Law of 25 July 2015 on electronic archiving (Luxembourg). This is one of the longer archiving periods in the EU.

---

## The Friction Map

**efacturation.public.lu not in Peppol provider scope.** Some Peppol access point providers do not have established Luxembourg B2G routing configured. Groups using a multi-country Peppol provider that has not tested Luxembourg B2G transmission may encounter routing failures at first invoice.

**10-year archiving gap.** Luxembourg's 10-year archiving period (Law of 25 July 2015) is longer than many EU countries. Groups that apply a standard 7-year archiving policy across all EU entities may not satisfy Luxembourg's requirement. A Luxembourg-specific archiving policy is needed.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
