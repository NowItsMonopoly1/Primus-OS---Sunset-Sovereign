# Primus OS Business Edition – Integration Guide

## Overview

This implementation provides a production-ready UI for the G2R Continuity Operating System. All components follow enterprise-grade design principles with institutional semantics, governance-first workflows, and serious, calm tonality.

## Architecture

### Technology Stack
- **React** + **TypeScript** for type-safe component development
- **Tailwind CSS** for utility-first styling with custom Primus OS theme
- **Next.js** or **Vite** compatible (routing not included)

### Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx                 # Federal Navy header with firm branding
│   │   └── PageContainer.tsx          # Responsive page wrapper
│   ├── ui/
│   │   ├── Button.tsx                 # Primary/Secondary/Ghost variants
│   │   └── Card.tsx                   # Surface container component
│   ├── ledger/
│   │   ├── ContinuityLedgerTable.tsx  # Main portfolio table
│   │   ├── ContinuityRow.tsx          # Individual relationship row
│   │   ├── ScoreBadge.tsx             # AAA-B continuity scoring
│   │   └── ContactCell.tsx            # Avatar + name + role display
│   └── panels/
│       └── DecisionRationalePanel.tsx # Right-side context panel
├── pages/
│   ├── onboarding/
│   │   ├── initialize.tsx             # Screen 1: Welcome
│   │   ├── source.tsx                 # Screen 2: CRM/LOS selection
│   │   ├── fields.tsx                 # Screen 3: Field mapping approval
│   │   ├── assessment.tsx             # Screen 4: Portfolio rating
│   │   └── governance.tsx             # Screen 5: Governance activation
│   └── ledger/
│       └── index.tsx                  # Main continuity ledger view
├── types/
│   └── ledger.ts                      # TypeScript interfaces
└── data/
    └── sampleLedgerData.ts            # Demo data for leadership presentation
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install react react-dom typescript
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/react @types/react-dom
```

### 2. Configure Tailwind

The included `tailwind.config.js` provides all Primus OS design tokens:
- Custom colors (Federal Navy, Trust Blue, Gold Alloy, Score gradients)
- Typography scale (h1, h2, body, label)
- Spacing values (page, card)
- Border radii (button, card)

Ensure your `globals.css` includes:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Font Setup

Install Inter font family:

```bash
npm install @fontsource/inter
```

In your app entry point:

```typescript
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
```

---

## Data Integration

### Wiring Real Data into the Continuity Ledger

The `ContinuityLedgerPage` component accepts props for real data:

```typescript
import { ContinuityLedgerPage } from './pages/ledger';
import { RelationshipRecord, DecisionRationale } from './types/ledger';

// Fetch from your API
const relationships: RelationshipRecord[] = await fetchRelationships();
const rationaleData: Record<string, DecisionRationale> = await fetchRationale();

<ContinuityLedgerPage
  relationships={relationships}
  rationaleData={rationaleData}
  onPrepareDraft={(id) => handlePrepareDraft(id)}
  onRecord={(id) => handleRecordInteraction(id)}
  onAddToBatch={(id) => handleAddToBatch(id)}
  onViewHistory={(id) => handleViewHistory(id)}
/>
```

### RelationshipRecord Interface

```typescript
interface RelationshipRecord {
  id: string;
  continuityScore: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';
  continuityScoreNumeric: number; // 0-100
  contact: {
    name: string;          // e.g., "J. Alvarez"
    initials: string;      // e.g., "JA"
    role: string;          // e.g., "Tier A Relationship"
    avatarUrl?: string;    // Optional profile image
  };
  status: 'Strong' | 'Stable' | 'Pending' | 'Review' | 'Inactive';
  valueOutlook: string;    // e.g., "Renewal pipeline – tier A book"
  lastInteraction: {
    type: 'Email' | 'Call' | 'Meeting' | 'Note';
    daysAgo: number;
  };
}
```

### DecisionRationale Interface

```typescript
interface DecisionRationale {
  relationshipId: string;
  recentActivity: string;        // Recent contact summary
  valueDrivers: string;          // Why this relationship matters
  riskConsiderations: string;    // Stability and risk assessment
  recommendedNextStep: string;   // Suggested action
  governanceNote: string;        // Compliance/approval context
}
```

---

## CRM/LOS Integration Points

### Salesforce Integration

Map Salesforce fields to Primus OS schema:

| Salesforce Field | Primus OS Field | Notes |
|------------------|-----------------|-------|
| `Contact.Name` | `contact.name` | Format as "FirstInitial. LastName" |
| `Contact.Title` | `contact.role` | Use segment/tier classification |
| `Account.Rating` | `continuityScore` | Map Hot/Warm/Cold to AAA-B scale |
| `Task.LastActivityDate` | `lastInteraction` | Calculate daysAgo from today |
| `Opportunity.CloseDate` | `valueOutlook` | Convert to forward-looking statement |

### Encompass LOS Integration

Map loan pipeline data:

```typescript
// Example transformation
const transformEncompassToRelationship = (loan: EncompassLoan): RelationshipRecord => ({
  id: loan.guid,
  continuityScore: calculateContinuityScore(loan.loanOfficerActivity),
  continuityScoreNumeric: loan.relationshipScore,
  contact: {
    name: formatName(loan.borrower.firstName, loan.borrower.lastName),
    initials: getInitials(loan.borrower.firstName, loan.borrower.lastName),
    role: loan.loanPurpose === 'Purchase' ? 'Purchase Client' : 'Refi Client',
  },
  status: mapLoanStatusToRelationshipStatus(loan.status),
  valueOutlook: generateValueOutlook(loan),
  lastInteraction: {
    type: loan.lastContactType,
    daysAgo: daysSince(loan.lastContactDate),
  },
});
```

### Spreadsheet Import

For Excel/Google Sheets sources, provide a CSV upload handler:

```typescript
import { parse } from 'csv-parse/sync';

const importSpreadsheet = async (file: File): Promise<RelationshipRecord[]> => {
  const text = await file.text();
  const rows = parse(text, { columns: true });

  return rows.map(row => ({
    id: generateId(),
    continuityScore: inferScoreFromActivity(row),
    continuityScoreNumeric: calculateNumericScore(row),
    contact: {
      name: row['Full Name'],
      initials: getInitials(row['Full Name']),
      role: row['Segment'] || 'Unclassified',
    },
    status: row['Status'] || 'Review',
    valueOutlook: row['Notes'] || 'Pending classification',
    lastInteraction: {
      type: 'Note',
      daysAgo: row['Last Contact'] ? daysSince(new Date(row['Last Contact'])) : 999,
    },
  }));
};
```

---

## Continuity Score Calculation

The scoring algorithm should consider:

1. **Recency of Contact** (40%)
   - Last 30 days: +40 points
   - 31-90 days: +25 points
   - 91-180 days: +10 points
   - 180+ days: 0 points

2. **Frequency of Interaction** (30%)
   - Monthly+ cadence: +30 points
   - Quarterly cadence: +20 points
   - Annual+ cadence: +10 points

3. **Economic Value Signals** (30%)
   - Active pipeline: +30 points
   - Referral history: +20 points
   - Multi-year relationship: +15 points

Example implementation:

```typescript
const calculateContinuityScore = (record: {
  lastContactDays: number;
  interactionCount12Mo: number;
  hasActivePipeline: boolean;
  referralCount: number;
  relationshipYears: number;
}): { score: ContinuityScore; numeric: number } => {
  let points = 0;

  // Recency
  if (record.lastContactDays <= 30) points += 40;
  else if (record.lastContactDays <= 90) points += 25;
  else if (record.lastContactDays <= 180) points += 10;

  // Frequency
  if (record.interactionCount12Mo >= 12) points += 30;
  else if (record.interactionCount12Mo >= 4) points += 20;
  else if (record.interactionCount12Mo >= 1) points += 10;

  // Value signals
  if (record.hasActivePipeline) points += 30;
  if (record.referralCount >= 3) points += 20;
  else if (record.referralCount >= 1) points += 10;
  if (record.relationshipYears >= 3) points += 15;

  // Convert to letter grade
  const score: ContinuityScore =
    points >= 90 ? 'AAA' :
    points >= 80 ? 'AA' :
    points >= 70 ? 'A' :
    points >= 60 ? 'BBB' :
    points >= 50 ? 'BB' : 'B';

  return { score, numeric: points };
};
```

---

## Governance Workflows

### Approval Batch System

When users click "Add to Approval Batch", implement a staging system:

```typescript
interface ApprovalBatch {
  id: string;
  createdBy: string;
  createdAt: Date;
  status: 'Draft' | 'Pending_Review' | 'Approved' | 'Rejected';
  relationships: string[]; // IDs
  outreachType: 'Email' | 'Call_Script' | 'Meeting_Invite';
  reviewedBy?: string;
  reviewedAt?: Date;
  comments?: string;
}

const addToApprovalBatch = async (
  relationshipId: string,
  userId: string
): Promise<void> => {
  // Create or append to existing draft batch
  const batch = await getOrCreateDraftBatch(userId);
  batch.relationships.push(relationshipId);
  await saveBatch(batch);

  // Notify user
  showNotification('Added to Approval Batch. Submit when ready for firm review.');
};
```

### Governance Mode Toggle

The toggle is admin-locked by default. To enable admin control:

```typescript
import { TopBar } from './components/layout/TopBar';

<TopBar
  showGovernanceMode
  governanceModeActive={isGovernanceActive}
  // Only show toggle for admin users
  allowToggle={user.role === 'Admin'}
  onToggle={(newState) => updateGovernanceMode(newState)}
/>
```

---

## Decision Rationale Panel Control

The panel updates automatically when a row is selected. To programmatically control it:

```typescript
const [selectedId, setSelectedId] = useState<string | null>(null);

// Select a specific relationship
setSelectedId('rel-001');

// Clear selection
setSelectedId(null);

// The panel will show rationale for selectedId if available
```

To fetch rationale dynamically:

```typescript
const [rationale, setRationale] = useState<DecisionRationale | null>(null);

const handleSelectRecord = async (id: string) => {
  setSelectedId(id);

  // Fetch from API
  const data = await fetch(`/api/rationale/${id}`).then(r => r.json());
  setRationale(data);
};
```

---

## Keyboard Navigation

Implement arrow key navigation for power users:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!relationships.length) return;

    const currentIndex = selectedRecordId
      ? relationships.findIndex(r => r.id === selectedRecordId)
      : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(currentIndex + 1, relationships.length - 1);
      setSelectedRecordId(relationships[nextIndex].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(currentIndex - 1, 0);
      setSelectedRecordId(relationships[prevIndex].id);
    } else if (e.key === 'Enter' && selectedRecordId) {
      e.preventDefault();
      onPrepareDraft(selectedRecordId);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [relationships, selectedRecordId]);
```

---

## Routing Setup

### Next.js App Router

```typescript
// app/page.tsx
import { InitializePage } from '@/pages/onboarding/initialize';

export default function Home() {
  return <InitializePage onBegin={() => router.push('/onboarding/source')} />;
}

// app/ledger/page.tsx
import { ContinuityLedgerPage } from '@/pages/ledger';

export default function Ledger() {
  return <ContinuityLedgerPage />;
}
```

### Vite + React Router

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<InitializePage onBegin={() => navigate('/onboarding/source')} />} />
    <Route path="/onboarding/source" element={<SourceConfirmationPage onContinue={() => navigate('/onboarding/fields')} />} />
    <Route path="/onboarding/fields" element={<LedgerReviewPage onApprove={() => navigate('/onboarding/assessment')} />} />
    <Route path="/onboarding/assessment" element={<InitialAssessmentPage onLoadLedger={() => navigate('/onboarding/governance')} />} />
    <Route path="/onboarding/governance" element={<GovernanceModePage onProceed={() => navigate('/ledger')} />} />
    <Route path="/ledger" element={<ContinuityLedgerPage />} />
  </Routes>
</BrowserRouter>
```

---

## Testing Recommendations

### Component Testing (Jest + React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ContinuityLedgerTable } from './ContinuityLedgerTable';

test('selects relationship on row click', () => {
  const mockSelect = jest.fn();

  render(
    <ContinuityLedgerTable
      records={sampleRelationships}
      selectedRecordId={null}
      onSelectRecord={mockSelect}
      onPrepare={jest.fn()}
      onRecord={jest.fn()}
      onAddToBatch={jest.fn()}
    />
  );

  const row = screen.getByText('J. Alvarez').closest('tr');
  fireEvent.click(row);

  expect(mockSelect).toHaveBeenCalledWith('rel-001');
});
```

### E2E Testing (Playwright)

```typescript
test('complete onboarding flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Begin Continuity Initialization');

  await page.click('text=CRM Platform');
  await page.click('text=Continue');

  await page.click('text=Approve Field Structure');
  await page.click('text=Load Continuity Ledger');
  await page.click('text=Proceed to Portfolio');

  await expect(page.locator('text=Portfolio Overview')).toBeVisible();
});
```

---

## Design System Compliance Checklist

- [ ] All colors use Tailwind custom tokens (no hardcoded hex)
- [ ] Typography uses defined scale (h1, h2, body, label)
- [ ] No startup language ("send", "campaign", "optimize")
- [ ] All CTAs use institutional verbs ("Initialize", "Approve", "Record")
- [ ] Governance Mode visible on all post-onboarding screens
- [ ] No red states except for true critical incidents
- [ ] No countdown timers or urgency indicators
- [ ] All errors use cooperative language ("Let's confirm...")
- [ ] Tooltips provide rationale, not just data
- [ ] No emojis or playful iconography

---

## Performance Optimization

### Virtual Scrolling for Large Ledgers

For portfolios with 1000+ relationships, implement virtual scrolling:

```bash
npm install react-virtual
```

```typescript
import { useVirtual } from 'react-virtual';

const { virtualItems, totalSize, parentRef } = useVirtual({
  size: relationships.length,
  parentRef: tableRef,
  estimateSize: () => 48, // row height
});
```

### Lazy Loading Rationale

Don't fetch all rationale upfront:

```typescript
const [rationaleCache, setRationaleCache] = useState<Record<string, DecisionRationale>>({});

const handleSelect = async (id: string) => {
  setSelectedRecordId(id);

  if (!rationaleCache[id]) {
    const data = await fetchRationale(id);
    setRationaleCache(prev => ({ ...prev, [id]: data }));
  }
};
```

---

## Deployment Notes

### Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=https://api.primusos.g2r.com
NEXT_PUBLIC_FIRM_NAME=G2R Continuity Partners
NEXT_PUBLIC_GOVERNANCE_DEFAULT=true
```

### Build Command

```bash
npm run build
```

### Production Considerations

- Enable Tailwind purging for minimal CSS bundle
- Use Next.js Image component for avatar optimization
- Implement CSP headers to prevent XSS
- Set up error tracking (Sentry, LogRocket)
- Configure RBAC for admin-only features

---

## Support & Extensibility

### Adding New Relationship Statuses

Edit `src/types/ledger.ts`:

```typescript
export type RelationshipStatus =
  | 'Strong'
  | 'Stable'
  | 'Pending'
  | 'Review'
  | 'Inactive'
  | 'Archive'; // New status
```

Update UI in `ContinuityRow.tsx` to handle new status.

### Custom Continuity Score Tiers

To add intermediate grades (e.g., A+, A-):

```typescript
export type ContinuityScore = 'AAA' | 'AA+' | 'AA' | 'AA-' | 'A+' | 'A' | 'A-' | ...;
```

Update `scoreColors` mapping in `ScoreBadge.tsx`.

---

## Questions?

This implementation is production-ready for leadership demonstration. For integration questions or custom requirements, consult your technical lead or reference the inline TypeScript documentation.

**Remember:** This is a Continuity Ledger, not a CRM. Governance over speed. Institutional semantics always.
