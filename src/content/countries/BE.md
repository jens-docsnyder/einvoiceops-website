---
country: Belgium
code: BE
flag: "🇧🇪"

mandate_type: interoperability
vida_alignment: DRR-compliant
future_direction: "Near real-time e-reporting to FPS Finance planned from January 1, 2028 via 5-corner Peppol model, per federal coalition agreement (pending legislation). Annual client listing to be abolished when enacted."

b2b: mandatory
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: all

key_deadlines:
  - date: 2025-12-31
    description: Hermes B2G platform decommissioned - B2G migrated to Peppol
  - date: 2026-01-01
    description: Mandatory structured Peppol B2B e-invoicing for all domestic transactions
  - date: 2026-03-31
    description: Tolerance period ended - administrative penalties now applicable
  - date: 2028-01-01
    description: Near real-time e-reporting to FPS Finance planned (federal coalition agreement; legislation pending)

formats: [Peppol-BIS-3.0, UBL-2.1, CII-UN-CEFACT]
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
foreign_resident_scope: false
archiving_years: 7
penalty_max: "Administrative fines under Art. 70 Belgian VAT Code; amounts depend on circumstances of each case"
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - ACCEPTED
  - REJECTED
  - PAID

has_sandbox: false
last_verified: 2026-04-30
---

## Preparation Timeline

Belgium's mandate went live January 1, 2026 (Law of 6 February 2024, Art. 3 §2bis: https://www.ejustice.just.fgov.be/cgi/article_body.pl?language=fr&pub_date=2024-02-20&numac=2024001635). The tolerance period ended March 31, 2026 (https://einvoice.belgium.be/en/news/period-tolerance-during-first-three-months-2026). Companies that have not completed implementation are in the full penalty window. Administrative fines apply under Art. 70 of the Belgian VAT Code from April 1, 2026.

The work from a standing start runs in four stages:

**Peppol access point selection (2-4 weeks).** The mandate requires Peppol network routing for all domestic B2B invoices. Most mid-market companies use a certified access point provider rather than operating their own AS4 node. Provider selection affects 2028 e-reporting readiness: per the Belgian federal coalition agreement, near real-time reporting to FPS Finance is planned from 2028, replacing the annual client listing. Choosing a provider without a confirmed 2028 roadmap means a forced migration in 18 months. The common procurement delay: InfoSec and legal review of a new critical cloud vendor takes 6-12 weeks in most corporate environments.

**ERP configuration and Peppol ID registration (4-8 weeks).** The billing system must produce Peppol BIS Billing 3.0 compliant XML (UBL 2.1 or CII). The access point registers the company's Peppol Participant ID in the Belgian SMP. Until that registration is active, Belgian counterparties cannot route invoices to you. The Belgian Peppol ID uses scheme 0208 with the 10-digit KBO/BCE enterprise number - this is a different field from the VAT number and must be stored and configured separately in ERP customer/vendor records.

**Master data scrubbing (3-4 weeks).** Every Belgian business partner needs a valid KBO/BCE enterprise number for Peppol routing. Companies without systematically verified KBO numbers for all Belgian customers and vendors encounter routing failures at go-live.

**Testing (2-4 weeks).** No official Belgian government B2B sandbox exists. Testing uses the Peppol test network provided by access point providers.

**Minimum:** 2-3 months with an established access point provider and a single entity. **Stretched:** 4-6 months for multi-entity groups, SAP DRC integration, or entities where outbound ERP XML configuration requires significant build work.

## Operational Ownership

**Finance Systems** owns the billing engine configuration for Peppol BIS 3.0 XML output. Every invoicing scenario - standard invoices, credit notes, self-billing - must produce valid XML. A specific Belgian gap in ERP configurations: the VAT breakdown must comply with Peppol UNCL5305 duty/tax/fee category codes (Category S for standard rate, Z for zero-rated, E for exempt). ERPs that aggregate tax at header level without category codes fail Peppol access point validation.

**Tax/Compliance** owns scope determination per entity: which Belgian-registered entities are in scope, which are excluded (Art. 44 of the Belgian VAT Code for exclusively exempt activities - note this applies only to entities exclusively carrying out exempt activities, not mixed-activity companies), and which self-billing arrangements benefit from any extended tolerance. Tax also owns 7-year archiving (https://einvoice.belgium.be/en/article/how-do-i-keep-invoices-received-electronic-invoicing) and penalty monitoring. From 2028, near real-time e-reporting to FPS Finance will add a new continuous monitoring obligation.

**AP Operations** must process inbound Peppol invoices from Belgian suppliers. The mandate requires both sending AND receiving. Registering a Peppol ID for outbound only and ignoring the inbound stream is the most common compliance gap in Belgian implementations.

**IT** owns the access point integration, Peppol ID registration in the Belgian SMP, inbound queue monitoring, and provider evaluation for 2028 readiness before contract renewal.

**Where it breaks:** AP is not configured to process inbound Peppol. Belgian suppliers start sending. Invoices arrive at the access point and queue unread. Nobody monitors the inbound queue because it did not exist before the mandate. Tax discovers the gap during archiving review.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

## Data & Infrastructure

The Belgian Peppol Participant ID uses the KBO/BCE enterprise number, scheme code 0208. A company registered as BE0123.456.789 registers on Peppol as 0208:0123456789. The dots are removed; the "BE" prefix is not included. Scheme 0088 (GLN - Global Location Number) is used in retail and healthcare. Scheme 9925 is specific to Austria and is not used for Belgian domestic routing.

Registration is not automatic. The access point explicitly registers the Peppol ID in the Belgian SMP after onboarding. Until confirmed active, Belgian counterparties cannot find the company and inbound routing fails silently with no error reaching the sender.

**The KBO/BCE gap in ERP master data.** Most multi-country ERP configurations store VAT numbers as the primary customer/vendor identifier. The Belgian KBO number is a separate 10-digit enterprise number without the "BE" prefix. In SAP, VAT number is typically stored in field STCEG; KBO requires a separate identification type. If the KBO field is absent or incorrectly populated, the Peppol transmission fails at the access point before reaching the recipient.

**The inbound integration gap.** An inbound Peppol invoice does not land in the ERP automatically. An API or SFTP bridge must be configured between the access point and the ERP's AP workflow. Standard ERPs have no Peppol inbox by default. This integration is consistently underscoped in implementation projects that treat e-invoicing as an outbound billing project.

For Belgian subsidiaries of foreign groups: each Belgian entity needs its own KBO/BCE number registered in the SMP. A group with six Belgian entities needs six Peppol IDs.

## Correction & Business Continuity

**Correction:** Belgium uses the standard Peppol UBL CreditNote transmitted via Peppol (https://docs.peppol.eu/poacc/billing/3.0/). The credit note must comply with Peppol BIS Billing 3.0, include the original invoice number in the BillingReference tag, and route through Peppol like any other invoice. A Peppol invoice cannot be cancelled or recalled once sent.

**Business continuity:** No central B2B government platform means no government downtime risk for B2B exchange. Primary continuity exposure is bilateral - either the sender's or recipient's access point. Peppol AS4 includes store-and-forward retry logic for transient outages.

**PDF fallback:** Reverting to PDF when a Peppol connection has issues does not satisfy the mandate after March 31, 2026. Queue and retry electronically.

## The Friction Map

**Inbound-only registration.** A company registers on Peppol, configures outbound invoicing, and considers compliance complete. Belgian suppliers start sending Peppol invoices to the registered ID. The invoices arrive at the access point and queue unprocessed. AP continues processing PDF invoices, unaware a Peppol inbound queue exists. Tax discovers during archiving review that months of inbound Belgian invoices were never processed. The mandate requires both sending AND receiving - outbound-only implementations are partially compliant at best.

**KBO/BCE number gaps in supplier master.** Peppol routing for Belgian companies uses the KBO/BCE enterprise number (scheme 0208). ERP supplier master records that store only VAT numbers cannot support Peppol routing without field-by-field KBO enrichment. Suppliers without a registered Peppol ID cannot receive invoices. Both gaps produce the same routing failure symptom with different root causes.

**Art. 44 misapplication.** The exclusion from the mandate applies only to entities that exclusively carry out Art. 44 VAT-exempt activities. Mixed-activity companies with some exempt revenue but also taxable operations are in scope for their taxable transactions. Finance teams that assume partial exempt activity excludes the entire entity face retroactive penalty exposure from April 1, 2026 onward.

**2028 e-reporting migration risk.** Access point providers that cannot support Belgium's planned 2028 reporting model will require customers to migrate. Companies signing multi-year access point contracts now without confirming the provider's 2028 roadmap are building in a forced migration. The 2028 model adds FPS Finance as a real-time recipient of invoice data - a new Tax compliance obligation that must be operationalised separately from the transmission infrastructure.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

## The "Ready" Definition

A Belgian mandate operation is ready when four conditions hold:

- Every Belgian-established entity's Peppol ID is registered in the Belgian SMP and verifiable by counterparties - send a Peppol SMP lookup for the entity's KBO number and confirm a registered endpoint returns
- All outbound domestic B2B invoices route via Peppol in Peppol BIS 3.0 format with no PDF substitutes for mandated transactions
- Inbound Peppol invoices from Belgian suppliers automatically reach the AP system - not queuing unread in the access point
- 7-year archiving of transmitted XML invoice data is active and owned by a named person, separate from PDF storage

The operations test: if a key Belgian supplier sends a Peppol invoice today, does it reach your AP system automatically, or does it sit in an access point queue? If the answer is "I'm not sure," inbound compliance is not done.
