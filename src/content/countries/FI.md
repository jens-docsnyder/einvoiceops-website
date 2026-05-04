---
country: Finland
code: FI
flag: 🇫🇮

mandate_type: interoperability
vida_alignment: DRR-inquiry
future_direction: "TIEKE's Verkkolaskuvisio 2030 initiative (Finland's e-invoicing forum, Verkkolaskufoorumi) targets 100% EN-standard e-invoice adoption by 2030, with public and private sector backing. No enacted B2B mandate exists as of May 2026. Act 241/2019 Section 4 gives any business (elinkeinonharjoittaja) the right to demand a structured e-invoice from any supplier on request - no turnover threshold applies. The supplier is legally required to comply."

b2b: voluntary
b2g: mandatory
b2c_scope: none
status: live
phase_in: true
phase_in_scope: by_entity_type

key_deadlines:
  - date: 2019-04-01
    description: B2G mandatory — central government contracting authorities (Act 241/2019)
  - date: 2020-04-01
    description: B2G mandatory — all other public sector contracting entities (Act 241/2019)

formats: [Finvoice-3.0, TEAPPSXML-3.0, Peppol-BIS-3.0]
cius: null
platform: none
platform_model: none
transport_protocol: operator-network
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2019-04-01
outbound_mandate_date: 2019-04-01
outbound_mandate_date_phase2: 2020-04-01
mandate_hardness: hard-inbound-soft-outbound

master_data_id: "OVT code: 0037 + 8-digit Business ID (Y-tunnus, no hyphen) + optional org unit suffix (up to 5 digits). Peppol scheme 0037. Address register: Tieke verkkolaskuosoite.fi."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 6
penalty_max: "No fixed financial penalty in Act 241/2019. A buyer who receives a non-compliant invoice may reject it and withhold payment without being in late-payment default until a compliant structured invoice is provided."
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED

has_sandbox: false
last_verified: 2026-05-04

mandate_version: 1
unresolved_high: 0
unresolved_amber: 0
confidence_summary: green
---

## Preparation Timeline

Finland's B2G e-invoicing mandate has been live since April 1, 2019 for central government contracting authorities, and since April 1, 2020 for all other public sector entities (Act on Electronic Invoicing, 241/2019). Finland operates on a private operator network — a four-corner model with no government clearance platform. Invoice routing uses OVT codes maintained in the Tieke address register.

The B2B situation requires careful interpretation. Act 241/2019, Section 4 establishes a right for any business (elinkeinonharjoittaja) to demand a structured e-invoice from any supplier on request. No turnover threshold applies - the right is universal. This is not a universal B2B mandate; it is an on-demand right. But it creates compliance exposure: a Finnish corporate customer who invokes this right is entitled to withhold payment on a non-compliant invoice without being in late-payment default. The foreign supplier cannot contest the delay until a compliant structured e-invoice is provided.

TIEKE's Verkkolaskuvisio 2030 initiative targets 100% EN-standard e-invoice adoption in Finland by 2030. This is an industry-led roadmap backed by Finland's Verkkolaskufoorumi, with public sector participation - not enacted legislation. No B2B mandate or confirmed enforcement date exists as of May 2026.

For a foreign group supplying Finnish public sector buyers from a standing start:

**OVT code collection (1-2 weeks).** Each Finnish public sector buyer has an OVT code in the Tieke address register (verkkolaskuosoite.fi). Invoices must be addressed to the buyer's OVT code. Standard ERP customer master records do not include an OVT field.

**Format and routing configuration (3-6 weeks).** Groups already on Peppol can route to Finnish public entities via scheme 0037 participant IDs. Groups without Peppol require a separate Finnish operator network connection.

**Minimum:** 4-6 weeks with existing Peppol capability. **Stretched:** 8-12 weeks for Finvoice-native implementation or large government buyer portfolios.

---

## Operational Ownership

**Finance Systems** owns structured e-invoice output (Finvoice 3.0, TEAPPSXML 3.0, or Peppol BIS 3.0) for B2G, including OVT routing field configuration.

**Tax/Compliance** owns two obligations. First: 6-year archiving under Accounting Act (1336/1997), Chapter 2, Section 10. Archiving must cover original electronic files. Second: B2B on-demand risk assessment — which Finnish corporate customers have or could invoke the right to request structured e-invoices, and is the current system capable of responding?

**IT** owns operator network connection or Peppol access point registration, OVT code lookup in the Tieke register, and testing against Finnish public entity endpoints.

**AP Operations** must confirm that inbound structured e-invoices from Finnish public sector buyers are processed and archived in original file format.

**Where it breaks:** The B2B on-demand blind spot. International groups configure outbound B2G e-invoicing and consider the Finnish obligation satisfied. They do not configure outbound capability for B2B customers. When a Finnish corporate customer demands a structured e-invoice under Act 241/2019, the group cannot provide one. The customer withholds payment. Finance discovers the gap at the first payment dispute, not during implementation.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**OVT code structure.** The Finnish routing identifier is the OVT code: `0037` + 8-digit Business ID (Y-tunnus without hyphen) + optional organization unit suffix (up to 5 digits). For Peppol routing, scheme code `0037` is used. Tieke maintains the national address register at verkkolaskuosoite.fi. Standard ERP customer master setups have no OVT field — it must be added as a dedicated field mapped to the routing logic.

**Finvoice 3.0 vs Peppol BIS 3.0.** Both are accepted for Finnish B2G. For groups already on Peppol for other EU countries, routing via Peppol scheme 0037 to Finnish public entities is increasingly straightforward and avoids a separate Finnish operator network agreement. Legacy implementations using Finvoice 2.x should be updated to Finvoice 3.0. Finvoice 2.x remains documented and accepted by Finnish banks, but Finvoice 3.0 is required for compliance with EU directive 2014/55/EU (EN 16931) for public sector invoicing.

**Operator network.** Finnish private e-invoice operators form the delivery network for Finvoice. Sender connects to one operator; the operator routes to the receiver's operator. Equivalent to the Peppol four-corner model but uses Finnish operator infrastructure.

---

## Correction & Business Continuity

**Correction:** Hyvityslasku (credit note). The credit note references the original invoice number. A new invoice must be issued if the original is fully voided.

**Business continuity:** Private operator network means no single point of failure. No central platform downtime risk.

---

## The Friction Map

**OVT code gap.** Global ERP customer master configurations have no OVT field. Finnish public sector buyers' OVT codes must be sourced from the Tieke register and added field-by-field to ERP customer records. Groups that attempt to go live without OVT codes in the routing logic are routing to empty endpoints.

**B2B on-demand blind spot.** International groups configure B2G and stop. They do not configure B2B outbound capability. Under Act 241/2019, a Finnish customer can demand a structured e-invoice and withhold payment until one is provided. Groups discover this gap at the first payment dispute, not during configuration.

**Format fragmentation.** Some Finnish public entities still receive Finvoice format rather than Peppol BIS 3.0. Groups that implemented Peppol-only find that specific buyers cannot receive their invoices. Finnish operator routing handles format conversion in many cases — but not universally.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

---

## The "Ready" Definition

A Finnish B2G operation is ready when four conditions hold:

- All Finnish public sector buyers have OVT codes confirmed in the Tieke register and configured in ERP routing
- The entity can send Finvoice 3.0 or Peppol BIS 3.0 for B2G — confirmed by a successful test delivery to at least one Finnish public entity
- The entity can send and receive structured e-invoices on demand for B2B — not only for the B2G obligation
- 6-year archiving of original electronic invoice files is active under a named owner

The practical test: send a Finvoice 3.0 or Peppol BIS 3.0 invoice to a Finnish central government entity's OVT code. If it delivers without error, B2G is working. If a Finnish corporate customer demanded a structured e-invoice today, could you provide one within 24 hours? If not, B2B readiness is incomplete.
