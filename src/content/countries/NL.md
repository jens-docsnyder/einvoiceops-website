---
country: Netherlands
code: NL
flag: "🇳🇱"

mandate_type: interoperability
vida_alignment: DRR-compliant
future_direction: "B2B e-invoicing mandate planned January 1, 2030 (government intent; no enacted legislation as of April 2026). Public consultation Q4 2026. Legislation expected mid-2028. Domestic e-reporting planned January 1, 2032."

b2b: not-yet
b2g: mandatory
b2c_scope: none
status: proposed
phase_in: false
phase_in_scope: none

key_deadlines:
  - date: 2017-01-01
    description: B2G e-invoicing mandatory for central government (Rijksoverheid) suppliers
  - date: 2019-04-18
    description: B2G e-invoicing mandatory for all public sector bodies (EU Directive 2014/55/EU implementation)
  - date: 2030-01-01
    description: Planned domestic B2B e-invoicing mandate (government intent; not yet enacted in law)
  - date: 2032-01-01
    description: Planned domestic e-reporting to Dutch tax authority (government intent; not yet enacted)

formats: [Peppol-BIS-3.0, SI-UBL-2.0, UBL-OHNL, SETU]
cius: NLCIUS
platform: "Digipoort"
platform_model: none
transport_protocol: Peppol-BIS-3.0
b2g_signature: none
b2b_signature: none

inbound_mandate_date: null
outbound_mandate_date: null
outbound_mandate_date_phase2: null
mandate_hardness: null

master_data_id: "Peppol ID scheme 0106 (KvK number) for companies; scheme 0190 (OIN) for government entities"
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 7
penalty_max: null
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT

has_sandbox: true
last_verified: 2026-04-30
mandate_version: 1
confidence_summary: amber
unresolved_high: 3
---

## Preparation Timeline

The Netherlands does not yet have a domestic B2B e-invoicing mandate. The government has confirmed intent to mandate from January 2030, with public consultation planned for Q4 2026 and legislation expected by mid-2028. There is no enacted law as of April 2026. The 2030 date is a policy target, not a legal deadline.

For the B2G mandate (live since 2017-2019): if your Dutch entity supplies Dutch central government or any public sector body, structured e-invoicing via Peppol and Digipoort is already required. If this has not been confirmed and validated, the gap is open now.

For B2B 2030 readiness: companies with Dutch operations that are also implementing Peppol for Belgium (2026 mandate) or Germany can extend the same access point infrastructure to the Netherlands at minimal marginal cost. The ERP output configuration for Peppol BIS 3.0 and NLCIUS is largely reusable from a Belgium implementation - the Dutch entity needs an additional registered Peppol ID, not a separate build. Companies not yet on Peppol anywhere should factor the Netherlands into their access point selection now rather than treating 2030 as a separate future project.

**B2G implementation from a standing start (2-4 months):**

1. Peppol access point selection and onboarding (2-4 weeks)
2. ERP configuration for Peppol BIS 3.0 and NLCIUS (SI-UBL 2.0) XML output (4-6 weeks). NLCIUS adds Dutch-specific requirements on top of EN 16931, including the supplier's KvK number in the correct XML node - a field absent from most multi-country ERP templates.
3. KvK-based Peppol ID registration in the Dutch SMP (1-2 weeks via access point)
4. Digipoort routing confirmation - verify the OIN-based Peppol ID of each Dutch government buyer in the OIN register (operated by Logius) and confirm live routing (2-3 weeks testing)

**B2B 2030:** If Peppol infrastructure is already live for B2G or another country, extending to B2B when the mandate is enacted adds weeks, not months.

## Operational Ownership

**Finance Systems** owns billing engine configuration for Peppol BIS 3.0 and NLCIUS output for B2G. The NLCIUS (Netherlands Core Invoice Usage Specification, version 1.03, mandatory for Dutch public sector invoicing since May 2018) adds Dutch-specific rules on top of EN 16931 (https://www.forumstandaardisatie.nl/standaard/nlcius). The same configuration applies to B2B when the 2030 mandate is enacted.

**Tax/Compliance** owns three obligations. First: confirming which Dutch entities are in scope for the B2G mandate - central government, provinces, municipalities, water boards, and ZBOs (Zelfstandige Bestuursorganen) and semi-public institutions receiving majority public funding. Second: 7-year archiving (10 years for real estate-related invoices) under Dutch tax law (https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/uw_facturen_bewaren). Third: flagging the 2030 B2B mandate in the compliance planning calendar.

**AP Operations** must confirm inbound Peppol routing from Dutch government buyers. Purchase orders and related documents from public sector buyers may route via Peppol - inbound routing must be configured.

**IT** owns Peppol access point integration, KvK number registration in the Dutch SMP, Digipoort connectivity validation, and - critically - ongoing maintenance of government buyer OIN Peppol IDs in ERP customer master. This last item is consistently unowned after go-live.

**Where it breaks:** The Dutch entity confirmed B2G Peppol routing at go-live. No revalidation process exists for government buyer OIDs. A public body reorganisation changes its OIN. Invoices route to the stale ID and fail silently in the access point queue. Nobody notices until a payment is overdue.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

## Data & Infrastructure

The Dutch Peppol Participant ID uses two scheme codes. Scheme **0106** (KvK / Kamer van Koophandel number) is used for private companies. Scheme **0190** (OIN / Organisatie-identificatienummer) is used for Dutch government entities. The VAT number (scheme 9944) is supported but not the primary routing identifier for B2G.

For B2G invoicing: Peppol invoices to Dutch government entities route through Digipoort, the central invoice reception hub operated by Logius. Digipoort automatically converts the incoming Peppol BIS 3.0 invoice to UBL-OHNL format for government system consumption (EU Commission eInvoicing Country Sheet NL, updated February 2026). Suppliers do not send directly to Digipoort - they send via Peppol to the buyer's OIN-based Peppol ID and the network handles routing automatically.

**NLCIUS vs SI-UBL 2.0.** SI-UBL 2.0 is the UBL syntax expression of NLCIUS. For a Peppol invoice to be valid for Dutch public sector recipients, it must comply with both Peppol BIS 3.0 (transmission) and NLCIUS (content). The key Dutch-specific requirement: the supplier's KvK number must appear in the PartyLegalEntity/CompanyID XML node. This field is absent in most multi-country ERP templates.

**SI-UBL 1.x is obsolete since January 2023** (https://www.peppol.nl/en/frequently-asked-questions-about-peppol). Only SI-UBL 2.0 is accepted. A CustomizationID update is required when migrating from 1.x - the header must reference the NLCIUS 2.0 profile.

For B2B (current state): no platform, no central routing. B2B invoices can be exchanged in any form until 2030.

## Correction & Business Continuity

**Correction:** Standard Peppol UBL CreditNote for B2G transactions, transmitted via Peppol to the government entity's OIN-based Peppol ID. Under Dutch VAT law, the credit note must reference the original invoice number and date (https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/factuur_corrigeren).

**Digipoort availability:** Peppol AS4 store-and-forward protocol queues outbound invoices at the access point and delivers when Digipoort is available. Short downtime windows do not block invoice submission.

**B2B continuity:** No central platform for B2B means no central downtime risk. Format-flexible until the 2030 mandate changes this.

## The Friction Map

**B2G coverage gaps.** A Dutch entity invoices some government bodies via Peppol and continues to send PDF invoices to others. The mandate covers all central government and public sector procurement. ZBOs and semi-public institutions receiving majority public funding are in scope but frequently missed in ERP scope assessments. Healthcare institutions operating as private foundations are typically not in scope, but those receiving majority public funding are - a distinction requiring legal verification per entity.

**Digipoort routing staleness.** Dutch government entity OINs change when ministries reorganise, agencies merge, or departments migrate systems. A company that set up B2G Peppol routing in 2019 and has not revalidated buyer OINs since is likely routing some invoices to stale IDs. These fail silently at the access point 24-48 hours after transmission rather than immediately. The OIN register (Logius) is the authoritative source - OIN accuracy is consistently unowned after initial go-live and is not checked until a payment failure surfaces the problem.

**SI-UBL version confusion.** SI-UBL 1.x has not been accepted since January 2023. Only SI-UBL 2.0 (NLCIUS) is valid for Dutch public sector invoicing. Older implementations not yet updated are non-compliant. This gap surfaces as a Digipoort format rejection - the error is a technical code, not a plain-language message.

**2030 mandate deferred planning.** Dutch B2B Peppol legislation is expected by mid-2028 with a two-year implementation window to January 2030. Companies that wait for enacted legislation will compete for access point capacity and ERP implementation resources alongside the entire Dutch B2B market simultaneously. Groups implementing Peppol for Belgium now can extend to the Netherlands at minimal marginal cost if they plan for it.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

## The "Ready" Definition

A Dutch mandate operation is ready when four conditions hold:

- All Dutch entities with invoices to central government or public sector bodies have Peppol IDs registered in the Dutch SMP with confirmed Digipoort routing
- Buyer OIN coverage is complete and has been validated against the Logius OIN register within the last 12 months - not just at go-live
- 7-year archiving of invoice records is active and owned by a named person
- Finance Systems has confirmed the 2030 B2B mandate timeline and a Peppol extension plan exists for when legislation passes

The 2030 test: if the Netherlands B2B mandate legislation passed today, how many months would it take to extend the existing Peppol infrastructure to B2B? If the answer is "we would need to start from zero," the 2030 window is shorter than it looks.
