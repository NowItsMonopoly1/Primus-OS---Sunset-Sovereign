-- =====================================================
-- DEPLOYMENT SCRIPT: Apply All Migrations (CORRECTED)
-- =====================================================
-- Run this script in Supabase SQL Editor to deploy:
-- 1. Continuity Signals Engine
-- 2. Sample Relationship Data
-- =====================================================

-- =====================================================
-- CONTINUITY SIGNALS ENGINE (CORRECTED)
-- =====================================================

-- First, add missing columns to relationships table
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS book_value NUMERIC;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS interest_rate NUMERIC;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS primary_contact_dob DATE;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS successor_identified BOOLEAN DEFAULT false;

-- Create system_config table for dynamic settings
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value NUMERIC NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default market rate
INSERT INTO system_config (key, value) VALUES ('current_market_rate', 6.5)
ON CONFLICT (key) DO NOTHING;

-- Add unique index to prevent duplicate active signals
CREATE UNIQUE INDEX IF NOT EXISTS ux_continuity_signals_active_type_per_relationship
ON continuity_signals (relationship_id, signal_type)
WHERE resolved_at IS NULL;

-- 1. Create the Master Signal Generation Function (CORRECTED)
CREATE OR REPLACE FUNCTION generate_continuity_signals()
RETURNS void AS $$
DECLARE
    current_market_rate NUMERIC := 6.5;
BEGIN
    -- Read dynamic market rate from config
    SELECT value INTO current_market_rate 
    FROM system_config 
    WHERE key = 'current_market_rate' 
    LIMIT 1;
    
    -- If no config, use default
    current_market_rate := COALESCE(current_market_rate, 6.5);

    -- SIGNAL TYPE 1: THE "GHOST" (Contact Gap > 90 Days)
    INSERT INTO continuity_signals (firm_id, relationship_id, signal_type, severity, title, description, triggered_at, created_at)
    SELECT
        r.firm_id,
        r.id,
        'CONTACT_GAP',
        'YELLOW'::signal_severity,
        'Contact Gap > 90 Days',
        'No interaction detected in 90+ days. Relationship drifting.',
        NOW(),
        NOW()
    FROM relationships r
    WHERE r.last_interaction_at < (NOW() - INTERVAL '90 days')
    AND NOT EXISTS (
        SELECT 1 FROM continuity_signals s
        WHERE s.relationship_id = r.id
        AND s.signal_type = 'CONTACT_GAP'
        AND s.resolved_at IS NULL
    );

    -- SIGNAL TYPE 2: THE "AT RISK" (Low Continuity Score)
    INSERT INTO continuity_signals (firm_id, relationship_id, signal_type, severity, title, description, triggered_at, created_at)
    SELECT
        r.firm_id,
        r.id,
        'ENGAGEMENT_DRIFT',
        'RED'::signal_severity,
        'Critical Continuity Score',
        'Continuity Score Critical (Below 60). Immediate intervention required.',
        NOW(),
        NOW()
    FROM relationships r
    WHERE r.continuity_score < 60
    AND NOT EXISTS (
        SELECT 1 FROM continuity_signals s
        WHERE s.relationship_id = r.id
        AND s.signal_type = 'ENGAGEMENT_DRIFT'
        AND s.resolved_at IS NULL
    );

    -- SIGNAL TYPE 3: THE "OPPORTUNITY" (Rate Trap)
    INSERT INTO continuity_signals (firm_id, relationship_id, signal_type, severity, title, description, triggered_at, created_at)
    SELECT
        r.firm_id,
        r.id,
        'VALUE_RISK',
        'GREEN'::signal_severity,
        'Refinance Opportunity',
        'Refinance Opportunity: Rate spread > 1.0%.',
        NOW(),
        NOW()
    FROM relationships r
    WHERE r.interest_rate > (current_market_rate + 1.0)
    AND NOT EXISTS (
        SELECT 1 FROM continuity_signals s
        WHERE s.relationship_id = r.id
        AND s.signal_type = 'VALUE_RISK'
        AND s.resolved_at IS NULL
    );

    -- SIGNAL TYPE 4: LIFE-STAGE TRANSITIONS
    INSERT INTO continuity_signals (firm_id, relationship_id, signal_type, severity, title, description, triggered_at, created_at)
    SELECT
        r.firm_id,
        r.id,
        'LIFE_STAGE',
        CASE
            WHEN EXTRACT(YEAR FROM AGE(r.primary_contact_dob)) >= 65 THEN 'RED'::signal_severity
            WHEN EXTRACT(YEAR FROM AGE(r.primary_contact_dob)) >= 60 THEN 'YELLOW'::signal_severity
            ELSE 'GREEN'::signal_severity
        END,
        'Life Stage Transition',
        'Primary contact age: ' || EXTRACT(YEAR FROM AGE(r.primary_contact_dob)) || ' years. Succession planning window.',
        NOW(),
        NOW()
    FROM relationships r
    WHERE r.primary_contact_dob IS NOT NULL
    AND EXTRACT(YEAR FROM AGE(r.primary_contact_dob)) >= 60
    AND NOT EXISTS (
        SELECT 1 FROM continuity_signals s
        WHERE s.relationship_id = r.id
        AND s.signal_type = 'LIFE_STAGE'
        AND s.resolved_at IS NULL
    );

    -- SIGNAL TYPE 5: SUCCESSOR VISIBILITY GAP
    INSERT INTO continuity_signals (firm_id, relationship_id, signal_type, severity, title, description, triggered_at, created_at)
    SELECT
        r.firm_id,
        r.id,
        'SUCCESSION_GAP',
        'RED'::signal_severity,
        'Succession Gap Identified',
        'High-value relationship ($' || (r.book_value / 1000000)::TEXT || 'M) with no documented successor.',
        NOW(),
        NOW()
    FROM relationships r
    WHERE r.book_value > 500000
    AND (r.successor_identified IS NULL OR r.successor_identified = FALSE)
    AND NOT EXISTS (
        SELECT 1 FROM continuity_signals s
        WHERE s.relationship_id = r.id
        AND s.signal_type = 'SUCCESSION_GAP'
        AND s.resolved_at IS NULL
    );

    -- Log execution
    RAISE NOTICE 'Continuity signals generated at % with market rate %', NOW(), current_market_rate;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a function to update market rate dynamically (CORRECTED)
CREATE OR REPLACE FUNCTION update_market_rate(new_rate NUMERIC)
RETURNS void AS $$
BEGIN
    INSERT INTO system_config (key, value, updated_at)
    VALUES ('current_market_rate', new_rate, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = new_rate, updated_at = NOW();

    RAISE NOTICE 'Market rate updated to %', new_rate;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a function to resolve/dismiss signals (CORRECTED)
CREATE OR REPLACE FUNCTION resolve_signal(signal_id UUID, resolved_by_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE continuity_signals
    SET
        resolved_at = NOW(),
        resolved_by = resolved_by_user_id,
        updated_at = NOW()
    WHERE id = signal_id;

    RAISE NOTICE 'Signal % resolved by user %', signal_id, resolved_by_user_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_continuity_signals() TO authenticated;
GRANT EXECUTE ON FUNCTION update_market_rate(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_signal(UUID, UUID) TO authenticated;

-- =====================================================
-- SAMPLE RELATIONSHIP DATA FOR TESTING
-- =====================================================

-- Insert sample relationships for WAL firm
INSERT INTO relationships (
    id,
    firm_id,
    display_name,
    role_or_segment,
    status,
    continuity_grade,
    continuity_score,
    last_interaction_at,
    last_interaction_type,
    avg_loan_size,
    annual_revenue,
    book_value,
    interest_rate,
    primary_contact_dob,
    successor_identified,
    is_founder_dependent,
    last_contact_days_ago,
    created_at,
    updated_at
) VALUES
-- HIGH PRIORITY: Recent contact, good scores
(
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Dr. Sarah Mitchell',
    'Medical Professional',
    'STRONG',
    'AAA',
    95,
    NOW() - INTERVAL '7 days',
    'MEETING',
    450000,
    18000,
    2250000,
    6.25,
    '1975-03-15'::date,
    true,
    false,
    7,
    NOW(),
    NOW()
),
-- MEDIUM PRIORITY: Contact gap (Ghost signal)
(
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Robert Chen',
    'Business Owner',
    'STABLE',
    'A',
    78,
    NOW() - INTERVAL '120 days',
    'EMAIL',
    320000,
    12800,
    1600000,
    7.15,
    '1968-11-22'::date,
    false,
    false,
    120,
    NOW(),
    NOW()
),
-- HIGH RISK: Low continuity score (At Risk signal)
(
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Jennifer Walsh',
    'Real Estate Investor',
    'REVIEW',
    'B',
    45,
    NOW() - INTERVAL '45 days',
    'CALL',
    280000,
    11200,
    1400000,
    7.75,
    '1972-08-30'::date,
    false,
    true,
    45,
    NOW(),
    NOW()
),
-- OPPORTUNITY: High rate (Value Risk signal)
(
    '550e8400-e29b-41d4-a716-446655440004'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Michael Rodriguez',
    'Construction Contractor',
    'STRONG',
    'AA',
    88,
    NOW() - INTERVAL '21 days',
    'MEETING',
    380000,
    15200,
    1900000,
    8.25,
    '1970-05-12'::date,
    true,
    false,
    21,
    NOW(),
    NOW()
),
-- LIFE STAGE: Age 65+ (Life Stage signal)
(
    '550e8400-e29b-41d4-a716-446655440005'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Patricia Johnson',
    'Retired Executive',
    'STABLE',
    'BBB',
    72,
    NOW() - INTERVAL '60 days',
    'EMAIL',
    520000,
    20800,
    2600000,
    6.85,
    '1958-12-03'::date,
    false,
    false,
    60,
    NOW(),
    NOW()
),
-- SUCCESSION GAP: High value, no successor (Succession Gap signal)
(
    '550e8400-e29b-41d4-a716-446655440006'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'David Thompson',
    'Manufacturing Owner',
    'STRONG',
    'AA',
    85,
    NOW() - INTERVAL '14 days',
    'MEETING',
    750000,
    30000,
    3750000,
    6.95,
    '1965-07-18'::date,
    false,
    true,
    14,
    NOW(),
    NOW()
),
-- RECENT ACTIVITY: Just contacted
(
    '550e8400-e29b-41d4-a716-446655440007'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Lisa Park',
    'Technology Entrepreneur',
    'STRONG',
    'AAA',
    92,
    NOW() - INTERVAL '2 days',
    'CALL',
    410000,
    16400,
    2050000,
    6.15,
    '1980-01-25'::date,
    true,
    false,
    2,
    NOW(),
    NOW()
),
-- STABLE CLIENT: Good engagement
(
    '550e8400-e29b-41d4-a716-446655440008'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'James Wilson',
    'Restaurant Owner',
    'STABLE',
    'A',
    82,
    NOW() - INTERVAL '30 days',
    'MEETING',
    290000,
    11600,
    1450000,
    7.45,
    '1973-09-14'::date,
    true,
    false,
    30,
    NOW(),
    NOW()
),
-- PENDING REVIEW: New relationship
(
    '550e8400-e29b-41d4-a716-446655440009'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Maria Garcia',
    'Healthcare Administrator',
    'PENDING',
    'B',
    65,
    NOW() - INTERVAL '5 days',
    'EMAIL',
    350000,
    14000,
    1750000,
    7.05,
    '1977-04-08'::date,
    false,
    false,
    5,
    NOW(),
    NOW()
),
-- INACTIVE: Needs attention
(
    '550e8400-e29b-41d4-a716-446655440010'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Thomas Brown',
    'Retail Business Owner',
    'INACTIVE',
    'BB',
    58,
    NOW() - INTERVAL '180 days',
    'NOTE',
    220000,
    8800,
    1100000,
    7.85,
    '1962-06-20'::date,
    false,
    true,
    180,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert some sample interactions (CORRECTED - proper column order)
INSERT INTO interactions (
    id,
    relationship_id,
    type,
    direction,
    occurred_at,
    value_event_weight,
    notes,
    source_system,
    created_at
) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'MEETING',
    'OUTBOUND',
    NOW() - INTERVAL '7 days',
    1,
    'Quarterly review meeting. Discussed refinance options and portfolio performance.',
    'PRIMUS_OS',
    NOW() - INTERVAL '7 days'
),
(
    '660e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'EMAIL',
    'OUTBOUND',
    NOW() - INTERVAL '120 days',
    0,
    'Sent quarterly newsletter and market update.',
    'PRIMUS_OS',
    NOW() - INTERVAL '120 days'
),
(
    '660e8400-e29b-41d4-a716-446655440003'::uuid,
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'CALL',
    'OUTBOUND',
    NOW() - INTERVAL '45 days',
    1,
    'Follow-up call regarding property investment opportunities.',
    'PRIMUS_OS',
    NOW() - INTERVAL '45 days'
),
(
    '660e8400-e29b-41d4-a716-446655440004'::uuid,
    '550e8400-e29b-41d4-a716-446655440004'::uuid,
    'MEETING',
    'OUTBOUND',
    NOW() - INTERVAL '21 days',
    1,
    'Construction loan discussion and rate review.',
    'PRIMUS_OS',
    NOW() - INTERVAL '21 days'
),
(
    '660e8400-e29b-41d4-a716-446655440005'::uuid,
    '550e8400-e29b-41d4-a716-446655440005'::uuid,
    'EMAIL',
    'OUTBOUND',
    NOW() - INTERVAL '60 days',
    1,
    'Annual portfolio review and succession planning discussion.',
    'PRIMUS_OS',
    NOW() - INTERVAL '60 days'
)
ON CONFLICT (id) DO NOTHING;

-- 5. INITIAL EXECUTION: Run the engine immediately
SELECT generate_continuity_signals();

-- =====================================================
-- DEPLOYMENT COMPLETE
-- =====================================================
-- Signals engine installed and sample data loaded.
-- Run SELECT generate_continuity_signals(); to refresh signals.
-- =====================================================