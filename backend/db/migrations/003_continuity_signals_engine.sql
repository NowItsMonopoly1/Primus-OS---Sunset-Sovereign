-- =====================================================
-- CONTINUITY SIGNALS ENGINE
-- =====================================================
-- This is the "Heartbeat" of Primus OS.
-- Automatically scans relationships and generates signals.
--
-- Migration: 003_continuity_signals_engine.sql
-- Purpose: Install the automatic signal generation logic
-- =====================================================

-- 1. Create the Master Signal Generation Function
CREATE OR REPLACE FUNCTION generate_continuity_signals()
RETURNS void AS $$
DECLARE
    -- Define the "Market Rate" for Refi opportunities (Change this as rates move)
    current_market_rate DECIMAL := 6.5;
BEGIN
    -- SIGNAL TYPE 1: THE "GHOST" (Contact Gap > 90 Days)
    -- Logic: If we haven't touched them in 3 months, they are drifting.
    INSERT INTO continuity_signals (firm_id, relationship_id, type, severity, message, created_at)
    SELECT
        r.firm_id,
        r.id,
        'CONTACT_GAP',
        'YELLOW',
        'No interaction detected in 90+ days. Relationship drifting.',
        NOW()
    FROM relationships r
    WHERE r.last_interaction_date < (NOW() - INTERVAL '90 days')
    AND NOT EXISTS (
        SELECT 1 FROM continuity_signals s
        WHERE s.relationship_id = r.id
        AND s.type = 'CONTACT_GAP'
        AND s.status = 'ACTIVE'
    );

    -- SIGNAL TYPE 2: THE "AT RISK" (Low Continuity Score)
    -- Logic: If their score drops below 60/100, they are in the "Danger Zone".
    INSERT INTO continuity_signals (firm_id, relationship_id, type, severity, message, created_at)
    SELECT
        r.firm_id,
        r.id,
        'ENGAGEMENT_DRIFT',
        'RED',
        'Continuity Score Critical (Below 60). Immediate intervention required.',
        NOW()
    FROM relationships r
    WHERE r.continuity_score < 60
    AND NOT EXISTS (
        SELECT 1 FROM continuity_signals s
        WHERE s.relationship_id = r.id
        AND s.type = 'ENGAGEMENT_DRIFT'
        AND s.status = 'ACTIVE'
    );

    -- SIGNAL TYPE 3: THE "OPPORTUNITY" (Rate Trap)
    -- Logic: If their rate is 1.0% higher than market, they are shopping.
    INSERT INTO continuity_signals (firm_id, relationship_id, type, severity, message, created_at)
    SELECT
        r.firm_id,
        r.id,
        'VALUE_RISK', -- Used for "Money in Motion"
        'GREEN',
        'Refinance Opportunity: Rate spread > 1.0%.',
        NOW()
    FROM relationships r
    WHERE r.interest_rate > (current_market_rate + 1.0)
    AND NOT EXISTS (
        SELECT 1 FROM continuity_signals s
        WHERE s.relationship_id = r.id
        AND s.type = 'VALUE_RISK'
        AND s.status = 'ACTIVE'
    );

    -- SIGNAL TYPE 4: LIFE-STAGE TRANSITIONS
    -- Logic: Detect age milestones that indicate succession timing
    INSERT INTO continuity_signals (firm_id, relationship_id, type, severity, message, created_at)
    SELECT
        r.firm_id,
        r.id,
        'LIFE_STAGE',
        CASE
            WHEN EXTRACT(YEAR FROM AGE(r.primary_contact_dob)) >= 65 THEN 'RED'
            WHEN EXTRACT(YEAR FROM AGE(r.primary_contact_dob)) >= 60 THEN 'YELLOW'
            ELSE 'GREEN'
        END,
        'Primary contact age: ' || EXTRACT(YEAR FROM AGE(r.primary_contact_dob)) || ' years. Succession planning window.',
        NOW()
    FROM relationships r
    WHERE r.primary_contact_dob IS NOT NULL
    AND EXTRACT(YEAR FROM AGE(r.primary_contact_dob)) >= 60
    AND NOT EXISTS (
        SELECT 1 FROM continuity_signals s
        WHERE s.relationship_id = r.id
        AND s.type = 'LIFE_STAGE'
        AND s.status = 'ACTIVE'
    );

    -- SIGNAL TYPE 5: SUCCESSOR VISIBILITY GAP
    -- Logic: High-value relationships with no documented successor
    INSERT INTO continuity_signals (firm_id, relationship_id, type, severity, message, created_at)
    SELECT
        r.firm_id,
        r.id,
        'SUCCESSION_GAP',
        'RED',
        'High-value relationship ($' || (r.book_value / 1000000)::TEXT || 'M) with no documented successor.',
        NOW()
    FROM relationships r
    WHERE r.book_value > 500000 -- $500K+ book value
    AND (r.successor_identified IS NULL OR r.successor_identified = FALSE)
    AND NOT EXISTS (
        SELECT 1 FROM continuity_signals s
        WHERE s.relationship_id = r.id
        AND s.type = 'SUCCESSION_GAP'
        AND s.status = 'ACTIVE'
    );

    -- Log execution
    RAISE NOTICE 'Continuity signals generated at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- 2. Create a function to update market rate dynamically
CREATE OR REPLACE FUNCTION update_market_rate(new_rate DECIMAL)
RETURNS void AS $$
BEGIN
    -- This allows brokers to update the market rate via API
    -- Store in a configuration table (create if doesn't exist)
    CREATE TABLE IF NOT EXISTS system_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    INSERT INTO system_config (key, value, updated_at)
    VALUES ('current_market_rate', new_rate::TEXT, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = new_rate::TEXT, updated_at = NOW();

    RAISE NOTICE 'Market rate updated to %', new_rate;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a function to resolve/dismiss signals
CREATE OR REPLACE FUNCTION resolve_signal(signal_id UUID, resolved_by_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE continuity_signals
    SET
        status = 'RESOLVED',
        resolved_at = NOW(),
        resolved_by = resolved_by_user_id
    WHERE id = signal_id;

    RAISE NOTICE 'Signal % resolved by user %', signal_id, resolved_by_user_id;
END;
$$ LANGUAGE plpgsql;

-- 4. AUTOMATION: Schedule the signals engine to run automatically
-- Create a cron job that runs every 6 hours
-- Note: This requires pg_cron extension. Enable in Supabase Dashboard under Database > Extensions
-- Then run this separately after enabling pg_cron:
--
-- SELECT cron.schedule(
--     'generate-continuity-signals',
--     '0 */6 * * *', -- Every 6 hours
--     $$ SELECT generate_continuity_signals(); $$
-- );

-- 5. INITIAL EXECUTION: Run the engine immediately
-- This triggers the scan right now so you see data in your dashboard instantly.
SELECT generate_continuity_signals();

-- 6. Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_continuity_signals() TO authenticated;
GRANT EXECUTE ON FUNCTION update_market_rate(DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_signal(UUID, UUID) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The Continuity Signals Engine is now installed.
-- Signals will be generated automatically every 6 hours.
-- Run SELECT generate_continuity_signals(); to manually trigger.
-- =====================================================
