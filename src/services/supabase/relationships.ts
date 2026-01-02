// src/services/supabase/relationships.ts
// Supabase service layer for relationships (continuity ledger)

import { supabase } from '../../supabaseClient';

export interface Relationship {
  id: string;
  externalId: string | null;
  displayName: string;
  roleOrSegment: string;
  status: 'STRONG' | 'STABLE' | 'PENDING' | 'REVIEW' | 'INACTIVE';
  valueOutlook: string | null;
  continuityGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';
  continuityScore: number;
  lastInteractionAt: string | null;
  lastInteractionType: 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE' | 'OTHER' | null;
  assignedAgentId: string | null;
  isFounderDependent: boolean;
  avgLoanSize: number | null;
  annualRevenue: number | null;
  lastContactDaysAgo: number | null;
  firmId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRelationshipInput {
  displayName: string;
  roleOrSegment: string;
  externalId?: string;
  status?: Relationship['status'];
  continuityGrade?: Relationship['continuityGrade'];
  continuityScore?: number;
  avgLoanSize?: number;
  annualRevenue?: number;
  isFounderDependent?: boolean;
}

export interface UpdateRelationshipInput {
  displayName?: string;
  roleOrSegment?: string;
  status?: Relationship['status'];
  continuityGrade?: Relationship['continuityGrade'];
  continuityScore?: number;
  assignedAgentId?: string | null;
  isFounderDependent?: boolean;
  avgLoanSize?: number;
  annualRevenue?: number;
  lastContactDaysAgo?: number;
}

// Get all relationships for current user's firm
export async function getRelationships(): Promise<{ data: Relationship[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .order('continuity_score', { ascending: false });

    if (error) throw error;

    return { data: data as Relationship[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Get single relationship by ID
export async function getRelationship(id: string): Promise<{ data: Relationship | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data: data as Relationship, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Create new relationship
export async function createRelationship(
  input: CreateRelationshipInput,
  firmId: string
): Promise<{ data: Relationship | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .insert({
        display_name: input.displayName,
        role_or_segment: input.roleOrSegment,
        external_id: input.externalId,
        status: input.status || 'REVIEW',
        continuity_grade: input.continuityGrade || 'B',
        continuity_score: input.continuityScore || 0,
        avg_loan_size: input.avgLoanSize,
        annual_revenue: input.annualRevenue,
        is_founder_dependent: input.isFounderDependent ?? true,
        firm_id: firmId,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as Relationship, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Update relationship
export async function updateRelationship(
  id: string,
  input: UpdateRelationshipInput
): Promise<{ data: Relationship | null; error: Error | null }> {
  try {
    const updates: Record<string, any> = {};
    
    if (input.displayName !== undefined) updates.display_name = input.displayName;
    if (input.roleOrSegment !== undefined) updates.role_or_segment = input.roleOrSegment;
    if (input.status !== undefined) updates.status = input.status;
    if (input.continuityGrade !== undefined) updates.continuity_grade = input.continuityGrade;
    if (input.continuityScore !== undefined) updates.continuity_score = input.continuityScore;
    if (input.assignedAgentId !== undefined) updates.assigned_agent_id = input.assignedAgentId;
    if (input.isFounderDependent !== undefined) updates.is_founder_dependent = input.isFounderDependent;
    if (input.avgLoanSize !== undefined) updates.avg_loan_size = input.avgLoanSize;
    if (input.annualRevenue !== undefined) updates.annual_revenue = input.annualRevenue;
    if (input.lastContactDaysAgo !== undefined) updates.last_contact_days_ago = input.lastContactDaysAgo;

    const { data, error } = await supabase
      .from('relationships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Relationship, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Delete relationship
export async function deleteRelationship(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

// Assign relationship to agent
export async function assignRelationship(
  relationshipId: string,
  agentId: string,
  assignedBy: string,
  reason?: string
): Promise<{ error: Error | null }> {
  try {
    // Get current assignment
    const { data: relationship } = await getRelationship(relationshipId);
    
    // Create assignment record
    const { error: assignError } = await supabase
      .from('client_assignments')
      .insert({
        relationship_id: relationshipId,
        assigned_to: agentId,
        assigned_by: assignedBy,
        previous_agent_id: relationship?.assignedAgentId,
        assignment_reason: reason,
        firm_id: relationship?.firmId,
      });

    if (assignError) throw assignError;

    // Update relationship
    const { error: updateError } = await updateRelationship(relationshipId, {
      assignedAgentId: agentId,
    });

    if (updateError) throw updateError;

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

// Get relationships assigned to specific agent
export async function getAgentRelationships(agentId: string): Promise<{ data: Relationship[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('assigned_agent_id', agentId)
      .order('continuity_score', { ascending: false });

    if (error) throw error;

    return { data: data as Relationship[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Get founder-dependent relationships
export async function getFounderDependentRelationships(): Promise<{ data: Relationship[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('is_founder_dependent', true)
      .order('annual_revenue', { ascending: false });

    if (error) throw error;

    return { data: data as Relationship[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}
