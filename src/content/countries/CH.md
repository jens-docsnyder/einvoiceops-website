---
country: Switzerland
code: CH
flag: "🇨🇭"

mandate_type: interoperability
vida_alignment: "Non-EU, non-EEA. ViDA does not apply. Switzerland has bilateral arrangements with the EU but is not bound by EU VAT directives or the ViDA initiative."
future_direction: "No B2B e-invoice mandate as of May 2026. QR invoice (QR-Rechnung) is mandatory since October 2022 as a payment instrument replacing ESR/ISR slips, but does not require structured electronic invoice transmission between companies. Cantonal B2G requirements vary; some cantons have adopted Peppol-based B2G independently of the federal EVRE mandate."

b2b: voluntary
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2016-01-01
    description: "EVRE (Verordnung über die elektronische Rechnungsstellung im Bund, SR 611.06) in force: federal administration must accept and send structured e-invoices; federal suppliers required to submit e-invoices (source-verification required for supplier obligation scope)"
  - date: 2022-10-01
    description: "QR invoice (QR-Rechnung) mandatory replacement for ESR/ISR payment slips - applicable to all invoices with a payment reference, but not a structured e-invoice mandate"

formats: [Peppol-BIS-3.0, ZUGFeRD, Factur-X, EN-16931, EDIFACT]
cius: null
platform: none
platform_model: none
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2016-01-01
outbound_mandate_date: 2016-01-01
outbound_mandate_date_phase2: null
mandate_hardness: hard-b2g

master_data_id: "UID (Unternehmens-Identifikationsnummer), format CHE-xxx.xxx.xxx. Peppol scheme for Swiss UID: source-verification required. Standard ERP VAT field stores CHE number; dedicated Peppol SMP registration required."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 10
penalty_max: "No dedicated administrative fine for federal B2G non-compliance. Consequences are contractual: failure to submit compliant e-invoices under a federal procurement contract may result in payment delay or contract termination clauses."
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED

has_sandbox: false
last_verified: null
mandate_version: 1
confidence_summary: amber
unresolved_high: 2
unresolved_amber: 2
---

## Preparation Timeline

Switzerland's federal B2G e-invoice mandate is governed by the EVRE (Verordnung über die elektronische Rechnungsstellung im Bund, SR 611.06), in force since January 1, 2016. Any company supplying goods or services to Swiss federal administration must submit structured electronic invoices. The Swiss federal administration (Bundesverwaltung) covers all federal departments and agencies - not cantonal government, where requirements vary.

The mandate operates without a central clearance platform. Federal buyers connect to the e-invoice network via certified Peppol access points or through the EFV (Eidgenössische Finanzverwaltung / Federal Finance Administration) portal. Accepted formats include Peppol BIS 3.0, ZUGFeRD/Factur-X (EN 16931 hybrid PDF), and EDIFACT for established EDI relationships.

No B2B mandate exists as of May 2026. Switzerland is not EU or EEA, so ViDA does not apply. The QR invoice (QR-Rechnung) that became mandatory in October 2022 is a payment instrument - it replaced the ESR/ISR payment slip and added a machine-readable QR code to the payment reference - but does not mandate structured electronic invoice transmission between companies.

For a foreign group implementing Swiss federal B2G from a standing start:

**Peppol access point setup (2-4 weeks if using an existing Peppol provider).** Switzerland participates in the global Peppol network. Groups already on Peppol for EU mandates can add Swiss federal B2G as an incremental SMP registration using the Swiss UID. If not already on Peppol, full access point onboarding is required.

**Swiss UID configuration (1-2 weeks).** The UID (Unternehmens-Identifikationsnummer, format CHE-xxx.xxx.xxx) must be registered as the Peppol routing identifier. Standard ERP VAT ID fields typically store the CHE number, but the Peppol SMP registration step - which maps the UID to an access point endpoint - is separate and must be completed before the first live invoice.

**EFV portal registration (1-3 weeks if using the federal portal directly rather than Peppol).** The EFV portal is an alternative path for federal invoice submission. Credential setup and format validation testing are required before the first live invoice.

**Minimum:** 3-5 weeks with existing Peppol capability. **Stretched:** 8-12 weeks from zero Peppol presence.

---

## Operational Ownership

**Finance Systems** owns the choice of submission path: Peppol access point vs. EFV portal. If using Peppol, Finance Systems owns Peppol BIS 3.0 or ZUGFeRD output configuration for Swiss federal buyers and the UID-based routing setup. If using the EFV portal, Finance Systems owns portal credentials and invoice submission process.

**Tax/Compliance** owns two obligations. First: 10-year archiving under OR Art. 958f (Swiss Code of Obligations). All business records including electronic invoices must be kept for 10 years in a reproducible form. A PDF export of a ZUGFeRD invoice does not satisfy the structured data archiving obligation. Second: scope determination for cantonal B2G - whether any entities also supply cantonal or municipal authorities with separate e-invoice requirements.

**IT** owns Peppol access point registration, UID scheme mapping in the SMP, and ERP format configuration for Peppol BIS 3.0 or ZUGFeRD output. For EDIFACT-based legacy federal procurement relationships, IT owns EDIFACT mapping and VAN connectivity.

**AP Operations** must confirm that inbound invoices from Swiss federal buyers are processed and archived under the 10-year OR retention requirement.

**Where it breaks:** The cantonal coverage gap. The EVRE covers federal administration only. Cantonal and municipal B2G requirements are set independently by each canton. A group with Swiss procurement contracts across multiple cantons may be EVRE-compliant and non-compliant at the cantonal level simultaneously.

The configuration work items in each of these areas vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**UID as routing identifier.** The Swiss UID is a 9-digit number presented in format CHE-xxx.xxx.xxx (with dots as grouping separators). For VAT-registered entities, the MWST number is the same UID with a MWST suffix. For Peppol routing, the UID is registered under a specific scheme code in the SMP. Standard ERP customer/vendor master fields store the number as a tax ID - a dedicated Peppol routing field with the correct scheme code must be added and mapped.

**Format choice.** Federal buyers accept Peppol BIS 3.0, ZUGFeRD/Factur-X (EN 16931 hybrid), and EDIFACT. ZUGFeRD is the recommended default for groups without existing Peppol infrastructure: the buyer receives a PDF with an embedded EN 16931 XML. For groups already on Peppol for EU mandates, Peppol BIS 3.0 is the cleaner extension and eliminates the hybrid PDF dependency.

**QR invoice scope boundary.** The QR invoice (QR-Rechnung) is required on any invoice that includes a Swiss payment slip reference (QR-IBAN). It is a machine-readable payment reference format, not a structured invoice payload. ERPs generating Swiss invoices must produce a valid QR code on the payment reference section - but this is separate from any EVRE structured e-invoice requirement. Both may apply to the same invoice.

**eBill.** The SIX Group eBill platform enables consumers and SMEs to receive invoices digitally via their banking portal. It is not a B2G e-invoice platform and is not required for federal procurement compliance.

---

## Correction & Business Continuity

**Correction:** Standard credit note. No central clearance platform is involved. For Peppol-routed invoices, the credit note is transmitted through the Peppol network referencing the original invoice.

**Business continuity:** No central government clearance platform means no central downtime risk. Peppol AS4 handles transient access point outages. EFV portal downtime is an operational risk for groups using the portal path - a bilateral contingency with the federal buyer contact is recommended for high-volume relationships.

---

## The Friction Map

**QR invoice vs. structured e-invoice confusion.** Finance teams implementing QR invoice compliance may believe the QR-Rechnung satisfies the EVRE e-invoice requirement for federal procurement. It does not. The QR invoice is a payment reference format. The EVRE requires a structured electronic invoice in one of the accepted formats. These are two separate compliance obligations that are regularly conflated.

**Cantonal scope not assessed.** The EVRE covers federal administration. Swiss groups with cantonal or municipal procurement relationships may face separate cantonal e-invoice requirements. A readiness assessment that only addresses the EVRE may leave cantonal exposure unchecked.

**UID not configured for Peppol routing.** The Swiss UID is widely stored in ERP systems as a tax registration field, not as a Peppol routing identifier. The SMP registration step - which maps the UID to an access point endpoint - is commonly missed when a group extends an existing Peppol setup to Swiss entities.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.

---

## The "Ready" Definition

A Swiss federal B2G operation is ready when four conditions hold:

- All Swiss entities supplying federal administration have an active submission path: either a Peppol access point with UID-based SMP registration or active EFV portal credentials with confirmed test invoice acceptance
- ZUGFeRD or Peppol BIS 3.0 output is configured in the ERP billing engine, and QR invoice output is configured for the payment reference section of Swiss invoices
- 10-year archiving of original e-invoice XML files is active under a named owner, meeting OR Art. 958f requirements
- Cantonal B2G exposure has been assessed and any canton-specific requirements are mapped to entities with cantonal procurement contracts

The practical test: submit a ZUGFeRD or Peppol BIS 3.0 test invoice to a federal buyer's endpoint. If it is received and accepted, the submission path is working. If the QR code on the payment slip is valid, payment processing is working. These are two separate tests.
