---
country: Spain
code: ES
flag: 🇪🇸

mandate_type: reporting
vida_alignment: DRR-partial
future_direction: "Verifactu/SIF mandatory from January 1, 2027 (IS taxpayers / corporations) and July 1, 2027 (all others) per Real Decreto-ley 15/2025. Mandatory B2B structured e-invoicing (Ley 18/2022 Art. 12) enacted in law — implementing Real Decreto pending as of May 2026. Once published: 12 months for companies above the large-company turnover threshold, 24 months for all others. TicketBAI already live and mandatory in Basque Country (Araba, Bizkaia, Gipuzkoa) and Navarre."

b2b: announced
b2g: mandatory
b2c_scope: in_scope
status: announced
phase_in: true
phase_in_scope: by_tax_type

key_deadlines:
  - date: 2015-01-15
    description: B2G mandatory via FACe portal — Facturae format (Ley 25/2013)
  - date: 2022-09-28
    description: Ley 18/2022 (Crea y Crece) enacted — mandatory B2B e-invoicing obligation in primary law (implementing regulation pending)
  - date: 2023-12-05
    description: Real Decreto 1007/2023 published — SIF/Verifactu technical regulation
  - date: 2024-10-17
    description: Orden HAC/1177/2024 published — Verifactu technical specifications
  - date: 2025-12-02
    description: Real Decreto-ley 15/2025 published — confirms 2027 go-live dates for Verifactu
  - date: 2027-01-01
    description: Verifactu/SIF mandatory for IS taxpayers (corporations subject to Impuesto sobre Sociedades)
  - date: 2027-07-01
    description: Verifactu/SIF mandatory for all other tax obligors (autónomos, IRPF taxpayers, others)

formats: [Verifactu-XSD, Facturae]
cius: null
platform: "Verifactu (AEAT, optional real-time) + FACe (B2G, centralized)"
platform_model: distributed
transport_protocol: SOAP-API
b2g_signature: XAdES
b2b_signature: XAdES

inbound_mandate_date: null
outbound_mandate_date: 2027-01-01
outbound_mandate_date_phase2: 2027-07-01
mandate_hardness: hard-outbound

master_data_id: "NIF (Número de Identificación Fiscal) — domestic, no ES prefix. EU VAT ID = ES + NIF. Same underlying digits, different field. NIF is used for Verifactu hash chain identification and FACe B2G routing."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 6
penalty_max: "Manufacturing or distributing non-compliant SIF: up to €150,000 per fiscal year per system type. Using or operating non-compliant SIF: up to €50,000 per fiscal year. Software lacking Declaración Responsable: €1,000 per system. Source: Art. 201 bis Ley 58/2003 (LGT), as amended by Ley 11/2021."
reporting_window: "Immediate (simultaneous with issuance) for Verifactu mode. No transmission deadline for non-Verifactu mode — records stored locally and available to AEAT on request."
correction_mechanism: anulacion

document_lifecycle_states:
  - ALTA
  - ANULACION

has_sandbox: true
last_verified: null

mandate_version: 1
unresolved_high: 1
unresolved_amber: 6
confidence_summary: amber
---

## Preparation Timeline

Spain is running two parallel e-invoicing frameworks on different timelines, with a third regional system already live in the Basque Country and Navarre.

**Verifactu/SIF (mandatory from January 1, 2027 for IS taxpayers, July 1, 2027 for all others):** Every invoicing software used by a Spanish tax-established company must comply with the SIF requirements under Real Decreto 1007/2023 and Orden HAC/1177/2024. The software must maintain a SHA-256 hash chain linking every invoice to the previous one. Companies choose between two modes: Verifactu mode (submit records to AEAT simultaneously via SOAP API — the text "VERI*FACTU" appears on the invoice QR code) or non-Verifactu mode (store records locally with hash chain, available to AEAT on request). This is not a clearance model — AEAT does not validate invoices before they are legally issued. The hash chain makes it cryptographically detectable if any invoice is deleted or modified after issuance.

**Mandatory B2B exchange (Ley 18/2022, Art. 12):** The law is enacted. The implementing Real Decreto is pending as of May 2026. Once published, the countdown begins: 12 months for large companies above the applicable turnover threshold, 24 months for all others. No confirmed go-live date in enacted secondary legislation as of May 2026.

**B2G via FACe (since January 15, 2015):** Mandatory under Ley 25/2013. Format: Facturae (Spanish national XML). Centralized FACe portal. FACe also accepts Peppol submissions for foreign company senders.

**TicketBAI (Basque Country + Navarre, already live):** Companies tax-domiciled in Araba, Bizkaia, Gipuzkoa, or Navarre are excluded from Verifactu requirements — TicketBAI functions as the regional equivalent with mandatory real-time submission to regional treasuries (Haciendas Forales). A company tax-domiciled in the Basque Country does not implement Verifactu; it implements TicketBAI instead.

For a foreign group implementing Verifactu from a standing start:

**Architecture decision (4-6 weeks).** Standard ERPs do not natively generate SHA-256 hash chains. The group must choose: extend the ERP with custom development, or use a middleware provider that handles hash chain generation, AEAT submission, and the Declaration of Responsibility (Declaración Responsable). This decision cannot be deferred past early 2026 for a January 2027 go-live.

**NIF master data remediation (2-3 weeks).** Spanish NIF (no prefix) must be stored separately from the EU VAT ID (ES + NIF).

**Non-alterability audit.** Current ERP processes that allow invoice deletion must be locked. Verifactu's hash chain makes post-issuance deletion a detectable compliance breach.

**Minimum:** 6-8 months. **Stretched:** 12-18 months for multi-entity groups or those with Basque/Navarre entities requiring separate TicketBAI implementation.

---

## Operational Ownership

**Finance Systems** owns SIF hash chain implementation, QR code generation on all invoice outputs, and Verifactu XSD record production. Also owns Facturae output for B2G FACe submissions. Once Ley 18/2022 implementing regulation is published, Finance Systems owns the structured B2B exchange format for that obligation as well.

**Tax/Compliance** owns scope determination: confirming which entities use SII (excluded from Verifactu), which are tax-domiciled in Basque Country or Navarre (TicketBAI instead), and which are established in Spanish territory (in scope). B2B mandate readiness timeline once implementing regulation publishes. Archiving: 6 years commercial (Art. 30 Código de Comercio), 4 years tax (Art. 66-70 Ley 58/2003).

**IT** owns the SOAP API connection for Verifactu mode, hash chain storage architecture, and the Declaration of Responsibility (Declaración Responsable) filing for the SIF. For Basque/Navarre entities: separate IT ownership for TicketBAI submission to each regional treasury.

**AP Operations** owns inbound B2G invoices from FACe, and will own inbound structured B2B invoices once Ley 18/2022 implementing regulation is live.

**Where it breaks:** The SIF architecture gap. Standard ERPs do not natively generate SHA-256 hash chains linking each invoice to the previous one. This requires either custom ERP development or a certified middleware layer — not a configuration exercise. Groups that start Verifactu planning in mid-2026 assuming their ERP vendor will ship a compliant module before January 2027 face an architecture-level gap if that module is delayed or insufficient.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**NIF vs EU VAT ID.** Same data quality problem as Poland's NIP/PL-prefix issue. The Spanish NIF (e.g., B12345678) has no country prefix for domestic use. The EU VAT ID used for VIES reporting is the NIF prefixed with "ES" (e.g., ESB12345678). Standard multi-country ERP VAT ID fields store the "ES" prefix. Verifactu XSD requires the NIF without prefix. Customer and vendor master records must have a separate Spanish domestic tax ID field storing the clean NIF.

**Hash chain architecture.** The SIF must maintain a SHA-256 hash of each billing record incorporating: the issuer's NIF, invoice number and series, date and time of issue, and the hash of the immediately preceding record. Standard ERPs store invoices as independent records — the chain linkage is not natively implemented. The practical architecture for mid-market groups is a sidecar compliance engine that receives invoice data from the ERP, generates and stores the hash chain, and either submits to AEAT (Verifactu mode) or holds locally.

**Chain reset on migration.** Article 11, Orden HAC/1177/2024 permits a documented chain reset when justified (e.g., system migration). The first record in the new chain must be flagged as "Primer registro" with documented justification. Groups that migrate ERPs without triggering the documented reset create a chain integrity gap detectable by AEAT.

**TicketBAI regions.** The Basque Country (Araba, Bizkaia, Gipuzkoa) and Navarre operate separate regional fiscal systems with mandatory real-time submission to their Haciendas Forales. TicketBAI uses its own TBAI XML schema and a separate hash chain. A group with entities in both Madrid (Common Territory) and Bilbao (Bizkaia) must maintain two separate SIF architectures.

---

## Correction & Business Continuity

**Verifactu corrections:** Two mechanisms. Registro de anulación: cancels a previous billing record in the hash chain. Registro de subsanación: corrects a previous record. Both generate new hash chain entries. The hash chain makes "delete and re-issue" a detectable compliance breach — any cancellation is permanently recorded and visible to AEAT. The ERP habit of deleting erroneous invoices and reposting is incompatible with Verifactu.

**B2B corrections (once Ley 18/2022 live):** Facturas rectificativas (corrective invoices) under Real Decreto 1619/2012.

**Business continuity (Verifactu mode):** If AEAT's SOAP web services are unavailable, the SIF queues records locally and submits once connectivity is restored. The hash chain remains intact during the queue period.

---

## The Friction Map

**SIF architecture decision deferred.** Groups that wait for their ERP vendor's Verifactu module and begin evaluation in Q3 2026 are running out of time for a January 2027 go-live. Custom ERP development takes 6-9 months. Middleware vendor onboarding takes 4-6 months. The architecture decision needs to be made in 2025 or early 2026.

**NIF/EU VAT ID separation.** Master data configured for cross-border operations does not separate the domestic NIF from the EU VAT ID. Verifactu XSD rejects submissions with the "ES" prefix — the same failure pattern as Poland's NIP/PL issue, surfacing at the first SIF submission.

**Non-alterability shock.** Finance teams accustomed to deleting draft or erroneous invoices discover that Verifactu's hash chain makes this a compliance violation. Every issued invoice requires an anulación record to cancel. Teams that continue with invoice-deletion habits after go-live create a chain integrity breach that AEAT can detect automatically.

**TicketBAI isolation.** Groups with entities in both Common Territory and Basque Country/Navarre must maintain two distinct SIF architectures. Applying the Verifactu implementation to a Bilbao entity produces a non-compliant configuration — TicketBAI requires separate TBAI schema output and separate regional treasury submission.

**B2B mandate timing gap.** Ley 18/2022 is enacted law. Groups focused solely on Verifactu and ignoring the B2B structured exchange obligation will face a second implementation cycle once the implementing regulation publishes — with a 12-24 month countdown from publication. Planning them independently creates duplicate effort and missed infrastructure decisions.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

---

## The "Ready" Definition

A Spanish Verifactu operation is ready when four conditions hold:

- All Spanish IS taxpayer entities have a deployed and tested SIF with an active SHA-256 hash chain before January 1, 2027 — confirmed by a successful AEAT test submission via the pre-production environment
- The NIF is stored as a dedicated domestic field, separate from the EU VAT ID (ES + NIF), in every Spanish customer and vendor master record
- The SIF's Declaration of Responsibility (Declaración Responsable) has been filed and invoice deletion is blocked at the system level
- Basque Country and Navarre entities have separate TicketBAI compliance configurations and are not on the Verifactu implementation track

The audit test: AEAT can reconstruct the hash chain for any period and detect chain breaks. If a chain break exists — from a system migration, a deleted invoice, or an unregistered SIF change — it is detectable. If you cannot produce an unbroken hash chain from your first 2027 invoice to the present, you are not compliant.
