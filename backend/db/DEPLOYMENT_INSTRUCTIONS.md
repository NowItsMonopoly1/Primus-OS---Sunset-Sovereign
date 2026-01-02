# SoloScale Schema Deployment Instructions

## Prerequisites
- Supabase project created
- `psql` or Supabase SQL Editor access
- Supabase Auth configured

## Deployment Order

### Step 1: Deploy Base Schema (if not already deployed)
```bash
psql $DATABASE_URL < backend/db/schema.sql
```

### Step 2: Deploy WAL Production Ready Migration
```bash
psql $DATABASE_URL < backend/db/migrations/002_wal_production_ready.sql
```

### Step 3: Verify Deployment
```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true;

-- Check WAL firm exists
SELECT * FROM firms WHERE name = 'West Approved Lending';
```

### Step 4: Configure Supabase Auth

#### Enable Email Auth
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email provider
3. Disable email confirmations for faster testing (optional)

#### Create RLS Helper Function
```sql
-- This function returns the current authenticated user's ID
-- Supabase Auth automatically provides auth.uid()
-- No additional setup needed if using Supabase Auth
```

### Step 5: Create First User (Founder)

**Option A: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add User"
3. Email: `founder@westapprovedlending.com`
4. Password: (set securely)
5. Auto Confirm: Yes

**Option B: Via SQL (after Supabase Auth user exists)**
```sql
-- Get the auth user's UUID from Supabase Dashboard
-- Then insert into users table
INSERT INTO users (id, firm_id, email, role, display_name)
VALUES (
  '<AUTH_USER_UUID>'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'founder@westapprovedlending.com',
  'FOUNDER',
  'Founder'
);
```

### Step 6: Test Firm Isolation

```sql
-- Test 1: Create a second test firm
INSERT INTO firms (name) VALUES ('Test Firm') RETURNING id;

-- Test 2: Try to query as WAL user (should only see WAL data)
-- Set auth context (simulate logged in user)
SET LOCAL auth.uid TO '<WAL_USER_UUID>';

-- Should only return WAL firm
SELECT * FROM firms;

-- Should only return WAL relationships
SELECT * FROM relationships;
```

## Post-Deployment Checklist

- [ ] All 24 tables created successfully
- [ ] RLS enabled on all tenant-scoped tables
- [ ] WAL firm exists with correct UUID
- [ ] Founder user created and linked to WAL firm
- [ ] Test queries respect firm isolation
- [ ] All indexes created
- [ ] All triggers active
- [ ] Helper views working

## Rollback Plan

If migration fails:

```sql
-- Drop new tables only (preserves base schema)
DROP TABLE IF EXISTS vault_documents CASCADE;
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS governance_actions CASCADE;
DROP TABLE IF EXISTS baseline_reports CASCADE;
DROP TABLE IF EXISTS client_assignments CASCADE;
DROP TABLE IF EXISTS continuity_signals CASCADE;

-- Drop new enums
DROP TYPE IF EXISTS document_category;
DROP TYPE IF EXISTS baseline_status;
DROP TYPE IF EXISTS signal_severity;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS governance_action_type;

-- Revert column additions
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER';
-- (continue for other altered columns if needed)
```

## Environment Variables

Add to `.env`:

```bash
# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (for migrations)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres
```

## Next Steps After Deployment

1. **Replace Mock Data Providers**
   - Delete `src/data/mockDataProvider.ts`
   - Delete `src/data/fakeApi.ts`
   - Wire real Supabase queries in `src/services/api.ts`

2. **Implement Auth Flow**
   - Add login page with Supabase Auth
   - Add auth context provider
   - Protect all routes with auth guard

3. **Build Signal Calculation Engine**
   - Create scheduled Supabase Edge Function
   - Calculate signals based on:
     - `last_contact_days_ago` > 60 = YELLOW
     - `last_contact_days_ago` > 90 = RED
     - Continuity score drop > 10 points = YELLOW

4. **Add Role-Based UI Guards**
   - Founders: See everything, approve everything
   - Juniors: Execute drafts, view assigned clients
   - Read-Only: View only, no mutations

5. **Implement Audit Logging**
   - Wrap all mutations with audit event creation
   - Log: Login, Logout, Approve, Reject, Export, Config Change

## Troubleshooting

**Problem**: RLS blocks all queries
- **Solution**: Ensure `auth.uid()` function exists and returns current user UUID
- **Check**: `SELECT auth.uid();` should return your user ID

**Problem**: Users table insert fails
- **Solution**: Create Supabase Auth user first, then insert into users table with matching UUID

**Problem**: Firm isolation not working
- **Solution**: Verify user has `firm_id` set correctly in users table

**Problem**: Foreign key violations
- **Solution**: Ensure firm_id exists in firms table before inserting dependent records

## Support

For schema questions or deployment issues, reference:
- Supabase RLS Docs: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL Docs: https://www.postgresql.org/docs/current/
- This codebase: `backend/db/schema.sql` for base structure
