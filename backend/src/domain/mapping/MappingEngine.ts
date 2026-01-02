/**
 * Primus OS Business Edition - Mapping Engine
 *
 * Handles field mapping during onboarding:
 * - Suggest mappings from source data to normalized schema
 * - Transform raw records into relationships + interactions
 */

import {
  FieldMapping,
  LedgerSource,
  TargetField,
  MappingSuggestion,
  Relationship,
  Interaction,
  RelationshipStatus,
  InteractionType,
} from '../../types';

export class MappingEngine {
  /**
   * Analyze raw columns and suggest field mappings
   */
  async previewMapping(params: {
    rawColumns: string[];
  }): Promise<MappingSuggestion[]> {
    const suggestions: MappingSuggestion[] = [];

    for (const column of params.rawColumns) {
      const normalized = column.toLowerCase().replace(/[_\s-]+/g, '');

      let suggestedTarget: TargetField | undefined;
      let confidence = 0;

      // Name field detection
      if (
        normalized.includes('name') ||
        normalized.includes('contact') ||
        normalized.includes('fullname')
      ) {
        suggestedTarget = 'RELATIONSHIP_NAME';
        confidence = 0.9;
      }

      // Segment/class detection
      else if (
        normalized.includes('segment') ||
        normalized.includes('tier') ||
        normalized.includes('class') ||
        normalized.includes('book')
      ) {
        suggestedTarget = 'BOOK_CLASS';
        confidence = 0.85;
      }

      // Status detection
      else if (normalized.includes('status') || normalized.includes('state')) {
        suggestedTarget = 'STATUS';
        confidence = 0.8;
      }

      // Last contact date
      else if (
        normalized.includes('lastcontact') ||
        normalized.includes('lastinteraction') ||
        normalized.includes('lasttouch')
      ) {
        suggestedTarget = 'LAST_INTERACTION_DATE';
        confidence = 0.85;
      }

      // Interaction type
      else if (
        normalized.includes('contacttype') ||
        normalized.includes('interactiontype')
      ) {
        suggestedTarget = 'LAST_INTERACTION_TYPE';
        confidence = 0.8;
      }

      // Value outlook / next contact
      else if (
        normalized.includes('nextcontact') ||
        normalized.includes('followup') ||
        normalized.includes('outlook')
      ) {
        suggestedTarget = 'VALUE_OUTLOOK_DATE';
        confidence = 0.7;
      }

      suggestions.push({
        sourceField: column,
        suggestedTarget,
        confidence,
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Apply field mappings and transform raw records
   */
  async applyMapping(params: {
    ledgerSourceId: string;
    firmId: string;
    rawRecords: Record<string, any>[];
    mappings: FieldMapping[];
  }): Promise<{
    relationships: Relationship[];
    interactions: Interaction[];
  }> {
    const relationships: Relationship[] = [];
    const interactions: Interaction[] = [];

    // Build mapping lookup
    const mappingLookup = new Map<string, TargetField>();
    for (const mapping of params.mappings) {
      mappingLookup.set(mapping.sourceField, mapping.targetField);
    }

    for (const rawRecord of params.rawRecords) {
      const relationship = this.transformToRelationship(
        rawRecord,
        mappingLookup,
        params.firmId
      );

      if (relationship) {
        relationships.push(relationship);

        // If there's a last interaction, create an interaction record
        if (relationship.lastInteractionAt) {
          interactions.push({
            id: this.generateId(),
            relationshipId: relationship.id,
            type: relationship.lastInteractionType || 'NOTE',
            direction: 'OUTBOUND',
            occurredAt: relationship.lastInteractionAt,
            valueEventWeight: 1,
            notes: 'Imported from ledger source',
            sourceSystem: params.ledgerSourceId,
            createdAt: new Date(),
          });
        }
      }
    }

    return { relationships, interactions };
  }

  /**
   * Transform a raw record to a Relationship entity
   */
  private transformToRelationship(
    rawRecord: Record<string, any>,
    mappings: Map<string, TargetField>,
    firmId: string
  ): Relationship | null {
    const relationship: Partial<Relationship> = {
      id: this.generateId(),
      firmId,
      continuityGrade: 'B', // Default, will be recalculated
      continuityScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Apply mappings
    for (const [sourceField, value] of Object.entries(rawRecord)) {
      const targetField = mappings.get(sourceField);

      if (!targetField) continue;

      switch (targetField) {
        case 'RELATIONSHIP_NAME':
          relationship.displayName = this.sanitizeString(value);
          break;

        case 'BOOK_CLASS':
          relationship.roleOrSegment = this.sanitizeString(value);
          break;

        case 'STATUS':
          relationship.status = this.parseStatus(value);
          break;

        case 'VALUE_OUTLOOK_DATE':
          relationship.valueOutlook = this.sanitizeString(value);
          break;

        case 'LAST_INTERACTION_DATE':
          relationship.lastInteractionAt = this.parseDate(value);
          break;

        case 'LAST_INTERACTION_TYPE':
          relationship.lastInteractionType = this.parseInteractionType(value);
          break;
      }
    }

    // Validate required fields
    if (!relationship.displayName) {
      console.warn('Skipping record: missing displayName', rawRecord);
      return null;
    }

    // Set defaults
    if (!relationship.roleOrSegment) {
      relationship.roleOrSegment = 'Unclassified';
    }

    if (!relationship.status) {
      relationship.status = 'REVIEW';
    }

    if (!relationship.valueOutlook) {
      relationship.valueOutlook = 'Pending classification';
    }

    return relationship as Relationship;
  }

  /**
   * Parse status from various string formats
   */
  private parseStatus(value: any): RelationshipStatus {
    if (!value) return 'REVIEW';

    const normalized = String(value).toLowerCase().trim();

    if (normalized.includes('strong') || normalized.includes('active')) return 'STRONG';
    if (normalized.includes('stable') || normalized.includes('good')) return 'STABLE';
    if (normalized.includes('pending') || normalized.includes('new')) return 'PENDING';
    if (normalized.includes('review') || normalized.includes('watch')) return 'REVIEW';
    if (normalized.includes('inactive') || normalized.includes('dormant')) return 'INACTIVE';

    return 'REVIEW';
  }

  /**
   * Parse interaction type from various string formats
   */
  private parseInteractionType(value: any): InteractionType {
    if (!value) return 'NOTE';

    const normalized = String(value).toLowerCase().trim();

    if (normalized.includes('email') || normalized.includes('e-mail')) return 'EMAIL';
    if (normalized.includes('call') || normalized.includes('phone')) return 'CALL';
    if (normalized.includes('meeting') || normalized.includes('visit')) return 'MEETING';
    if (normalized.includes('note') || normalized.includes('memo')) return 'NOTE';

    return 'OTHER';
  }

  /**
   * Parse date from various formats
   */
  private parseDate(value: any): Date | undefined {
    if (!value) return undefined;

    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      console.warn('Failed to parse date:', value);
    }

    return undefined;
  }

  /**
   * Sanitize string values
   */
  private sanitizeString(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  /**
   * Generate portfolio assessment from imported relationships
   */
  async generateAssessment(params: {
    relationships: Relationship[];
  }): Promise<{
    portfolioRating: string;
    portfolioRatingNumeric: number;
    strongStablePercent: number;
    reviewPercent: number;
    dormantEquityPercent: number;
  }> {
    const total = params.relationships.length;

    if (total === 0) {
      return {
        portfolioRating: 'B',
        portfolioRatingNumeric: 0,
        strongStablePercent: 0,
        reviewPercent: 0,
        dormantEquityPercent: 0,
      };
    }

    const strongStable = params.relationships.filter(
      (r) => r.status === 'STRONG' || r.status === 'STABLE'
    ).length;

    const review = params.relationships.filter((r) => r.status === 'REVIEW').length;

    const dormant = params.relationships.filter((r) => r.status === 'INACTIVE').length;

    const strongStablePercent = Math.round((strongStable / total) * 100);
    const reviewPercent = Math.round((review / total) * 100);
    const dormantEquityPercent = Math.round((dormant / total) * 100);

    // Calculate portfolio rating based on distribution
    let portfolioRatingNumeric = 50; // Base

    if (strongStablePercent >= 70) portfolioRatingNumeric = 85;
    else if (strongStablePercent >= 50) portfolioRatingNumeric = 75;
    else if (strongStablePercent >= 30) portfolioRatingNumeric = 65;

    const portfolioRating =
      portfolioRatingNumeric >= 80
        ? 'AA'
        : portfolioRatingNumeric >= 70
        ? 'A'
        : portfolioRatingNumeric >= 60
        ? 'BBB'
        : 'BB';

    return {
      portfolioRating,
      portfolioRatingNumeric,
      strongStablePercent,
      reviewPercent,
      dormantEquityPercent,
    };
  }

  private generateId(): string {
    // TODO: Use proper UUID generation
    return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
