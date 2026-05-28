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

inbound_mandate_date: 2025-01-01
outbound_mandate_date: 2027-01-01
outbound_mandate_date_phase2: 2028-01-01
mandate_hardness: hard-inbound-soft-outbound

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
last_verified: 2026-05-04
mandate_phase: active-rollout
mandate_version: 1
confidence_summary: amber
unresolved_high: 0
unresolved_amber: 2
---

## Preparation Timeline

The receiving obligation has been live since January 2025. If your German entity has not confirmed it can receive EN 16931-compliant invoices (XRechnung or ZUGFeRD format), that gap is already open.

For the issuing side, your deadline depends on one number: prior-year turnover from domestic B2B transactions. The EUR 800,000 threshold was set by the Growth Opportunities Act (Wachstumschancengesetz, March 2024, BGBl. 2024 I Nr. 108 [https://www.recht.bund.de/bgbl/1/2024/108/VO.html]), which amends §14 UStG. The transition rule (§27 Abs. 38 UStG) determines your deadline based on prior-year total turnover. Above it, the issuing mandate applies from January 2027. Below it, January 2028. Most finance teams have not confirmed this per entity.

A clean implementation from a standing start takes 6-9 months. The work runs in four stages: entity scoping and format selection, ERP data audit and tax code mapping, transport setup (Peppol access point or email gateway), and validation testing with trading partners.

Simple setups with an existing Peppol provider can compress to 3-4 months. Fragmented multi-country ERPs routinely run to 9 months or beyond.

The most common delay: discovering mid-project that the entity list is incomplete, or that ERP tax codes have not been mapped to UNECE 5305 format - a field-by-field review that surprises most finance teams.

**Minimum:** 3-4 months with a simple ERP setup and an existing Peppol provider. **Stretched:** 9+ months for fragmented multi-country ERPs, legacy billing systems, or unresolved format decisions.

## Operational Ownership

**Finance Systems** owns the billing engine reconfiguration. The mandate requires EN 16931-compliant XML output - producing it means systematic work across the entire billing configuration, not a single settings change.

**Tax/Compliance** owns two obligations the mandate created. First: GoBD archiving now requires the XML to be stored unmodified for 10 years - a PDF export does not satisfy this requirement. Second: if an incoming invoice contains a format error in the XML, it is classified as a "sonstige Rechnung" rather than a valid e-invoice under the mandate - putting the input VAT deduction at risk until corrected via Rechnungsberichtigung. [BMF Schreiben 15.10.2024, III C 2 - S 7287-a/23/10001 :007 (DOK 2024/0883282), Rn 7; BMF Schreiben 15.10.2025: https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.pdf?__blob=publicationFile&v=3] Tax must define and operationalise validation rules for incoming invoices, not only outgoing.

**AP Operations** has a new processing requirement since January 2025: German business partners may now send invoices as structured XML files (XRechnung or ZUGFeRD). In practice, many AP teams continue to process the readable PDF layer of ZUGFeRD invoices rather than ingesting the XML - which leaves the input VAT validation gap open (see Tax/Compliance above).

**IT** owns the transport layer: the connection between the ERP and the Peppol network or bilateral exchange channel.

**Where it breaks:** Tax defines XML validation rules for incoming invoices. AP processes the PDF layer. The two teams have no shared view of incoming invoice XML quality. When Tax identifies a format error, the input VAT deduction has typically already been claimed and must be reversed.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

## Data & Infrastructure

Two ERP data gaps consistently stop German implementations before they start.

**UN/ECE unit of measure codes.** EN 16931 requires UNECE Recommendation 20 codes in the XML (PCE for pieces, KGM for kilograms). Standard ERP unit-of-measure fields use internal codes that rarely match. This must be mapped field-by-field across the product catalogue. Companies with large item masters typically surface this in month three of implementation.

**Leitweg-ID for B2G.** The buyer reference required for routing to German public authorities. This field does not exist in standard ERP customer master setups. For any company billing a German public entity, this is a blocking gap before go-live.

Transport options for B2B direct exchange: **Email** is legally sufficient under BMF guidance [BMF Schreiben 15.10.2024, III C 2 - S 7287-a/23/10001 :007 (DOK 2024/0883282), Rn 44] - send the XML file to a designated buyer inbox. Not scalable, no retry logic, no tracking. **Peppol access point** is the recommended path for any group with significant German invoice volume. A certified provider registers your VAT ID or GLN on the Peppol SMP; counterparties on the network route to you automatically. **Direct bilateral connections** work for major trading partner relationships but require per-partner setup.

Format choice (XRechnung vs ZUGFeRD): XRechnung is machine-readable only - buyers without XML processing capability cannot read it visually. ZUGFeRD bundles a readable PDF alongside the XML. For mixed supplier bases, ZUGFeRD is the safer default, but requires the billing engine to generate both layers simultaneously.

## Correction & Business Continuity

**Correction:** Germany uses correction invoices (Rechnungsberichtigung) rather than credit notes. Once the mandatory e-invoice obligation applies to your entity, the correction document must itself be a fully compliant EN 16931 electronic invoice - the same invoice type code for a correction (BMF FAQ 2026: https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html, section on Rechnungsberichtigungen). During the transition periods where your entity is still permitted to issue paper or non-compliant electronic formats, corrections may also use those formats. Once the transition period ends, a PDF correction to an XRechnung is not valid. The correction must reference the original invoice number specifically and unambiguously and be transmitted through the same channel as the original.

**Penalties:** Germany has no dedicated financial penalty schedule for e-invoice non-compliance. The BMF FAQ is silent on penalties because consequences operate through existing tax law rather than a new e-invoice-specific fine regime. The primary financial risk is input VAT denial: an invoice that does not meet EN 16931 requirements may be reclassified as a "sonstige Rechnung," putting the recipient's input VAT deduction at risk. GoBD archiving failures (not storing the XML unmodified for 10 years) expose the company to heightened audit risk and potential tax base estimation by the tax authority. There is no per-invoice administrative fine comparable to those in clearance-model mandates. The `penalty_max` field is null — confirmed correct.

**Business continuity:** Germany has no central government B2B platform, so there is no government downtime risk for B2B exchange. Exposure is bilateral - either your Peppol access point or your trading partner's. The Peppol AS4 protocol includes store-and-forward retry logic that handles transient outages without manual intervention. For email-based exchange, the fallback is manual queue management.

Reverting to paper or PDF when a trading partner's system is down is not compliant for mandated businesses without explicit mutual transitional consent. Queue and retry electronically.

## The Friction Map

**The hybrid illusion.** ZUGFeRD invoices contain two layers: a readable PDF and a structured XML. A pattern observed in early ZUGFeRD implementations: AP teams process the PDF and do not ingest the XML. The BMF Schreiben of October 2025 (https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.pdf?__blob=publicationFile&v=3) introduces the concept of "innerer Kontrollpfad" (internal control path) - failing to ingest and validate the XML means the internal control path is absent, which can result in denied input VAT deductions during an audit. Tax owns the VAT exposure. AP owns the process. Nobody owns the space between them.

**Master data failures at sender.** Invoices fail KoSIT validation before leaving the sender's system because the buyer's VAT ID is formatted incorrectly - DE prefix missing, checksum wrong, or field blank. For B2G transactions, the Leitweg-ID is simply absent from the customer master. Buyer routing data was not validated during onboarding - a data quality problem that was invisible until the first e-invoice batch failed.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

## The "Ready" Definition

A German mandate operation is ready when four conditions hold:

- Every incoming domestic B2B invoice is processed via its XML data, not its PDF layer
- The XML of every invoice is archived unmodified, meeting GoBD immutability requirements
- Tax has defined and operationalised validation rules for incoming invoice XML
- The billing system produces EN 16931-compliant outbound XML and can transmit it through the required channel (applicable for large entities from January 2027)

The auditor test: if a VAT inspector asks for the original invoice for any transaction in the past ten years, can you produce the unmodified XML? If not, archiving is not done.
