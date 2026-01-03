-- =====================================================
-- SAMPLE RELATIONSHIP DATA FOR TESTING
-- =====================================================
-- This script inserts realistic sample data for West Approved Lending
-- to test the Continuity Signals Engine and dashboard functionality.
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
    last_interaction_date,
    last_interaction_type,
    avg_loan_size,
    annual_revenue,
    book_value,
    interest_rate,
    primary_contact_dob,
    successor_identified,
    is_founder_dependent,
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
    NOW() - INTERVAL '120 days', -- Contact gap > 90 days
    'EMAIL',
    320000,
    12800,
    1600000,
    7.15,
    '1968-11-22'::date,
    false,
    false,
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
    45, -- Below 60, critical
    NOW() - INTERVAL '45 days',
    'CALL',
    280000,
    11200,
    1400000,
    7.75,
    '1972-08-30'::date,
    false,
    true,
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
    8.25, -- 8.25% vs 6.5% market = 1.75% spread (opportunity)
    '1970-05-12'::date,
    true,
    false,
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
    '1958-12-03'::date, -- Age 65+, succession planning needed
    false,
    false,
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
    3750000, -- $3.75M book value > $500K threshold
    6.95,
    '1965-07-18'::date,
    false, -- No successor identified
    true,
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
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert some sample interactions for the relationships
INSERT INTO interactions (
    id,
    relationship_id,
    type,
    direction,
    notes,
    value_event_weight,
    created_at
) VALUES
-- Recent meeting with Dr. Mitchell
(
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'MEETING',
    'OUTBOUND',
    'Quarterly review meeting. Discussed refinance options and portfolio performance.',
    0.8,
    NOW() - INTERVAL '7 days'
),
-- Email to Robert Chen (but it's been 120 days, creating contact gap)
(
    '660e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'EMAIL',
    'OUTBOUND',
    'Sent quarterly newsletter and market update.',
    0.2,
    NOW() - INTERVAL '120 days'
),
-- Call with Jennifer Walsh
(
    '660e8400-e29b-41d4-a716-446655440003'::uuid,
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'CALL',
    'OUTBOUND',
    'Follow-up call regarding property investment opportunities.',
    0.6,
    NOW() - INTERVAL '45 days'
),
-- Meeting with Michael Rodriguez
(
    '660e8400-e29b-41d4-a716-446655440004'::uuid,
    '550e8400-e29b-41d4-a716-446655440004'::uuid,
    'MEETING',
    'OUTBOUND',
    'Construction loan discussion and rate review.',
    0.7,
    NOW() - INTERVAL '21 days'
),
-- Email to Patricia Johnson
(
    '660e8400-e29b-41d4-a716-446655440005'::uuid,
    '550e8400-e29b-41d4-a716-446655440005'::uuid,
    'EMAIL',
    'OUTBOUND',
    'Annual portfolio review and succession planning discussion.',
    0.5,
    NOW() - INTERVAL '60 days'
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SAMPLE DATA INSERTED
-- =====================================================
-- 10 sample relationships created with various scenarios:
-- - Contact gaps, low scores, refinance opportunities
-- - Life stage transitions, succession gaps
-- - Different continuity grades and interaction patterns
--
-- Next: Run the signals engine to generate alerts
-- =====================================================