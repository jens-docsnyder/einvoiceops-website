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
last_verified: 2026-04-27
---

## Preparation Timeline

Italy has been live since January 2019. For a foreign-headquartered group onboarding an Italian subsidiary, you are a late mover. The infrastructure is stable and well-documented, but the implementation complexity has not reduced.

**Scoping and master data audit (3-4 weeks).** The first task is confirming that every Italian customer and vendor record has correct routing information. B2B customers need a Codice Destinatario (7-character routing code). Public administration entities need a Codice Univoco Ufficio (6 characters) plus CIG/CUP procurement codes where applicable. B2C customers without a code use 0000000 (seven zeros). Foreign B2B buyers use XXXXXXX (seven X's). All four routing scenarios must be mapped in the ERP customer master before testing begins. This field-collection exercise takes longer than expected because buyers rarely volunteer their Codice Destinatario proactively.

**Channel selection and setup (2-4 weeks).** For mid-market groups: use a certified intermediary hub (Sovos, B2Brouter, Pagero, or equivalent). Direct SDICoop requires mutual TLS certificates from Agenzia delle Entrate - up to 20 days processing time, plus ongoing certificate renewal management. Intermediary route bypasses this entirely via REST API.

**FatturaPA schema mapping (6-8 weeks).** The consistently underestimated step. FatturaPA v1.8/1.9 has a large number of TipoDocumento codes (TD01 through TD28) covering standard invoices, credit notes, deferred invoices, and reverse charge variations for foreign purchases. Every billing scenario in the ERP must map to the correct TD code. Errors produce SdI structural rejections that return as numeric error codes, not readable descriptions.

**UAT with SdI sandbox (4 weeks).** Requires accreditation and can be slow. Test cases must cover rejection scenarios - invalid VAT IDs, wrong Codice Destinatario format, structural XML errors.

**Minimum:** 3-4 months with an established intermediary and a single Italian entity. **Stretched:** 6-9 months for multi-entity Italian operations, SAP S/4HANA environments, or where TD document type mapping requires significant ERP customisation.

## Operational Ownership

**Finance Systems** owns master data integrity - Codice Destinatario and CIG/CUP codes in the customer master, correct TipoDocumento logic in the billing engine. They also own the Conservazione Elettronica setup, which is a separate technical service from SdI transmission. Finance Systems routinely fails to provision it until Tax flags the gap, sometimes months after go-live.

**Tax/Compliance** owns the 10-year electronic archiving (Conservazione Sostitutiva). This requires time-stamping (Marca Temporale) and specific technical certification - storing PDFs in a file server does not satisfy it. Tax also governs TD17-TD19 logic: Italian entities receiving invoices from foreign suppliers must self-report those transactions back to SdI via reverse charge document types. This is a separate workflow from the outbound invoice stream and frequently gets missed during implementation.

**AP/AR Operations** manages the daily exception queue. The key constraint: B2B buyers have no refusal window at the SdI platform level. If an invoice clears SdI, it is legally issued. Commercial disputes are resolved offline by requesting a TD04 credit note from the supplier - the buyer cannot initiate anything at the platform level. AR Operations also monitors for Mancata Consegna status (SdI cleared the invoice but could not reach the buyer's endpoint) and must manually email a PDF copy to the buyer in those cases. This is a documented fallback, not an edge case.

**IT** owns the middleware integration to the intermediary hub, API authentication, and webhook configuration for SdI status callbacks.

**Where it breaks:** The 12-day transmission window. Italian subsidiaries of foreign groups typically run on centralised monthly billing cycles. End-of-month batch billing routinely breaches the 12-day rule for goods delivered earlier in the month. The clock starts at the date of supply, not the invoice date. Foreign billing teams consistently get this wrong.

## Data & Infrastructure

Three ERP fields are consistently missing in multi-country setups:

**Codice Destinatario** - the 7-character routing code that tells SdI which endpoint to deliver to. Unlike a VAT number, this is not derivable from public records. Buyers must communicate it to their suppliers. Collecting this field across an entire Italian customer base is a project in itself and cannot be automated.

**CIG/CUP codes** - procurement identifiers required on all invoices to public administration. Often not captured in ERP order records because they come from the buyer's procurement system. Missing CIG/CUP causes immediate SdI rejection for B2G transactions.

**Correct Codice Fiscale placement** - separate from Partita IVA for sole traders and private individuals. Both exist in the FatturaPA schema but in different XML nodes. Treating them as equivalent triggers SdI error codes 00327/00324 and immediate rejection.

The transmission path for most mid-market groups is an intermediary hub connecting to SdI via SDICoop or SDIFTP, accessed through a REST API. The hub manages certificate renewal, retry logic, and status webhook delivery. Direct SDICoop or SDIFTP registration with Agenzia delle Entrate requires mutual TLS certificate management and is rarely the right choice for a subsidiary of a foreign group.

**Routing override risk:** If a buyer registers their Codice Destinatario directly on the AdE portal against their VAT number, SdI overrides whatever routing code the supplier puts in the XML and redirects to the registered endpoint. Suppliers need to know this behaviour exists and verify whether major customers have a registered routing preference before go-live.

## Correction & Business Continuity

**Correction:** Italy does not allow correction invoices. Once a B2B invoice receives a Ricevuta di Consegna (delivery receipt) from SdI, it is locked in the tax ledger. The only path forward is a TD04 credit note (Nota di Variazione in diminuzione) to zero out the original, followed by a new TD01 invoice. The credit note must itself be a valid FatturaPA XML transmitted through SdI. There is no paper fallback.

**Buyer refusal:** B2B buyers have no refusal mechanism at the SdI platform level. Once SdI clears an invoice, it is legally issued. Commercial disputes require the buyer to contact the supplier offline and request a credit note. For B2G only, public administration has a 15-day window to issue a Notifica di Esito Rifiuto through the platform.

**SdI downtime fallback:** If SdI is temporarily unavailable, companies can ship goods with a DDT (Documento di Trasporto - transport document). The invoice is then issued as a TD24 deferred invoice, giving until the 15th day of the following month to transmit to SdI. This is the documented legal fallback. Companies that are not aware of it either delay shipments or issue paper invoices illegally.

## The Friction Map

**Mancata Consegna mishandling.** SdI clears the invoice - it is tax-valid - but the buyer's endpoint is down or their PEC inbox is full. SdI returns a Mancata Consegna status. Foreign AR teams see the status, assume the invoice failed, and attempt to resubmit. This creates a duplicate in the tax ledger. The correct action: the invoice is legally valid. The supplier must download the PDF and email it directly to the buyer. Root cause: nobody in the AR team knows what Mancata Consegna means, and the intermediary portal is typically only checked weekly.

**Codice Fiscale vs Partita IVA confusion.** For individual traders and private consumers, these are different fields placed in different XML nodes. For companies they are often numerically identical but must still appear in the correct node. Error codes 00327/00324 mean immediate SdI rejection. Root cause: the ERP was configured by an accountant who treats them as equivalent.

**Foreign B2B routing gap.** Invoices to non-Italian EU counterparties require XXXXXXX as the Codice Destinatario. Most ERPs do not have a routing rule for "foreign buyer, no Italian routing code" - the field is left blank, which triggers a different rejection error. Root cause: the implementation team tested only with Italian customer records.

**Conservazione gap.** Companies assume that transmitting through a certified intermediary satisfies the archiving requirement. It does not. Conservazione Elettronica (10-year timestamped archival with Marca Temporale) is a separate service. Most intermediaries offer it as an add-on. Many Italian subsidiaries only discover the gap during their first Italian tax audit, years after go-live.

## The "Ready" Definition

A stabilised Italian operation achieves above 98% straight-through clearance through SdI without manual XML editing or resubmission.

**12-day compliance rate: 100%.** No immediate invoices issued beyond 12 days from the date of supply. If the billing run is monthly, this means restructuring the billing trigger for Italian entities to date-of-supply rather than end-of-month, or moving to weekly billing cycles.

**Automated reverse charge.** All incoming foreign AP invoices requiring self-reporting to SdI (TD17, TD18, TD19) are processed automatically by the ERP. No manual intervention by the Tax team.

**Closed-loop AR ledger.** Invoice status in the AR ledger updates automatically via SdI status webhooks - Ricevuta di Consegna, Scartato, Mancata Consegna - without requiring AP staff to log into the intermediary portal.

**Mancata Consegna workflow.** A documented process exists for identifying Mancata Consegna cases and dispatching the PDF fallback to the buyer within 24 hours. This process is automated, not dependent on someone remembering to check a portal.

The Group Controller's test: can the CFO of the Italian subsidiary name the person who owns Conservazione Elettronica renewal, the person who monitors the 12-day transmission clock, and the person who handles Mancata Consegna? If none of those three have a named owner, the mandate is not embedded.
