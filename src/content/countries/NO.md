---
country: Norway
code: NO
flag: "🇳🇴"

mandate_type: interoperability
vida_alignment: "EEA member, not EU. ViDA is EU law and does not apply to Norway. Norway monitors EU ViDA developments as an EEA member but is not bound by EU VAT directives."
future_direction: "No B2B e-invoice mandate as of May 2026. Norway is EEA but not EU - ViDA does not apply directly. National B2B e-invoicing is voluntary but used widely in large enterprise procurement. Peppol BIS 3.0 (EHF 3.0) is the de facto standard for B2B e-invoicing."

b2b: voluntary
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2012-07-01
    description: "Central government agencies (statlige virksomheter) required to send and receive e-invoices in EHF format via Peppol (source-verification required)"
  - date: 2019-04-01
    description: "All public entities including municipalities and counties must accept e-invoices from suppliers under Anskaffelsesforskriften §11-3, transposing EU Directive 2014/55/EU for EEA (source-verification required)"

formats: [Peppol-BIS-3.0, EHF-3.0]
cius: EHF-3.0
platform: none
platform_model: none
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2019-04-01
outbound_mandate_date: 2019-04-01
outbound_mandate_date_phase2: null
mandate_hardness: hard-b2g

master_data_id: "Organisasjonsnummer (9-digit Norwegian company registration number), Peppol scheme 0192. Format: 0192:NNNNNNNNN. Source from Brønnøysundregistrene (brreg.no)."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 5
penalty_max: "Administrative fine (vitesvedtak) under Forvaltningsloven, set case-by-case. No fixed statutory maximum for e-invoice non-compliance specifically. (source-verification required)"
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED

has_sandbox: true
last_verified: 2026-05-12
mandate_phase: transposition-stable
mandate_version: 1
confidence_summary: green
unresolved_high: 0
unresolved_amber: 0
---

## Preparation Timeline

Norway has been a Peppol pioneer. EHF (Elektronisk Handelsformat) 3.0, Norway's national e-invoice profile, is built on Peppol BIS 3.0 and was among the earliest Peppol profiles deployed in Europe. The B2G mandate has been live in central government since 2012 and extended in stages to cover all public entities.

Since April 1, 2019, any company supplying goods or services to Norwegian public entities under a public procurement contract must issue invoices in Peppol BIS 3.0 (EHF 3.0) format. This covers all contracting authorities: central government agencies, municipalities, county administrations, and state-owned enterprises. Contracts outside formal procurement thresholds are included.

No B2B mandate exists as of May 2026. Norway is EEA but not EU, so ViDA does not apply.

For a foreign group implementing Norwegian B2G from a standing start:

**Peppol access point setup (2-4 weeks if using an existing Peppol provider).** If the group is already on Peppol for another mandate - Germany, Netherlands, Belgium - Norwegian B2G is an incremental configuration. Register the Norwegian entity's organisasjonsnummer on the Peppol SMP using scheme 0192. If not already on Peppol, full access point onboarding is required.

**Organisasjonsnummer sourcing (1-2 weeks).** The Peppol participant ID uses the Norwegian company registration number (organisasjonsnummer), a 9-digit identifier from Brønnøysundregistrene. Foreign entities supplying Norwegian public buyers must confirm the registered Norwegian entity number and configure it as the Peppol routing identifier.

**Buyer Reference collection (2-4 weeks).** Norwegian public entities use internal reference codes to route invoices to the correct department. These codes must be collected from each buyer at contract time and mapped to ERP customer master records before the first invoice is transmitted.

**Minimum:** 4-6 weeks with existing Peppol capability. **Stretched:** 10-14 weeks from zero Peppol presence, or where the ERP requires reconfiguration for EHF 3.0 output.

---

## Operational Ownership

**Finance Systems** owns EHF 3.0 (Peppol BIS 3.0) output configuration for B2G. The organisasjonsnummer-based Peppol routing must be mapped to each Norwegian public sector customer record. If the entity previously used an older EHF version, Finance Systems owns the format migration.

**Tax/Compliance** owns two obligations. First: 5-year archiving under Bokføringsloven (Accounting Act) §13. Archiving must cover the original electronic invoice XML file, not a PDF export. Second: monitoring whether Norwegian corporate customers are demanding Peppol BIS 3.0 invoices for B2B - a voluntary but increasingly common procurement requirement.

**IT** owns Peppol access point registration with the Norwegian Peppol Authority (Digitaliseringsdirektoratet, Digdir), scheme 0192 routing configuration, and SMP registration for each Norwegian entity.

**AP Operations** must confirm that inbound Peppol invoices from Norwegian buyers are processed automatically and archived in original XML format.

**Where it breaks:** The Buyer Reference gap mirrors the Swedish pattern. Norwegian public entities require an internal order or routing reference code that is not available in any public registry. An invoice without a valid Buyer Reference is delivered to the Peppol access point and rejected silently by the buyer's internal AP system. Finance discovers the gap at payment delay, not at go-live testing.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**Routing identifiers.** The Peppol participant ID for Norwegian entities uses scheme code 0192 (organisasjonsnummer). The number is 9 digits, no hyphen. Format for Peppol routing: `0192:NNNNNNNNN`. Standard ERP customer master setups store company name, address, and VAT ID but not Peppol participant IDs. The organisasjonsnummer must be sourced from Brønnøysundregistrene or directly from the buyer, stored in a dedicated field, and mapped to Peppol routing.

**EHF 3.0 and Peppol BIS 3.0 equivalence.** EHF 3.0 is Norway's national CIUS of Peppol BIS 3.0. Groups already transmitting Peppol BIS 3.0 invoices for other EU mandates are technically capable of Norwegian B2G - the main configuration work is the organisasjonsnummer scheme mapping and Buyer Reference field population, not a new format.

**B2B voluntary adoption.** Norwegian enterprise procurement increasingly requires Peppol BIS 3.0 invoices as a contractual condition, even without a legal mandate. Groups with significant Norwegian B2B revenue should confirm whether their ERP can produce Peppol BIS 3.0 for B2B without additional configuration.

---

## Correction & Business Continuity

**Correction:** Standard Peppol UBL CreditNote. No central platform involvement. The credit note is transmitted through the same Peppol channel as the original invoice, referencing the original invoice number.

**Business continuity:** No central clearance platform means no central downtime risk. Peppol AS4 store-and-forward handles transient access point outages. No government platform uptime dependency exists for B2B or B2G.

---

## The Friction Map

**Buyer Reference not mapped.** Norwegian public entities require an internal routing reference that is not published in any directory. It must be collected from each buyer before the first invoice. An invoice without a valid Buyer Reference is delivered to the Peppol access point and silently rejected by the buyer's AP system. The failure surfaces at payment delay, not go-live testing.

**Organisasjonsnummer not in ERP master.** ERP customer master records for Norwegian entities typically contain name, address, and VAT registration details - not the 9-digit organisasjonsnummer in scheme 0192 format for Peppol routing. This lookup and data entry step is required before the first invoice can route correctly.

**Old EHF profile still active.** Groups with Norwegian B2G history from before EHF 3.0 may still be on EHF 2.x profiles. Finance Systems may not know which active entities are on the current profile. An ERP footprint audit for CustomizationID header strings is how this is found.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

---

## The "Ready" Definition

A Norwegian B2G operation is ready when four conditions hold:

- All Norwegian entities supplying public sector bodies have active Peppol BIS 3.0 (EHF 3.0) enabled, with confirmed SMP registration using scheme 0192 and the correct organisasjonsnummer
- Buyer Reference codes are collected from each Norwegian government buyer and mapped in ERP customer master records before the first invoice is transmitted
- 5-year archiving of original Peppol XML invoice files is active under a named owner - not PDF exports, but the original UBL records
- Inbound Peppol invoices from Norwegian buyers are processed automatically and archived in original XML format

The practical test: submit a Peppol BIS 3.0 invoice to a Norwegian public entity's Peppol ID via your access point with a valid Buyer Reference. If it delivers without error and the buyer acknowledges receipt, B2G is working. If any step fails, implementation is not complete.
