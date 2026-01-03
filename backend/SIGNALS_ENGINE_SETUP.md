# Continuity Signals Engine - Setup Guide

## 🎯 Overview

The Continuity Signals Engine is the **"Heartbeat"** of Primus OS. It automatically scans your relationship database and generates actionable signals that tell brokers exactly who to call.

This is a **server-side** calculation engine that runs in your Supabase database, not on the user's laptop.

---

## 📦 Installation Steps

### Step 1: Apply the Migration

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Open the file: `backend/db/migrations/003_continuity_signals_engine.sql`
5. Copy the entire contents
6. Paste into Supabase SQL Editor
7. Click **"Run"** (bottom right)

Expected output:
```
SUCCESS: Function created
NOTICE: Continuity signals generated at [timestamp]
```

### Step 2: Verify Signal Generation

Run this query in Supabase SQL Editor:

```sql
SELECT
    type,
    severity,
    COUNT(*) as signal_count
FROM continuity_signals
WHERE status = 'ACTIVE'
GROUP BY type, severity
ORDER BY severity DESC, type;
```

You should see signals grouped by type:
- `CONTACT_GAP` (Yellow) - Haven't contacted in 90+ days
- `ENGAGEMENT_DRIFT` (Red) - Continuity score < 60
- `VALUE_RISK` (Green) - Refinance opportunities
- `LIFE_STAGE` (Yellow/Red) - Age-based succession timing
- `SUCCESSION_GAP` (Red) - No documented successor

---

## 🔧 Signal Types Explained

### 1. CONTACT_GAP (Yellow)
**Trigger:** Last interaction > 90 days ago
**Action:** Schedule a touchpoint call
**Business Logic:** Relationships drift when ignored for 3+ months

### 2. ENGAGEMENT_DRIFT (Red)
**Trigger:** Continuity score < 60/100
**Action:** Immediate intervention required
**Business Logic:** Low scores indicate relationship degradation

### 3. VALUE_RISK (Green = Opportunity)
**Trigger:** Interest rate > market rate + 1.0%
**Action:** Proactive refinance outreach
**Business Logic:** Rate-driven refinance opportunities before they shop

### 4. LIFE_STAGE (Yellow/Red)
**Trigger:** Primary contact age ≥ 60 years
**Action:** Initiate succession planning conversation
**Business Logic:** Age milestones indicate retirement/estate planning windows

### 5. SUCCESSION_GAP (Red)
**Trigger:** Book value > $500K with no documented successor
**Action:** Document heir/successor relationship
**Business Logic:** High-value relationships need continuity protection

---

## ⚙️ Configuration

### Update Market Rate

As interest rates change, update the market rate used for refinance opportunity detection:

```sql
SELECT update_market_rate(6.25); -- Set to current market rate
```

### Manual Signal Generation

To manually trigger signal generation (useful for testing):

```sql
SELECT generate_continuity_signals();
```

### Resolve a Signal

When a broker takes action on a signal:

```sql
SELECT resolve_signal(
    'signal-uuid-here'::UUID,
    'user-uuid-here'::UUID
);
```

---

## 🤖 Automatic Scheduling (Optional)

To run the signals engine automatically every 6 hours:

### Enable pg_cron Extension

1. In Supabase Dashboard, go to **Database > Extensions**
2. Search for **pg_cron**
3. Click **Enable**

### Schedule the Job

Run this SQL after enabling pg_cron:

```sql
SELECT cron.schedule(
    'generate-continuity-signals',
    '0 */6 * * *', -- Every 6 hours
    $$ SELECT generate_continuity_signals(); $$
);
```

### View Scheduled Jobs

```sql
SELECT * FROM cron.job;
```

### Disable Automatic Scheduling

```sql
SELECT cron.unschedule('generate-continuity-signals');
```

---

## 🔌 Frontend Integration

### Fetch Active Signals

Create a service function in your frontend:

```typescript
// src/services/supabase/signals.ts
import { supabase } from './client';

export interface ContinuitySignal {
  id: string;
  firm_id: string;
  relationship_id: string;
  type: 'CONTACT_GAP' | 'ENGAGEMENT_DRIFT' | 'VALUE_RISK' | 'LIFE_STAGE' | 'SUCCESSION_GAP';
  severity: 'GREEN' | 'YELLOW' | 'RED';
  message: string;
  status: 'ACTIVE' | 'RESOLVED';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export async function getActiveSignals(firmId: string) {
  const { data, error } = await supabase
    .from('continuity_signals')
    .select(`
      *,
      relationships (
        client_name,
        book_value,
        continuity_score
      )
    `)
    .eq('firm_id', firmId)
    .eq('status', 'ACTIVE')
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function resolveSignal(signalId: string, userId: string) {
  const { error } = await supabase.rpc('resolve_signal', {
    signal_id: signalId,
    resolved_by_user_id: userId
  });

  return { error };
}

export async function triggerSignalGeneration() {
  const { error } = await supabase.rpc('generate_continuity_signals');
  return { error };
}

export async function updateMarketRate(newRate: number) {
  const { error } = await supabase.rpc('update_market_rate', {
    new_rate: newRate
  });

  return { error };
}
```

### Display Signals in Dashboard

Update your `ContinuitySignalsPage.tsx` to use real data:

```typescript
import { useEffect, useState } from 'react';
import { getActiveSignals, resolveSignal } from '../services/supabase/signals';
import { useAuth } from '../contexts/AuthContext';

export default function ContinuitySignalsPage() {
  const [signals, setSignals] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    if (!user?.firmId) return;
    const { data } = await getActiveSignals(user.firmId);
    setSignals(data || []);
  };

  const handleResolve = async (signalId: string) => {
    await resolveSignal(signalId, user.id);
    loadSignals(); // Reload signals
  };

  // ... rest of component
}
```

---

## 📊 Monitoring & Analytics

### Signal Volume by Type

```sql
SELECT
    type,
    severity,
    COUNT(*) as total_signals,
    COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_signals,
    COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_signals
FROM continuity_signals
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY type, severity
ORDER BY total_signals DESC;
```

### Average Resolution Time

```sql
SELECT
    type,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours_to_resolve
FROM continuity_signals
WHERE status = 'RESOLVED'
AND resolved_at IS NOT NULL
GROUP BY type
ORDER BY avg_hours_to_resolve DESC;
```

### Top Relationships by Signal Count

```sql
SELECT
    r.client_name,
    r.book_value,
    COUNT(s.id) as signal_count
FROM relationships r
LEFT JOIN continuity_signals s ON s.relationship_id = r.id
WHERE s.status = 'ACTIVE'
GROUP BY r.id, r.client_name, r.book_value
ORDER BY signal_count DESC, r.book_value DESC
LIMIT 10;
```

---

## 🔒 Security

- All functions are restricted to `authenticated` role only
- Signals are scoped by `firm_id` - users can only see their own firm's signals
- Row Level Security (RLS) policies should be enabled on `continuity_signals` table

### Enable RLS on Signals Table

```sql
ALTER TABLE continuity_signals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see signals for their firm
CREATE POLICY "Users can view their firm's signals"
ON continuity_signals
FOR SELECT
USING (
    firm_id IN (
        SELECT firm_id FROM users WHERE id = auth.uid()
    )
);

-- Policy: Users can resolve signals for their firm
CREATE POLICY "Users can resolve their firm's signals"
ON continuity_signals
FOR UPDATE
USING (
    firm_id IN (
        SELECT firm_id FROM users WHERE id = auth.uid()
    )
);
```

---

## 🐛 Troubleshooting

### No Signals Generated

**Check 1:** Verify relationships have required data:
```sql
SELECT COUNT(*) FROM relationships WHERE last_interaction_date IS NULL;
SELECT COUNT(*) FROM relationships WHERE continuity_score IS NULL;
```

**Solution:** Populate missing fields with initial data.

### Duplicate Signals

**Check 2:** Verify NOT EXISTS clause is working:
```sql
SELECT relationship_id, type, COUNT(*)
FROM continuity_signals
WHERE status = 'ACTIVE'
GROUP BY relationship_id, type
HAVING COUNT(*) > 1;
```

**Solution:** Manually clean up duplicates and verify the function logic.

### Function Permission Errors

**Check 3:** Verify grants:
```sql
SELECT routine_name, grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'generate_continuity_signals';
```

**Solution:** Re-run the GRANT statements from the migration.

---

## 📚 Next Steps

1. ✅ Apply migration `003_continuity_signals_engine.sql`
2. ✅ Verify signal generation with test query
3. ✅ Enable pg_cron for automatic scheduling (optional)
4. ✅ Integrate signals API into frontend
5. ✅ Enable RLS policies for security
6. ✅ Set up monitoring dashboard

---

## 💡 Business Impact

This signals engine transforms the app from a **passive dashboard** into an **active continuity system** by:

- **Preventing drift:** Identifies ghost relationships before they leave
- **Protecting value:** Flags at-risk relationships for immediate action
- **Creating opportunities:** Surfaces refinance windows proactively
- **Ensuring succession:** Tracks life-stage transitions automatically
- **Quantifying risk:** Provides a real-time "who to call" list

**The broker no longer guesses. The system tells them.**
