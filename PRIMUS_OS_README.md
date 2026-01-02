# Primus OS Business Edition – G2R Continuity Operating System

**Enterprise-grade relationship continuity platform for mortgage and real estate leadership.**

---

## Overview

This is a serious, institutional-grade UI built for revenue portfolio management. Not a CRM. Not a trading dashboard. A **Continuity Ledger** with **Governed Onboarding**.

### Design Philosophy

- **Governance over speed** – No instant-send. Every outreach flows through approval.
- **Continuity over hustle** – Relationships are equity. We protect that equity.
- **Institutional semantics** – No startup language. No "campaigns". No "optimize".
- **Leadership-facing** – Built for partners who sign 7-figure checks.

### Visual Language

**Inspired by:** Microsoft Office · Salesforce · DocuSign · Bloomberg Terminal

**Rejected influences:** Slack · Notion · Linear · Modern SaaS dashboards

---

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Onboarding and ledger screens
├── types/            # TypeScript interfaces
├── data/             # Sample data for demo
└── tailwind.config.js # Primus OS design tokens
```

### Demo Routes

1. **Onboarding Flow** (5 screens):
   - `/` – Initialize Firm Ledger
   - `/onboarding/source` – Confirm Ledger Source
   - `/onboarding/fields` – Approve Relationship Fields
   - `/onboarding/assessment` – Initial Continuity Scan
   - `/onboarding/governance` – Governance Mode Activation

2. **Main Application**:
   - `/ledger` – Continuity Ledger (Portfolio View)

---

## Core Features

### 1. Continuity Ledger

Two-column layout:
- **Left (70%):** Portfolio table with Continuity Scores, Contact details, Status, Value Outlook, Last Interaction, and Actions
- **Right (30%):** Decision Rationale panel showing why each relationship matters

**No instant-send.** All actions route through "Prepare → Approval Batch → Approve" workflow.

### 2. Continuity Scoring (AAA–B)

Letter grades based on:
- Recency of contact (40%)
- Frequency of interaction (30%)
- Economic value signals (30%)

Numeric scores (0-100) map to grades:
- **AAA:** 90-100 (High stability)
- **AA:** 80-89 (Strong relationship)
- **A:** 70-79 (Stable)
- **BBB:** 60-69 (Moderate)
- **BB:** 50-59 (Limited activity)
- **B:** 0-49 (Dormant)

### 3. Governance Mode

Always visible. Always on (by default). Admin-locked toggle ensures:
- Consistent messaging across firm
- Compliance review before outreach
- Protection of relationship equity

### 4. Decision Rationale

Context for every relationship:
- Recent Activity
- Value Drivers
- Risk Considerations
- Recommended Next Step
- Governance Note

Leadership sees **why** before **what**.

---

## Design Tokens

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Federal Navy | `#1C2A4A` | Top bar, headers |
| Trust Blue | `#4263EB` | Primary actions, links |
| Gold Alloy | `#DAC36B` | Accent (sparingly) |
| Office Slate | `#F3F4F6` | Page background |
| Carbon Black | `#0B0C0D` | Primary text |

### Typography

- **Font:** Inter (400, 500, 600 weights)
- **h1:** 24px/600
- **h2:** 18px/600
- **body:** 14px/400
- **label:** 12px/500

### Spacing

- **Page padding:** 24px
- **Card padding:** 20-24px
- **Table row height:** 48px
- **Border radius:** 4px (buttons) / 6px (cards)

---

## Integration Guide

### Wiring Real Data

```typescript
import { ContinuityLedgerPage } from './pages/ledger';

const relationships = await fetchFromCRM(); // Your API call
const rationaleData = await fetchRationale();

<ContinuityLedgerPage
  relationships={relationships}
  rationaleData={rationaleData}
  onPrepareDraft={(id) => handlePrepare(id)}
  onRecord={(id) => handleRecord(id)}
  onAddToBatch={(id) => handleBatch(id)}
/>
```

### CRM/LOS Mappings

**Salesforce:**
- `Contact.Name` → `contact.name`
- `Account.Rating` → `continuityScore`
- `Task.LastActivityDate` → `lastInteraction`

**Encompass:**
- `Loan.Borrower.Name` → `contact.name`
- `Loan.Status` → `status`
- `Loan.LastContactDate` → `lastInteraction`

**Spreadsheets:**
- Upload CSV/Excel and map columns to schema

See [PRIMUS_OS_INTEGRATION_GUIDE.md](./PRIMUS_OS_INTEGRATION_GUIDE.md) for full details.

---

## Semantic Rules (CRITICAL)

### ✅ Approved Language

- Initialize, Approve, Record, Archive
- Load, Govern, Prepare
- Continuity Ledger, Portfolio, Relationship Equity
- Outreach Batch, Value Outlook

### ❌ Prohibited Language

- Upload, Run, Execute, Send Now
- Campaign, Optimize, Scale, Growth-hack
- Leads, Contacts, Prospects
- Blast, Push, Fire, Launch

**Why:** This is institutional software. Language must reflect governance and continuity, not urgency or hustle.

---

## UX Laws

1. **No instant-send.** Everything flows through approval.
2. **No urgency indicators.** No countdown timers. No red states (except true incidents).
3. **Rationale before action.** Users see context before every decision.
4. **Portfolio framing.** Relationships are assets, not leads.
5. **Cooperative error messaging.** "Let's confirm one detail..." not "Error: Invalid input."

---

## Sample Data

Demo includes 4 anonymized relationships:

| Score | Contact | Status | Value Outlook |
|-------|---------|--------|---------------|
| AAA | J. Alvarez | Strong | Renewal pipeline – tier A book |
| AA | M. Lewis | Stable | Refi-eligible – rate review |
| BBB | R. Khan | Review | Dormant – reactivation potential |
| BB | S. Thompson | Pending | Aging portfolio – discuss succession |

Located in `src/data/sampleLedgerData.ts`.

---

## Testing

### Component Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Design System Compliance

Run the checklist in [PRIMUS_OS_INTEGRATION_GUIDE.md](./PRIMUS_OS_INTEGRATION_GUIDE.md) before production deployment.

---

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=https://api.primusos.g2r.com
NEXT_PUBLIC_FIRM_NAME=Your Firm Name
NEXT_PUBLIC_GOVERNANCE_DEFAULT=true
```

---

## Tech Stack

- **React 18+** with TypeScript
- **Tailwind CSS** with custom Primus OS theme
- **Next.js** or **Vite** (routing not included, your choice)
- **Inter font** (Google Fonts or self-hosted)

---

## File Reference

### Key Components

- [TopBar.tsx](src/components/layout/TopBar.tsx) – Federal Navy header with firm branding
- [ContinuityLedgerTable.tsx](src/components/ledger/ContinuityLedgerTable.tsx) – Main portfolio table
- [ScoreBadge.tsx](src/components/ledger/ScoreBadge.tsx) – AAA-B continuity scoring with tooltips
- [DecisionRationalePanel.tsx](src/components/panels/DecisionRationalePanel.tsx) – Context panel
- [ledger.ts](src/types/ledger.ts) – TypeScript interfaces

### Onboarding Screens

- [initialize.tsx](src/pages/onboarding/initialize.tsx) – Screen 1
- [source.tsx](src/pages/onboarding/source.tsx) – Screen 2
- [fields.tsx](src/pages/onboarding/fields.tsx) – Screen 3
- [assessment.tsx](src/pages/onboarding/assessment.tsx) – Screen 4
- [governance.tsx](src/pages/onboarding/governance.tsx) – Screen 5

### Main Application

- [index.tsx](src/pages/ledger/index.tsx) – Continuity Ledger screen

---

## Documentation

- **Integration Guide:** [PRIMUS_OS_INTEGRATION_GUIDE.md](./PRIMUS_OS_INTEGRATION_GUIDE.md)
- **Type Definitions:** [src/types/ledger.ts](src/types/ledger.ts)
- **Sample Data:** [src/data/sampleLedgerData.ts](src/data/sampleLedgerData.ts)

---

## Design Checklist

Before showing to leadership:

- [ ] All language is institutional (no startup speak)
- [ ] Governance Mode visible on all screens
- [ ] No red states except critical incidents
- [ ] All tooltips provide rationale, not just data
- [ ] No emojis or playful icons
- [ ] Top bar shows Federal Navy with firm name
- [ ] All buttons use "Prepare", "Approve", "Record" (never "Send")
- [ ] Continuity Scores use letter grades (AAA-B)
- [ ] Decision Rationale panel shows context before action

---

## Philosophy

This UI is not optimized for speed. It's optimized for **governance**.

This UI is not designed to scale outreach. It's designed to **protect relationship equity**.

This UI does not feel modern or playful. It feels **institutional and serious**.

Because that's what leadership needs when they're managing a 9-figure revenue portfolio.

---

## Support

For integration questions, see [PRIMUS_OS_INTEGRATION_GUIDE.md](./PRIMUS_OS_INTEGRATION_GUIDE.md).

For design system questions, reference `tailwind.config.js` and the component library.

**Remember:** Governance over speed. Continuity over hustle. Institutional semantics always.
