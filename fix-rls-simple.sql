-- =====================================================
-- SIMPLE RLS FIX: Remove infinite recursion
-- =====================================================
-- Run this in Supabase SQL Editor to fix the policies
-- =====================================================

-- STEP 1: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS relationship_isolation ON relationships;
DROP POLICY IF EXISTS users_isolation ON users;
DROP POLICY IF EXISTS firms_isolation ON firms;
DROP POLICY IF EXISTS interactions_isolation ON interactions;
DROP POLICY IF EXISTS signals_isolation ON continuity_signals;

DROP POLICY IF EXISTS users_read_own ON users;
DROP POLICY IF EXISTS users_insert_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;

DROP POLICY IF EXISTS relationships_read_own_firm ON relationships;
DROP POLICY IF EXISTS relationships_insert_own_firm ON relationships;
DROP POLICY IF EXISTS relationships_update_own_firm ON relationships;
DROP POLICY IF EXISTS relationships_delete_own_firm ON relationships;

DROP POLICY IF EXISTS firms_read_own ON firms;
DROP POLICY IF EXISTS interactions_read_own_firm ON interactions;
DROP POLICY IF EXISTS interactions_insert_own_firm ON interactions;
DROP POLICY IF EXISTS signals_read_own_firm ON continuity_signals;

-- STEP 2: Temporarily disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE firms DISABLE ROW LEVEL SECURITY;
ALTER TABLE relationships DISABLE ROW LEVEL SECURITY;
ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE continuity_signals DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- DONE - RLS Disabled for Testing
-- =====================================================
-- All tables now accessible without RLS restrictions.
-- Use this for development/testing.
-- Re-enable RLS in production with proper policies.
-- =====================================================
