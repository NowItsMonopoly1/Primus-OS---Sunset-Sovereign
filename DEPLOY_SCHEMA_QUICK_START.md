# 🚀 Quick Start: Deploy Schema to Supabase

## Option 1: Supabase SQL Editor (Recommended for Windows)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"

### Step 2: Copy & Paste Migration
1. Open: `backend/db/migrations/002_wal_production_ready.sql`
2. Select ALL (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into Supabase SQL Editor
5. Click "Run" (or press Ctrl+Enter)

### Step 3: Verify Deployment
Run this query in a new SQL Editor tab:
```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show 24+ tables including:
-- - continuity_signals
-- - client_assignments  
-- - baseline_reports
-- - governance_actions
-- - audit_events
-- - vault_documents
```

### Step 4: Enable Row Level Security
Already done! ✅ The migration enables RLS automatically.

### Step 5: Get Your Supabase Credentials
1. Go to Project Settings → API
2. Copy these values to `.env`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key
```

---

## Option 2: Command Line (if you install PostgreSQL tools)

```bash
# Install PostgreSQL client (Windows)
choco install postgresql

# Then run migration
psql $DATABASE_URL < backend/db/migrations/002_wal_production_ready.sql
```

---

## After Schema Deployment

✅ Schema deployed → **Ready for Phase 1: Wire UI to Database**

Next steps:
1. Update `.env` with real Supabase credentials
2. Create auth context provider
3. Build login page
4. Replace mock data with Supabase queries
5. Test end-to-end data flow

---

**Status Check:**
- [ ] Schema deployed to Supabase
- [ ] `.env` updated with real credentials
- [ ] Can query tables via Supabase Dashboard
- [ ] Ready to wire UI

Let me know when schema is deployed and I'll start wiring the UI! 🔌
