# Primus OS Business Edition - Full Stack Integration Guide

**Complete system: Backend brain + Frontend presentation**

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Onboarding  │  │   Ledger     │  │  Governance  │    │
│  │   Screens    │  │   Screen     │  │    Batch     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                    JSON over HTTP
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    BACKEND (Node.js/Express)                │
│                          │                                  │
│  ┌───────────────────────┴────────────────────────┐        │
│  │              API Layer (REST)                  │        │
│  │  /api/ledger  /api/governance  /api/onboarding │        │
│  └───────────────────┬─────────────────────────────┘       │
│                      │                                      │
│  ┌───────────────────┴─────────────────────────────────┐   │
│  │            Domain Services (Business Logic)        │   │
│  │                                                     │   │
│  │  ┌──────────────────┐  ┌──────────────────┐       │   │
│  │  │ ContinuityScore  │  │  RationaleBuilder│       │   │
│  │  │    Service       │  │                  │       │   │
│  │  └──────────────────┘  └──────────────────┘       │   │
│  │                                                     │   │
│  │  ┌──────────────────┐  ┌──────────────────┐       │   │
│  │  │  GovernanceQueue │  │  MappingEngine   │       │   │
│  │  │    Service       │  │                  │       │   │
│  │  └──────────────────┘  └──────────────────┘       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                     PostgreSQL
                           │
                  ┌────────┴────────┐
                  │   relationships │
                  │   interactions  │
                  │ outreach_drafts │
                  │governance_batches│
                  │governance_events │
                  └─────────────────┘
```

---

## Complete File Structure

```
the-sunset-protocol---legacy-monetization/
│
├── frontend/  (or src/)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx
│   │   │   └── PageContainer.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   ├── ledger/
│   │   │   ├── ContinuityLedgerTable.tsx
│   │   │   ├── ContinuityRow.tsx
│   │   │   ├── ScoreBadge.tsx
│   │   │   └── ContactCell.tsx
│   │   └── panels/
│   │       └── DecisionRationalePanel.tsx
│   ├── pages/
│   │   ├── onboarding/
│   │   │   ├── initialize.tsx
│   │   │   ├── source.tsx
│   │   │   ├── fields.tsx
│   │   │   ├── assessment.tsx
│   │   │   └── governance.tsx
│   │   └── ledger/
│   │       └── index.tsx
│   ├── types/
│   │   └── ledger.ts
│   ├── data/
│   │   └── sampleLedgerData.ts
│   └── services/
│       └── api.ts  (NEW - API client)
│
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── continuity/
│   │   │   │   └── ContinuityScoreService.ts
│   │   │   ├── rationale/
│   │   │   │   └── RationaleBuilder.ts
│   │   │   ├── governance/
│   │   │   │   ├── GovernanceQueueService.ts
│   │   │   │   └── GovernanceEventService.ts
│   │   │   └── mapping/
│   │   │       └── MappingEngine.ts
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   │   ├── LedgerController.ts
│   │   │   │   ├── GovernanceController.ts
│   │   │   │   └── OnboardingController.ts
│   │   │   └── routes/
│   │   │       └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── db/
│   │   └── schema.sql
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── tailwind.config.js
├── PRIMUS_OS_INTEGRATION_GUIDE.md
├── PRIMUS_OS_README.md
└── FULL_STACK_INTEGRATION.md  (this file)
```

---

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Set DATABASE_URL and other vars

# Create database
createdb primus_os

# Run migrations
npm run db:migrate

# Start backend server
npm run dev
```

Backend runs on: [http://localhost:3001](http://localhost:3001)

Verify: [http://localhost:3001/health](http://localhost:3001/health)

---

### 2. Frontend Setup

```bash
# Navigate to frontend (from project root)
npm install

# Start frontend
npm run dev
```

Frontend runs on: [http://localhost:3000](http://localhost:3000)

---

### 3. Connect Frontend to Backend

Create API client service:

```typescript
// src/services/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
  // Ledger
  async getPortfolio(params?: { status?: string; grade?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/ledger?${query}`);
    return res.json();
  },

  async getRelationship(id: string) {
    const res = await fetch(`${API_BASE}/ledger/${id}`);
    return res.json();
  },

  async createDraft(relationshipId: string, data: { subject: string; body: string }) {
    const res = await fetch(`${API_BASE}/ledger/${relationshipId}/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async recordInteraction(relationshipId: string, data: any) {
    const res = await fetch(`${API_BASE}/ledger/${relationshipId}/record-interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Governance
  async getBatches(status?: string) {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/governance/batches${query}`);
    return res.json();
  },

  async createBatch(label: string) {
    const res = await fetch(`${API_BASE}/governance/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
    return res.json();
  },

  async addDraftToBatch(batchId: string, draftId: string) {
    const res = await fetch(`${API_BASE}/governance/batches/${batchId}/add-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId }),
    });
    return res.json();
  },

  async approveBatch(batchId: string) {
    const res = await fetch(`${API_BASE}/governance/batches/${batchId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  // Onboarding
  async createLedgerSource(data: { sourceType: string; sourceName: string }) {
    const res = await fetch(`${API_BASE}/onboarding/ledger-sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async previewFields(ledgerSourceId: string, sampleHeaders: string[]) {
    const res = await fetch(`${API_BASE}/onboarding/preview-fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ledgerSourceId, sampleHeaders }),
    });
    return res.json();
  },

  async approveFields(ledgerSourceId: string, mappings: any[]) {
    const res = await fetch(`${API_BASE}/onboarding/approve-fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ledgerSourceId, mappings }),
    });
    return res.json();
  },

  async runAssessment(ledgerSourceId: string, rawRecords: any[]) {
    const res = await fetch(`${API_BASE}/onboarding/run-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ledgerSourceId, rawRecords }),
    });
    return res.json();
  },
};
```

---

### 4. Update Continuity Ledger Page

Replace sample data with real API calls:

```typescript
// src/pages/ledger/index.tsx
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export const ContinuityLedgerPage = () => {
  const [relationships, setRelationships] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [rationale, setRationale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const response = await api.getPortfolio({ limit: 50, offset: 0 });
      setRelationships(response.data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecord = async (id: string) => {
    setSelectedRecordId(id);
    try {
      const response = await api.getRelationship(id);
      setRationale(response.rationale);
    } catch (error) {
      console.error('Failed to load rationale:', error);
    }
  };

  const handlePrepareDraft = async (id: string) => {
    // TODO: Open draft modal
    console.log('Prepare draft for:', id);
  };

  const handleAddToBatch = async (id: string) => {
    // TODO: Show batch selection modal
    console.log('Add to batch:', id);
  };

  if (loading) {
    return <div>Loading portfolio...</div>;
  }

  return (
    <div className="min-h-screen bg-office-slate">
      <TopBar showGovernanceMode governanceModeActive />
      <div className="p-page">
        <div className="flex gap-6">
          <div className="flex-1" style={{ flexBasis: '70%' }}>
            <ContinuityLedgerTable
              records={relationships}
              selectedRecordId={selectedRecordId}
              onSelectRecord={handleSelectRecord}
              onPrepare={handlePrepareDraft}
              onRecord={(id) => console.log('Record interaction:', id)}
              onAddToBatch={handleAddToBatch}
            />
          </div>
          <div className="w-full" style={{ flexBasis: '30%' }}>
            <DecisionRationalePanel
              rationale={rationale}
              onPrepareDraft={handlePrepareDraft}
              onAddToBatch={handleAddToBatch}
              onViewHistory={(id) => console.log('View history:', id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## Data Flow Examples

### Example 1: View Relationship Details

```
User clicks row in ledger table
    ↓
Frontend: onSelectRecord(relationshipId)
    ↓
API: GET /api/ledger/:id
    ↓
Backend: LedgerController.getRelationship()
    ↓
    ├─ Fetch relationship from DB
    ├─ Fetch recent interactions
    ├─ ContinuityScoreService.calculate()
    └─ RationaleBuilder.build()
    ↓
Return JSON { relationship, rationale, interactions }
    ↓
Frontend: Update DecisionRationalePanel
```

---

### Example 2: Create & Approve Outreach Draft

```
User clicks "Prepare Draft for Review"
    ↓
Frontend: Modal opens, user writes subject/body
    ↓
API: POST /api/ledger/:id/drafts
    ↓
Backend: LedgerController.createDraft()
    ↓
    ├─ Insert into outreach_drafts (status: PREPARED)
    └─ GovernanceEventService.record('DRAFT_PREPARED')
    ↓
Return draft ID
    ↓
User adds to batch
    ↓
API: POST /api/governance/batches/:id/add-draft
    ↓
Backend: GovernanceQueueService.addDraftToBatch()
    ↓
    ├─ Update draft (status: IN_BATCH)
    └─ Record event
    ↓
Admin reviews batch
    ↓
API: POST /api/governance/batches/:id/approve
    ↓
Backend: GovernanceQueueService.approveBatch()
    ↓
    ├─ Update batch (status: APPROVED)
    ├─ Update all drafts (status: APPROVED)
    └─ Record event
    ↓
Execute batch
    ↓
API: POST /api/governance/batches/:id/execute
    ↓
Backend: GovernanceQueueService.executeBatch()
    ↓
    ├─ Update batch (status: EXECUTED)
    ├─ Update drafts (status: EXECUTED)
    ├─ Record event
    └─ TODO: Send via SMTP/CRM
```

---

### Example 3: Onboarding Flow

```
User: "Begin Continuity Initialization"
    ↓
Screen 2: Select source (CRM/LOS/Spreadsheet)
    ↓
API: POST /api/onboarding/ledger-sources
    ↓
Backend: Create ledger_sources record
    ↓
User uploads CSV or connects API
    ↓
API: POST /api/onboarding/preview-fields
Body: { sampleHeaders: ["Full Name", "Segment", ...] }
    ↓
Backend: MappingEngine.previewMapping()
    ↓
Return suggestions with confidence scores
    ↓
Screen 3: User approves mappings
    ↓
API: POST /api/onboarding/approve-fields
Body: { mappings: [{ sourceField, targetField }, ...] }
    ↓
Backend: Save to field_mappings table
    ↓
Screen 4: Run assessment
    ↓
API: POST /api/onboarding/run-assessment
Body: { rawRecords: [...] }
    ↓
Backend:
    ├─ MappingEngine.applyMapping() → relationships + interactions
    ├─ ContinuityScoreService.calculateBatch() → scores
    ├─ MappingEngine.generateAssessment() → portfolio rating
    └─ Insert all into DB
    ↓
Return assessment { portfolioRating: 'A', strongStablePercent: 67, ... }
    ↓
Screen 5: Governance Mode activation
    ↓
Complete → Navigate to /ledger
```

---

## Environment Configuration

### Backend `.env`

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/primus_os
CORS_ORIGIN=http://localhost:3000
```

### Frontend `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FIRM_NAME=G2R Continuity Partners
```

---

## Testing the Full Stack

### 1. Backend Health Check

```bash
curl http://localhost:3001/health
```

Expected:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-31T12:00:00Z",
  "service": "Primus OS Backend"
}
```

---

### 2. Test Ledger API

```bash
curl http://localhost:3001/api/ledger
```

Expected (empty initially):
```json
{
  "data": [],
  "pagination": { "total": 0, "limit": 50, "offset": 0 }
}
```

---

### 3. Test Onboarding Flow

```bash
# Create ledger source
curl -X POST http://localhost:3001/api/onboarding/ledger-sources \
  -H "Content-Type: application/json" \
  -d '{"sourceType":"CRM","sourceName":"Salesforce Test"}'

# Preview field mappings
curl -X POST http://localhost:3001/api/onboarding/preview-fields \
  -H "Content-Type: application/json" \
  -d '{"sampleHeaders":["Full Name","Segment","Last Contact"]}'
```

---

## Production Deployment

### Backend (Node.js)

Deploy to:
- AWS ECS/Fargate
- Google Cloud Run
- Heroku
- Railway

**Environment:**
```bash
NODE_ENV=production
DATABASE_URL=<production-postgres-url>
CORS_ORIGIN=https://app.primusos.com
```

---

### Frontend (Next.js)

Deploy to:
- Vercel (recommended)
- Netlify
- AWS Amplify

**Environment:**
```bash
NEXT_PUBLIC_API_URL=https://api.primusos.com/api
```

---

### Database (PostgreSQL)

Use managed service:
- AWS RDS
- Google Cloud SQL
- Supabase
- Heroku Postgres

**Backup strategy:**
- Daily automated backups
- Point-in-time recovery enabled
- Retention: 30 days minimum

---

## Security Checklist

### Backend
- [ ] Replace mock auth with JWT
- [ ] Enable rate limiting (express-rate-limit)
- [ ] Add input validation (joi or zod)
- [ ] Sanitize SQL queries (use parameterized queries)
- [ ] Enable CORS only for production domain
- [ ] Set security headers (helmet.js)
- [ ] Enable HTTPS only
- [ ] Hash sensitive data (bcrypt)
- [ ] Implement RBAC (role-based access control)
- [ ] Set up audit logging

### Frontend
- [ ] Sanitize user inputs
- [ ] Implement CSP headers
- [ ] Use HTTPS only
- [ ] Validate API responses
- [ ] Handle authentication tokens securely
- [ ] Implement session timeout

### Database
- [ ] Use strong passwords
- [ ] Enable SSL connections
- [ ] Restrict network access (VPC/firewall)
- [ ] Regular backups
- [ ] Encrypt at rest
- [ ] Monitor for suspicious queries

---

## Monitoring & Observability

### Backend Metrics

- Request latency (p50, p95, p99)
- Error rate
- Database connection pool usage
- Continuity score calculation time
- Governance event volume

**Tools:**
- DataDog
- New Relic
- Prometheus + Grafana

### Frontend Metrics

- Page load time
- API response time
- User interactions (table sorting, row selection)
- Error boundaries triggered

**Tools:**
- Vercel Analytics
- Google Analytics
- LogRocket

### Alerts

Set up alerts for:
- API error rate > 1%
- Database connection failures
- High latency (> 500ms p95)
- Failed batch executions
- Score calculation errors

---

## Scaling Considerations

### Database

- Add read replicas for heavy read workloads
- Partition `interactions` table by date (for historical data)
- Archive old `governance_events` (> 2 years)

### Backend

- Horizontal scaling: Run multiple instances behind load balancer
- Cache frequently accessed data (Redis)
- Background jobs for score recalculation (Bull or Agenda)

### Frontend

- CDN for static assets
- Server-side rendering for SEO
- Lazy loading for large tables (react-virtual)

---

## Roadmap

### Phase 1: MVP (Current)
- ✅ Core ledger functionality
- ✅ Continuity scoring
- ✅ Governance batches
- ✅ Onboarding flow

### Phase 2: Integrations
- [ ] Salesforce OAuth + sync
- [ ] Encompass LOS connector
- [ ] SMTP email execution
- [ ] CSV import/export

### Phase 3: Intelligence
- [ ] Predictive scoring (ML model)
- [ ] Automated rationale generation (LLM)
- [ ] Risk trend analysis
- [ ] Relationship health alerts

### Phase 4: Collaboration
- [ ] Multi-user batch review
- [ ] Comments on drafts
- [ ] Approval workflows (multi-stage)
- [ ] Team dashboards

---

## Support

**Backend issues:**
See `backend/README.md`

**Frontend issues:**
See `PRIMUS_OS_INTEGRATION_GUIDE.md`

**Database migrations:**
See `backend/db/schema.sql`

**API reference:**
See `backend/README.md` → API Endpoints

---

## Philosophy

This is backend-first architecture.

The frontend **presents** data.
The backend **decides** everything.

Continuity scores are calculated server-side with explainable logic.
Rationale is generated server-side with deterministic templates.
Governance flows are enforced server-side with audit trails.

No client-side shortcuts.
No "fake it till you make it" UX.
No instant-send buttons.

**Governance over speed.**
**Continuity over hustle.**
**Institutional semantics always.**

---

Built for leadership that manages 9-figure revenue portfolios.

This is Primus OS.
