# 🚨 Quick Fix: 401 Unauthorized Errors

## Problem

Your dashboard is showing 401 (Unauthorized) errors because:
1. **Row Level Security (RLS)** is enabled on Supabase tables
2. **No authentication** is set up yet (user is not logged in)
3. **RLS policies** are blocking anonymous access

## Solution: Temporarily Disable RLS for Development

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: **tianndcmjatgxytkqvpq**
3. Click **SQL Editor** in the left sidebar
4. Click **"New Query"**

### Step 2: Run This SQL (Copy & Paste)

```sql
-- =====================================================
-- DISABLE RLS FOR DEVELOPMENT
-- =====================================================
-- This allows unauthenticated access for testing
-- Re-enable RLS before production deployment
-- =====================================================

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE firms DISABLE ROW LEVEL SECURITY;
ALTER TABLE relationships DISABLE ROW LEVEL SECURITY;
ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE continuity_signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE continuity_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE governance_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE governance_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE field_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_sources DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might cause conflicts
DROP POLICY IF EXISTS relationship_isolation ON relationships;
DROP POLICY IF EXISTS users_isolation ON users;
DROP POLICY IF EXISTS firms_isolation ON firms;
DROP POLICY IF EXISTS interactions_isolation ON interactions;
DROP POLICY IF EXISTS signals_isolation ON continuity_signals;

-- =====================================================
-- DONE - RLS Disabled
-- =====================================================
-- Your app should now load without 401 errors
-- =====================================================
```

### Step 3: Click "Run" (Bottom Right)

Expected output:
```
SUCCESS: Completed in [X]ms
```

### Step 4: Refresh Your Dashboard

Go back to your app and refresh the page. The 401 errors should be gone.

---

## Alternative: Create Test Data

If your tables are empty, you also need to add some test data:

```sql
-- Insert a test firm
INSERT INTO firms (id, name, governance_mode_enabled)
VALUES ('test-firm-123', 'Test Firm Inc', true)
ON CONFLICT (id) DO NOTHING;

-- Insert a test user
INSERT INTO users (id, firm_id, email, role)
VALUES ('test-user-123', 'test-firm-123', 'test@example.com', 'BROKER')
ON CONFLICT (id) DO NOTHING;

-- Insert test relationships
INSERT INTO relationships (
  id,
  firm_id,
  display_name,
  role_or_segment,
  status,
  continuity_grade,
  continuity_score,
  last_interaction_at
)
VALUES
  ('rel-1', 'test-firm-123', 'Hamilton Trust', 'High-Value', 'Active', 'AAA', 95, NOW() - INTERVAL '2 days'),
  ('rel-2', 'test-firm-123', 'Nexus Surgery Group', 'Medical', 'At Risk', 'BB', 45, NOW() - INTERVAL '45 days'),
  ('rel-3', 'test-firm-123', 'Venture Partners IV', 'Private Equity', 'Strong', 'AA', 85, NOW() - INTERVAL '28 days'),
  ('rel-4', 'test-firm-123', 'Estate of J. Rourke', 'Estate', 'Transition', 'A', 75, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;
```

---

## What This Does

**Before:**
- ❌ Supabase blocks all requests (401 errors)
- ❌ Dashboard shows "Failed to fetch relationships"
- ❌ App unusable

**After:**
- ✅ Supabase allows all requests (no auth required)
- ✅ Dashboard loads relationships from database
- ✅ App works for development/testing

---

## ⚠️ Important: Re-Enable RLS for Production

This is a **temporary development workaround**. Before deploying to production:

1. Re-enable RLS:
```sql
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
-- (repeat for all tables)
```

2. Create proper RLS policies:
```sql
CREATE POLICY "Users can view their firm's relationships"
ON relationships
FOR SELECT
USING (
  firm_id IN (
    SELECT firm_id FROM users WHERE id = auth.uid()
  )
);
```

3. Implement authentication (Login page)

---

## Files Fixed

- ✅ **pages/Dashboard.tsx** - Removed broken `api.subscribeToContinuityUpdates()` call
- ✅ **fix-rls-simple.sql** - SQL script to disable RLS (ready to run)

---

## Next Steps

1. Run the SQL above in Supabase
2. Refresh your dashboard
3. Verify relationships load
4. Continue development

Once basic functionality works, we can add proper authentication and re-enable RLS.
