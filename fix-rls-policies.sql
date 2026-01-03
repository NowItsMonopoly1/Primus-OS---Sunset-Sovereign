-- =====================================================
-- FIX: Infinite Recursion in RLS Policies
-- =====================================================
-- Run this in Supabase SQL Editor FIRST, before deploy_signals_and_data.sql
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS relationship_isolation ON relationships;
DROP POLICY IF EXISTS users_isolation ON users;

-- Create simple, non-recursive policies for users table
CREATE POLICY users_read_own ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_insert_own ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create simple, non-recursive policies for relationships table
-- Allow users to read relationships belonging to their firm
CREATE POLICY relationships_read_own_firm ON relationships
  FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY relationships_insert_own_firm ON relationships
  FOR INSERT
  WITH CHECK (
    firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY relationships_update_own_firm ON relationships
  FOR UPDATE
  USING (
    firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY relationships_delete_own_firm ON relationships
  FOR DELETE
  USING (
    firm_id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  );

-- Create policies for firms table
DROP POLICY IF EXISTS firms_isolation ON firms;

CREATE POLICY firms_read_own ON firms
  FOR SELECT
  USING (
    id IN (
      SELECT firm_id FROM users WHERE id = auth.uid()
    )
  );

-- Create policies for interactions table
DROP POLICY IF EXISTS interactions_isolation ON interactions;

CREATE POLICY interactions_read_own_firm ON interactions
  FOR SELECT
  USING (
    relationship_id IN (
      SELECT id FROM relationships 
      WHERE firm_id IN (
        SELECT firm_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY interactions_insert_own_firm ON interactions
  FOR INSERT
  WITH CHECK (
    relationship_id IN (
      SELECT id FROM relationships 
      WHERE firm_id IN (
        SELECT firm_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Create policies for continuity_signals table
DROP POLICY IF EXISTS signals_isolation ON continuity_signals;

CREATE POLICY signals_read_own_firm ON continuity_signals
  FOR SELECT
  USING (
    relationship_id IN (
      SELECT id FROM relationships 
      WHERE firm_id IN (
        SELECT firm_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- Verification Query
-- =====================================================
-- After running this, test with:
-- SELECT id, display_name, continuity_grade FROM relationships LIMIT 5;