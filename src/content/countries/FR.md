---
country: France
code: FR
flag: "🇫🇷"

mandate_type: clearance-pdp
vida_alignment: ctc-national
future_direction: "ViDA DRR cross-border alignment anticipated 2030+. Current framework is a national CTC model independent of ViDA timeline."

b2b: mandatory
b2g: mandatory
b2c_scope: e-reporting-only
status: pilot
phase_in: true
phase_in_scope: by_size

key_deadlines:
  - date: 2026-09-01
    description: All companies must be able to receive e-invoices; large and ETI companies must issue
  - date: 2027-09-01
    description: SME and micro-enterprises must issue e-invoices

formats: [Factur-X, UBL-BIS-3.0, CII-UN-CEFACT]
cius: EN16931
platform: "PPF (Portail Public de Facturation)"
platform_model: Y-Model
transport_protocol: PDP
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2026-09-01
outbound_mandate_date: 2026-09-01
outbound_mandate_date_phase2: 2027-09-01
mandate_hardness: hard-inbound-soft-outbound

master_data_id: "SIRET (14-digit establishment identifier)"
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 10
penalty_max: "EUR 15 per invoice (cap EUR 15,000/year); EUR 250 per e-reporting transmission (cap EUR 15,000/year)"
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - DEPOSITED
  - REJECTED
  - REFUSED
  - PAID

has_sandbox: true
last_verified: 2026-04-29
---

## Preparation Timeline

The inbound obligation applies to all companies from September 1, 2026. That is four months from now. Any group with French subsidiaries that has not yet selected a certified PDP and registered in the Annuaire is behind.

France has delayed its B2B mandate before. The current dates are confirmed in legislation (Loi n° 2023-1322 du 29 décembre 2023, Article 91: https://www.legifrance.gouv.fr/loda/id/JORFTEXT000048727345), with a built-in government option to postpone by up to three months by decree. The hard outside limit is December 1, 2026 for large companies and December 1, 2027 for SMEs.

Outbound obligations are phased by size:
- Large companies and ETIs: hard outbound from September 1, 2026
- SMEs and micro-enterprises: hard outbound from September 1, 2027

A clean implementation from standing start takes 4-6 months minimum. Four stages:

**PDP selection and contracting (4-8 weeks).** There is no free public option for B2B invoice exchange. The PPF's B2B exchange capability was discontinued in October 2024. Every French entity must contract a certified PDP (Plateforme Agréée). Approximately 80-100 platforms are currently certified or pre-registered. The common procurement delay: InfoSec and legal review of a new critical cloud vendor takes 6-12 weeks in most corporate environments.

**SIRET audit and Annuaire registration (2-4 weeks).** Every active French establishment (SIRET, 14 digits) must be registered in the central routing directory (the Annuaire) with an assigned PDP by September 1, 2026. Groups with multiple French entities must audit their entity list and close inactive SIRETs before registering to prevent routing confusion.

**ERP-to-PDP integration (8-12 weeks).** The billing engine must produce one of the three accepted formats (Factur-X, UBL BIS 3.0, or CII) at EN 16931 standard or above. The reverse integration - lifecycle statuses flowing back from PDP to ERP - is equally important and is rarely covered in default PDP contract terms.

**Testing and pilot transactions (4-6 weeks).** The official Pilot Phase runs from February to August 2026. Groups starting now can complete piloting before the mandatory go-live. Groups waiting until September have no pilot buffer.

**Minimum:** 4 months with a simple ERP and fast PDP onboarding. **Stretched:** 9+ months for fragmented multi-entity setups or slow procurement.

## Operational Ownership

**Finance Systems** owns two integration layers. First: ERP-to-PDP output - the billing engine must produce a compliant format and all mandatory data fields. Second: the reverse integration of PDP lifecycle statuses back into the ERP. This reverse flow is typically not part of standard PDP contract scope and requires separate specification.

**Tax/Compliance** owns two obligations the mandate created. First: archiving. E-invoices must be stored in their original electronic format for 10 years under commercial law (Art. L123-22 Code de commerce: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006279025) and 6 years under tax law (Art. L102 B LPF: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000046869400). Storing PDFs does not satisfy this. Second: e-reporting. B2C sales and international B2B transactions not subject to e-invoicing must be reported separately to the DGFiP on a defined schedule - a distinct pipeline from e-invoicing, owned by Tax.

**AP/AR Operations** manages lifecycle status exceptions. A Rejet (technical failure at the PDP) means the invoice was never legally issued. A Refus (buyer rejection for business reasons) means the invoice was legally issued. These require different responses and AR must have separate documented procedures for each.

**IT** owns the PDP integration layer: the connection between the ERP and the certified PDP, Annuaire registration for all French SIRETs, and - where an OD is currently in use - the bridge from OD output to PDP input.

**Where it breaks:** Groups using an OD (uncertified invoice software) that have not yet contracted a certified PDP. An OD cannot transmit invoices under the mandate. The transition requires 6-9 months of lead time. Most groups relying on an OD have not started this transition.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

## Data & Infrastructure

Three ERP data gaps are consistently blocking French mandate readiness:

**SIRET at establishment level.** The Annuaire routes invoices at the 14-digit SIRET - the establishment identifier, not the 9-digit SIREN legal entity identifier. ERPs configured for cross-border EU operations typically store SIREN or VAT number, not the full SIRET. Any invoice addressed to a SIREN-only record will fail routing in the Annuaire. This must be corrected field-by-field across all French customer and vendor records.

**Annuaire registration completeness across all entities.** Every active French establishment must be registered in the Annuaire with an assigned PDP. Groups with multiple French subsidiaries must audit their entity list against the SIRENE database and deregister defunct establishments before registering active ones. Routing confusion from inactive SIRETs creates invoice delivery failures at the sender's PDP.

**Pre-invoice Annuaire lookup.** Before transmitting an invoice, the system must confirm the buyer's SIRET is registered in the Annuaire and identify which PDP they use. Standard ERP configurations do not include this as a default pre-validation step. Invoices sent to unregistered buyers are rejected at the sender's PDP.

Format selection: all three formats (Factur-X, UBL BIS 3.0, CII) are legally equivalent. Factur-X is often preferred for mixed supplier bases because of its embedded PDF layer. Pure UBL or CII is preferred for fully automated end-to-end processing. The Factur-X MINIMUM profile is insufficient - EN 16931 or Basic WL is the required baseline.

## Correction & Business Continuity

**Correction:** France does not allow altering or reissuing an invoice under the same number. The correction mechanism is a credit note (avoir) referencing the original invoice number, followed by a new invoice with a new sequential number. The credit note must itself be transmitted through the PDP. [impots.gouv.fr FAQ: https://www.impots.gouv.fr/foire-aux-questions-je-decouvre-la-facturation-electronique]

**Rejet vs Refus - two different workflows:**
- Rejet: technical or format failure at the PDP. The invoice was never legally issued. Fix the error, issue a corrected invoice under a new number.
- Refus: buyer rejects for business reasons. The invoice was legally issued. Issue a credit note to cancel it, then a new invoice.

AR must have separate documented procedures for each. Treating them as the same workflow is the most common process gap at go-live.

**Business continuity:** France has no government platform in the B2B invoice transmission path. All exchange is PDP-to-PDP. PDP downtime is the primary continuity risk and there is no governmental fallback. PDP SLAs for availability, retry logic, and failover must be evaluated during procurement, not discovered after contract signature.

## The Friction Map

**Annuaire registration failures.** The most consistent data gaps when registering French entities in the Annuaire: the SIRET is stored at SIREN level (missing the 5-digit establishment suffix), and the optional routing code (Code de Routage) for directing invoices to specific departments is absent. Consequence: supplier invoices cannot be routed to the correct endpoint and are rejected at the sender's PDP. The governance gap is between Corporate Tax and Legal (who know the SIREN and group structure) and AP/Master Data (who need SIRET-level routing data). Neither team has owned routing data as a compliance requirement before.

**OD-to-PDP transition bottleneck.** Many groups use an OD to generate invoices and assumed the public PPF portal would handle transmission at no cost. Since October 2024, the PPF no longer exchanges B2B invoices - all B2B flows require a certified PDP. The transition from OD to PDP involves a new vendor procurement cycle, InfoSec review, and API/EDI integration work. Lead time: 6-9 months. Groups that have not started this are at structural risk of non-compliance on September 1, 2026.

**Factur-X PDF vs XML layer.** Factur-X is a hybrid format: a readable PDF/A-3 with an embedded XML payload. The XML layer is legally binding; the DGFiP audits the XML, not the PDF. A pattern observed in early implementations: AP teams continue processing the PDF layer through OCR or visual review, treating a hybrid e-invoice like a scanned paper invoice. Consequence: payment is booked against data that may differ from the legally reported XML. The governance gap is the same as in Germany: no shared protocol between AP Operations (processing the visual document) and Tax (owning VAT data validity).

**Lifecycle status reverse-integration gap.** The mandate requires PDPs to report four statuses back to the DGFiP: Deposited, Rejected, Refused, and Paid. Standard PDP procurement focuses on outbound invoice transmission. At go-live, groups discover the reverse flow - statuses triggering automated AR/AP ERP workflows - requires additional integration work not covered in the PDP contract, and that PDP pricing for high-frequency status-message API calls was not included in the initial cost model.

## The "Ready" Definition

A French mandate operation is ready when four conditions hold:

- All active French SIRETs are registered in the Annuaire with an assigned certified PDP, and the registration is maintained as entities are created or closed
- Every B2B invoice is transmitted through the PDP with clearance confirmed, and lifecycle statuses flow automatically into ERP AR/AP workflows
- Tax has defined and operationalised separate e-reporting flows for B2C transactions and international B2B transactions not covered by e-invoicing
- Archiving preserves the original electronic invoice file with authenticity and integrity for 10 years - not PDF storage, but the transmitted XML or Factur-X file with verifiable provenance

The Finance Director's test: if the DGFiP auditor asks for the original invoice for any transaction in the past six years, can you produce the original transmitted electronic file with proof of PDP submission? If not, archiving is not done.
