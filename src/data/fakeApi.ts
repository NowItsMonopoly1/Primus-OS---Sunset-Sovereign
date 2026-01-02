// src/data/fakeApi.ts
// Temp fallback API functions for PRIMUS OS Continuity System

import {
  Profile,
  Relationship,
  ContinuitySignal,
  ApprovalDraft,
  ValueEvent,
  mockProfiles,
  mockRelationships,
  mockContinuitySignals,
  mockApprovalDrafts,
  mockValueEvents,
} from './continuityData';

// Simulate async API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getProfiles = async (): Promise<Profile[]> => {
  await delay(100);
  return mockProfiles;
};

export const getCurrentProfile = async (): Promise<Profile> => {
  await delay(100);
  // Assume current user is Charlie Junior for demo
  return mockProfiles.find(p => p.id === '3') || mockProfiles[0];
};

export const getRelationships = async (): Promise<Relationship[]> => {
  await delay(100);
  return mockRelationships;
};

export const getContinuitySignals = async (): Promise<ContinuitySignal[]> => {
  await delay(100);
  return mockContinuitySignals;
};

export const getApprovalDrafts = async (): Promise<ApprovalDraft[]> => {
  await delay(100);
  return mockApprovalDrafts;
};

export const getValueEvents = async (): Promise<ValueEvent[]> => {
  await delay(100);
  return mockValueEvents;
};

export const approveDrafts = async (draftIds: string[], approverId: string): Promise<void> => {
  await delay(200);
  // In real API, update the drafts
  console.log(`Approved drafts ${draftIds.join(', ')} by ${approverId}`);
};

export const archiveDrafts = async (draftIds: string[]): Promise<void> => {
  await delay(200);
  // In real API, archive the drafts
  console.log(`Archived drafts ${draftIds.join(', ')}`);
};

export const createDraft = async (draft: Omit<ApprovalDraft, 'id' | 'createdAt' | 'status'>): Promise<ApprovalDraft> => {
  await delay(200);
  const newDraft: ApprovalDraft = {
    ...draft,
    id: `draft${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'Pending',
  };
  console.log('Created draft:', newDraft);
  return newDraft;
};