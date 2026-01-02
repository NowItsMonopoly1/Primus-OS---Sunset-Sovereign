// src/services/continuityApi.ts
// API service for continuity data using Supabase

import { supabase } from '../supabaseClient';
import {
  Profile,
  Relationship,
  ContinuitySignal,
  ApprovalDraft,
  ValueEvent,
} from '../data/continuityData';

// Profiles
export const fetchProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return data || [];
};

export const fetchCurrentProfile = async (): Promise<Profile | null> => {
  // Assume we have auth and get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
};

// Relationships
export const fetchRelationships = async (): Promise<Relationship[]> => {
  const { data, error } = await supabase.from('relationships').select('*');
  if (error) throw error;
  return data || [];
};

// Continuity Signals
export const fetchContinuitySignals = async (): Promise<ContinuitySignal[]> => {
  const { data, error } = await supabase.from('continuity_signals').select('*');
  if (error) throw error;
  return data || [];
};

// Approval Drafts
export const fetchApprovalDrafts = async (): Promise<ApprovalDraft[]> => {
  const { data, error } = await supabase.from('approval_drafts').select('*');
  if (error) throw error;
  return data || [];
};

export const approveDrafts = async (draftIds: string[], approverId: string): Promise<void> => {
  const { error } = await supabase
    .from('approval_drafts')
    .update({
      status: 'Approved',
      approvedBy: approverId,
      approvedAt: new Date().toISOString(),
    })
    .in('id', draftIds);

  if (error) throw error;
};

export const archiveDrafts = async (draftIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('approval_drafts')
    .update({ status: 'Archived' })
    .in('id', draftIds);

  if (error) throw error;
};

export const createDraft = async (draft: Omit<ApprovalDraft, 'id' | 'createdAt' | 'status'>): Promise<ApprovalDraft> => {
  const { data, error } = await supabase
    .from('approval_drafts')
    .insert(draft)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Value Events
export const fetchValueEvents = async (): Promise<ValueEvent[]> => {
  const { data, error } = await supabase.from('value_events').select('*');
  if (error) throw error;
  return data || [];
};