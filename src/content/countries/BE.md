---
country: Belgium
code: BE
flag: "🇧🇪"

mandate_type: interoperability
vida_alignment: DRR-compliant
future_direction: "Near real-time e-reporting to FPS Finance planned from January 1, 2028 via 5-corner Peppol model. Annual client listing abolished from 2028 as transaction data will be available in real time."

b2b: mandatory
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: all

key_deadlines:
  - date: 2025-12-31
    description: Hermes B2G platform decommissioned - B2G also migrated to Peppol
  - date: 2026-01-01
    description: Mandatory structured Peppol B2B e-invoicing for all domestic transactions
  - date: 2026-03-31
    description: Tolerance period ended - penalties now applicable for non-compliant B2B invoicing
  - date: 2026-06-30
    description: Extended tolerance for self-billing arrangements ends
  - date: 2028-01-01
    description: Near real-time e-reporting to FPS Finance via 5-corner Peppol model

formats: [Peppol-BIS-3.0, UBL-2.1, CII-16B]
cius: null
platform: none
platform_model: none
transport_protocol: Peppol-BIS-3.0
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2026-01-01
outbound_mandate_date: 2026-01-01
outbound_mandate_date_phase2: null
mandate_hardness: hard-both

master_data_id: "Peppol ID scheme 0208 (KBO/BCE enterprise number)"
mandatory_pdf_bundle: none
foreign_resident_scope: true
archiving_years: 7
penalty_max: "EUR 5,000 per offense (third offense within 3 months)"
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT

has_sandbox: false
last_verified: 2026-04-29
---

## Preparation Timeline

Belgium's mandate went live January 1, 2026. The tolerance period ended March 31, 2026. Companies that have not yet completed implementation are in the full penalty window. Self-billing arrangements have an extended tolerance until June 30, 2026. From April 1, 2026, penalties apply: EUR 1,500 for a first offense, EUR 3,000 second, EUR 5,000 third within a three-month window.

The work from a standing start runs in four stages:

**Peppol access point selection (2-4 weeks).** The mandate requires Peppol network routing for all domestic B2B invoices. Most mid-market companies use a certified access point provider rather than running their own AS4 node. Provider selection affects 2028 e-reporting readiness: Belgium moves to a 5-corner Peppol model in 2028, where FPS Finance becomes an active Peppol participant receiving real-time invoice copies. Choosing a provider without a confirmed 2028 roadmap means a second migration.

**ERP configuration and Peppol ID registration (4-8 weeks).** The billing system must produce Peppol BIS Billing 3.0 compliant XML (UBL 2.1 or CII 16B). Your access point registers your Peppol Participant ID in the Belgian SMP (Service Metadata Publisher). Until that registration is active, Belgian counterparties cannot find you on the Peppol network.

**Master data scrubbing (3-4 weeks).** Every Belgian business partner needs a valid KBO/BCE enterprise number - the primary Belgian Peppol routing identifier. Companies without systematically verified customer and vendor KBO numbers encounter routing failures at go-live.

**Testing (2-4 weeks).** No official Belgian government B2B sandbox exists. Testing uses the Peppol test network provided by access point providers.

**Minimum:** 2-3 months with an established access point provider and a single entity. **Stretched:** 4-6 months for multi-entity groups, SAP DRC integration, or entities where outbound ERP XML configuration requires significant build work.

## Operational Ownership

**Finance Systems** owns the billing engine configuration for Peppol BIS 3.0 XML output. Every invoicing scenario - standard invoices, credit notes, self-billing, and any invoice-type-specific handling - must produce valid XML before the access point can transmit.

**Tax/Compliance** owns scope determination per entity: which Belgian-registered entities are mandated, which are excluded (Art. 44 of the Belgian VAT Code for exclusively exempt activities, Art. 56 flat-rate taxpayers), and which self-billing arrangements still benefit from the June 2026 tolerance. Tax also owns the 7-year archiving obligation and penalty exposure monitoring. From January 2028, near real-time e-reporting to FPS Finance will expand Tax's monitoring and reporting scope significantly.

**AP Operations** must process inbound Peppol invoices from Belgian suppliers. The mandate requires both sending AND receiving. Registering a Peppol ID for outbound only and ignoring the inbound stream is the most common compliance gap in early implementations.

**IT** owns the access point integration, API setup, Peppol ID registration management, and inbound queue monitoring. IT is also responsible for evaluating provider readiness for the 2028 5-corner model before contract renewal.

**Where it breaks:** AP is not set up to process inbound Peppol. Belgian suppliers start sending. Invoices arrive at the access point and queue unread. Tax discovers the gap during archiving review.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

## Data & Infrastructure

The Belgian Peppol Participant ID uses the KBO/BCE enterprise number as the primary identifier. The format is scheme code 0208 followed by the 10-digit enterprise number: a company registered as BE0123.456.789 registers on Peppol as 0208:0123456789. The 9925 scheme (VAT-number-based) is valid but has limited support and is not the recommended primary identifier.

Registration is not automatic. Your access point must explicitly register your Peppol ID in the Belgian SMP after onboarding. Until confirmed and active, Belgian counterparties searching the SMP cannot find you and inbound routing fails silently.

For Belgian subsidiaries of foreign groups: the mandate applies to the Belgian established entity, not the foreign parent. A multi-entity group with six Belgian entities needs six Peppol IDs registered, each tied to the Belgian entity's KBO/BCE number.

**Transport:** Peppol AS4 is the standard protocol. Email-based PDF transmission is not compliant for mandated B2B transactions. Other EN 16931-compliant formats are permitted only where both parties agree - in practice, Peppol is the de facto mandatory path.

## Correction & Business Continuity

**Correction:** Belgium uses the standard Peppol UBL CreditNote transmitted via Peppol. There is no Belgian-specific correction format. The credit note must comply with Peppol BIS Billing 3.0 and route through Peppol like any other invoice.

**Business continuity:** No central B2B government platform means no government downtime risk for B2B exchange. Exposure is bilateral - either the sender's or recipient's access point. Peppol AS4 includes store-and-forward retry logic for transient outages.

**PDF fallback:** Reverting to PDF when a Peppol connection has issues does not satisfy the mandate. Queue and retry electronically. If a trading partner has not registered on Peppol, the invoice cannot be delivered - this is a mandate compliance issue on the recipient side, not a sender fallback scenario.

## The Friction Map

**Inbound-only registration.** A company registers on Peppol, configures outbound invoicing, and considers compliance complete. Belgian suppliers start sending Peppol invoices to the registered ID. The invoices arrive at the access point and queue unprocessed. AP continues processing PDF invoices, unaware a Peppol inbound queue exists. Tax discovers during archiving review that months of inbound Belgian invoices were never processed. The mandate requires both sending AND receiving - outbound-only implementations are partially compliant at best.

**KBO/BCE number gaps in supplier master.** Peppol routing for Belgian companies uses the KBO/BCE enterprise number (scheme 0208). Suppliers without registered Peppol IDs cannot receive Peppol invoices. Routing failures surface at go-live and are not always clearly attributed to missing KBO data.

**Art. 44 misapplication.** The exclusion applies only to entities that exclusively carry out Art. 44 VAT-exempt activities. Mixed-activity companies with some exempt revenue but also taxable operations are in scope. Finance teams that assume partial exempt activity excludes the entire entity face retroactive penalty exposure.

**2028 e-reporting migration risk.** Access point providers that cannot support the 5-corner Peppol model will require customers to migrate by January 2028. Companies signing multi-year contracts now without confirming the provider's 2028 roadmap are building in a forced migration.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

## The "Ready" Definition

A Belgian mandate operation is ready when four conditions hold:

- Every Belgian-established entity's Peppol ID is registered in the Belgian SMP and verifiable by counterparties
- All outbound domestic B2B invoices route via Peppol in Peppol BIS 3.0 format - no PDF substitutes for mandated transactions
- Inbound Peppol invoices from Belgian suppliers are automatically ingested and processed (not queuing unread in the access point)
- 7-year archiving of XML invoice data is confirmed as active and owned by a named person

The operations test: if a key Belgian supplier sends a Peppol invoice today, does it reach your AP system automatically, or does it sit in an access point queue? If the answer is "I'm not sure," inbound compliance is not done.
