---
country: Netherlands
code: NL
flag: "🇳🇱"

mandate_type: post-audit
vida_alignment: DRR-compliant
future_direction: "Domestic B2B e-invoicing mandate planned from January 2030, domestic e-reporting from January 2032. Legislation expected mid-2028 after public consultation Q4 2026."

b2b: not-yet
b2g: mandatory
b2c_scope: none
status: announced
phase_in: false
phase_in_scope: none

key_deadlines:
  - date: 2017-04-01
    description: B2G e-invoicing mandatory for central government suppliers
  - date: 2018-01-01
    description: B2G e-invoicing mandatory for all public sector suppliers
  - date: 2030-01-01
    description: Planned domestic B2B e-invoicing mandate (not yet enacted in law)
  - date: 2032-01-01
    description: Planned domestic e-reporting to Dutch tax authority (not yet enacted in law)

formats: [Peppol-BIS-3.0, SI-UBL-2.0, UBL-OHNL]
cius: null
platform: "Digipoort"
platform_model: none
transport_protocol: Peppol-BIS-3.0
b2g_signature: none
b2b_signature: none

inbound_mandate_date: null
outbound_mandate_date: null
outbound_mandate_date_phase2: null
mandate_hardness: null

master_data_id: "Peppol ID scheme 0106 (KvK / Kamer van Koophandel number)"
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 7
penalty_max: null
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT

has_sandbox: false
last_verified: 2026-04-29
---

## Preparation Timeline

The Netherlands does not yet have a domestic B2B e-invoicing mandate. The government has announced intent to mandate from January 2030, with legislation expected by mid-2028 following public consultation planned for Q4 2026.

For the B2G mandate (live since 2017-2018): if your Dutch entity supplies Dutch central government or public sector bodies, structured e-invoicing via Peppol and Digipoort is already required. If this has not been confirmed and validated, the gap is open now.

For B2B 2030 readiness: companies with Dutch operations that are also implementing Peppol for Belgium (2026 mandate) or Germany can extend the same access point infrastructure to the Netherlands at low marginal cost. Companies that are not yet on Peppol anywhere should factor Netherlands 2030 into their access point selection now rather than treating it as a separate future project.

**B2G implementation from a standing start (2-4 months):**
1. Peppol access point selection and onboarding (2-4 weeks)
2. ERP configuration for Peppol BIS 3.0 or SI-UBL 2.0 XML output (4-6 weeks)
3. KvK-based Peppol ID registration in the Dutch SMP (1-2 weeks via access point)
4. Digipoort routing confirmation for Dutch government buyer IDs (2-3 weeks testing)

**B2B 2030 readiness:** If Peppol infrastructure is already live for B2G or another country, extending to B2B when the mandate is enacted adds weeks, not months. The ERP output configuration for Peppol BIS 3.0 will be the same standard.

## Operational Ownership

**Finance Systems** owns billing engine configuration for Peppol BIS 3.0 or SI-UBL 2.0 output for B2G. The same configuration will apply to B2B when the 2030 mandate is enacted. For groups already running Peppol for Belgium, the format is identical - the NL entity needs its own registered Peppol ID.

**Tax/Compliance** owns confirming which Dutch entities are in scope for the B2G mandate (any entity with invoices to Dutch central or public sector bodies), archiving (7 years), and flagging the 2030 B2B mandate in the compliance planning calendar. The implementation window once legislation passes in 2028 is two years and will be congested.

**AP Operations** must process inbound Peppol from Dutch government buyers. Purchase orders and remittance documents may route via Peppol - inbound routing must be confirmed as configured.

**IT** owns Peppol access point integration, KvK number registration in the Dutch SMP, and Digipoort connectivity validation for all in-scope B2G invoice flows.

**Where it breaks:** The Dutch entity confirmed at go-live that B2G Peppol routing worked. Nobody has revalidated government buyer Peppol IDs since. A reorganisation of a public body changed its Peppol ID and invoices have been failing silently for months.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

## Data & Infrastructure

The Dutch Peppol Participant ID uses the KvK (Kamer van Koophandel / Chamber of Commerce) registration number, scheme code 0106. A company with KvK number 12345678 registers on Peppol as 0106:12345678. The VAT number (scheme 9944) is also supported but less commonly used.

For B2G invoicing: Peppol invoices to Dutch government entities are automatically routed through Digipoort, the Dutch government's central invoice reception hub (operated by Logius). Digipoort converts the Peppol BIS 3.0 invoice to UBL-OHNL format for government system consumption. Suppliers do not send directly to Digipoort - they send via Peppol to the buyer's Peppol ID and the network handles routing automatically.

Government buyer Peppol IDs: Dutch government entities have specific Peppol IDs registered in the Dutch SMP. Suppliers must use the correct buyer Peppol ID for routing. Sending to an outdated or incorrect ID produces a routing failure.

For B2B (post-audit current state): no platform, no central routing. B2B invoices can be exchanged in any form as long as legal content requirements are met and the invoice is archived for 7 years.

## Correction & Business Continuity

**Correction:** Standard Peppol UBL CreditNote. For B2G transactions, the credit note is transmitted via Peppol to the government entity's Peppol ID the same way as the original invoice.

**Digipoort availability:** Peppol AS4 store-and-forward protocol queues outbound invoices at the access point and delivers when Digipoort is available. Government invoice submission is not blocked by short Digipoort downtime windows.

**B2B continuity:** No central platform for B2B means no central downtime risk. Format-flexible until the 2030 mandate changes this.

## The Friction Map

**B2G coverage gaps.** A Dutch entity invoices some government bodies via Peppol and continues to send PDF invoices to others. The mandate covers all central government and public sector procurement, not just selected accounts. Finance teams that have not confirmed full B2G scope coverage have open gaps.

**Digipoort routing staleness.** Dutch government entity Peppol IDs change over time - reorganisations, mergers of public bodies, system migrations. A company that set up B2G Peppol routing in 2019 and has not revalidated buyer IDs since is likely routing some invoices to stale IDs, which fail silently at the access point.

**SI-UBL version confusion.** SI-UBL 1.x is no longer valid. Since 2019, the required format is SI-UBL 2.0, aligned with and functionally equivalent to Peppol BIS 3.0. Older implementations not yet updated are non-compliant for B2G.

**2030 mandate deferred planning.** Dutch B2B Peppol legislation is expected by mid-2028 with a two-year implementation window. Companies that wait for enacted legislation before starting will compete for access point provider capacity and ERP implementation resources in 2028-2030 alongside the entire Dutch B2B market. Groups implementing Peppol for Belgium now can extend NL at minimal marginal cost if they plan for it.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

## The "Ready" Definition

A Dutch mandate operation is ready when four conditions hold:

- All Dutch entities with invoices to central government or public sector bodies have Peppol IDs registered in the Dutch SMP with confirmed Digipoort routing
- Buyer Peppol ID coverage is complete - every in-scope government buyer ID has been validated in the last 12 months
- 7-year archiving is active and owned by a named person
- Finance Systems has reviewed the 2030 B2B mandate timeline and a Peppol extension plan exists for when legislation passes

The 2030 test: if the Netherlands B2B mandate legislation passed today, how many months would it take to extend the existing Peppol infrastructure to B2B? If the answer is "we'd need to start from zero," the 2030 window is shorter than it looks.
