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

    return { data: data as ContinuitySignal[], error: null };
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
