// src/data/continuityData.ts
// Types for PRIMUS OS Continuity System

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
  type: string;
  severity: 'GREEN' | 'YELLOW' | 'RED';
  description: string;
  triggeredAt: string;
  status: 'ACTIVE' | 'RESOLVED';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ApprovalDraft {
  id: string;
  relationshipId: string;
  type: string;
  description: string;
  requestedBy: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
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