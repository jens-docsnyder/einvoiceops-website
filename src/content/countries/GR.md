---
country: Greece
code: GR
flag: "🇬🇷"

mandate_type: clearance
vida_alignment: DRR-compliant
future_direction: "Greece implemented myDATA e-reporting from 2021 and layered mandatory e-invoice issuance via Law 5222/2025. All B2B invoices require a MARK (unique registration number) from myDATA before they are legally issued. Phase-in complete for large entities (>EUR 1M revenue) from March 2, 2026; all remaining businesses from October 1, 2026."

b2b: mandatory
b2g: mandatory
b2c_scope: "B2C reporting via POS/cash registers to myDATA; not structured e-invoice but myDATA-reported receipts"
status: live
phase_in: true
phase_in_scope: "Phase 1: entities with 2023 revenue >EUR 1M - mandatory from March 2, 2026 (transition window to May 3, 2026). Phase 2: all remaining businesses - mandatory from October 1, 2026 (transition window to December 31, 2026)."

key_deadlines:
  - date: 2026-03-02
    description: "Phase 1 mandatory: entities with 2023 revenue >EUR 1M must issue e-invoices via myDATA-certified providers or direct API"
  - date: 2026-05-03
    description: "Phase 1 transition window closes - no further tolerance for Phase 1 entities"
  - date: 2026-10-01
    description: "Phase 2 mandatory: all remaining businesses must issue e-invoices via myDATA"
  - date: 2026-12-31
    description: "Phase 2 transition window closes - full enforcement"

formats: [EN-16931, UBL-2.1, CII-UN-CEFACT]
cius: "myDATA API v1.0.7 (Greek national CIUS/API specification)"
platform: myDATA
platform_model: clearance
transport_protocol: REST-API
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2026-03-02
outbound_mandate_date: 2026-03-02
outbound_mandate_date_phase2: 2026-10-01
mandate_hardness: "hard-both from Phase 1 date; Phase 2 extends to remaining businesses October 2026"

master_data_id: "AFM (Arithmos Forologikou Mitroou) - 9-digit Greek Tax Identification Number. Mandatory in all myDATA transmissions for both issuer and recipient."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 5
penalty_max: "EUR 10,000 per audit (Law 5222/2025 Art. 214 and 239 - source-verification required)"
reporting_window: "Real-time via certified providers (Y.PA.H.E.S.); next-day for direct ERP/API submissions. 2-day fallback permitted if myDATA is unavailable - business must maintain a Failure Log."
correction_mechanism: credit_note

document_lifecycle_states:
  - PENDING
  - MARK_ASSIGNED
  - SENT
  - ACCEPTED
  - REJECTED
  - CANCELLED

has_sandbox: true
last_verified: null
mandate_version: 1
confidence_summary: amber
unresolved_high: 3
unresolved_amber: 2
---

## Preparation Timeline

Greece operates a clearance model. The myDATA platform (run by AADE, the Greek tax authority) assigns a MARK - a unique registration number - to every invoice before it is legally issued. An invoice without a MARK has no legal standing under Greek law.

Law 5222/2025 (published ΦΕΚ Α΄ 134, July 28, 2025) established the mandatory e-invoice issuance requirement on top of the myDATA e-reporting framework that has been live since 2021. Decision A.1044/2026 set the phase-in dates.

Phase 1 was mandatory from March 2, 2026 for entities with 2023 revenue above EUR 1 million. A transition window ran to May 3, 2026. Phase 2 applies from October 1, 2026 for all remaining businesses, with a transition window to December 31, 2026.

For a group implementing Greek e-invoicing from a standing start:

**myDATA certified provider selection or direct API setup (4-8 weeks).** Invoices reach myDATA either through a Y.PA.H.E.S.-certified provider or via direct REST API connection. Certified provider onboarding includes credential setup, Greek entity registration on the platform, and test invoice submission. Direct API requires credential management per Greek entity and format validation against the myDATA API v1.0.7 schema.

**AFM master data scrubbing (3-6 weeks).** Every invoice must include the 9-digit AFM of both issuer and recipient. Standard ERP customer/vendor master records hold VAT numbers in country-prefixed format (e.g., EL123456789). The myDATA API requires the 9-digit AFM without prefix. Field mapping and data quality checks across the full Greek customer/vendor portfolio are required before go-live.

**ERP MARK integration (4-8 weeks).** The ERP must call myDATA, obtain the MARK, and embed it in the invoice before transmission. Standard ERP billing engines have no myDATA MARK integration out of the box. This is a custom connector requirement in every implementation.

**Minimum:** 8-12 weeks with a certified provider and a single entity. **Stretched:** 16-24 weeks for multi-entity groups or where the ERP billing engine requires custom connector development.

---

## Operational Ownership

**Finance Systems** owns the ERP connector to myDATA: the API call to obtain the MARK, the embedding of MARK in the invoice XML, and the certified provider integration if not using direct API. Every invoicing scenario - standard, credit note, cancellation - must route through myDATA and return a valid MARK before the invoice is transmitted to the customer.

**Tax/Compliance** owns scope determination: which Greek entities are in Phase 1 (2023 revenue >EUR 1M) vs Phase 2, whether any transactions are excluded from the myDATA obligation, and the Failure Log procedure for the 2-day offline fallback when myDATA is unavailable. Tax also owns 5-year archiving under Law 4174/2013 Art. 13.

**Master Data/IT** owns AFM scrubbing for the full Greek customer and vendor portfolio: converting country-prefixed VAT numbers to 9-digit AFM format, validating against the AADE business registry, and populating dedicated AFM fields in ERP customer/vendor records.

**AP Operations** must confirm inbound e-invoice processing: Greek suppliers will send invoices with MARKs. AP must validate that inbound invoices carry valid MARKs and that the MARK is stored as part of the archiving record.

**IT** owns the myDATA REST API integration, credential management per Greek entity, and monitoring of myDATA platform status. The 2-day fallback procedure requires IT to have a defined protocol for what happens when myDATA is unavailable.

**Where it breaks:** The MARK integration gap. Standard ERP billing engines do not call external clearance APIs. Every ERP implementation requires a custom connector. Groups that plan go-live without having built and tested this connector discover the gap when the first real invoice is rejected by myDATA for missing credentials or format errors.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**AFM routing.** The Greek Tax ID (AFM) is 9 digits. Country-prefixed format in ERP (EL prefix) must be stripped for myDATA API calls. All invoice transmissions require both issuer AFM and recipient AFM. If the recipient is a foreign entity, a placeholder AFM (000000000) may apply in some cases - confirm with local Greek Tax/Compliance on a transaction-by-transaction basis.

**MARK integration.** The myDATA API call returns a MARK, an UID (invoice UID), and a classification. These three values must be stored in the invoice record and made available for archiving. ERPs that do not have a dedicated field for myDATA MARK will require schema extension or a custom mapping table.

**Certified providers (Y.PA.H.E.S.).** AADE maintains a list of certified e-invoicing providers. Using a non-certified provider does not satisfy the mandate. The list is at aade.gr/en/mydata/licensed-software-e-invoicing-providers. Providers handle the MARK request on behalf of the issuer and manage the myDATA API credential rotation.

**Fallback procedure.** If myDATA is unavailable, the business may issue invoices for up to 2 days without a MARK - but must maintain a Failure Log with the invoice details. When myDATA is restored, all Failure Log invoices must be submitted within the restoration window. Groups without a documented fallback procedure are exposed to compliance gaps during myDATA outages.

---

## The Friction Map

**MARK connector absent from ERP.** The clearance requirement means the billing engine must call an external API before issuing each invoice. Standard SAP, Oracle, and Microsoft ERPs have no myDATA connector in their out-of-the-box configuration. Every implementation requires custom development or a certified middleware layer. Groups that scope e-invoicing as a format change - rather than an API integration - discover this gap during development, not planning.

**AFM data quality in customer/vendor master.** Greek customers and vendors are stored in ERP with EL-prefixed VAT numbers or with incorrect digit counts. myDATA rejects transmissions with invalid AFM. A full master data scrubbing pass is required before go-live - this is not a one-time fix but an ongoing data quality obligation as new Greek partners are onboarded.

**B2C and POS scope.** B2C transactions are reported to myDATA via POS/cash register systems, not via the structured e-invoice flow. Groups with Greek retail operations must confirm that their POS systems are connected to myDATA separately from the B2B e-invoice configuration.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

---

## The "Ready" Definition

A Greek myDATA operation is ready when four conditions hold:

- Every Greek entity has active myDATA credentials (via certified provider or direct API) and the ERP billing engine returns a valid MARK for each test invoice before transmission
- AFM is validated and stored in 9-digit format for all Greek customers and vendors in the ERP master
- The 2-day fallback Failure Log procedure is documented, owned, and tested
- 5-year archiving includes the MARK, UID, and invoice XML - not PDF exports alone

The practical test: submit a test invoice to myDATA for a Greek entity, receive a MARK, embed it in the invoice, and transmit to a test recipient. If the full cycle completes without error, myDATA integration is working. If any step fails, implementation is not complete.
