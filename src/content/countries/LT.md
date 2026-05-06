---
country: Lithuania
code: LT
flag: "🇱🇹"

mandate_type: interoperability
vida_alignment: DRR-inquiry
future_direction: "Lithuania's B2B e-invoicing mandate for January 2028 is at announced/policy stage - part of the 'Naujos kartos Lietuva' (New Generation Lithuania) national recovery plan (RRF). No legislation enacted as of May 2026. B2G via SABIS platform (replacing E.saskaita) has been live for public administration since 2024. i.MAS (Intelligent Tax Administration System) integration is planned for future B2B compliance linking."

b2b: announced
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2024-09-01
    description: "SABIS platform fully operational for B2G (transition from E.saskaita completed)"
  - date: 2028-01-01
    description: "B2B e-invoicing mandate announced (policy stage only - no enacted legislation as of May 2026)"

formats: [Peppol-BIS-3.0, UBL-2.1]
cius: null
platform: SABIS
platform_model: interoperability
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: null
outbound_mandate_date: null
outbound_mandate_date_phase2: null
mandate_hardness: "B2G hard-both (live); B2B announced January 2028 (no enacted law)"

master_data_id: "Peppol Participant ID using EAS codes 0213 (Company Code - juridinis asmens kodas) or 9960 (VAT Number). Company Code is the primary Lithuanian identifier."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 10
penalty_max: null
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED
  - ACCEPTED
  - REJECTED

has_sandbox: true
last_verified: null
mandate_version: 1
confidence_summary: amber
unresolved_high: 1
unresolved_amber: 2
---

## Preparation Timeline

Lithuania's B2G e-invoicing operates via the SABIS platform (Sistema Automatizuoto Biudzetines Informacijos, operated by NBFC - National Centre for Shared Services). The platform replaced E.saskaita and became fully operational in September 2024. Government Resolution No. 405 (May 29, 2024) is the legal basis for SABIS operations. NBFC is also the Lithuanian Peppol Authority.

B2B e-invoicing has been announced as a January 2028 target under the "Naujos kartos Lietuva" national recovery plan, but no legislation has been enacted. The January 2028 date is a policy commitment, not an enacted law. Treat as announced, not mandatory.

For companies with Lithuanian public sector customers:

**SABIS/Peppol onboarding (3-5 weeks).** SABIS routes B2G invoices via Peppol. The Lithuanian entity's Peppol participant ID uses EAS code 0213 (Company Code) or 9960 (VAT number). The NBFC sandbox is at api.sabis-mok.nbfc.lt/api.

**Company Code (juridinis asmens kodas) in Peppol routing.** Peppol EAS 0213 uses the Lithuanian Company Code - not the VAT number. Public sector buyers will have Peppol IDs based on their Company Code. ERP routing configurations that default to VAT number lookup must be configured to resolve Lithuanian Company Codes via the Peppol Directory.

**Minimum:** 4-6 weeks with existing Peppol capability. **Stretched:** 10-14 weeks from zero Peppol presence.

---

## Operational Ownership

**Finance Systems** owns Peppol BIS 3.0 / UBL 2.1 output for Lithuanian B2G, SABIS platform integration, and Company Code routing configuration.

**Tax/Compliance** owns the 10-year archiving requirement under the Law on Documents and Archives, and monitoring of the B2B January 2028 mandate as it moves from policy to enacted legislation.

**Master Data/IT** owns Peppol participant ID setup using Company Codes (EAS 0213) for Lithuanian entities and public sector buyers. The NBFC/edelivery.lt directory provides public sector buyer Peppol IDs.

**IT** owns SABIS/Peppol access point registration, NBFC API sandbox testing, and monitoring of NBFC legislative updates as the B2B mandate moves toward enactment.

**Where it breaks:** Company Code routing. Lithuanian public sector buyers use EAS 0213 (Company Code), not the VAT number scheme used in many other Peppol countries. ERP Peppol configurations that auto-resolve VAT numbers fail on Lithuanian buyers that use Company Code-based Peppol IDs.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**SABIS platform.** NBFC (nbfc.lrv.lt) operates SABIS and the Lithuanian Peppol Authority. The edelivery.lt domain is the Peppol Authority contact point. SABIS handles routing for Lithuanian public administration (ministries, municipalities, and state institutions).

**Peppol EAS codes.** EAS 0213 = Company Code (juridinis asmens kodas); EAS 9960 = VAT Number. Lithuanian public sector entities use 0213 as primary. Private companies may use either, but 0213 is preferred for domestic routing.

**B2B January 2028 - policy only.** The announced B2B mandate is part of Lithuania's RRF/national recovery plan. No legislation has been enacted. Monitoring NBFC and e-seimas.lrs.lt for draft law publication is the appropriate preparation step. i.MAS integration is planned but technical specifications for B2B are not yet published.

**Archiving.** 10-year archiving is required under the Law on Documents and Archives. This period applies to electronic records including invoice XML.

---

## The Friction Map

**Company Code vs. VAT number routing mismatch.** ERP Peppol configurations built for other EU countries typically use VAT number-based Peppol IDs. Lithuanian public sector buyers use Company Code-based IDs (EAS 0213). Without explicit configuration for Lithuanian routing, Peppol lookups may fail or resolve to wrong endpoints.

**B2B mandate monitoring gap.** The January 2028 B2B date is not yet legislation. Groups that wait for enacted law before beginning implementation will have less than 24 months from enactment to go-live. The SABIS B2G infrastructure provides the Peppol foundation for B2B, but B2B-specific scope (which transactions, which entities, what penalties) will require a readiness review once the law is published.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
