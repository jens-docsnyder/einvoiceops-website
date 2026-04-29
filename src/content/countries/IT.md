---
country: Italy
code: IT
flag: "🇮🇹"

mandate_type: centralized-clearance
vida_alignment: legacy-clearance
future_direction: "FatturaPA v1.9.1 takes effect May 2026. Long-term ViDA alignment anticipated 2028-2030."

b2b: mandatory
b2g: mandatory
b2c_scope: in_scope
status: live
phase_in: false
phase_in_scope: all

key_deadlines:
  - date: 2015-03-31
    description: B2G mandate fully live for all public administration suppliers
  - date: 2019-01-01
    description: B2B and B2C mandates go live
  - date: 2022-07-01
    description: Cross-border transactions integrated - Esterometro abolished
  - date: 2024-01-01
    description: Microenterprises (<EUR 25k annual revenue) mandated
  - date: 2026-05-15
    description: FatturaPA v1.9.1 technical specifications take effect

formats: [FatturaPA]
cius: CIUS-IT
platform: "Sistema di Interscambio (SdI)"
platform_model: centralized
transport_protocol: SFTP
b2g_signature: XAdES
b2b_signature: optional

inbound_mandate_date: 2019-01-01
outbound_mandate_date: 2019-01-01
outbound_mandate_date_phase2: null
mandate_hardness: hard-both

master_data_id: "Codice Destinatario (B2B 7-char) / Codice Univoco Ufficio (B2G 6-char)"
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 10
penalty_max: "70% of undocumented VAT (min EUR 300)"
reporting_window: 12
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - ACCEPTED
  - REJECTED
  - REJECTED_BY_BUYER

has_sandbox: true
last_verified: 2026-04-29
---

## Preparation Timeline

Italy has been live since January 2019. For a foreign-headquartered group onboarding an Italian subsidiary, the infrastructure is stable and well-documented - but the implementation complexity has not reduced with time.

There are four stages of work:

**Scoping and master data audit (3-4 weeks).** The first task is confirming that every Italian customer and vendor record has correct routing information. B2B customers need a Codice Destinatario - a 7-character routing code unique to Italy. Public administration entities need a Codice Univoco Ufficio (6 characters) plus CIG/CUP procurement codes where applicable. B2C customers without a routing code use 0000000 (seven zeros). Foreign B2B buyers use XXXXXXX (seven X's). All four scenarios must be mapped in the ERP customer master before testing begins. Collecting Codice Destinatario from existing customers takes longer than expected - buyers rarely volunteer the code proactively.

**Channel selection and setup (2-4 weeks).** For mid-market groups, the practical choice is a certified intermediary hub (Sovos, B2Brouter, Pagero, or equivalent). Direct SDICoop integration requires mutual TLS certificates from Agenzia delle Entrate, with a processing time of approximately 20 days, plus ongoing certificate renewal management. An intermediary bypasses this via REST API.

**FatturaPA schema mapping (6-8 weeks).** FatturaPA is Italy's mandatory B2B e-invoice format - a structured XML schema governed by Agenzia delle Entrate. The schema includes document type codes (TipoDocumento, TD01 through TD29 as of v1.9.1) covering standard invoices, credit notes, deferred invoices, reverse charge variations for foreign purchases, and self-billing for missed invoicing. Every billing scenario in the ERP must map to the correct TD code. Errors produce SdI structural rejections that return as numeric error codes without readable descriptions. This mapping step is consistently underestimated.

**UAT with SdI sandbox (4 weeks).** Agenzia delle Entrate provides a test environment (Test di Interoperabilità) that requires accreditation. Test cases must cover rejection scenarios: invalid VAT IDs, wrong Codice Destinatario format, structural XML errors.

**Minimum:** 3-4 months with an established intermediary and a single Italian entity. **Stretched:** 6-9 months for multi-entity Italian operations, SAP S/4HANA environments, or where TipoDocumento mapping requires significant ERP customisation.

## Operational Ownership

**Finance Systems** owns two things: master data integrity (Codice Destinatario and CIG/CUP codes in the customer master, correct TipoDocumento logic in the billing engine), and Conservazione Elettronica setup. Conservazione Elettronica is a separate technical service from SdI transmission - it requires its own provisioning and certification. In practice, it is often deferred until Tax flags the gap, sometimes months after go-live.

**Tax/Compliance** owns the 10-year electronic archiving obligation (Conservazione Sostitutiva). This requires time-stamping (Marca Temporale) and specific technical certification - storing XML or PDF files in a file server does not satisfy it. [Italian Civil Code Art. 2220: https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262; AgID Conservazione rules: https://www.agid.gov.it/it/piattaforme/conservazione] Tax also governs TD17-TD19 logic: Italian entities receiving invoices from foreign suppliers must self-report those transactions back to SdI via reverse charge document types. This is a separate workflow from the outbound invoice stream and is frequently missed during implementation.

**AP/AR Operations** manages the daily exception queue. A key constraint: B2B buyers have no refusal mechanism at the SdI platform level. Once SdI clears an invoice, it is legally issued. [AdE FAQ: https://www.agenziaentrate.gov.it/portale/schede/comunicazioni/fatture-e-corrispettivi/faq-fe] Commercial disputes require the buyer to contact the supplier offline and request a TD04 credit note. AR Operations also monitors for Mancata Consegna status - SdI accepted the invoice but could not reach the buyer's endpoint - and must email a PDF copy to the buyer in those cases. This is a documented fallback, not an edge case.

**IT** owns the middleware integration to the intermediary hub, API authentication, and webhook configuration for SdI status callbacks.

**Where it breaks:** The 12-day transmission window. [DL 34/2019 (Decreto Crescita), Art. 14, amending DPR 633/1972 Art. 21: https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2019-04-30;34] Italian subsidiaries of foreign groups often run on centralised monthly billing cycles. Monthly batch billing creates a structural breach risk for the 12-day rule, because the clock starts at the date of supply, not the invoice date. Foreign billing teams running month-end cycles consistently encounter this gap.

## Data & Infrastructure

Three ERP fields are consistently missing in multi-country setups:

**Codice Destinatario** - the 7-character routing code that tells SdI which endpoint to deliver to. Unlike a VAT number, this is not derivable from public records. Buyers must communicate it to their suppliers. Collecting this field across an Italian customer base is a project in itself and cannot be automated.

**CIG/CUP codes** - procurement identifiers required on all invoices to public administration. Often not captured in ERP order records because they come from the buyer's procurement system. Missing CIG/CUP causes immediate SdI rejection for B2G transactions.

**Correct Codice Fiscale placement** - separate from Partita IVA for sole traders and private individuals. Both exist in the FatturaPA schema but in different XML nodes. Mapping them to the same ERP field triggers SdI error codes 00327/00324 and immediate rejection.

The transmission path for most mid-market groups is an intermediary hub connecting to SdI via SDICoop or SDIFTP, accessed through a REST API. The hub manages certificate renewal, retry logic, and status webhook delivery. Direct SDICoop or SDIFTP registration with Agenzia delle Entrate requires mutual TLS certificate management and is rarely the right choice for a subsidiary of a foreign group.

**Routing override:** If a buyer registers their Codice Destinatario directly on the AdE portal against their VAT number, SdI overrides whatever routing code the supplier puts in the XML and redirects to the registered endpoint. Suppliers should verify whether major customers have a registered routing preference before go-live.

## Correction & Business Continuity

**Correction:** Italy does not allow correction invoices. Once a B2B invoice receives a Ricevuta di Consegna from SdI, it is locked in the tax ledger. The only path forward is a TD04 credit note (Nota di Variazione in diminuzione) to zero out the original, followed by a new TD01 invoice. The credit note must itself be a valid FatturaPA XML transmitted through SdI. [AdE FAQ: https://www.agenziaentrate.gov.it/portale/schede/comunicazioni/fatture-e-corrispettivi/faq-fe] There is no paper fallback.

**Buyer refusal:** B2B buyers have no refusal mechanism at the SdI platform level. Once SdI clears an invoice, it is legally issued. Commercial disputes require the buyer to contact the supplier offline and request a credit note. For B2G only, public administration has a 15-day window to issue a Notifica di Esito Rifiuto through the platform. [AdE FAQ: https://www.agenziaentrate.gov.it/portale/schede/comunicazioni/fatture-e-corrispettivi/faq-fe]

**Deferred invoicing and SdI downtime:** TD24 (Fattura Differita) is Italy's standard statutory procedure for deferred invoicing: goods can be shipped with a DDT (Documento di Trasporto) and invoiced by the 15th of the following month. [DPR 633/1972, Art. 21: https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.presidente.repubblica:1972-10-26;633; AdE FAQ: https://www.agenziaentrate.gov.it/portale/schede/comunicazioni/fatture-e-corrispettivi/faq-fe] This same mechanism applies when SdI is temporarily unavailable - goods keep moving, the invoice follows. Companies unaware of TD24 may delay shipments or attempt paper invoices, which are not compliant for mandated businesses.

## The Friction Map

**Mancata Consegna mishandling.** SdI accepts the invoice - it is tax-valid - but the buyer's endpoint is down or their PEC inbox is full. SdI returns a Mancata Consegna status. A pattern observed in multi-country AR operations: foreign teams see the status, assume the invoice failed, and resubmit. This creates a duplicate in the tax ledger. The correct action: the invoice is legally valid. The supplier downloads the PDF and emails it directly to the buyer. The governance gap is that AR has no defined process for Mancata Consegna, and the intermediary portal is checked infrequently.

**Codice Fiscale vs Partita IVA confusion.** For individual traders and private consumers, these are different fields placed in different XML nodes. For companies they are often numerically identical but must still appear in the correct node. Error codes 00327/00324 mean immediate SdI rejection. Root cause: ERP configuration does not distinguish between the two fields during customer onboarding, treating them as equivalent.

**Foreign B2B routing gap.** Invoices to non-Italian EU counterparties require XXXXXXX as the Codice Destinatario. Most ERPs do not have a routing rule for "foreign buyer, no Italian routing code" - the field is left blank, triggering a different rejection error. This typically surfaces when the first foreign customer invoice is submitted in production, because implementation testing covered only Italian customer records.

**Conservazione gap.** Transmitting through a certified intermediary does not satisfy the archiving requirement. Conservazione Elettronica (10-year timestamped archival with Marca Temporale) is a separate service. Most intermediaries offer it as an add-on. Many Italian subsidiaries discover the gap during their first Italian tax audit, years after go-live.

## The "Ready" Definition

An Italian mandate operation is ready when four conditions hold:

- Every B2B invoice is transmitted through SdI and achieves Ricevuta di Consegna without manual XML editing or resubmission
- All immediate invoices are transmitted within 12 days of the date of supply, not the invoice date
- All incoming foreign AP invoices requiring reverse charge self-reporting (TD17, TD18, TD19) are processed without manual Tax team intervention
- Conservazione Elettronica is provisioned as a separate service, distinct from SdI transmission, with a named owner

The Group Controller's test: can the CFO of the Italian subsidiary name the person who owns Conservazione Elettronica renewal, the person who monitors the 12-day transmission clock, and the person who handles Mancata Consegna? If none of those three have a named owner, the mandate is not embedded.
