# Phase 4 - Backend Activation Progress

## ✅ Completed

### Database Layer
- [x] PostgreSQL connection pool (`src/infra/db/connection.ts`)
- [x] Transaction support
- [x] Health check functionality

### Repositories
- [x] `RelationshipRepository` - Full CRUD for relationships
- [x] `InteractionRepository` - Interaction data access
- [x] `GovernanceRepository` - Batches, drafts, events

### Services (Partial)
- [x] `GovernanceEventService` - Wired to database
- [x] `GovernanceQueueServiceV2` - Complete state machine with DB

## 🚧 In Progress / Remaining

### 1. Wire Controllers to Repositories

**LedgerController** needs:
```typescript
constructor(
  private relationshipRepo: RelationshipRepository,
  private interactionRepo: InteractionRepository,
  private governanceRepo: GovernanceRepository,
  private continuityScoreService: ContinuityScoreService,
  private rationaleBuilder: RationaleBuilder,
  private eventService: GovernanceEventService
)
```

Replace all `// TODO` comments with real DB calls.

### 2. Update Server.ts

Wire all dependencies:
```typescript
// Repositories
const relationshipRepo = new RelationshipRepository();
const interactionRepo = new InteractionRepository();
const governanceRepo = new GovernanceRepository();

// Services
const eventService = new GovernanceEventService(governanceRepo);
const governanceQueueService = new GovernanceQueueServiceV2(governanceRepo, eventService);

// Controllers with dependencies
const ledgerController = new LedgerController(
  relationshipRepo,
  interactionRepo,
  governanceRepo,
  continuityScoreService,
  rationaleBuilder,
  eventService
);
```

### 3. Frontend API Client

Create `src/services/api.ts`:
- Connect to `http://localhost:3001/api`
- All endpoints from backend

### 4. Wire Frontend Components

**ContinuityLedgerPage**:
- `useEffect` to load from `/api/ledger`
- Replace `sampleLedgerData.ts`

**Onboarding Pages**:
- Screen 2: POST to `/api/onboarding/ledger-sources`
- Screen 3: POST to `/api/onboarding/preview-fields` + `/approve-fields`
- Screen 4: POST to `/api/onboarding/run-assessment`

### 5. Testing

- [ ] Postman collection (all endpoints)
- [ ] Unit tests for scoring algorithm
- [ ] Integration test for onboarding flow
- [ ] State machine validation tests

## Critical Path to Completion

1. **Update server.ts** (5 min)
   - Wire repositories to services
   - Wire services to controllers

2. **Update LedgerController** (10 min)
   - Replace TODOs with repo calls in:
     - `listPortfolio()`
     - `getRelationship()`
     - `createDraft()`
     - `recordInteraction()`

3. **Create Frontend API Client** (10 min)
   - `src/services/api.ts`

4. **Wire Ledger Page** (10 min)
   - Replace sample data with API calls

5. **Test End-to-End** (15 min)
   - Seed database with test data
   - Verify full workflow

## Seed Data Script Needed

```sql
-- Insert test firm
INSERT INTO firms (id, name, governance_mode_enabled)
VALUES ('firm_1', 'G2R Continuity Partners', true);

-- Insert test user
INSERT INTO users (id, firm_id, email, role)
VALUES ('user_1', 'firm_1', 'admin@g2r.com', 'ADMIN');

-- Insert sample relationships
INSERT INTO relationships (
  id, display_name, role_or_segment, status, value_outlook,
  continuity_grade, continuity_score, last_interaction_at, last_interaction_type, firm_id
) VALUES
  ('rel_1', 'J. Alvarez', 'Tier A Relationship', 'STRONG', 'Renewal pipeline – tier A book',
   'AAA', 91, NOW() - INTERVAL '12 days', 'EMAIL', 'firm_1'),
  ('rel_2', 'M. Lewis', 'High-referral segment', 'STABLE', 'Refi-eligible – rate review',
   'AA', 84, NOW() - INTERVAL '32 days', 'CALL', 'firm_1'),
  ('rel_3', 'R. Khan', 'Dormant opportunity', 'REVIEW', 'Dormant – reactivation potential',
   'BBB', 67, NOW() - INTERVAL '98 days', 'EMAIL', 'firm_1'),
  ('rel_4', 'S. Thompson', 'Aging book', 'PENDING', 'Aging portfolio – discuss succession',
   'BB', 58, NOW() - INTERVAL '190 days', 'MEETING', 'firm_1');

-- Insert sample interactions
INSERT INTO interactions (
  id, relationship_id, type, direction, occurred_at, value_event_weight, notes
) VALUES
  (gen_random_uuid(), 'rel_1', 'EMAIL', 'OUTBOUND', NOW() - INTERVAL '12 days', 2, 'Renewal pipeline check-in'),
  (gen_random_uuid(), 'rel_2', 'CALL', 'OUTBOUND', NOW() - INTERVAL '32 days', 3, 'Rate environment discussion');
```

## Next Actions

1. Execute items 1-4 from Critical Path
2. Run seed script
3. Test in UI
4. Create Postman collection
5. Submit PR

## Files Modified/Created This Phase

**New:**
- `backend/src/infra/db/connection.ts`
- `backend/src/infra/repositories/RelationshipRepository.ts`
- `backend/src/infra/repositories/InteractionRepository.ts`
- `backend/src/infra/repositories/GovernanceRepository.ts`
- `backend/src/domain/governance/GovernanceQueueServiceV2.ts`

**Modified:**
- `backend/src/domain/governance/GovernanceEventService.ts`

**Pending:**
- `backend/src/server.ts` - Wire dependencies
- `backend/src/api/controllers/LedgerController.ts` - Replace TODOs
- `backend/src/api/controllers/GovernanceController.ts` - Replace TODOs
- `backend/src/api/controllers/OnboardingController.ts` - Replace TODOs
- `src/services/api.ts` - Create frontend client
- `src/pages/ledger/index.tsx` - Wire to API
