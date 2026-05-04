---
country: Sweden
code: SE
flag: 🇸🇪

mandate_type: interoperability
vida_alignment: DRR-inquiry
future_direction: "Legacy Svefaktura 1.0 and EDIFACT formats phased out for new public procurement from July 1, 2025 — all new B2G contracts must use Peppol BIS 3.0. No B2B mandate enacted. Sweden is monitoring EU ViDA initiative; no formal B2B inquiry confirmed as of May 2026."

b2b: voluntary
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2019-04-01
    description: B2G mandatory for all contracting authorities and their suppliers (Lag 2018:1277, §4 and §5)
  - date: 2025-07-01
    description: Svefaktura 1.0 and EDIFACT phase-out for new public procurement — Peppol BIS 3.0 mandatory for all new contracts

formats: [Peppol-BIS-3.0]
cius: null
platform: none
platform_model: none
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2019-04-01
outbound_mandate_date: 2019-04-01
outbound_mandate_date_phase2: null
mandate_hardness: hard-both

master_data_id: "Peppol participant ID based on organisationsnummer (scheme 0007, DIGG/SFTI recommended) or GLN (scheme 0088). Format: 0007:NNNNNNNNNN (10-digit organisationsnummer without hyphen)."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 7
penalty_max: "Variable — the authority designated by government (§7 of Lag 2018:1277) may issue a vitesföreläggande (conditional fine) under Viteslag (1985:206). No fixed statutory maximum. Amount set case-by-case based on the entity's financial standing and the scale of the breach."
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED

has_sandbox: true
last_verified: null

mandate_version: 1
unresolved_high: 0
unresolved_amber: 3
confidence_summary: amber
---

## Preparation Timeline

Sweden's B2G e-invoicing mandate has been live since April 1, 2019 (Lag 2018:1277, §4 and §5). Any company supplying goods or services to Swedish public authorities under contracts signed after that date must issue Peppol BIS 3.0 invoices. The law covers all contracting authorities — central government agencies, municipalities, regions, and government-owned companies — including procurement below EU thresholds and direct awards.

Legacy formats (Svefaktura 1.0, EDIFACT) are no longer accepted for new public procurement as of July 1, 2025. All new Swedish B2G contracts must use Peppol BIS 3.0.

No B2B mandate exists as of May 2026. The Ministry of Finance launched a formal inquiry on February 5, 2026 to assess a domestic B2B mandate in the context of EU ViDA. The inquiry report is due November 30, 2027. The direction of travel is clear, but the mandate is not enacted.

For a foreign group implementing Swedish B2G from a standing start:

**Peppol access point setup (2-4 weeks if using existing Peppol provider).** If the group is already on Peppol for another EU country (Germany, Netherlands, Belgium), Swedish B2G is an incremental registration and routing configuration, not a new platform. If not already on Peppol, full access point onboarding is required.

**Buyer Reference (Referensnummer) collection (2-4 weeks depending on portfolio).** Swedish public entities require an internal routing code to direct invoices to the correct department. This code is not publicly searchable. It must be requested from each government buyer before the first invoice is sent.

**Minimum:** 4-6 weeks with existing Peppol capability. **Stretched:** 10-16 weeks from zero Peppol presence, or where the ERP is on Svefaktura 1.0 and requires reconfiguration.

---

## Operational Ownership

**Finance Systems** owns Peppol BIS 3.0 output for B2G, including Buyer Reference field mapping and organisationsnummer-based Peppol routing. If the ERP was previously configured for Svefaktura 1.0, Finance Systems owns the format migration.

**Tax/Compliance** owns two obligations. First: 7-year archiving under Bokföringslaget (1999:1078), Chapter 7, Section 2. Archiving must cover the original electronic invoice XML file, not only a PDF export. Second: B2B capability gap assessment — which Swedish corporate customers have demanded structured e-invoices, and does the current system handle this?

**IT** owns Peppol access point registration with DIGG, scheme 0007 routing configuration, and Svefaktura legacy cleanup for any entities still emitting the old format.

**AP Operations** must confirm that inbound Peppol invoices from Swedish government buyers are processed automatically and archived in original XML format.

**Where it breaks:** The Buyer Reference gap. Swedish public entities require an internal routing code to direct the invoice to the correct department and cost center. This code is not in the buyer's public records — it must be requested directly from each government buyer. An invoice with a missing or incorrect Buyer Reference is typically delivered successfully to the Peppol access point and rejected silently by the buyer's internal AP system. Finance discovers the gap when payment does not arrive, not during go-live testing.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**Routing identifiers.** The Peppol participant ID for Swedish entities uses scheme code 0007 (organisationsnummer, DIGG/SFTI recommended) or 0088 (GLN). The organisationsnummer is 10 digits. For Peppol routing, the hyphen is removed: `0007:5561234567`. Standard ERP customer master setups store company name, address, and VAT ID but not Peppol participant IDs with scheme codes. The Peppol ID must be sourced from the buyer, stored in a dedicated field, and mapped to the correct Peppol routing.

**Svefaktura legacy.** Svefaktura 1.0 was the Swedish national e-invoice format before the Peppol migration. It is no longer accepted for new public procurement as of July 1, 2025. ERP configurations built for Svefaktura output must be reconfigured for Peppol BIS 3.0. Finding which entities are still on Svefaktura and which have already migrated is typically the first discovery of a readiness sprint.

**B2B capability gap.** No B2B mandate exists yet. But the formal ViDA inquiry signals a mandate is coming. Groups without outbound Peppol BIS 3.0 capability for B2B are building implementation debt that will become a compliance gap once the inquiry outcome becomes legislation.

---

## Correction & Business Continuity

**Correction:** Standard Peppol UBL CreditNote. No central platform involvement. The credit note is transmitted through the same Peppol channel as the original invoice.

**Business continuity:** No central clearance platform means no central downtime risk. Peppol AS4 store-and-forward handles transient access point outages. No offline fallback procedure is required.

**Svefaktura legacy risk:** Entities still on Svefaktura 1.0 should not assume grandfathering. Public entities upgrading their AP systems may stop accepting legacy formats regardless of contract date.

---

## The Friction Map

**Buyer Reference not collected.** Standard ERP customer master setups for Swedish public sector buyers contain no Buyer Reference (Referensnummer). The invoice is transmitted via Peppol, delivered to the access point — and rejected by the buyer's internal system for missing the routing code. The failure surfaces at payment delay, not at go-live testing.

**Svefaktura legacy still active.** Groups with Swedish B2G history from before 2022 are disproportionately likely to still be on Svefaktura. Finance Systems may not know which entities are still emitting Svefaktura and which have migrated. An ERP footprint audit focused on CustomizationID header strings is how this is found.

**B2B capability absent.** Groups that treat Swedish B2B e-invoicing as permanently voluntary may find themselves unable to respond when a Swedish corporate customer demands a Peppol BIS 3.0 invoice — a demand the customer is entitled to make under the incoming ViDA framework, and will be entitled to make under Swedish law once the inquiry outcome is enacted.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

---

## The "Ready" Definition

A Swedish B2G operation is ready when four conditions hold:

- All Swedish entities supplying public sector bodies have Peppol BIS 3.0 enabled with confirmed active Peppol access point registrations, using scheme 0007 routing validated against each government buyer's Peppol ID
- Buyer Reference (Referensnummer) is collected from each Swedish government buyer and configured in ERP routing before the first invoice is transmitted
- Svefaktura 1.0 output is disabled or confirmed not in use for any active B2G contracts
- 7-year archiving of original Peppol XML invoice files is active under a named owner — not PDF exports, but the original UBL records

The practical test: send a Peppol BIS 3.0 invoice to a Swedish central government entity's Peppol ID via your access point with a valid Buyer Reference. If it delivers without error and the buyer acknowledges receipt, B2G is working. If you cannot send this test invoice, implementation is not complete.
