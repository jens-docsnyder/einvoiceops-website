---
country: Denmark
code: DK
flag: "🇩🇰"

mandate_type: interoperability
vida_alignment: DRR-compliant
future_direction: "OIOUBL 3.0 project cancelled January 14, 2026 by Danish Business Authority (https://nemhandel.dk/oioubl-30-aflyses-tillmeld-dig-til-naeste-nemhandelsforum-24-februar-i-koebenhavn-0). Peppol BIS 3.0 designated as the single future standard. New Bookkeeping Act (Bogføringsloven Act 700/2022) extends B2B digital capability requirements to small businesses from January 1, 2026."

b2b: mandatory
b2g: mandatory
b2c_scope: none
status: live
phase_in: true
phase_in_scope: by_size

key_deadlines:
  - date: 2005-01-01
    description: B2G e-invoicing mandatory for central government suppliers
  - date: 2019-04-18
    description: B2G updated for EN 16931 compliance, all public sector bodies
  - date: 2024-07-01
    description: Bogføringsloven B2B capability — large/medium companies with standard registered systems
  - date: 2025-01-01
    description: Bogføringsloven B2B capability — large/medium with custom/in-house systems
  - date: 2026-01-14
    description: OIOUBL 3.0 cancelled — Peppol BIS 3.0 is single future standard
  - date: 2026-01-01
    description: Bogføringsloven B2B capability — small businesses (Class A, turnover above DKK 300,000 for two consecutive years)

formats: [Peppol-BIS-3.0, OIOUBL-2.1]
cius: OIOUBL
platform: none
platform_model: none
transport_protocol: Peppol-BIS-3.0
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2024-07-01
outbound_mandate_date: 2024-07-01
outbound_mandate_date_phase2: 2026-01-01
mandate_hardness: hard-inbound-soft-outbound

master_data_id: "GLN (Global Location Number / EAN) — 13-digit, primary routing identifier for public entities"
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 5
penalty_max: "Up to DKK 1,500,000; compulsory dissolution for repeated non-compliance — Bogføringsloven Section 26"
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - ACCEPTED

has_sandbox: true
last_verified: 2026-04-30
mandate_version: 1
confidence_summary: amber
unresolved_high: 0
unresolved_amber: 2
---

## Preparation Timeline

Denmark operates two e-invoicing frameworks in parallel, which creates scope confusion in multi-country assessments.

**B2G (since 2005):** All suppliers to Danish public authorities must issue structured e-invoices via NemHandel. The network has migrated to a Peppol-based architecture. OIOUBL 2.1 remains valid for B2G, but the OIOUBL 3.0 project was officially cancelled on January 14, 2026 (https://nemhandel.dk/oioubl-30-aflyses-tillmeld-dig-til-naeste-nemhandelsforum-24-februar-i-koebenhavn-0). Peppol BIS 3.0 is the single future standard. Any implementation documentation referencing OIOUBL 3.0 as upcoming is outdated.

**B2B (Bogføringsloven 2022):** The New Bookkeeping Act (Act 700/2022) requires Danish companies to use certified registered digital bookkeeping systems capable of e-invoice exchange. This is a system capability mandate, not a per-transaction e-invoice mandate. Companies are not legally required to issue every invoice as a structured e-invoice - they must have the capability. Phase-in by company size:
- July 1, 2024: Large/medium companies using standard registered systems
- January 1, 2025: Large/medium companies using custom/in-house systems
- January 1, 2026: Small businesses (Class A, turnover above DKK 300,000 for two consecutive years)

For a foreign group implementing Danish B2G from a standing start (2-3 months):

**GLN registration and ERP configuration (4-6 weeks).** Every Danish public sector entity is identified by a 13-digit GLN (Global Location Number). Invoices must be addressed to the buyer's GLN. Standard ERP customer master setups store names and addresses but not GLNs. GLNs must be sourced from the NemHandelsregistret and stored in a dedicated field with routing mapped to the correct NemHandel/Peppol endpoint.

**OIOUBL-specific fields (3-4 weeks).** B2G invoices require fields absent from standard UBL global templates: Contact ID (buyer's internal routing code to the correct department), AccountingCostCode (budget/cost centre), and the correct ProfileID string and EndpointID with GLN schemeID for NemHandel routing.

**Minimum:** 2-3 months for a single entity with clean GLN data. **Stretched:** 3-4 months for multi-entity setups or where Contact IDs must be collected from individual government buyers.

## Operational Ownership

**Finance Systems** owns billing engine configuration for OIOUBL 2.1 and Peppol BIS 3.0 output for B2G, including GLN routing, Contact ID, AccountingCostCode, and ProfileID fields. For the Bogføringsloven B2B requirement, Finance Systems must confirm the ERP is either a certified registered system or connected to one.

**Tax/Compliance** owns two obligations. First: confirming the Bogføringsloven compliance tier - which company class applies and whether the entity uses a standard or custom/in-house bookkeeping system. Second: 5-year archiving under Bogføringsloven Section 12. Archiving must cover the original electronic invoice file, not PDF exports.

**IT** owns Peppol access point registration for B2G, GLN registration in the NemHandelsregistret, and Bogføringsloven system certification where the company runs a custom ERP.

**AP Operations** must confirm that inbound Peppol/NemHandel invoices from Danish government buyers are processed automatically.

**Where it breaks:** The Bogføringsloven certification gap. Companies using SAP, Oracle, or Dynamics assume the ERP itself is Erhvervsstyrelsen-registered. The base ERP product may be registered - custom modifications and in-house configurations may require separate certification. The burden of proof rests on the company.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

## Data & Infrastructure

**GLN routing.** The GLN (13-digit) is the routing identifier for Danish public sector entities. It is registered in the NemHandelsregistret. Standard ERP customer master setups do not include a dedicated GLN field. The GLN must be sourced from each government buyer and stored in a separate field mapped to the XML EndpointID with schemeID="0088".

**OIOUBL vs Peppol BIS 3.0.** OIOUBL 2.1 is the Danish CIUS predating EN 16931. Peppol BIS 3.0 is the recommended path for new implementations following the OIOUBL 3.0 cancellation. Both use UBL 2.1 structures - the practical difference in ERP configuration is in the CustomizationID header and profile strings. New implementations should target Peppol BIS 3.0.

**Mandatory fields absent from global templates:**
- `EndpointID` with `schemeID="0088"` (GLN routing)
- `AccountingCustomerParty/Contact/ID` (Contact ID for departmental routing within the buying entity)
- `AccountingCostCode` (budget cost centre required by many public sector buyers)
- `ProfileID` string specific to the NemHandel procurement profile

Missing any of these causes delivery failure at the NemHandel access point or buyer system rejection.

## Correction & Business Continuity

**Correction:** Standard Peppol UBL CreditNote. Original invoices cannot be deleted or modified once issued under Bogføringsloven immutability requirements. A credit note referencing the original invoice must be issued and transmitted via the same channel.

**Business continuity:** No central clearance platform means no central downtime risk. Peppol AS4 store-and-forward handles transient access point outages. B2G invoice delivery is resilient to short platform downtime.

**OIOUBL 3.0:** Any roadmap or vendor communication referencing OIOUBL 3.0 as upcoming should be disregarded. Cancelled January 14, 2026. Peppol BIS 3.0 is the single future standard.

## The Friction Map

**GLN validation gap.** Standard ERP customer master setups have no GLN field and no NemHandelsregistret validation. Invoices addressed to a missing or incorrect GLN fail at the NemHandel access point. The gap surfaces at the first B2G invoice attempt, not during configuration.

**Bogføringsloven certification confusion.** Large companies using standard ERPs assume the system is Erhvervsstyrelsen-registered. The base ERP may be registered - the specific configuration, custom modules, and in-house modifications may not be. The burden of proof rests on the company to confirm.

**Contact ID collection.** Many Danish public sector buyers require a Contact ID in the invoice to route it to the correct internal department. This code is not publicly searchable - it must be collected from each buyer individually. Groups that have not collected Contact IDs for all Danish government customers encounter delivery failures despite correct GLN routing.

**OIOUBL profile confusion.** Some implementations still configure the OIOUBL 2.01 profile string rather than the OIOUBL 2.1 profile. The difference is in the ProfileID header field. NemHandel rejects invoices with the wrong profile string.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

## The "Ready" Definition

A Danish mandate operation is ready when four conditions hold:

- All Danish entities supplying public sector bodies have Peppol or NemHandel access point registrations confirmed active, with GLN-based routing validated against the NemHandelsregistret for every in-scope government buyer
- All Danish entities using custom or in-house ERP configurations have confirmed Erhvervsstyrelsen registration under Bogføringsloven, or use a registered standard system
- 5-year archiving of original electronic invoice files is active under a named owner - not PDF exports, but the original XML records
- OIOUBL 3.0 is not on any implementation roadmap - all future e-invoicing work targets Peppol BIS 3.0

The practical test: send a Peppol BIS 3.0 invoice to a Danish central government entity's GLN via your access point. If it delivers without error and the buyer acknowledges receipt, B2G is working.
