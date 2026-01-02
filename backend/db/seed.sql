-- Primus OS Business Edition - Seed Data
-- Test data for development and demo

-- Clean existing data (development only!)
TRUNCATE TABLE governance_events CASCADE;
TRUNCATE TABLE field_mappings CASCADE;
TRUNCATE TABLE ledger_sources CASCADE;
TRUNCATE TABLE outreach_drafts CASCADE;
TRUNCATE TABLE governance_batches CASCADE;
TRUNCATE TABLE continuity_snapshots CASCADE;
TRUNCATE TABLE interactions CASCADE;
TRUNCATE TABLE relationships CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE firms CASCADE;

-- Insert test firm
INSERT INTO firms (id, name, governance_mode_enabled, created_at, updated_at)
VALUES ('firm_1', 'G2R Continuity Partners', true, NOW(), NOW());

-- Insert test users
INSERT INTO users (id, firm_id, email, role, created_at, updated_at)
VALUES
  ('user_1', 'firm_1', 'admin@g2r.com', 'ADMIN', NOW(), NOW()),
  ('user_2', 'firm_1', 'producer@g2r.com', 'USER', NOW(), NOW());

-- Insert sample relationships
INSERT INTO relationships (
  id, external_id, display_name, role_or_segment, status, value_outlook,
  continuity_grade, continuity_score,
  last_interaction_at, last_interaction_type,
  firm_id, created_at, updated_at
) VALUES
  (
    'rel_1', NULL, 'J. Alvarez', 'Tier A Relationship', 'STRONG',
    'Renewal pipeline – tier A book', 'AAA', 91,
    NOW() - INTERVAL '12 days', 'EMAIL',
    'firm_1', NOW(), NOW()
  ),
  (
    'rel_2', NULL, 'M. Lewis', 'High-referral segment', 'STABLE',
    'Refi-eligible – rate review', 'AA', 84,
    NOW() - INTERVAL '32 days', 'CALL',
    'firm_1', NOW(), NOW()
  ),
  (
    'rel_3', NULL, 'R. Khan', 'Dormant opportunity', 'REVIEW',
    'Dormant – reactivation potential', 'BBB', 67,
    NOW() - INTERVAL '98 days', 'EMAIL',
    'firm_1', NOW(), NOW()
  ),
  (
    'rel_4', NULL, 'S. Thompson', 'Aging book', 'PENDING',
    'Aging portfolio – discuss succession', 'BB', 58,
    NOW() - INTERVAL '190 days', 'MEETING',
    'firm_1', NOW(), NOW()
  ),
  (
    'rel_5', NULL, 'P. Martinez', 'Mid-tier producer', 'STABLE',
    'Quarterly service review scheduled', 'A', 72,
    NOW() - INTERVAL '45 days', 'EMAIL',
    'firm_1', NOW(), NOW()
  ),
  (
    'rel_6', NULL, 'K. Washington', 'Enterprise segment', 'STRONG',
    'Multi-location renewal opportunity', 'AAA', 94,
    NOW() - INTERVAL '8 days', 'MEETING',
    'firm_1', NOW(), NOW()
  );

-- Insert sample interactions for rel_1 (J. Alvarez)
INSERT INTO interactions (
  id, relationship_id, type, direction, occurred_at,
  value_event_weight, notes, source_system, created_at
) VALUES
  (gen_random_uuid(), 'rel_1', 'EMAIL', 'OUTBOUND', NOW() - INTERVAL '12 days',
   2, 'Renewal pipeline check-in', 'System', NOW()),
  (gen_random_uuid(), 'rel_1', 'CALL', 'INBOUND', NOW() - INTERVAL '45 days',
   3, 'Client requested rate review', 'System', NOW()),
  (gen_random_uuid(), 'rel_1', 'MEETING', 'OUTBOUND', NOW() - INTERVAL '90 days',
   4, 'Quarterly business review', 'System', NOW()),
  (gen_random_uuid(), 'rel_1', 'EMAIL', 'OUTBOUND', NOW() - INTERVAL '120 days',
   1, 'Market update newsletter', 'System', NOW());

-- Insert sample interactions for rel_2 (M. Lewis)
INSERT INTO interactions (
  id, relationship_id, type, direction, occurred_at,
  value_event_weight, notes, source_system, created_at
) VALUES
  (gen_random_uuid(), 'rel_2', 'CALL', 'OUTBOUND', NOW() - INTERVAL '32 days',
   3, 'Rate environment discussion', 'System', NOW()),
  (gen_random_uuid(), 'rel_2', 'EMAIL', 'INBOUND', NOW() - INTERVAL '60 days',
   2, 'Referral submitted', 'System', NOW()),
  (gen_random_uuid(), 'rel_2', 'MEETING', 'OUTBOUND', NOW() - INTERVAL '150 days',
   4, 'Annual planning session', 'System', NOW());

-- Insert sample interactions for rel_3 (R. Khan)
INSERT INTO interactions (
  id, relationship_id, type, direction, occurred_at,
  value_event_weight, notes, source_system, created_at
) VALUES
  (gen_random_uuid(), 'rel_3', 'EMAIL', 'OUTBOUND', NOW() - INTERVAL '98 days',
   1, 'Quarterly check-in (no response)', 'System', NOW()),
  (gen_random_uuid(), 'rel_3', 'CALL', 'OUTBOUND', NOW() - INTERVAL '200 days',
   2, 'Left voicemail', 'System', NOW());

-- Insert sample interactions for rel_4 (S. Thompson)
INSERT INTO interactions (
  id, relationship_id, type, direction, occurred_at,
  value_event_weight, notes, source_system, created_at
) VALUES
  (gen_random_uuid(), 'rel_4', 'MEETING', 'OUTBOUND', NOW() - INTERVAL '190 days',
   3, 'Annual portfolio review', 'System', NOW()),
  (gen_random_uuid(), 'rel_4', 'EMAIL', 'OUTBOUND', NOW() - INTERVAL '280 days',
   1, 'Holiday greeting', 'System', NOW());

-- Insert sample continuity snapshots
INSERT INTO continuity_snapshots (
  id, relationship_id, score, grade, calculated_at,
  reason_summary, created_at
) VALUES
  (gen_random_uuid(), 'rel_1', 91, 'AAA', NOW() - INTERVAL '30 days',
   'Score 91/100 (AAA). High stability with consistent engagement.', NOW()),
  (gen_random_uuid(), 'rel_2', 84, 'AA', NOW() - INTERVAL '30 days',
   'Score 84/100 (AA). Strong relationship with regular touchpoints.', NOW()),
  (gen_random_uuid(), 'rel_3', 67, 'BBB', NOW() - INTERVAL '30 days',
   'Score 67/100 (BBB). Moderate engagement, monitor for improvement.', NOW());

-- Insert sample governance batch
INSERT INTO governance_batches (
  id, firm_id, label, status, created_by, created_at, updated_at
) VALUES
  ('batch_1', 'firm_1', 'Q1 2025 Renewal Outreach', 'OPEN', 'user_1', NOW(), NOW());

-- Insert sample outreach draft
INSERT INTO outreach_drafts (
  id, relationship_id, firm_id, body, subject, status,
  prepared_by, governance_batch_id, created_at, updated_at
) VALUES
  (
    'draft_1', 'rel_1', 'firm_1',
    'Dear J. Alvarez,

As we begin Q1 2025, I wanted to reach out regarding your renewal pipeline.

Our records show strong continuity in our relationship, and I''d like to schedule a brief call to discuss your upcoming needs and ensure we''re aligned on service delivery.

Would next week work for a 15-minute conversation?

Best regards,
G2R Team',
    'Q1 Service Continuity Update',
    'IN_BATCH', 'user_2', 'batch_1', NOW(), NOW()
  );

-- Insert sample governance events
INSERT INTO governance_events (
  id, firm_id, entity_type, entity_id, event_type,
  performed_by, payload, occurred_at
) VALUES
  (gen_random_uuid(), 'firm_1', 'BATCH', 'batch_1', 'BATCH_CREATED',
   'user_1', '{"label":"Q1 2025 Renewal Outreach"}', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), 'firm_1', 'OUTREACH_DRAFT', 'draft_1', 'DRAFT_PREPARED',
   'user_2', '{"relationshipId":"rel_1","subject":"Q1 Service Continuity Update"}', NOW() - INTERVAL '1 hour'),
  (gen_random_uuid(), 'firm_1', 'OUTREACH_DRAFT', 'draft_1', 'DRAFT_ADDED_TO_BATCH',
   'user_2', '{"batchId":"batch_1"}', NOW() - INTERVAL '30 minutes');

-- Verify data
SELECT 'Firms' as table_name, COUNT(*) as count FROM firms
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Relationships', COUNT(*) FROM relationships
UNION ALL
SELECT 'Interactions', COUNT(*) FROM interactions
UNION ALL
SELECT 'Governance Batches', COUNT(*) FROM governance_batches
UNION ALL
SELECT 'Outreach Drafts', COUNT(*) FROM outreach_drafts
UNION ALL
SELECT 'Governance Events', COUNT(*) FROM governance_events;

SELECT 'Seed complete!' as status;
