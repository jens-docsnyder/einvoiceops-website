---
country: Estonia
code: EE
flag: "🇪🇪"

mandate_type: interoperability
vida_alignment: DRR-inquiry
future_direction: "Estonia's Accounting Act amendment (RT I, 04.10.2024, 1) introduced a key entitlement: from July 1, 2025, registered e-invoice recipients can legally reject PDFs. The B2B infrastructure (operators: Finbite, Telema, Unifiedpost) is mature. A B2B mandate is under active drafting at the Ministry of Finance (fin.ee), with approximately 2027 as the target, but no law has been enacted. The national e-invoice standard is eXML 1.2 (EVS 923:2014/AC:2017)."

b2b: announced
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2019-04-01
    description: "B2G e-invoicing mandatory for central government (EU directive transposition)"
  - date: 2025-07-01
    description: "Registered e-invoice recipients can legally reject PDF invoices (Accounting Act amendment RT I, 04.10.2024, 1)"

formats: [eXML-1.2, UBL-2.1, Peppol-BIS-3.0]
cius: null
platform: "RIK (e-Financials) for public sector; Finbite/Telema/Unifiedpost for B2B"
platform_model: interoperability
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: null
outbound_mandate_date: null
outbound_mandate_date_phase2: null
mandate_hardness: "B2G hard-both (live); B2B mandate drafting at MoF, ~2027 target (no enacted law)"

master_data_id: "Registrikood (Registration Code) - 8-digit company registration number. Address registry integrated into e-Business Register (ariregister.rik.ee)."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 7
penalty_max: "EUR 3,200 (Accounting Act §35 - source-verification required)"
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED
  - ACCEPTED
  - REJECTED

has_sandbox: false
last_verified: null
mandate_version: 1
confidence_summary: amber
unresolved_high: 1
unresolved_amber: 2
---

## Preparation Timeline

Estonia has one of the most mature e-invoicing ecosystems in the EU. B2G has been mandatory since April 2019. The B2B operator network (Finbite, Telema, Unifiedpost) handles structured e-invoice exchange for the majority of Estonian businesses. The national format is eXML 1.2 (EVS 923:2014/AC:2017, maintained by the Estonian Centre for Standardisation), and Peppol BIS 3.0 is also widely supported.

The July 1, 2025 amendment (Accounting Act, RT I, 04.10.2024, 1) is a significant change: registered e-invoice recipients can now legally reject PDF invoices. Any Estonian company or government entity that has registered in the e-Business Register (ariregister.rik.ee) as an e-invoice recipient is entitled to refuse PDFs from suppliers. Groups sending PDFs to registered Estonian recipients are in a precarious compliance position from July 1, 2025.

A B2B mandate is under active drafting at the Ministry of Finance (fin.ee). No enacted law exists as of May 2026; approximately 2027 is the indicated target.

For groups with Estonian customers or suppliers:

**Operator registration (2-3 weeks).** B2B e-invoice exchange in Estonia goes via operators (Finbite, Telema, Unifiedpost) or via Peppol. Connecting to one of the three operators gives access to most Estonian B2B exchange. The Registrikood (8-digit) is the routing identifier.

**eXML 1.2 or Peppol BIS 3.0 format output.** ERP billing engines must output either eXML 1.2 or Peppol BIS 3.0. eXML 1.2 is Estonian-specific; Peppol BIS 3.0 is the international standard and is increasingly preferred.

**Registered recipient check.** Before continuing to send PDFs to any Estonian counterparty, check the e-Business Register (ariregister.rik.ee) to determine whether they have registered as an e-invoice recipient. If registered, they are entitled to reject PDFs from July 1, 2025.

**Minimum:** 3-6 weeks for B2B with an existing operator connection. **Stretched:** 8-12 weeks for full B2G integration with RIK.

---

## Operational Ownership

**Finance Systems** owns eXML 1.2 / Peppol BIS 3.0 output, operator connection (Finbite/Telema/Unifiedpost), and B2G integration with RIK (e-Financials).

**Tax/Compliance** owns: (1) identifying all Estonian customers registered as e-invoice recipients (ariregister.rik.ee lookup); (2) 7-year archiving under Accounting Act §12; (3) monitoring MoF draft legislation for the B2B mandate (~2027).

**Master Data/IT** owns Registrikood (8-digit, no EE prefix) data quality for all Estonian customers and vendors, and e-Business Register address registry synchronization.

**IT** owns operator API integration, Peppol access point configuration for Estonian routing, and fin.ee/MoF monitoring for B2B mandate draft publication.

**Where it breaks:** PDF rejection. Estonian registered recipients began legally rejecting PDFs from July 1, 2025. Groups that have not checked the e-Business Register for their Estonian customers are sending PDFs that counterparties are entitled to reject - and may already be doing so.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**Registrikood.** The 8-digit Estonian company registration code is the primary routing identifier. The e-Business Register (ariregister.rik.ee) integrates the e-invoice address registry - there is no separate portal for checking e-invoice capability. The Registrikood (without EE prefix) is used for Peppol routing.

**eXML 1.2.** EVS 923:2014/AC:2017 is the Estonian national e-invoice standard, maintained by EVS (Estonian Centre for Standardisation). It predates EN 16931 and is not an EN 16931 CIUS. Peppol BIS 3.0 is increasingly used alongside or instead of eXML 1.2.

**Operator network.** Three primary B2B operators handle most Estonian e-invoice exchange: Finbite, Telema, and Unifiedpost. Each operator connects to the others via interoperability agreements. Connecting to one operator reaches counterparties on all three.

**Archiving.** 7 years under Accounting Act §12. Original electronic format must be preserved; conversion to PDF only does not satisfy the archiving requirement.

---

## The Friction Map

**PDF rejection exposure.** Estonian registered recipients have been legally entitled to reject PDFs since July 1, 2025. Groups that have not run an ariregister.rik.ee lookup against their Estonian customer and vendor portfolio do not know which counterparties are entitled to reject. Invoice disputes arising from PDF rejection are the first symptom.

**eXML 1.2 vs. Peppol BIS 3.0 choice.** Groups implementing Estonian e-invoicing alongside other EU countries should use Peppol BIS 3.0 (avoiding eXML 1.2 as an additional format). Groups implementing Estonia standalone may find eXML 1.2 simpler due to local operator support. The format choice should be made once, not operator-by-operator.

**B2B mandate monitoring.** The Ministry of Finance (fin.ee) is actively drafting B2B e-invoicing legislation. Groups that do not monitor this process may be surprised by a short implementation window after law publication.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
