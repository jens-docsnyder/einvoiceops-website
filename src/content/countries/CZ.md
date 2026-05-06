---
country: Czech Republic
code: CZ
flag: "🇨🇿"

mandate_type: interoperability
vida_alignment: DRR-inquiry
future_direction: "Czech Republic has a mandatory B2G e-invoicing regime via the NEN platform (operated by Ministry of Regional Development/MMR) for public procurement. ISDOC (national format) and ISDS (Data Box system) are significant for the Czech market. No B2B mandate has been enacted. The national eInvoicing Forum monitors EU ViDA developments (mf.gov.cz/cs/dane-a-ucetnictvi/elektronicka-fakturace)."

b2b: none
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines: []

formats: [UBL-2.1, Peppol-BIS-3.0, ISDOC]
cius: null
platform: NEN
platform_model: interoperability
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: null
outbound_mandate_date: null
outbound_mandate_date_phase2: null
mandate_hardness: "B2G hard-outbound for public procurement; no B2B mandate"

master_data_id: "ICO (Identifikacni cislo osoby) - 8-digit company identification number. Czech VAT number: CZ + 8-10 digits. Both are required for invoice identification."
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

The Czech Republic's B2G e-invoicing operates via the NEN platform (Národní elektronický nástroj - National Electronic Tool), operated by the Ministry of Regional Development (MMR). NEN handles public procurement e-invoices alongside the ISDS (Datová schránka - Data Box system), which is a de facto secure government document delivery channel used across the Czech public sector.

Three formats are accepted: UBL 2.1, Peppol BIS 3.0, and ISDOC (Informacní systém pro doklady - the Czech national e-document format). ISDOC is significant - many Czech ERPs and accounting systems generate ISDOC natively. No B2B mandate exists.

For groups with Czech public sector customers:

**NEN platform / Peppol registration (3-5 weeks).** Suppliers to Czech public procurement must be able to submit via NEN. Peppol BIS 3.0 is accepted. The Czech entity's ICO (8-digit company identification number) is the primary identifier.

**ISDS (Data Box) consideration.** The Czech Data Box system (ISDS) is a government-mandated secure message delivery system for legal entities. All Czech legal entities have an ISDS data box (datová schránka). For B2G invoice delivery, ISDS may be used as an alternative or supplement to NEN/Peppol. Groups with Czech entities should verify whether their ISDS data boxes are active and monitored.

**ISDOC format.** If Czech public sector buyers request ISDOC format, the ERP must be configured to generate ISDOC XML. ISDOC is Czech-specific and is not an EN 16931 derivative. Czech ERP integrators typically support ISDOC; international ERPs typically require a Czech connector.

**Minimum:** 3-6 weeks for B2G with Peppol capability. ISDOC implementation adds 4-6 weeks.

---

## Operational Ownership

**Finance Systems** owns NEN platform integration, Peppol BIS 3.0 / UBL 2.1 / ISDOC output as required, and ISDS data box monitoring for inbound government documents.

**Tax/Compliance** owns archiving (10 years for accounting records under Czech Accounting Act), monitoring of the national eInvoicing Forum (mf.gov.cz) for B2B mandate developments, and VAT reporting via Czech tax authority portals.

**Master Data/IT** owns ICO data quality (8-digit, without CZ prefix) for all Czech customers and vendors, ISDS data box IDs for Czech government buyers, and Czech VAT number (CZ + 8-10 digits) validation.

**IT** owns NEN platform access, ISDS data box integration for inbound document monitoring, Peppol access point registration, and KDP CR / KACR guidance monitoring for implementation updates.

**Where it breaks:** ISDS data box not monitored. Czech public sector entities may send documents (including purchase orders and contract modifications) via ISDS. Groups with Czech entities that have active ISDS data boxes but no one monitoring the inbox miss government communications and invoice-related documents.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**ICO vs. Czech VAT number.** The ICO (8-digit company identification number) is different from the Czech VAT number (CZ + 8-10 digits). Both are required for invoice identification. The ICO is used for NEN/Peppol routing. ERP master data must store both separately.

**ISDS data box.** Every Czech legal entity has a Data Box (datová schránka) ID. The ISDS system is used by Czech public authorities to send legally binding documents. For B2G, some public entities deliver purchasing documents via ISDS. The Data Box ID must be monitored and integrated into the document management workflow.

**ISDOC.** Czech national e-document format, accepted alongside UBL 2.1 and Peppol BIS 3.0. ISDOC is primarily relevant for Czech domestic B2B and B2G where counterparties request it. zakonyprolidi.cz (Act 134/2016 confirmed URL) and mf.gov.cz are primary reference sources.

---

## The Friction Map

**ISDS data box unmonitored.** Czech entities have legally assigned Data Box IDs. If no one monitors the data box inbox, legally binding government documents (including compliance notifications) go unread. This is a governance gap that exists independently of e-invoicing.

**ISDOC not in international ERP scope.** International ERP implementations typically configure UBL 2.1 or Peppol BIS 3.0. Czech public sector buyers that request ISDOC receive rejections or PDFs. Confirming which Czech public buyers require ISDOC is a prerequisite scoping step.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
