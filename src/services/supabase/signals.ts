// src/services/supabase/signals.ts
// Supabase service layer for continuity signals

import { supabase } from '../../supabaseClient';

export type SignalSeverity = 'GREEN' | 'YELLOW' | 'RED';

export interface ContinuitySignal {
  id: string;
  firmId: string;
  relationshipId: string;
  severity: SignalSeverity;
  signalType: string;
  title: string;
  description: string;
  metricValue: number | null;
  assignedTo: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  triggeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSignalInput {
  relationshipId: string;
  severity: SignalSeverity;
  signalType: string;
  title: string;
  description: string;
  metricValue?: number;
  assignedTo?: string;
}

// Get all active signals (unresolved)
export async function getActiveSignals(): Promise<{ data: ContinuitySignal[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('continuity_signals')
      .select('*')
      .is('resolved_at', null)
      .order('severity', { ascending: false })
      .order('triggered_at', { ascending: false });

    if (error) throw error;

    // Map snake_case to camelCase
    const mappedData = data?.map(row => ({
      id: row.id,
      firmId: row.firm_id,
      relationshipId: row.relationship_id,
      severity: row.severity,
      signalType: row.signal_type,
      title: row.title,
      description: row.description,
      metricValue: row.metric_value,
      assignedTo: row.assigned_to,
      resolvedAt: row.resolved_at,
      resolvedBy: row.resolved_by,
      resolutionNotes: row.resolution_notes,
      triggeredAt: row.triggered_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) || [];

    return { data: mappedData as ContinuitySignal[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Get signals for specific relationship
export async function getRelationshipSignals(relationshipId: string): Promise<{ data: ContinuitySignal[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('continuity_signals')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('triggered_at', { ascending: false });

    if (error) throw error;

    return { data: data as ContinuitySignal[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Create new signal
export async function createSignal(
  input: CreateSignalInput,
  firmId: string
): Promise<{ data: ContinuitySignal | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('continuity_signals')
      .insert({
        firm_id: firmId,
        relationship_id: input.relationshipId,
        severity: input.severity,
        signal_type: input.signalType,
        title: input.title,
        description: input.description,
        metric_value: input.metricValue,
        assigned_to: input.assignedTo,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as ContinuitySignal, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Resolve signal
export async function resolveSignal(
  signalId: string,
  resolvedBy: string,
  notes?: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('continuity_signals')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        resolution_notes: notes,
      })
      .eq('id', signalId);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

// Assign signal to agent
export async function assignSignal(
  signalId: string,
  agentId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('continuity_signals')
      .update({ assigned_to: agentId })
      .eq('id', signalId);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

// Get signals assigned to agent
export async function getAgentSignals(agentId: string): Promise<{ data: ContinuitySignal[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('continuity_signals')
      .select('*')
      .eq('assigned_to', agentId)
      .is('resolved_at', null)
      .order('severity', { ascending: false });

    if (error) throw error;

    return { data: data as ContinuitySignal[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Get signal counts by severity
export async function getSignalCounts(): Promise<{
  data: { red: number; yellow: number; green: number } | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('continuity_signals')
      .select('severity')
      .is('resolved_at', null);

    if (error) throw error;

    const counts = {
      red: data.filter(s => s.severity === 'RED').length,
      yellow: data.filter(s => s.severity === 'YELLOW').length,
      green: data.filter(s => s.severity === 'GREEN').length,
    };

    return { data: counts, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// =====================================================
// SIGNALS ENGINE FUNCTIONS
// =====================================================

/**
 * Manually trigger signal generation from the database function
 * Useful for "Refresh" button in the UI
 */
export async function triggerSignalGeneration(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.rpc('generate_continuity_signals');

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Update the market interest rate used for refinance opportunity detection
 */
export async function updateMarketRate(newRate: number): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.rpc('update_market_rate', {
      new_rate: newRate
    });

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Map signal types to user-friendly labels
 */
export const SIGNAL_TYPE_LABELS: Record<string, string> = {
  CONTACT_GAP: 'Contact Recency',
  ENGAGEMENT_DRIFT: 'Engagement Quality',
  VALUE_RISK: 'Value Opportunity',
  LIFE_STAGE: 'Life-Stage Transition',
  SUCCESSION_GAP: 'Succession Readiness'
};

/**
 * Map severity to colors (Primus OS Design System)
 */
export const SEVERITY_COLORS: Record<SignalSeverity, string> = {
  RED: '#B55A4A',
  YELLOW: '#C6A45E',
  GREEN: '#4A9E88'
};

/**
 * Get recommended action for signal type
 */
export function getRecommendedAction(signalType: string): string {
  const actions: Record<string, string> = {
    CONTACT_GAP: 'Schedule touchpoint call within 48 hours',
    ENGAGEMENT_DRIFT: 'Immediate intervention - Review relationship strategy',
    VALUE_RISK: 'Proactive refinance consultation opportunity',
    LIFE_STAGE: 'Initiate succession planning conversation',
    SUCCESSION_GAP: 'Document heir/successor relationship'
  };

  return actions[signalType] || 'Review and take appropriate action';
}

/**
 * Subscribe to real-time signal changes
 */
export function subscribeToSignals(
  firmId: string,
  onSignalChange: (payload: any) => void
) {
  return supabase
    .channel(`signals:${firmId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'continuity_signals',
        filter: `firm_id=eq.${firmId}`
      },
      onSignalChange
    )
    .subscribe();
}
