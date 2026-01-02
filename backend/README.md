# Primus OS Business Edition - Backend

**Enterprise continuity ledger system with institutional governance.**

---

## Overview

This is the backend brain for the G2R Continuity Operating System. All core intelligence runs server-side:

- **Continuity Scoring** - Explainable 0-100 scoring with AAA-B grades
- **Rationale Generation** - Context-aware decision support
- **Governance Flows** - Prepare → Approval Batch → Approve → Execute
- **Field Mapping** - CRM/LOS/Spreadsheet onboarding

The frontend is presentation only. This backend makes all decisions.

---

## Tech Stack

- **Node.js 18+** with TypeScript
- **Express** for HTTP API
- **PostgreSQL 14+** for relational data + audit trails
- **No ORM** - Direct SQL for performance and clarity

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
nano .env

# Create database
createdb primus_os

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

Server will start on [http://localhost:3001](http://localhost:3001).

Health check: [http://localhost:3001/health](http://localhost:3001/health)

---

## Database Setup

### Create Database

```bash
createdb primus_os
```

### Run Migrations

```bash
psql -U postgres -d primus_os -f db/schema.sql
```

### Verify

```bash
psql primus_os
\dt
```

You should see tables:
- `firms`
- `users`
- `relationships`
- `interactions`
- `continuity_snapshots`
- `governance_batches`
- `outreach_drafts`
- `governance_events`
- `ledger_sources`
- `field_mappings`

---

## Project Structure

```
backend/
├── src/
│   ├── domain/              # Core business logic
│   │   ├── continuity/
│   │   │   └── ContinuityScoreService.ts
│   │   ├── rationale/
│   │   │   └── RationaleBuilder.ts
│   │   ├── governance/
│   │   │   ├── GovernanceQueueService.ts
│   │   │   └── GovernanceEventService.ts
│   │   └── mapping/
│   │       └── MappingEngine.ts
│   ├── api/
│   │   ├── controllers/     # HTTP request handlers
│   │   │   ├── LedgerController.ts
│   │   │   ├── GovernanceController.ts
│   │   │   └── OnboardingController.ts
│   │   └── routes/
│   │       └── index.ts
│   ├── types/
│   │   └── index.ts         # TypeScript definitions
│   └── server.ts            # Express app entry point
├── db/
│   └── schema.sql           # PostgreSQL schema
├── package.json
└── tsconfig.json
```

---

## API Reference

### Base URL

```
http://localhost:3001/api
```

### Authentication

Mock authentication is enabled for development. All requests have access to:

```typescript
req.user = {
  id: 'user_1',
  email: 'admin@g2r.com',
  firmId: 'firm_1',
  role: 'ADMIN'
}
```

**TODO:** Replace with real JWT authentication before production.

---

## Core Services

### 1. ContinuityScoreService

Calculates relationship continuity scores (0-100) with letter grades (AAA-B).

**Algorithm:**

- **Recency (40%)**: Days since last interaction
- **Frequency (30%)**: Interaction count in last 12 months
- **Value Events (20%)**: Weighted interaction quality
- **Stability (10%)**: Historical score volatility

**Grade Mapping:**

| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | AAA | High stability, exceptional continuity |
| 80-89 | AA | Strong relationship, consistent engagement |
| 70-79 | A | Stable with regular touchpoints |
| 60-69 | BBB | Moderate engagement |
| 45-59 | BB | Limited recent activity |
| 0-44 | B | Dormant relationship |

**Example:**

```typescript
import { ContinuityScoreService } from './domain/continuity/ContinuityScoreService';

const service = new ContinuityScoreService();

const result = await service.calculateForRelationship(relationship, interactions);
// {
//   score: 84,
//   grade: 'AA',
//   reasonSummary: 'Score 84/100 (AA). Recent interaction: EMAIL 12 days ago...'
// }
```

---

### 2. RationaleBuilder

Generates structured decision rationale for every relationship.

**Output Sections:**

- **Recent Activity**: Last contact summary
- **Value Drivers**: Why this relationship matters
- **Risk Considerations**: Continuity threats
- **Recommended Next Step**: Suggested action
- **Governance Note**: Compliance context

**Example:**

```typescript
import { RationaleBuilder } from './domain/rationale/RationaleBuilder';

const builder = new RationaleBuilder();

const rationale = builder.build({
  relationship,
  interactions,
  score: 84,
  grade: 'AA'
});
// {
//   recentActivity: 'Last contact: EMAIL · 12 days ago (renewal pipeline check-in).',
//   valueDrivers: 'Tier A relationship with consistent multi-year production...',
//   ...
// }
```

---

### 3. GovernanceQueueService

Manages approval batch workflows.

**State Transitions:**

**Draft:**
- PREPARED → IN_BATCH → APPROVED → EXECUTED

**Batch:**
- OPEN → UNDER_REVIEW → APPROVED → EXECUTED

**Example:**

```typescript
import { GovernanceQueueService } from './domain/governance/GovernanceQueueService';

const service = new GovernanceQueueService(eventService);

// Create batch
const batch = await service.createBatch({
  firmId: 'firm_1',
  label: 'Q1 Renewal Outreach',
  createdBy: 'user_1'
});

// Add draft to batch
await service.addDraftToBatch({
  draftId: 'draft_123',
  batchId: batch.id,
  actorId: 'user_1',
  firmId: 'firm_1'
});

// Approve batch (admin only)
await service.approveBatch({
  batchId: batch.id,
  actorId: 'admin_1',
  firmId: 'firm_1'
});

// Execute batch
await service.executeBatch({
  batchId: batch.id,
  actorId: 'admin_1',
  firmId: 'firm_1'
});
```

---

### 4. MappingEngine

Handles onboarding field mapping and data transformation.

**Features:**

- Smart field detection from column names
- Confidence scoring for suggestions
- Normalization of raw data to schema
- Portfolio assessment generation

**Example:**

```typescript
import { MappingEngine } from './domain/mapping/MappingEngine';

const engine = new MappingEngine();

// Preview mappings
const suggestions = await engine.previewMapping({
  rawColumns: ['Full Name', 'Segment', 'Last Contact Date']
});
// [
//   { sourceField: 'Full Name', suggestedTarget: 'RELATIONSHIP_NAME', confidence: 0.9 },
//   { sourceField: 'Segment', suggestedTarget: 'BOOK_CLASS', confidence: 0.85 },
//   ...
// ]

// Apply mappings
const { relationships, interactions } = await engine.applyMapping({
  ledgerSourceId: 'src_123',
  firmId: 'firm_1',
  rawRecords: csvData,
  mappings: approvedMappings
});

// Generate assessment
const assessment = await engine.generateAssessment({ relationships });
// {
//   portfolioRating: 'A',
//   portfolioRatingNumeric: 82,
//   strongStablePercent: 67,
//   reviewPercent: 14,
//   dormantEquityPercent: 19
// }
```

---

## API Endpoints

### Ledger Routes

#### `GET /api/ledger`
List all relationships for a firm.

**Query Params:**
- `status` (optional): Filter by relationship status
- `grade` (optional): Filter by continuity grade
- `limit` (optional): Page size (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "rel_1",
      "displayName": "J. Alvarez",
      "roleOrSegment": "Tier A Relationship",
      "continuityGrade": "AAA",
      "continuityScore": 91,
      "status": "STRONG",
      "valueOutlook": "Renewal pipeline – tier A book",
      "lastInteractionAt": "2025-12-19T10:00:00Z",
      "lastInteractionType": "EMAIL"
    }
  ],
  "pagination": {
    "total": 250,
    "limit": 50,
    "offset": 0
  }
}
```

---

#### `GET /api/ledger/:id`
Get detailed relationship with rationale.

**Response:**
```json
{
  "relationship": { ... },
  "rationale": {
    "recentActivity": "Last contact: Email · 12 days ago...",
    "valueDrivers": "Tier A relationship with...",
    "riskConsiderations": "Current continuity is strong...",
    "recommendedNextStep": "Prepare a renewal confirmation note...",
    "governanceNote": "Adding this relationship to the Approval Batch..."
  },
  "interactions": [ ... ]
}
```

---

#### `POST /api/ledger/:id/drafts`
Create an outreach draft.

**Body:**
```json
{
  "subject": "Q1 Service Continuity Update",
  "body": "Dear J. Alvarez,\n\nAs we begin Q1..."
}
```

**Response:**
```json
{
  "id": "draft_123",
  "status": "PREPARED",
  "createdAt": "2025-12-31T12:00:00Z"
}
```

---

#### `POST /api/ledger/:id/record-interaction`
Record a new interaction.

**Body:**
```json
{
  "type": "CALL",
  "direction": "OUTBOUND",
  "notes": "Discussed renewal pipeline",
  "valueEventWeight": 3
}
```

---

#### `POST /api/ledger/recalculate-scores`
Recalculate all continuity scores (admin only).

**Response:**
```json
{
  "message": "Scores recalculated successfully",
  "count": 250
}
```

---

### Governance Routes

#### `GET /api/governance/batches`
List all governance batches.

**Query Params:**
- `status` (optional): Filter by batch status

---

#### `POST /api/governance/batches`
Create a new batch.

**Body:**
```json
{
  "label": "Q1 Renewal Outreach Batch"
}
```

---

#### `POST /api/governance/batches/:id/add-draft`
Add a draft to a batch.

**Body:**
```json
{
  "draftId": "draft_123"
}
```

---

#### `POST /api/governance/batches/:id/approve`
Approve a batch (admin only).

**Response:**
```json
{
  "message": "Batch approved successfully"
}
```

---

#### `POST /api/governance/batches/:id/execute`
Execute an approved batch (admin only).

---

### Onboarding Routes

#### `GET /api/onboarding/ledger-sources`
List all ledger sources for a firm.

---

#### `POST /api/onboarding/ledger-sources`
Create a new ledger source.

**Body:**
```json
{
  "sourceType": "CRM",
  "sourceName": "Salesforce Production"
}
```

---

#### `POST /api/onboarding/preview-fields`
Preview field mapping suggestions.

**Body:**
```json
{
  "ledgerSourceId": "src_123",
  "sampleHeaders": ["Full Name", "Segment", "Last Contact Date"]
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "sourceField": "Full Name",
      "suggestedTarget": "RELATIONSHIP_NAME",
      "confidence": 0.9
    }
  ]
}
```

---

#### `POST /api/onboarding/approve-fields`
Save approved field mappings.

**Body:**
```json
{
  "ledgerSourceId": "src_123",
  "mappings": [
    { "sourceField": "Full Name", "targetField": "RELATIONSHIP_NAME" },
    { "sourceField": "Segment", "targetField": "BOOK_CLASS" }
  ]
}
```

---

#### `POST /api/onboarding/run-assessment`
Import data and run initial assessment.

**Body:**
```json
{
  "ledgerSourceId": "src_123",
  "rawRecords": [
    { "Full Name": "John Doe", "Segment": "Tier A", ... },
    ...
  ]
}
```

**Response:**
```json
{
  "assessment": {
    "portfolioRating": "A",
    "portfolioRatingNumeric": 82,
    "strongStablePercent": 67,
    "reviewPercent": 14,
    "dormantEquityPercent": 19
  },
  "importedCount": 250
}
```

---

## Development

### Run Development Server

```bash
npm run dev
```

Hot reload enabled via `ts-node-dev`.

### Build for Production

```bash
npm run build
```

Compiles TypeScript to `dist/` folder.

### Run Production Server

```bash
npm start
```

### Run Tests

```bash
npm test
```

---

## Database Migrations

All schema changes should be versioned as migration files.

**Example migration structure:**

```
db/
├── schema.sql                    # Initial schema
├── migrations/
│   ├── 001_add_email_tracking.sql
│   ├── 002_add_referral_scores.sql
│   └── ...
```

**Apply migration:**

```bash
psql primus_os -f db/migrations/001_add_email_tracking.sql
```

---

## Production Deployment

### Environment Variables

Set these in production:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/primus_os
JWT_SECRET=<strong-secret-here>
CORS_ORIGIN=https://app.primusos.com
```

### Database Backups

```bash
# Backup
pg_dump primus_os > backup_$(date +%Y%m%d).sql

# Restore
psql primus_os < backup_20251231.sql
```

### Security Checklist

- [ ] Replace mock authentication with JWT
- [ ] Enable HTTPS only
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Sanitize all user inputs
- [ ] Enable database connection pooling
- [ ] Set up monitoring (Datadog, New Relic)
- [ ] Configure error tracking (Sentry)
- [ ] Enable audit logging for all governance events
- [ ] Encrypt sensitive data at rest

---

## Integration Points

### Salesforce CRM

**OAuth Flow:**

```typescript
// TODO: Implement OAuth2 flow
// Store access token per firm
// Sync contacts → relationships
// Sync tasks → interactions
```

### Encompass LOS

**API Integration:**

```typescript
// TODO: Connect to Encompass REST API
// Map loans → relationships
// Track loan officer activity → interactions
```

### Email (SMTP)

**Outreach Execution:**

```typescript
// TODO: Send approved drafts via SMTP
// Track delivery status
// Record sent interactions
```

---

## Governance Audit Trail

Every significant action generates a `governance_events` record.

**Event Types:**

- `DRAFT_PREPARED`
- `DRAFT_ADDED_TO_BATCH`
- `BATCH_APPROVED`
- `BATCH_EXECUTED`
- `SCORES_RECALCULATED`
- `FIELD_MAPPINGS_APPROVED`
- `INTERACTION_RECORDED`

**Query audit trail:**

```sql
SELECT * FROM governance_events
WHERE firm_id = 'firm_1'
ORDER BY occurred_at DESC
LIMIT 100;
```

---

## Performance Considerations

### Database Indexes

All critical queries have indexes:

- `relationships(firm_id, continuity_grade)`
- `interactions(relationship_id, occurred_at DESC)`
- `governance_events(firm_id, occurred_at DESC)`

### Caching Strategy

**TODO:** Implement Redis caching for:

- Relationship scores (refresh on interaction)
- Portfolio summaries (refresh on score recalculation)
- Batch status (refresh on state transition)

### Query Optimization

- Use pagination for large result sets
- Limit interaction history to last 50 per relationship
- Batch score calculations (not real-time for large portfolios)

---

## Testing

### Unit Tests

```bash
npm test
```

Test coverage for:

- ContinuityScoreService scoring logic
- RationaleBuilder templates
- MappingEngine field detection
- GovernanceQueueService state transitions

### Integration Tests

**TODO:** Add integration tests for:

- Full onboarding flow
- Governance batch approval workflow
- Score recalculation batch job

---

## Support

For backend questions or integration issues, contact the G2R development team.

**Remember:**

Governance over speed.
Continuity over hustle.
Institutional semantics always.

---

## License

PROPRIETARY - G2R Internal Use Only
