# 🔍 OfferLens — Privacy-First Job Offer Reality Checker

> **Built for a real friend actively navigating job offers.**  
> An evidence-based job offer investigation assistant that extracts structured facts, detects cross-document contradictions, flags concerning signals, audits missing information, and drafts tailored clarification scripts — all while keeping candidate personal data private and local.

---

## 🛡️ Core Philosophy: Calibrated & Objective Analysis

Job seekers are frequently vulnerable to high-pressure tactics, verbal "bait-and-switch" promises, and confusing legal agreements. Traditional tools either act like generic chat summaries or jump to aggressive conclusions.

OfferLens adheres strictly to **calibrated, objective, evidence-based investigation**:

- ❌ **Never declares:** *"This is definitely a scam."*
- ✅ **Instead uses calibrated language:**
  - *"Potential concern detected."*
  - *"Information is inconsistent."*
  - *"Additional verification recommended."*
  - *"The document contains a request for payment."*
  - *"Uncertainty level: Moderate / High"*
- ⚖️ **Core Rule:** **"The final decision always belongs to the user."**

---

## 🚀 Key Features

### 1. Multi-Document Investigation Dossier
Job seekers receive offer details across fragmented channels. OfferLens aggregates and cross-references:
- **Offer Letters & Employment Agreements** (PDF, scans, text)
- **Recruiter Email Threads** (outreach, compensation negotiations)
- **Direct Messages** (LinkedIn, Slack, WhatsApp, Telegram, SMS)
- **Salary Breakup Sheets** (compensation tables, bonus annexures)
- **Job Descriptions** (stated requirements vs actual duties)
- **Interview Guides** (screening process protocols)
- **Recruiter Audio / Voice Notes** (voicemail transcripts and audio recordings)
- **Candidate Personal Notes** (verbal promises made by hiring managers)

### 2. Client-Side Privacy Shield & PII Sanitizer
- **Local-First by Design:** All fact extraction, regex parsing, and contradiction detection run locally in the browser and in-process.
- **Automatic PII Redaction:** Automatically detects and masks:
  - Candidate Full Names (`[CANDIDATE_NAME_REDACTED]`)
  - Personal Email Addresses (`[PERSONAL_EMAIL_REDACTED]`)
  - Phone Numbers (`[PHONE_REDACTED]`)
  - Social Security Numbers & Tax IDs (`[SSN_REDACTED]`)
  - Bank Account & Direct Deposit Numbers (`[BANK_ACCOUNT_REDACTED]`)
  - Physical Street Addresses (`[ADDRESS_REDACTED]`)
  - Custom User-Defined Words (e.g. current employer name, confidential project)
- **Interactive Redaction Preview:** Toggle at any time between **Sanitized View** and **Original View** with full PII audit logs.
- **Zero Server Retention:** Uploaded files and texts are processed in memory and never saved to a database.

### 3. Cross-Document Contradiction & Delta Engine
Detects substantive divergences between recruiter claims and written agreements:
- **Compensation Variance:** Flags when recruiter promised $165k base, but contract states $132k base + $33k discretionary bonus.
- **Work Arrangement Contradiction:** Flags when recruiter promised 100% remote, but contract mandates 4 days/week onsite in Austin, TX.
- **PTO Divergence:** Flags when "Unlimited PTO" email pitch conflicts with contract's 14-day capped accrual.
- **Equipment Provision Gap:** Flags when recruiter promised a MacBook Pro and $1,500 stipend, but contract requires candidate to purchase hardware from a third-party vendor.
- **Probationary Terms:** Flags surprise 90-day probationary windows that reduce job security or delay healthcare benefits.

### 4. Potentially Concerning Signals (Calibrated Risk Detector)
- **Advance Payment / Check Cashing:** Mentions of depositing checks, wiring funds, or reimbursing third-party equipment suppliers.
- **Communication Domain Anomalies:** Free email providers (`@gmail.com`) purporting to be enterprise recruiters, or lookalike domain extensions (`.site`, `.cc`, `-careers.com`).
- **Chat-Only Interview Processes:** Interviews conducted strictly via Telegram, WhatsApp, or Signal text chat without live video conferencing.
- **Draconian Covenants:** Non-competes spanning 18+ months or nationwide scope; IP assignment capturing personal projects conceived on off-hours.
- **Artificial Urgency:** Exploding 24- to 48-hour signature deadlines intended to prevent candidate due diligence.

### 5. Recruiter Claim vs Offer Reality Matrix
A side-by-side comparison grid evaluating alignment across 8 core dimensions:
1. Base Salary
2. Work Location & Remote Status
3. Bonus & Variable Incentives
4. Equity Grant & Vesting Schedule
5. Paid Time Off (PTO)
6. Workstation & IT Provisioning
7. Health Insurance Effective Date
8. Decision Window & Deadlines

### 6. Missing Information & Blind-Spot Audit
Identifies critical terms omitted from the formal agreement:
- Missing stock option strike price / 409A valuation
- Missing total fully diluted share count (cannot determine % ownership)
- Unstated health insurance commencement date (Day 1 vs 90-day wait)
- Absence of objective bonus performance KPIs
- Missing Prior Inventions Disclosure Exhibit (Exhibit A)

### 7. Recruiter Inquiries & Negotiation Playbook
Generates calibrated, copy-paste ready scripts for every discrepancy:
- **Polite & Enthusiastic:** Friendly, collaborative tone for positive inquiries.
- **Direct & Professional:** Clear, standard business tone for quick alignment.
- **Firm Due Diligence:** Contractually precise phrasing for legal, IP, or compensation gaps.

### 8. Verbatim Evidence Inspector
Clicking any finding opens the **Evidence Drawer**, showing the exact source document, the verbatim quote snippet, surrounding context lines, and why it was flagged.

### 9. Printable Executive Export
One-click export to printable PDF, formatted Markdown, or JSON dossier for sharing with a mentor, spouse, or attorney.

---

## 🧪 Pre-Loaded Realistic Test Cases (1-Click Test)

OfferLens comes pre-packaged with 4 authentic scenarios ready to inspect immediately:

1. **The Remote Bait-and-Switch (Austin Cloud Solutions LLC)**
   - *Recruiter Pitch:* $165,000 base salary, 100% permanent remote anywhere in US, unlimited PTO, Apple MacBook Pro delivered.
   - *Formal Contract:* $132,000 base + $33,000 discretionary bonus, mandatory 4 days/week in-office in Austin, TX, 14 days PTO, 18-month non-compete, 48-hour deadline.
   - *Score:* 46% Alignment (High Contradictions).

2. **The Equipment Check Red Flag (Global Apex Systems Inc)**
   - *Signals:* Lookalike domain (`@global-apex-systems.site`), interview conducted purely on Telegram text chat, directive to deposit an advance $3,850 cashier's check and wire funds to a hardware vendor.
   - *Calibrated Language:* *"The document contains a request for payment. Additional verification recommended."*

3. **The Opaque Startup Equity Trap (NovaScale Technologies Inc)**
   - *Dilemma:* 50,000 stock options promised with hyped valuation claims, but completely missing strike price, capitalization pool size, and 409A valuation. Draconian IP assignment capturing off-hours personal code.

4. **The Clean & Transparent Tech Offer (Nexus Data Dynamics Inc)**
   - *Legitimate Offer:* 96% Alignment. Base salary of $160,000 matches, 12,000 RSUs with clear 4-year schedule and 1-year cliff, Day 1 healthcare benefits, 20 days PTO.

---

## 🛠️ Architecture & Tech Stack

```
OfferLens/
├── server/                      # Express + TypeScript API Server
│   ├── src/
│   │   ├── types.ts             # Shared data schemas
│   │   ├── sanitizer.ts         # Local PII Redaction Engine
│   │   ├── deterministicAnalyzer.ts # Deterministic Reality Check Engine
│   │   ├── geminiAnalyzer.ts    # Optional Gemini 3.8 Flash AI Engine
│   │   ├── mockData.ts          # 4 authentic sample dossiers
│   │   └── index.ts             # Express REST endpoints & static server
│   └── package.json
│
├── client/                      # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/          # Modular UI components
│   │   │   ├── Header.tsx
│   │   │   ├── PrivacyShieldModal.tsx
│   │   │   ├── SampleDossierSelector.tsx
│   │   │   ├── DocumentUploader.tsx
│   │   │   ├── DocumentShelf.tsx
│   │   │   ├── DocumentViewerModal.tsx
│   │   │   ├── ExecutiveScorecard.tsx
│   │   │   ├── ContradictionsTab.tsx
│   │   │   ├── ConcerningSignalsTab.tsx
│   │   │   ├── ClaimVsOfferMatrixTab.tsx
│   │   │   ├── MissingInfoTab.tsx
│   │   │   ├── RecruiterQuestionsTab.tsx
│   │   │   ├── StructuredFactsTab.tsx
│   │   │   ├── EvidenceDrawer.tsx
│   │   │   └── ExportReportModal.tsx
│   │   ├── App.tsx              # Main dossier workspace controller
│   │   ├── types.ts
│   │   └── index.css            # Custom theme & highlights
│   └── package.json
└── package.json                 # Monorepo root scripts
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js >= 18 (Node 24+ supported)
- npm >= 9

### Running OfferLens

1. **Start the Unified Server (Frontend + Backend on Port 3000):**
   ```bash
   cd server
   npm start
   ```
   Open your browser to: **`http://localhost:3000`**

2. **Or run with Vite Live Hot-Reloading in Development:**
   - In terminal 1 (Server):
     ```bash
     cd server
     npm run dev
     ```
   - In terminal 2 (Client):
     ```bash
     cd client
     npm run dev
     ```
   Open your browser to: **`http://localhost:5173`**

---

## 🔒 Privacy & Gemini AI Configuration

- **Offline Local Mode (Default):** OfferLens operates 100% offline without any API keys.
- **Gemini 3.8 Flash AI Mode (Optional):**
  - Click the **API Key icon (🔑)** in the top navigation bar.
  - Enter your Google Gemini API key.
  - The key is saved strictly in your browser's `localStorage` and is never persisted on the server.
  - Only **pre-sanitized text** (with names, addresses, phones, and SSNs masked) is ever evaluated by Gemini.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | System health & Gemini availability check |
| `/api/samples` | GET | Lists available pre-loaded realistic sample dossiers |
| `/api/samples/:id` | GET | Retrieves full sample dossier with sanitized documents |
| `/api/sanitize` | POST | Masks candidate PII from raw text using local patterns |
| `/api/upload` | POST | Ingests PDF, image, audio, or text documents and returns sanitized document object |
| `/api/analyze` | POST | Runs comprehensive reality check investigation report |
| `/api/generate-script` | POST | Customizes recruiter inquiry script based on selected tone |

---

## ⚖️ Legal & Ethical Notice

OfferLens is designed as an informational reality checker and decision-support assistant for candidates. It is not an attorney and does not provide formal legal advice. Employment decisions involve subjective career, financial, and personal tradeoffs. **The final decision always belongs to the user.**
