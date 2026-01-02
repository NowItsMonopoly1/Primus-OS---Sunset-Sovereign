/**
 * Primus OS Business Edition - Backend Type Definitions
 * Core domain types for continuity ledger system
 */

export type ContinuityGrade = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';

export type RelationshipStatus = 'STRONG' | 'STABLE' | 'PENDING' | 'REVIEW' | 'INACTIVE';

export type InteractionType = 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE' | 'OTHER';

export type InteractionDirection = 'INBOUND' | 'OUTBOUND';

export type DraftStatus = 'PREPARED' | 'IN_BATCH' | 'APPROVED' | 'EXECUTED' | 'ARCHIVED';

export type BatchStatus = 'OPEN' | 'UNDER_REVIEW' | 'APPROVED' | 'EXECUTED' | 'ARCHIVED';

export type LedgerSourceType = 'CRM' | 'LOS' | 'SHEET';

export type LedgerSourceStatus = 'PENDING' | 'ACTIVE' | 'DISABLED';

export type GovernanceEntityType = 'RELATIONSHIP' | 'OUTREACH_DRAFT' | 'BATCH' | 'MAPPING';

export type TargetField =
  | 'RELATIONSHIP_NAME'
  | 'BOOK_CLASS'
  | 'VALUE_OUTLOOK_DATE'
  | 'LAST_INTERACTION_DATE'
  | 'LAST_INTERACTION_TYPE'
  | 'STATUS';

// Database entities

export interface Relationship {
  id: string;
  externalId?: string;
  displayName: string;
  roleOrSegment: string;
  status: RelationshipStatus;
  valueOutlook: string;
  continuityGrade: ContinuityGrade;
  continuityScore: number;
  lastInteractionAt?: Date;
  lastInteractionType?: InteractionType;
  firmId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  id: string;
  relationshipId: string;
  type: InteractionType;
  direction: InteractionDirection;
  occurredAt: Date;
  valueEventWeight: number;
  notes?: string;
  sourceSystem?: string;
  createdAt: Date;
}

export interface ContinuitySnapshot {
  id: string;
  relationshipId: string;
  score: number;
  grade: ContinuityGrade;
  calculatedAt: Date;
  reasonSummary: string;
  createdAt: Date;
}

export interface OutreachDraft {
  id: string;
  relationshipId: string;
  firmId: string;
  body: string;
  subject: string;
  status: DraftStatus;
  preparedBy: string;
  approvedBy?: string;
  governanceBatchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GovernanceBatch {
  id: string;
  firmId: string;
  label: string;
  status: BatchStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GovernanceEvent {
  id: string;
  firmId: string;
  entityType: GovernanceEntityType;
  entityId: string;
  eventType: string;
  performedBy: string;
  payload: Record<string, any>;
  occurredAt: Date;
}

export interface LedgerSource {
  id: string;
  firmId: string;
  sourceType: LedgerSourceType;
  sourceName: string;
  status: LedgerSourceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldMapping {
  id: string;
  ledgerSourceId: string;
  sourceField: string;
  targetField: TargetField;
  createdAt: Date;
}

// Service DTOs

export interface Rationale {
  recentActivity: string;
  valueDrivers: string;
  riskConsiderations: string;
  recommendedNextStep: string;
  governanceNote: string;
}

export interface ScoreResult {
  score: number;
  grade: ContinuityGrade;
  reasonSummary: string;
}

export interface MappingSuggestion {
  sourceField: string;
  suggestedTarget?: TargetField;
  confidence: number;
}

export interface PortfolioAssessment {
  portfolioRating: ContinuityGrade;
  portfolioRatingNumeric: number;
  strongStablePercent: number;
  reviewPercent: number;
  dormantEquityPercent: number;
}
