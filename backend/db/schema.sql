-- Primus OS Business Edition - Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core enums
CREATE TYPE continuity_grade AS ENUM ('AAA', 'AA', 'A', 'BBB', 'BB', 'B');
CREATE TYPE relationship_status AS ENUM ('STRONG', 'STABLE', 'PENDING', 'REVIEW', 'INACTIVE');
CREATE TYPE interaction_type AS ENUM ('EMAIL', 'CALL', 'MEETING', 'NOTE', 'OTHER');
CREATE TYPE interaction_direction AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE draft_status AS ENUM ('PREPARED', 'IN_BATCH', 'APPROVED', 'EXECUTED', 'ARCHIVED');
CREATE TYPE batch_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'APPROVED', 'EXECUTED', 'ARCHIVED');
CREATE TYPE ledger_source_type AS ENUM ('CRM', 'LOS', 'SHEET');
CREATE TYPE ledger_source_status AS ENUM ('PENDING', 'ACTIVE', 'DISABLED');
CREATE TYPE governance_entity_type AS ENUM ('RELATIONSHIP', 'OUTREACH_DRAFT', 'BATCH', 'MAPPING');
CREATE TYPE target_field AS ENUM (
  'RELATIONSHIP_NAME',
  'BOOK_CLASS',
  'VALUE_OUTLOOK_DATE',
  'LAST_INTERACTION_DATE',
  'LAST_INTERACTION_TYPE',
  'STATUS'
);

-- Firms (multi-tenant)
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  governance_mode_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'USER', -- USER | ADMIN
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Relationships (the ledger)
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR(255),
  display_name VARCHAR(255) NOT NULL,
  role_or_segment VARCHAR(255) NOT NULL,
  status relationship_status NOT NULL DEFAULT 'REVIEW',
  value_outlook TEXT,
  continuity_grade continuity_grade NOT NULL DEFAULT 'B',
  continuity_score SMALLINT NOT NULL DEFAULT 0 CHECK (continuity_score >= 0 AND continuity_score <= 100),
  last_interaction_at TIMESTAMP,
  last_interaction_type interaction_type,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_relationships_firm_id ON relationships(firm_id);
CREATE INDEX idx_relationships_continuity_grade ON relationships(continuity_grade);
CREATE INDEX idx_relationships_status ON relationships(status);

-- Interactions (activity log)
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  direction interaction_direction NOT NULL,
  occurred_at TIMESTAMP NOT NULL,
  value_event_weight SMALLINT NOT NULL DEFAULT 0 CHECK (value_event_weight >= 0 AND value_event_weight <= 5),
  notes TEXT,
  source_system VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_relationship_id ON interactions(relationship_id);
CREATE INDEX idx_interactions_occurred_at ON interactions(occurred_at DESC);

-- Continuity snapshots (historical scores)
CREATE TABLE continuity_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  score SMALLINT NOT NULL CHECK (score >= 0 AND score <= 100),
  grade continuity_grade NOT NULL,
  calculated_at TIMESTAMP NOT NULL,
  reason_summary TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_snapshots_relationship_id ON continuity_snapshots(relationship_id);
CREATE INDEX idx_snapshots_calculated_at ON continuity_snapshots(calculated_at DESC);

-- Governance batches
CREATE TABLE governance_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  status batch_status NOT NULL DEFAULT 'OPEN',
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_batches_firm_id ON governance_batches(firm_id);
CREATE INDEX idx_batches_status ON governance_batches(status);

-- Outreach drafts
CREATE TABLE outreach_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  subject VARCHAR(500) NOT NULL,
  status draft_status NOT NULL DEFAULT 'PREPARED',
  prepared_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  governance_batch_id UUID REFERENCES governance_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drafts_relationship_id ON outreach_drafts(relationship_id);
CREATE INDEX idx_drafts_batch_id ON outreach_drafts(governance_batch_id);
CREATE INDEX idx_drafts_status ON outreach_drafts(status);

-- Governance events (audit trail)
CREATE TABLE governance_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  entity_type governance_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  performed_by VARCHAR(100) NOT NULL, -- user ID or "SYSTEM"
  payload JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_firm_id ON governance_events(firm_id);
CREATE INDEX idx_events_entity ON governance_events(entity_type, entity_id);
CREATE INDEX idx_events_occurred_at ON governance_events(occurred_at DESC);

-- Ledger sources (onboarding)
CREATE TABLE ledger_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  source_type ledger_source_type NOT NULL,
  source_name VARCHAR(255) NOT NULL,
  status ledger_source_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sources_firm_id ON ledger_sources(firm_id);

-- Field mappings
CREATE TABLE field_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ledger_source_id UUID NOT NULL REFERENCES ledger_sources(id) ON DELETE CASCADE,
  source_field VARCHAR(255) NOT NULL,
  target_field target_field NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(ledger_source_id, source_field)
);

CREATE INDEX idx_mappings_source_id ON field_mappings(ledger_source_id);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_firms_updated_at BEFORE UPDATE ON firms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON governance_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON outreach_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON ledger_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
