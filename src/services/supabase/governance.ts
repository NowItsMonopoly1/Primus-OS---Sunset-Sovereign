// src/services/supabase/governance.ts
// Supabase service layer for governance (approvals, batches, drafts)

import { supabase } from '../../supabaseClient';

export type DraftStatus = 'PREPARED' | 'IN_BATCH' | 'APPROVED' | 'EXECUTED' | 'ARCHIVED';
export type BatchStatus = 'OPEN' | 'UNDER_REVIEW' | 'APPROVED' | 'EXECUTED' | 'ARCHIVED';

export interface OutreachDraft {
  id: string;
  relationshipId: string;
  firmId: string;
  body: string;
  subject: string;
  status: DraftStatus;
  preparedBy: string;
  approvedBy: string | null;
  governanceBatchId: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  executedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GovernanceBatch {
  id: string;
  firmId: string;
  label: string;
  status: BatchStatus;
  createdBy: string;
  approvedBy: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDraftInput {
  relationshipId: string;
  subject: string;
  body: string;
  preparedBy: string;
}

export interface CreateBatchInput {
  label: string;
  createdBy: string;
  draftIds?: string[];
}

// Get all drafts for current firm
export async function getDrafts(): Promise<{ data: OutreachDraft[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('outreach_drafts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as OutreachDraft[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Get drafts pending approval
export async function getPendingDrafts(): Promise<{ data: OutreachDraft[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('outreach_drafts')
      .select('*')
      .in('status', ['PREPARED', 'IN_BATCH'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as OutreachDraft[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Get drafts in specific batch
export async function getBatchDrafts(batchId: string): Promise<{ data: OutreachDraft[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('outreach_drafts')
      .select('*')
      .eq('governance_batch_id', batchId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as OutreachDraft[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Create new draft
export async function createDraft(
  input: CreateDraftInput,
  firmId: string
): Promise<{ data: OutreachDraft | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('outreach_drafts')
      .insert({
        firm_id: firmId,
        relationship_id: input.relationshipId,
        subject: input.subject,
        body: input.body,
        status: 'PREPARED',
        prepared_by: input.preparedBy,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as OutreachDraft, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Approve draft
export async function approveDraft(
  draftId: string,
  approvedBy: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('outreach_drafts')
      .update({
        status: 'APPROVED',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', draftId);

    if (error) throw error;

    // Log governance action
    await logGovernanceAction({
      actionType: 'DRAFT_APPROVED',
      entityType: 'OUTREACH_DRAFT',
      entityId: draftId,
      performedBy: approvedBy,
    });

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

// Reject draft
export async function rejectDraft(
  draftId: string,
  reason: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('outreach_drafts')
      .update({
        status: 'ARCHIVED',
        rejection_reason: reason,
      })
      .eq('id', draftId);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

// Create governance batch
export async function createBatch(
  input: CreateBatchInput,
  firmId: string
): Promise<{ data: GovernanceBatch | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('governance_batches')
      .insert({
        firm_id: firmId,
        label: input.label,
        status: 'OPEN',
        created_by: input.createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    // If draft IDs provided, add them to batch
    if (input.draftIds && input.draftIds.length > 0) {
      await addDraftsToBatch(data.id, input.draftIds);
    }

    return { data: data as GovernanceBatch, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Add drafts to batch
export async function addDraftsToBatch(
  batchId: string,
  draftIds: string[]
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('outreach_drafts')
      .update({
        governance_batch_id: batchId,
        status: 'IN_BATCH',
      })
      .in('id', draftIds);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

// Approve batch
export async function approveBatch(
  batchId: string,
  approvedBy: string
): Promise<{ error: Error | null }> {
  try {
    // Update batch status
    const { error: batchError } = await supabase
      .from('governance_batches')
      .update({
        status: 'APPROVED',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', batchId);

    if (batchError) throw batchError;

    // Approve all drafts in batch
    const { error: draftsError } = await supabase
      .from('outreach_drafts')
      .update({
        status: 'APPROVED',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('governance_batch_id', batchId);

    if (draftsError) throw draftsError;

    // Log governance action
    await logGovernanceAction({
      actionType: 'BATCH_APPROVED',
      entityType: 'BATCH',
      entityId: batchId,
      performedBy: approvedBy,
    });

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

// Get all batches
export async function getBatches(): Promise<{ data: GovernanceBatch[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('governance_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as GovernanceBatch[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Get batches pending approval
export async function getPendingBatches(): Promise<{ data: GovernanceBatch[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('governance_batches')
      .select('*')
      .in('status', ['OPEN', 'UNDER_REVIEW'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as GovernanceBatch[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Log governance action (internal helper)
async function logGovernanceAction(params: {
  actionType: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  reason?: string;
  beforeState?: any;
  afterState?: any;
}): Promise<void> {
  try {
    // Get user's role
    const { data: userData } = await supabase
      .from('users')
      .select('role, firm_id')
      .eq('id', params.performedBy)
      .single();

    if (!userData) return;

    await supabase.from('governance_actions').insert({
      firm_id: userData.firm_id,
      action_type: params.actionType,
      entity_type: params.entityType,
      entity_id: params.entityId,
      performed_by: params.performedBy,
      performed_by_role: userData.role,
      before_state: params.beforeState || null,
      after_state: params.afterState || null,
      reason: params.reason,
    });
  } catch (err) {
    console.error('Error logging governance action:', err);
  }
}
