// src/data/continuityData.ts
// Temp fallback data and types for PRIMUS OS Continuity System

export interface Profile {
  id: string;
  name: string;
  role: 'founder' | 'senior' | 'junior' | 'viewer';
  email: string;
}

export interface Relationship {
  id: string;
  name: string;
  rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';
  numericScore: number;
  status: 'Active' | 'Monitoring' | 'At Risk';
  horizon: '0-3' | '3-6' | '6-12' | '12+';
  lastVerified: string;
  value: number;
}

export interface ContinuitySignal {
  id: string;
  relationshipId: string;
  type: 'Verified Recency' | 'Relationship Drift' | 'Life-stage Timing';
  message: string;
  timestamp: string;
  flagged: boolean;
}

export interface ApprovalDraft {
  id: string;
  relationshipId: string;
  subject: string;
  body: string;
  rationale: string;
  status: 'Pending' | 'Approved' | 'Archived';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ValueEvent {
  id: string;
  relationshipId: string;
  type: string;
  amount: number;
  probability: number;
  horizon: '0-3' | '3-6' | '6-12' | '12+';
  timestamp: string;
}

// Mock data
export const mockProfiles: Profile[] = [
  { id: '1', name: 'Alice Founder', role: 'founder', email: 'alice@firm.com' },
  { id: '2', name: 'Bob Senior', role: 'senior', email: 'bob@firm.com' },
  { id: '3', name: 'Charlie Junior', role: 'junior', email: 'charlie@firm.com' },
  { id: '4', name: 'Dana Viewer', role: 'viewer', email: 'dana@firm.com' },
];

export const mockRelationships: Relationship[] = [
  {
    id: 'rel1',
    name: 'John Smith',
    rating: 'AAA',
    numericScore: 95,
    status: 'Active',
    horizon: '0-3',
    lastVerified: '2025-12-30',
    value: 50000,
  },
  {
    id: 'rel2',
    name: 'Sarah Miller',
    rating: 'AA',
    numericScore: 88,
    status: 'Monitoring',
    horizon: '3-6',
    lastVerified: '2025-12-25',
    value: 75000,
  },
  {
    id: 'rel3',
    name: 'Ted Williams',
    rating: 'A',
    numericScore: 82,
    status: 'At Risk',
    horizon: '6-12',
    lastVerified: '2025-12-20',
    value: 30000,
  },
];

export const mockContinuitySignals: ContinuitySignal[] = [
  {
    id: 'sig1',
    relationshipId: 'rel1',
    type: 'Verified Recency',
    message: 'Recent contact confirmed active engagement.',
    timestamp: '2025-12-30T10:00:00Z',
    flagged: false,
  },
  {
    id: 'sig2',
    relationshipId: 'rel2',
    type: 'Relationship Drift',
    message: 'Slight decrease in communication frequency.',
    timestamp: '2025-12-28T14:00:00Z',
    flagged: true,
  },
  {
    id: 'sig3',
    relationshipId: 'rel3',
    type: 'Life-stage Timing',
    message: 'Approaching retirement milestone.',
    timestamp: '2025-12-27T09:00:00Z',
    flagged: true,
  },
];

export const mockApprovalDrafts: ApprovalDraft[] = [
  {
    id: 'draft1',
    relationshipId: 'rel1',
    subject: 'Follow-up on Recent Discussion',
    body: 'Dear John, I wanted to follow up on our conversation...',
    rationale: 'Maintain active relationship and explore opportunities.',
    status: 'Pending',
    createdBy: '3', // Charlie Junior
    createdAt: '2025-12-29T11:00:00Z',
  },
  {
    id: 'draft2',
    relationshipId: 'rel2',
    subject: 'Update on Market Conditions',
    body: 'Hi Sarah, Given the current market...',
    rationale: 'Address potential concerns from monitoring status.',
    status: 'Approved',
    createdBy: '3',
    createdAt: '2025-12-28T16:00:00Z',
    approvedBy: '2', // Bob Senior
    approvedAt: '2025-12-29T09:00:00Z',
  },
];

export const mockValueEvents: ValueEvent[] = [
  {
    id: 'event1',
    relationshipId: 'rel1',
    type: 'Refinance Opportunity',
    amount: 20000,
    probability: 0.8,
    horizon: '0-3',
    timestamp: '2025-12-30T12:00:00Z',
  },
  {
    id: 'event2',
    relationshipId: 'rel2',
    type: 'HELOC for Remodel',
    amount: 100000,
    probability: 0.6,
    horizon: '3-6',
    timestamp: '2025-12-28T15:00:00Z',
  },
];