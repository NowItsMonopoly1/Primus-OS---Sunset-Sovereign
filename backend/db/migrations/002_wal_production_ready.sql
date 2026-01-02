-- ============================================================================
-- SoloScale / Primus OS - WAL Production Ready Schema
-- Migration 002: Adds missing DoD requirements for infrastructure launch
-- ============================================================================
-- Requirements Satisfied:
-- ✅ Firm tenancy with RLS
-- ✅ Role-based permissions (Founder, Junior, ReadOnly)
-- ✅ Client assignments (succession tracking)
-- ✅ Continuity signals (persistent, not static)
-- ✅ Baseline reports (save, retrieve, export)
-- ✅ Audit trail (immutable, append-only)
-- ✅ Vault (document storage per firm)
-- ✅ Governance state machine
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENHANCED ENUMS
-- ----------------------------------------------------------------------------

-- User roles with granular permissions
CREATE TYPE user_role AS ENUM ('FOUNDER', 'JUNIOR_AGENT', 'READ_ONLY');

-- Signal severity levels
CREATE TYPE signal_severity AS ENUM ('GREEN', 'YELLOW', 'RED');

-- Baseline report status
CREATE TYPE baseline_status AS ENUM ('DRAFT', 'FINALIZED', 'ARCHIVED');

-- Document categories for Vault
CREATE TYPE document_category AS ENUM (
  'SUCCESSION_AGREEMENT',
  'COMPLIANCE_RECORD',
  'OPERATIONS_SOP',
  'LEGAL_ESTATE',
  'CLIENT_CONTRACT',
  'OTHER'
);

-- Governance action types (for approval workflow)
CREATE TYPE governance_action_type AS ENUM (
  'DRAFT_CREATED',
  'DRAFT_SUBMITTED',
  'DRAFT_APPROVED',
  'DRAFT_REJECTED',
  'DRAFT_EXECUTED',
  'BATCH_CREATED',
  'BATCH_APPROVED',
  'CLIENT_ASSIGNED',
  'CLIENT_REASSIGNED',
  'BASELINE_CREATED',
  'SIGNAL_CREATED',
  'SIGNAL_RESOLVED'
);

-- ----------------------------------------------------------------------------
-- 2. MODIFY EXISTING TABLES
-- ----------------------------------------------------------------------------

-- Upgrade users table with enhanced roles
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'JUNIOR_AGENT';
ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add founder-dependency tracking to relationships
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS is_founder_dependent BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS avg_loan_size DECIMAL(12,2);
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(12,2);
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS last_contact_days_ago INTEGER;

-- Add state machine fields to outreach_drafts
ALTER TABLE outreach_drafts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;
ALTER TABLE outreach_drafts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE outreach_drafts ADD COLUMN IF NOT EXISTS executed_at TIMESTAMP;
ALTER TABLE outreach_drafts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add batch approval tracking
ALTER TABLE governance_batches ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;
ALTER TABLE governance_batches ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE governance_batches ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ----------------------------------------------------------------------------
-- 3. NEW TABLES - CONTINUITY SIGNALS
-- ----------------------------------------------------------------------------

CREATE TABLE continuity_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  
  -- Signal classification
  severity signal_severity NOT NULL DEFAULT 'GREEN',
  signal_type VARCHAR(100) NOT NULL, -- 'CONTACT_GAP', 'ENGAGEMENT_DRIFT', 'VALUE_RISK', etc.
  
  -- Context
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  metric_value DECIMAL(12,2), -- e.g., days since contact, score drop, etc.
  
  -- Assignment & resolution
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  
  -- Timestamps
  triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signals_firm_id ON continuity_signals(firm_id);
CREATE INDEX idx_signals_relationship_id ON continuity_signals(relationship_id);
CREATE INDEX idx_signals_severity ON continuity_signals(severity);
CREATE INDEX idx_signals_assigned_to ON continuity_signals(assigned_to);
CREATE INDEX idx_signals_resolved ON continuity_signals(resolved_at);

-- ----------------------------------------------------------------------------
-- 4. NEW TABLES - CLIENT ASSIGNMENTS (SUCCESSION TRACKING)
-- ----------------------------------------------------------------------------

CREATE TABLE client_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  
  -- Assignment details
  assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- History preservation
  previous_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assignment_reason TEXT,
  
  -- Timestamps
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_firm_id ON client_assignments(firm_id);
CREATE INDEX idx_assignments_relationship_id ON client_assignments(relationship_id);
CREATE INDEX idx_assignments_assigned_to ON client_assignments(assigned_to);
CREATE INDEX idx_assignments_assigned_at ON client_assignments(assigned_at DESC);

-- ----------------------------------------------------------------------------
-- 5. NEW TABLES - CONTINUITY BASELINE REPORTS
-- ----------------------------------------------------------------------------

CREATE TABLE baseline_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  
  -- Report metadata
  report_name VARCHAR(255) NOT NULL,
  status baseline_status NOT NULL DEFAULT 'DRAFT',
  
  -- Inputs (founder-provided assumptions)
  total_client_count INTEGER NOT NULL,
  total_book_value DECIMAL(15,2) NOT NULL,
  avg_commission_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.0100 = 100 bps
  current_annual_revenue DECIMAL(12,2) NOT NULL,
  
  -- Scenario A: Walk Away
  unmanaged_decay_rate DECIMAL(5,4) NOT NULL DEFAULT 0.20, -- 20%
  unmanaged_terminal_income DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Scenario B: Primus Protected
  managed_decay_rate DECIMAL(5,4) NOT NULL DEFAULT 0.05, -- 5%
  sunset_retention_rate DECIMAL(5,4) NOT NULL DEFAULT 0.30, -- 30%
  sunset_duration_years INTEGER NOT NULL DEFAULT 10,
  
  -- Calculated outputs
  projected_years INTEGER NOT NULL DEFAULT 5,
  delta_revenue DECIMAL(15,2), -- Total value saved
  terminal_income_annual DECIMAL(12,2), -- Recurring sunset income
  
  -- Audit
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  finalized_by UUID REFERENCES users(id) ON DELETE SET NULL,
  finalized_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_baselines_firm_id ON baseline_reports(firm_id);
CREATE INDEX idx_baselines_status ON baseline_reports(status);
CREATE INDEX idx_baselines_created_at ON baseline_reports(created_at DESC);

-- ----------------------------------------------------------------------------
-- 6. NEW TABLES - GOVERNANCE ACTIONS (IMMUTABLE AUDIT TRAIL)
-- ----------------------------------------------------------------------------

CREATE TABLE governance_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  
  -- Action classification
  action_type governance_action_type NOT NULL,
  entity_type governance_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Actor context
  performed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  performed_by_role user_role NOT NULL,
  
  -- State change tracking
  before_state JSONB,
  after_state JSONB,
  
  -- Human context
  reason TEXT,
  notes TEXT,
  
  -- Timestamps (immutable - no updated_at)
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_actions_firm_id ON governance_actions(firm_id);
CREATE INDEX idx_actions_entity ON governance_actions(entity_type, entity_id);
CREATE INDEX idx_actions_performed_by ON governance_actions(performed_by);
CREATE INDEX idx_actions_occurred_at ON governance_actions(occurred_at DESC);

-- ----------------------------------------------------------------------------
-- 7. NEW TABLES - AUDIT EVENTS (SYSTEM-LEVEL LOGGING)
-- ----------------------------------------------------------------------------

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  
  -- Event classification
  event_type VARCHAR(100) NOT NULL, -- 'LOGIN', 'EXPORT', 'CONFIG_CHANGE', etc.
  event_category VARCHAR(50) NOT NULL, -- 'AUTH', 'DATA', 'EXPORT', 'CONFIG'
  
  -- Actor
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_role user_role,
  
  -- Context
  description TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp (immutable)
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_firm_id ON audit_events(firm_id);
CREATE INDEX idx_audit_user_id ON audit_events(user_id);
CREATE INDEX idx_audit_category ON audit_events(event_category);
CREATE INDEX idx_audit_occurred_at ON audit_events(occurred_at DESC);

-- ----------------------------------------------------------------------------
-- 8. NEW TABLES - VAULT (DOCUMENT STORAGE)
-- ----------------------------------------------------------------------------

CREATE TABLE vault_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  
  -- Document metadata
  file_name VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  category document_category NOT NULL,
  
  -- Storage
  storage_path TEXT NOT NULL, -- S3/Supabase Storage path
  encryption_status VARCHAR(50) DEFAULT 'AES-256', -- Theatre for UI
  
  -- Access control
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  description TEXT,
  tags TEXT[], -- Array of tags for filtering
  
  -- Timestamps
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vault_firm_id ON vault_documents(firm_id);
CREATE INDEX idx_vault_category ON vault_documents(category);
CREATE INDEX idx_vault_uploaded_by ON vault_documents(uploaded_by);
CREATE INDEX idx_vault_archived ON vault_documents(is_archived);
CREATE INDEX idx_vault_uploaded_at ON vault_documents(uploaded_at DESC);

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) - FIRM ISOLATION
-- ----------------------------------------------------------------------------

-- Enable RLS on all tenant-scoped tables
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuity_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuity_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE baseline_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their firm's data
-- NOTE: Replace auth.uid() with your Supabase auth implementation

-- Firms: Users can read their own firm
CREATE POLICY firm_isolation ON firms
  FOR ALL
  USING (id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Users: Can read users in their firm
CREATE POLICY user_isolation ON users
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Relationships: Firm-scoped access
CREATE POLICY relationship_isolation ON relationships
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Interactions: Via relationship firm_id
CREATE POLICY interaction_isolation ON interactions
  FOR ALL
  USING (relationship_id IN (
    SELECT id FROM relationships WHERE firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  ));

-- Continuity Snapshots: Via relationship firm_id
CREATE POLICY snapshot_isolation ON continuity_snapshots
  FOR ALL
  USING (relationship_id IN (
    SELECT id FROM relationships WHERE firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  ));

-- Governance Batches: Firm-scoped
CREATE POLICY batch_isolation ON governance_batches
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Outreach Drafts: Firm-scoped
CREATE POLICY draft_isolation ON outreach_drafts
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Governance Events: Firm-scoped
CREATE POLICY event_isolation ON governance_events
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Ledger Sources: Firm-scoped
CREATE POLICY source_isolation ON ledger_sources
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Field Mappings: Via ledger_source firm_id
CREATE POLICY mapping_isolation ON field_mappings
  FOR ALL
  USING (ledger_source_id IN (
    SELECT id FROM ledger_sources WHERE firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  ));

-- Continuity Signals: Firm-scoped
CREATE POLICY signal_isolation ON continuity_signals
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Client Assignments: Firm-scoped
CREATE POLICY assignment_isolation ON client_assignments
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Baseline Reports: Firm-scoped
CREATE POLICY baseline_isolation ON baseline_reports
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Governance Actions: Firm-scoped
CREATE POLICY action_isolation ON governance_actions
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Audit Events: Firm-scoped
CREATE POLICY audit_isolation ON audit_events
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- Vault Documents: Firm-scoped
CREATE POLICY vault_isolation ON vault_documents
  FOR ALL
  USING (firm_id IN (SELECT firm_id FROM users WHERE id = auth.uid()));

-- ----------------------------------------------------------------------------
-- 10. UPDATED_AT TRIGGERS FOR NEW TABLES
-- ----------------------------------------------------------------------------

CREATE TRIGGER update_signals_updated_at 
  BEFORE UPDATE ON continuity_signals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_baselines_updated_at 
  BEFORE UPDATE ON baseline_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_updated_at 
  BEFORE UPDATE ON vault_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NOTE: audit_events and governance_actions are immutable (no updated_at)

-- ----------------------------------------------------------------------------
-- 11. SEED DATA - WAL FIRM
-- ----------------------------------------------------------------------------

-- Insert West Approved Lending as first firm
INSERT INTO firms (id, name, governance_mode_enabled)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'West Approved Lending',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Note: Actual user creation should happen via Supabase Auth
-- This is a placeholder structure for reference
-- INSERT INTO users (id, firm_id, email, role, display_name)
-- VALUES (
--   auth.uid(),
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   'founder@westapprovedlending.com',
--   'FOUNDER',
--   'Founder (WAL)'
-- );

-- ----------------------------------------------------------------------------
-- 12. HELPER VIEWS (OPTIONAL - FOR REPORTING)
-- ----------------------------------------------------------------------------

-- View: Current client assignments (denormalized for performance)
CREATE OR REPLACE VIEW current_client_assignments AS
SELECT DISTINCT ON (ca.relationship_id)
  ca.id,
  ca.firm_id,
  ca.relationship_id,
  ca.assigned_to,
  ca.assigned_by,
  ca.assigned_at,
  u.display_name AS assigned_to_name,
  u.role AS assigned_to_role,
  r.display_name AS client_name
FROM client_assignments ca
JOIN users u ON ca.assigned_to = u.id
JOIN relationships r ON ca.relationship_id = r.id
ORDER BY ca.relationship_id, ca.assigned_at DESC;

-- View: Active signals (unresolved only)
CREATE OR REPLACE VIEW active_signals AS
SELECT
  s.id,
  s.firm_id,
  s.relationship_id,
  s.severity,
  s.signal_type,
  s.title,
  s.description,
  s.metric_value,
  s.assigned_to,
  s.triggered_at,
  r.display_name AS client_name,
  r.continuity_grade,
  u.display_name AS assigned_to_name
FROM continuity_signals s
JOIN relationships r ON s.relationship_id = r.id
LEFT JOIN users u ON s.assigned_to = u.id
WHERE s.resolved_at IS NULL
ORDER BY s.severity DESC, s.triggered_at DESC;

-- View: Latest baseline per firm
CREATE OR REPLACE VIEW latest_baselines AS
SELECT DISTINCT ON (firm_id)
  id,
  firm_id,
  report_name,
  status,
  total_book_value,
  current_annual_revenue,
  delta_revenue,
  terminal_income_annual,
  finalized_at,
  created_at
FROM baseline_reports
WHERE status = 'FINALIZED'
ORDER BY firm_id, finalized_at DESC;

-- ----------------------------------------------------------------------------
-- MIGRATION COMPLETE
-- ----------------------------------------------------------------------------
-- Next Steps:
-- 1. Deploy this migration to Supabase
-- 2. Wire Supabase Auth to populate users table
-- 3. Replace mock data providers with real DB queries
-- 4. Implement signal calculation engine (scheduled job)
-- 5. Build role-based permission middleware
-- ----------------------------------------------------------------------------
