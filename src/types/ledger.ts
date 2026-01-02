/**
 * Primus OS Business Edition - Type Definitions
 * Continuity Ledger & Governance Models
 */

export type ContinuityScore = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';

export type RelationshipStatus =
  | 'Strong'
  | 'Stable'
  | 'Pending'
  | 'Review'
  | 'Inactive';

export type InteractionType =
  | 'Email'
  | 'Call'
  | 'Meeting'
  | 'Note';

export interface RelationshipRecord {
  id: string;
  continuityScore: ContinuityScore;
  continuityScoreNumeric: number; // 0-100
  contact: {
    name: string;
    initials: string;
    role: string;
    avatarUrl?: string;
  };
  status: RelationshipStatus;
  valueOutlook: string;
  lastInteraction: {
    type: InteractionType;
    daysAgo: number;
  };
}

export interface DecisionRationale {
  relationshipId: string;
  recentActivity: string;
  valueDrivers: string;
  riskConsiderations: string;
  recommendedNextStep: string;
  governanceNote: string;
}

export interface OnboardingFieldMapping {
  detectedField: string;
  confirmAs: string;
  example: string;
  isMapped: boolean;
}

export interface ContinuityAssessment {
  portfolioRating: ContinuityScore;
  portfolioRatingNumeric: number;
  strongStablePercent: number;
  reviewPercent: number;
  dormantEquityPercent: number;
}

export type LedgerSource =
  | 'crm'
  | 'los'
  | 'spreadsheet'
  | 'admin';
