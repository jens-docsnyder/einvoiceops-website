---
country: Romania
code: RO
flag: "🇷🇴"

mandate_type: centralized-clearance
vida_alignment: legacy-clearance
future_direction: "EU derogation (Decision 2023/1553) expires December 31, 2026. Romania expected to transition to ViDA permanent framework or seek extension. B2C mandatory from January 2025. Non-resident VAT-registered entities without PE in scope from January 2026 (OUG 89/2025)."

b2b: mandatory
b2g: mandatory
b2c_scope: in_scope
status: live
phase_in: false
phase_in_scope: all

key_deadlines:
  - date: 2022-07-01
    description: B2G mandatory (Law 139/2022)
  - date: 2024-01-01
    description: B2B mandatory reporting begins — 5 working days to transmit
  - date: 2024-07-01
    description: B2B full clearance — exclusive XML, paper invoices no longer valid for VAT deduction
  - date: 2025-01-01
    description: B2C mandatory reporting begins
  - date: 2025-07-01
    description: B2C penalty enforcement begins
  - date: 2026-01-01
    description: Reporting window standardised to 5 working days; non-residents expanded in scope (OUG 89/2025)
  - date: 2026-12-31
    description: EU derogation (Decision 2023/1553) expires

formats: [UBL-2.1, RO-CIUS]
cius: RO_CIUS
platform: "RO e-Factura (ANAF)"
platform_model: centralized
transport_protocol: API-OAuth2
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2024-07-01
outbound_mandate_date: 2024-07-01
outbound_mandate_date_phase2: null
mandate_hardness: hard-both

master_data_id: "CUI/CIF (Tax Registration Number) — numeric only, no RO prefix for domestic routing"
mandatory_pdf_bundle: none
foreign_resident_scope: true
archiving_years: 5
penalty_max: "10,000 RON (large taxpayers) / 5,000 RON (medium) / 2,500 RON (others) for non-transmission; 15% of invoice value for B2B transactions outside XML system — GEO 120/2021 Art. 13^1 as amended by Law 296/2023"
reporting_window: 5
correction_mechanism: credit_note

document_lifecycle_states:
  - SUBMITTED
  - ACCEPTED
  - REJECTED

has_sandbox: true
last_verified: 2026-04-30
mandate_version: 1
confidence_summary: amber
unresolved_high: 1
unresolved_amber: 3
---

## Preparation Timeline

Romania's e-Factura mandate is fully live. The clearance model - where paper invoices are void for VAT deduction - has been in force since July 1, 2024 (Law 296/2023; GEO 115/2023). B2C transactions have been mandatory since January 1, 2025 (GEO 69/2024). From January 1, 2026, the reporting window is standardised at 5 working days from date of issuance (OUG 89/2025), and non-resident entities VAT-registered in Romania without a permanent establishment came into scope.

A structural time pressure: the EU derogation permitting Romania's mandate expires December 31, 2026 (EU Council Decision 2023/1553). Romania will either transition to the ViDA permanent framework or seek extension. The specific changes required are currently undefined.

Unlike Italy (SdI delivers invoices to the buyer) and France (PDP exchanges between parties), Romania requires the buyer to actively download the ANAF-signed XML from the SPV (Virtual Private Space). AP teams without an automated SPV download process are processing PDFs, not legal documents.

For a foreign group onboarding a Romanian entity, implementation from a standing start takes 3-6 months:

**CUI/CIF master data remediation (2-4 weeks).** The CUI (company) or CIF (fiscal ID) is the routing identifier. Multi-country ERP configurations store Romanian entities with the "RO" prefix (used for EU VAT/VIES). RO e-Factura routing uses the numeric CUI without the prefix. This is the most common first-week rejection.

**RO_CIUS schema mapping (4-6 weeks).** The RO_CIUS is a Romanian extension of EN 16931/UBL 2.1. Required fields absent from standard ERP templates: Trade Register "J" number (BT-31/32), invoicing period start/end dates (BT-73/74), UNECE unit of measure codes (BT-130), BNR exchange rate for foreign currency transactions (VAT must be expressed in RON using the National Bank of Romania daily rate), and specific Romanian legal reference text for VAT exemptions.

**SPV API integration and download automation (3-5 weeks).** Submission is via REST API with OAuth2 bearer token. The cycle is asynchronous: upload → poll for status → download ANAF-signed ZIP archive. AP must separately automate download of incoming invoices from the SPV buyer inbox.

**Minimum:** 3 months with clean master data and a single entity. **Stretched:** 5-6 months for multi-entity Romanian operations or where the BNR rate feed requires build work.

## Operational Ownership

**Finance Systems** owns the RO_CIUS XML output including Romanian-specific fields and the BNR exchange rate integration. VAT totals must be in RON using the National Bank of Romania daily rate - an automated rate feed most multi-country ERP configurations do not include for Romania.

**Tax/Compliance** owns the reporting window. From January 1, 2026, invoices must reach ANAF within 5 working days of issuance (OUG 89/2025). Monthly batch billing cycles breach this window for any transaction dated more than 5 working days before the transmission run. Tax must define and enforce the maximum permitted delay in invoice generation.

**AP Operations** owns the ANAF SPV download process. Every supplier invoice arrives in the company's SPV buyer inbox as an ANAF-sealed XML. AP must retrieve it automatically and ingest it into the ERP. AP teams that continue processing supplier PDFs are not processing legal documents - the ANAF-signed XML is the only valid original for input VAT deduction.

**IT** owns the OAuth2 API connection, qualified certificate renewal, the asynchronous polling loop, and the ANAF index number callback that writes back into the ERP record after acceptance.

**Where it breaks:** D406 SAF-T filing. Romania requires SAF-T reporting via the D406 form. The ANAF index number from e-Factura must be cross-referenced in the D406 SalesInvoices section. Groups that implement e-Factura and SAF-T as separate workstreams without aligning the index number flow produce D406 reports that do not match the e-Factura records. ANAF can reconcile both automatically.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

## Data & Infrastructure

**The CUI/CIF gap.** The numeric CUI is used for RO e-Factura routing. The "RO"-prefixed version is for EU VAT purposes. Standard ERP VAT ID fields store the "RO" prefix. Customer and vendor master records must have a separate Romanian domestic tax ID field with the clean numeric CUI.

**ANAF submission flow.** The API cycle is asynchronous. Sender submits XML, receives an upload ID, polls for status, then downloads a ZIP containing the original XML plus the ANAF digital signature when accepted. This ZIP is the legal original. Standard ERP integrations expect synchronous responses - the asynchronous poll cycle requires middleware or a custom integration layer.

**The SPV buyer inbox.** Buyers must actively download incoming invoices from the SPV. This is the key architectural difference from Italy's SdI and France's PDP model. AP teams without automated SPV download will have invoices accumulating in the inbox unprocessed.

**D406 SAF-T cross-reference.** The ANAF index number assigned to each accepted invoice must appear in the D406 SalesInvoices XML block. The index must flow from the e-Factura callback into the ERP document header before the D406 extraction runs.

**Trade Register number (J number).** The trade register registration number is required in the RO_CIUS XML (BT-31/32 for seller and buyer). This is almost never stored in standard ERP customer/vendor master data for Romanian entities. It must be sourced from the ONRC (trade register) and added field-by-field.

## Correction & Business Continuity

**Correction:** Romania allows both Credit Notes (type 381) and Correction Invoices (type 384) via RO e-Factura. Both must be submitted to ANAF and receive their own ANAF index number. The correction must reference the original ANAF index. A rejected invoice (no ANAF index assigned) cannot be corrected - fix the XML and resubmit.

**Offline fallback:** If ANAF/SPV is unavailable, invoices may be issued to the buyer (e.g., PDF by email) with delayed transmission. Once ANAF is restored, the supplier has 5 working days to upload the XML (Law 296/2023).

**Derogation expiry risk:** The EU derogation expires December 31, 2026. Any technical changes required to align with the ViDA permanent framework will need to be implemented in 2026. The scope of changes is currently undefined.

## The Friction Map

**CUI vs VAT ID master data failure.** The most common first-week rejection. The "RO" prefix is correct for VIES; it is wrong for RO e-Factura domestic routing. Master data configured for cross-border operations does not distinguish between these two uses of the same underlying number.

**BNR exchange rate feed gap.** Romanian VAT must be in RON even when the transaction currency is EUR or USD. Groups without an automated BNR daily rate feed must enter rates manually. Hard-coded monthly averages produce tax calculation discrepancies that ANAF flags in D406 reconciliation.

**SPV inbox not monitored.** AP configures outbound e-Factura and considers the obligation fulfilled. Nobody configures or monitors the SPV buyer inbox. Supplier invoices pile up undownloaded. Input VAT deduction depends on retrieving the ANAF-signed XML. Finance discovers the gap at the first VAT return.

**Trade Register number missing.** The J number is required in the RO_CIUS XML and is almost never stored in standard ERP customer/vendor master data for Romanian entities. Must be sourced from the ONRC trade register field-by-field.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

## The "Ready" Definition

A Romanian e-Factura operation is ready when four conditions hold:

- Every outbound B2B invoice reaches ANAF and receives an index number within 5 working days of the date of supply - confirmed by API callback monitoring, not by assuming transmission succeeded
- The ANAF-signed XML for every inbound supplier invoice is downloaded from the SPV buyer inbox and archived - not the PDF the supplier may have also sent
- The ANAF index number is stored in the ERP document header and appears in D406 SAF-T filings - both obligations use the same identifier and must be aligned
- Foreign currency invoices use the BNR daily rate for RON VAT calculation via an automated rate feed, not manual entry

The auditor test: ANAF can cross-reference every e-Factura index number against your D406 filing automatically. If the index numbers do not match, the discrepancy surfaces in the next tax inspection.
