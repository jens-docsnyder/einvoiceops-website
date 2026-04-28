---
country: Germany
code: DE
flag: "🇩🇪"

mandate_type: interoperability
vida_alignment: DRR-compliant
future_direction: "Transaction-based reporting (VRS) post-2028 aligned with ViDA DRR cross-border scope."

b2b: mandatory
b2g: mandatory
b2c_scope: none
status: live
phase_in: true
phase_in_scope: pending_micro

key_deadlines:
  - date: 2025-01-01
    description: Mandatory receiving of EN 16931 e-invoices for all domestic B2B
  - date: 2027-01-01
    description: Mandatory issuing for entities with prior-year turnover >EUR 800,000
  - date: 2028-01-01
    description: Mandatory issuing for all remaining B2B entities

formats: [XRechnung, ZUGFeRD, Peppol-BIS-3.0, EN16931]
cius: XRechnung
platform: none
platform_model: none
transport_protocol: Peppol-BIS-3.0
b2g_signature: none
b2b_signature: none

master_data_id: "VAT-ID (USt-IdNr) / Leitweg-ID for B2G"
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 10
penalty_max: null
reporting_window: null
correction_mechanism: correction_invoice

document_lifecycle_states:
  - SENT

has_sandbox: false
last_verified: 2026-04-27
---

## Preparation Timeline

For a mid-market group with a German subsidiary, budget 6-9 months for a clean implementation. The receiving obligation has been live since January 2025, so if you haven't acted yet, you're already behind on the AP side.

Months 1-2 are scoping: identify which German entities are in scope. The mandate applies only to domestic ("inländische") businesses - foreign-resident entities with a German VAT registration are not yet in scope. Determine whether the EUR 800k turnover threshold means your issuing deadline is January 2027 or January 2028. Most finance teams discover they don't have a clean entity list at this stage.

Months 2-4 are the ERP data audit and format decision. The choice between XRechnung (pure XML), ZUGFeRD (hybrid XML+PDF), and Peppol BIS 3.0 is not just technical - it depends on what your German trading partners can receive. ZUGFeRD requires the billing engine to generate both layers simultaneously. Most multi-country ERP configurations need meaningful config work to produce either format correctly.

Months 5-7 are access point or transport setup. Email is legally sufficient but unscalable. Any group with more than a handful of German counterparties needs a Peppol access point provider. Registration uses the German VAT ID or a GLN.

Months 8-9 are testing and go-live. Validate XML against the KoSIT validator. Run end-to-end tests with key trading partners before the deadline.

**Minimum:** 3-4 months with a simple ERP setup and an existing Peppol provider. **Stretched:** 9+ months for fragmented multi-country ERPs, legacy billing systems, or internal disagreements about format selection.

## Operational Ownership

**Finance Systems** configures the billing engine. The key task: map every applicable ERP tax code to UNECE 5305 tax category codes required by EN 16931. This is not a settings toggle - it requires reviewing every tax code in the system. Any gap produces XML validation failures.

**Tax/Compliance** owns two things the rest of the business typically ignores. First: GoBD archiving. The XML must be archived unmodified for 10 years. A PDF export does not satisfy this. Second: the October 2025 BMF letter created a new VAT exposure - if an incoming invoice contains a format error or business rule error in the XML, the right to deduct input tax is lost. Tax must define validation rules for incoming invoices, not just outgoing. This is a new obligation most tax teams haven't operationalised yet.

**AP Operations** owns the incoming e-invoice stream, live since January 2025. The required shift: from OCR-based PDF processing to XML data ingestion. Most AP teams are still reading the PDF layer of ZUGFeRD invoices and ignoring the XML. This works until Tax discovers the XML is wrong.

**IT** owns the transport layer - AS4 protocol maintenance for Peppol, or secure inbound/outbound email gateway configuration for direct exchange.

**Where it breaks:** Tax and AP Operations are not aligned on XML-first validation. Tax sets EN 16931 rules. AP continues to process PDFs. When Tax eventually finds a format error in the XML, the VAT deduction has already been claimed and must be reversed.

## Data & Infrastructure

Two ERP data gaps consistently stop German implementations before they start.

**UN/ECE unit of measure codes.** The mandate requires UNECE Recommendation 20 codes in the XML (PCE for pieces, KGM for kilograms). Standard ERP unit-of-measure fields use internal codes that rarely match. This must be mapped field-by-field across the product catalogue. Companies with large item masters discover this in month three.

**Leitweg-ID for B2G.** The buyer reference required for routing to German public authorities. This field typically does not exist in ERP customer master setups. For companies billing any German public entity, this is a blocking gap before go-live.

The transport options for B2B: **Email** is legally sufficient under BMF guidance - send the XML file to a designated buyer inbox. Not scalable, no retry logic, no tracking. **Peppol access point** is the recommended path for any group with significant German invoice volume. A certified provider registers your VAT ID or GLN on the Peppol SMP; counterparties on the Peppol network then route to you automatically. **Direct bilateral connections** work for major trading partner relationships but require per-partner setup.

Format choice (XRechnung vs ZUGFeRD) is partly a supply chain decision. XRechnung is machine-readable only - buyers without XML processing capability cannot read it visually. ZUGFeRD bundles the PDF for human readability. For mixed supplier bases, ZUGFeRD is the safer default, but requires more ERP configuration to generate both layers correctly.

## Correction & Business Continuity

**Correction:** Germany uses correction invoices (Rechnungsberichtigung), not credit notes. The BMF March 2026 FAQ is explicit: the correction must itself be a fully compliant EN 16931 electronic invoice. You cannot correct an XRechnung by sending a PDF. The correction document must contain a structural reference to the original invoice number and be transmitted through the same channel as the original.

**Business continuity:** Germany has no central government platform for B2B, so there is no government downtime risk. Continuity exposure is bilateral - your Peppol access point or your trading partner's. The Peppol AS4 protocol includes store-and-forward retry logic that handles transient outages without manual intervention. For email-based exchange, the fallback is manual queue management.

Reverting to paper or PDF when a trading partner's system is down is not compliant for mandated businesses without explicit mutual transitional consent. Queue and retry electronically.

## The Friction Map

**The hybrid illusion.** ZUGFeRD invoices have two layers: a readable PDF and a structured XML. AP teams process the PDF. Finance teams assume the PDF is the document. It is not. The October 2025 BMF letter confirmed that XML data takes legal precedence over the PDF in all cases. If the XML contains a format error - even if the PDF looks correct - the right to deduct input VAT is lost. Root cause: nobody told AP operations that the XML layer is the legal original. A governance gap, not a technical one.

**Email routing failures.** Suppliers send XML files to a designated invoice inbox. IT treats it as a standard mailbox: security filters strip XML attachments as potential malware, the inbox fills up, emails bounce with no alerting. Root cause: IT classifies the integration mailbox as email administration rather than a regulated business process. Nobody monitors the rejection log.

**Master data failures at sender.** Invoices fail KoSIT validation before leaving the sender's system because the buyer's VAT ID is formatted incorrectly - DE prefix missing, checksum wrong, or the field is blank. Root cause: Sales Operations never validated VAT IDs during customer onboarding. For B2G, the Leitweg-ID is simply not in the customer master.

## The "Ready" Definition

A stabilised German mandate operation: more than 95% of incoming domestic B2B invoices are processed by the ERP via XML data ingestion without OCR fallback or manual AP intervention. The XML is archived unmodified, meeting GoBD immutability requirements. No input VAT deductions have been flagged or denied due to format or business rule errors under the BMF October 2025 error categories.

For the issuing side (live for large taxpayers from January 2027): outbound transmission achieves above 99% first-time delivery success. Days Sales Outstanding is flat or improved - confirming that the mandate shift has not delayed payment processing at trading partners.

The Finance Director's test: if the VAT auditor asks for the original invoice for any transaction in the past ten years, can you produce the unmodified XML within four hours? If yes, GoBD archiving is embedded. If not, it is not done.
