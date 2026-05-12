---
country: Slovenia
code: SI
flag: "🇸🇮"

mandate_type: interoperability
vida_alignment: DRR-compliant
future_direction: "ZIERDED (Uradni list RS, st. 85/2025, November 6, 2025) establishes mandatory B2B e-invoicing from January 1, 2028. B2G via UJP (Public Payments Administration) is already live. UJP is both the B2G platform and the Slovenian Peppol Authority. e-SLOG 2.0 is the national format (EN 16931 CIUS). PDFs are not accepted for B2G."

b2b: announced
b2g: mandatory
b2c_scope: none
status: live
phase_in: false
phase_in_scope: null

key_deadlines:
  - date: 2028-01-01
    description: "B2B e-invoicing mandatory (ZIERDED - Uradni list RS, st. 85/2025)"

formats: [e-SLOG-2.0, UBL-2.1, Peppol-BIS-3.0]
cius: "e-SLOG 2.0 (Slovenian national format/CIUS on EN 16931)"
platform: UJP
platform_model: interoperability
transport_protocol: Peppol-AS4
b2g_signature: none
b2b_signature: none

inbound_mandate_date: 2028-01-01
outbound_mandate_date: 2028-01-01
outbound_mandate_date_phase2: null
mandate_hardness: "B2G hard-both (live); B2B announced January 2028 (ZIERDED enacted)"

master_data_id: "Tax ID (davcna stevilka): SI + 8 digits. Registration Number (maticna stevilka): 7 digits. Peppol: scheme 0088 (GLN) or 9923 (SI VAT number)."
mandatory_pdf_bundle: none
foreign_resident_scope: false
archiving_years: 10
penalty_max: "EUR 1,000-3,000 for legal entities; EUR 500-1,500 for sole proprietors; EUR 100-1,000 for responsible persons (ZIERDED Art. 21)"
reporting_window: null
correction_mechanism: credit_note

document_lifecycle_states:
  - SENT
  - DELIVERED
  - ACCEPTED
  - REJECTED

has_sandbox: false
last_verified: null
mandate_phase: active-rollout
mandate_version: 1
confidence_summary: amber
unresolved_high: 1
unresolved_amber: 2
---

## Preparation Timeline

Slovenia's B2G e-invoicing has been live for several years via UJP (Uprava Republike Slovenije za javna placila - Public Payments Administration). UJP is the single entry and exit point for all B2G and G2G invoices and is also the Slovenian Peppol Authority. Formats accepted: e-SLOG 2.0 (national CIUS on EN 16931), UBL 2.1, and Peppol BIS 3.0. PDFs are not accepted by the UJP platform.

ZIERDED (Zakon o izdajanju elektronskih racunov pri drzavnih, upravnih in druzbenih dejavnostih - Law on Electronic Invoice Issuance in State, Administrative and Social Activities, Uradni list RS, st. 85/2025, November 6, 2025, PISRS code ZAKO9033) establishes mandatory B2B e-invoicing from January 1, 2028. The law is enacted - this is not a policy target.

ZRFR (Zveza racunovodij, financnikov in revizorjev) is the primary professional body. e-SLOG 2.0 documentation is maintained by ROSE Slovenia (roseslovenia.eu) and epos.si.

For groups with Slovenian public sector customers (B2G, currently live):

**UJP platform registration (2-4 weeks).** Suppliers must register with UJP to receive a UJP participant credential. The platform routes invoices in e-SLOG 2.0, UBL 2.1, or Peppol BIS 3.0 format. Registration requires the Slovenian Tax ID (davcna stevilka, SI + 8 digits).

**e-SLOG 2.0 output configuration (4-6 weeks).** e-SLOG 2.0 extends EN 16931 with Slovenian-specific fields. Standard ERP UBL 2.1 output must be validated against the e-SLOG 2.0 schema. The ROSE Slovenia specification defines the mandatory extensions.

**B2B mandate monitoring (now to January 2028).** ZIERDED is enacted. Groups should begin B2B readiness planning now: the January 2028 deadline applies to all established entities. 20 months from May 2026 to implementation is a tight window for multi-entity groups.

**Minimum:** 4-8 weeks for B2G with existing e-SLOG capability. **Stretched:** 12-20 weeks for B2B implementation from zero starting January 2027.

---

## Operational Ownership

**Finance Systems** owns e-SLOG 2.0 / Peppol BIS 3.0 format output, UJP platform transmission, and the B2B Peppol routing configuration for January 2028.

**Tax/Compliance** owns scope determination for both B2G (current) and B2B (January 2028), VAT reporting via e-Davki (ZDDV-1 amendments July 2025), and archiving: 10 years general; 20 years for real estate transactions (ZDDV-1 Art. 86).

**Master Data/IT** owns Tax ID (davcna stevilka, SI + 8 digits) and Registration Number (maticna stevilka, 7 digits) for all Slovenian customers and vendors. Peppol scheme 0088 (GLN) or 9923 (SI VAT) for participant IDs.

**IT** owns UJP platform integration, Peppol access point registration (UJP as Slovenian Peppol Authority), and e-SLOG 2.0 schema validation.

**Where it breaks:** PDF submissions. UJP rejects PDFs. Suppliers accustomed to PDF-to-public-sector workflows in other countries attempt PDF submission and receive rejection with no equivalent fallback accepted.

The configuration work items in each cluster vary by ERP system, entity structure, and current baseline. That specificity is what the Readiness Sprint delivers.

---

## Data & Infrastructure

**e-SLOG 2.0.** Slovenia's national e-invoice format is maintained by ROSE Slovenia (roseslovenia.eu) and epos.si. e-SLOG 2.0 is an EN 16931 CIUS with Slovenian-specific extensions. Both UBL 2.1 and CII syntax are accepted at the EN 16931 level, but the SLOG extensions must be present in the output.

**UJP as single platform.** All B2G invoices route through UJP. There is no alternative platform. The UJP Peppol participant directory includes all Slovenian public administration buyers. Bilateral direct connections are not accepted outside the UJP platform.

**Two Slovenian identifiers.** The Tax ID (davcna stevilka, SI + 8 digits) and the Registration Number (maticna stevilka, 7 digits) serve different functions. Peppol routing uses scheme 9923 (SI VAT) or 0088 (GLN). ERP master data must store both identifiers separately.

**Archiving split.** 10 years for standard records; 20 years for real estate transactions (ZDDV-1 Art. 86). Both periods apply to the original electronic XML record.

---

## The Friction Map

**PDF rejection at UJP.** Slovenia's public administration platform does not accept PDFs. Suppliers with PDF-based B2G processes elsewhere discover at submission that the UJP platform requires structured format. There is no PDF fallback for Slovenian B2G.

**B2B January 2028 readiness gap.** ZIERDED is enacted. The B2B obligation applies to all established entities from January 1, 2028. Groups with Slovenian subsidiaries that begin planning after mid-2027 face compressed timelines across a multi-entity scope.

**e-SLOG 2.0 extensions not in standard UBL.** EN 16931 UBL 2.1 output that passes validation for other EU countries may not pass Slovenian e-SLOG 2.0 validation. The ROSE Slovenia CIUS extensions are mandatory and must be explicitly mapped in the ERP output configuration.

Every group has a version of at least one of these. Finding which ones, and in which subsidiaries, is how a Readiness Sprint starts.
