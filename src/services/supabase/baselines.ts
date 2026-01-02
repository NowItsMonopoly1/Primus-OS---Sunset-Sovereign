// src/services/supabase/baselines.ts
// Supabase service layer for continuity baseline reports

import { supabase } from '../../supabaseClient';

export type BaselineStatus = 'DRAFT' | 'FINALIZED' | 'ARCHIVED';

export interface BaselineReport {
  id: string;
  firmId: string;
  reportName: string;
  status: BaselineStatus;
  
  // Inputs
  totalClientCount: number;
  totalBookValue: number;
  avgCommissionRate: number;
  currentAnnualRevenue: number;
  
  // Scenario A
  unmanagedDecayRate: number;
  unmanagedTerminalIncome: number;
  
  // Scenario B
  managedDecayRate: number;
  sunsetRetentionRate: number;
  sunsetDurationYears: number;
  
  // Outputs
  projectedYears: number;
  deltaRevenue: number | null;
  terminalIncomeAnnual: number | null;
  
  // Audit
  createdBy: string;
  finalizedBy: string | null;
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBaselineInput {
  reportName: string;
  totalClientCount: number;
  totalBookValue: number;
  avgCommissionRate: number;
  currentAnnualRevenue: number;
  unmanagedDecayRate?: number;
  managedDecayRate?: number;
  sunsetRetentionRate?: number;
  sunsetDurationYears?: number;
  projectedYears?: number;
}

export interface UpdateBaselineInput {
  reportName?: string;
  status?: BaselineStatus;
  totalClientCount?: number;
  totalBookValue?: number;
  avgCommissionRate?: number;
  currentAnnualRevenue?: number;
  projectedYears?: number;
  deltaRevenue?: number;
  terminalIncomeAnnual?: number;
}

// Get all baseline reports
export async function getBaselines(): Promise<{ data: BaselineReport[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('baseline_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as BaselineReport[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Get single baseline
export async function getBaseline(id: string): Promise<{ data: BaselineReport | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('baseline_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data: data as BaselineReport, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Get latest finalized baseline
export async function getLatestBaseline(): Promise<{ data: BaselineReport | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('baseline_reports')
      .select('*')
      .eq('status', 'FINALIZED')
      .order('finalized_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

    return { data: data as BaselineReport | null, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Create new baseline
export async function createBaseline(
  input: CreateBaselineInput,
  firmId: string,
  createdBy: string
): Promise<{ data: BaselineReport | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('baseline_reports')
      .insert({
        firm_id: firmId,
        report_name: input.reportName,
        status: 'DRAFT',
        total_client_count: input.totalClientCount,
        total_book_value: input.totalBookValue,
        avg_commission_rate: input.avgCommissionRate,
        current_annual_revenue: input.currentAnnualRevenue,
        unmanaged_decay_rate: input.unmanagedDecayRate || 0.20,
        unmanaged_terminal_income: 0,
        managed_decay_rate: input.managedDecayRate || 0.05,
        sunset_retention_rate: input.sunsetRetentionRate || 0.30,
        sunset_duration_years: input.sunsetDurationYears || 10,
        projected_years: input.projectedYears || 5,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as BaselineReport, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Update baseline
export async function updateBaseline(
  id: string,
  input: UpdateBaselineInput
): Promise<{ data: BaselineReport | null; error: Error | null }> {
  try {
    const updates: Record<string, any> = {};
    
    if (input.reportName !== undefined) updates.report_name = input.reportName;
    if (input.status !== undefined) updates.status = input.status;
    if (input.totalClientCount !== undefined) updates.total_client_count = input.totalClientCount;
    if (input.totalBookValue !== undefined) updates.total_book_value = input.totalBookValue;
    if (input.avgCommissionRate !== undefined) updates.avg_commission_rate = input.avgCommissionRate;
    if (input.currentAnnualRevenue !== undefined) updates.current_annual_revenue = input.currentAnnualRevenue;
    if (input.projectedYears !== undefined) updates.projected_years = input.projectedYears;
    if (input.deltaRevenue !== undefined) updates.delta_revenue = input.deltaRevenue;
    if (input.terminalIncomeAnnual !== undefined) updates.terminal_income_annual = input.terminalIncomeAnnual;

    const { data, error } = await supabase
      .from('baseline_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: data as BaselineReport, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Finalize baseline (lock it)
export async function finalizeBaseline(
  id: string,
  finalizedBy: string,
  calculatedDelta: number,
  calculatedTerminalIncome: number
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('baseline_reports')
      .update({
        status: 'FINALIZED',
        finalized_by: finalizedBy,
        finalized_at: new Date().toISOString(),
        delta_revenue: calculatedDelta,
        terminal_income_annual: calculatedTerminalIncome,
      })
      .eq('id', id);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

// Archive baseline
export async function archiveBaseline(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('baseline_reports')
      .update({ status: 'ARCHIVED' })
      .eq('id', id);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}
