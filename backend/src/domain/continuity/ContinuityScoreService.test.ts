/**
 * Primus OS Business Edition - Continuity Score Service Tests
 *
 * Unit tests for scoring algorithm and grade mapping
 */

import { ContinuityScoreService } from './ContinuityScoreService';
import { Relationship, Interaction, ContinuityGrade } from '../../types';

describe('ContinuityScoreService', () => {
  let service: ContinuityScoreService;

  beforeEach(() => {
    service = new ContinuityScoreService();
  });

  describe('Grade Mapping', () => {
    it('should map score 95 to AAA', async () => {
      const relationship = createMockRelationship();
      const interactions = createRecentInteractions(15, 12); // 15 interactions in last 12 months

      const result = await service.calculateForRelationship(relationship, interactions);

      expect(result.grade).toBe('AAA');
      expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it('should map score 85 to AA', async () => {
      const relationship = createMockRelationship();
      const interactions = createRecentInteractions(8, 45); // 8 interactions, last 45 days ago

      const result = await service.calculateForRelationship(relationship, interactions);

      expect(result.grade).toBe('AA');
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.score).toBeLessThan(90);
    });

    it('should map score 75 to A', async () => {
      const relationship = createMockRelationship();
      const interactions = createRecentInteractions(4, 60); // 4 interactions, last 60 days ago

      const result = await service.calculateForRelationship(relationship, interactions);

      expect(result.grade).toBe('A');
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.score).toBeLessThan(80);
    });

    it('should map score 65 to BBB', async () => {
      const relationship = createMockRelationship();
      const interactions = createRecentInteractions(2, 120); // 2 interactions, last 120 days ago

      const result = await service.calculateForRelationship(relationship, interactions);

      expect(result.grade).toBe('BBB');
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.score).toBeLessThan(70);
    });

    it('should map score 55 to BB', async () => {
      const relationship = createMockRelationship();
      const interactions = createRecentInteractions(1, 200); // 1 interaction, last 200 days ago

      const result = await service.calculateForRelationship(relationship, interactions);

      expect(result.grade).toBe('BB');
      expect(result.score).toBeGreaterThanOrEqual(45);
      expect(result.score).toBeLessThan(60);
    });

    it('should map score 30 to B', async () => {
      const relationship = createMockRelationship();
      const interactions = createRecentInteractions(0, 400); // No recent interactions

      const result = await service.calculateForRelationship(relationship, interactions);

      expect(result.grade).toBe('B');
      expect(result.score).toBeLessThan(45);
    });
  });

  describe('Scoring Components', () => {
    it('should give high recency score for last 30 days', async () => {
      const relationship = createMockRelationship();
      const interactions = [createInteraction(15)]; // 15 days ago

      const result = await service.calculateForRelationship(relationship, interactions);

      // Recency should contribute 40 points
      expect(result.score).toBeGreaterThanOrEqual(40);
    });

    it('should give lower recency score for 90+ days', async () => {
      const relationship = createMockRelationship();
      const interactions = [createInteraction(95)]; // 95 days ago

      const result = await service.calculateForRelationship(relationship, interactions);

      // Recency should contribute 20 points max
      expect(result.score).toBeLessThanOrEqual(30);
    });

    it('should reward high interaction frequency', async () => {
      const relationship = createMockRelationship();
      const interactions = createRecentInteractions(15, 30); // 15 interactions, last 30 days

      const result = await service.calculateForRelationship(relationship, interactions);

      // Should get high frequency score (30) + high recency (40)
      expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it('should handle zero interactions gracefully', async () => {
      const relationship = createMockRelationship();
      const interactions: Interaction[] = [];

      const result = await service.calculateForRelationship(relationship, interactions);

      expect(result.score).toBeLessThan(20); // Minimal score
      expect(result.grade).toBe('B');
      expect(result.reasonSummary).toContain('No recorded interactions');
    });
  });

  describe('Reason Summary', () => {
    it('should include score and grade in summary', async () => {
      const relationship = createMockRelationship();
      const interactions = createRecentInteractions(10, 20);

      const result = await service.calculateForRelationship(relationship, interactions);

      expect(result.reasonSummary).toContain(`Score ${result.score}/100`);
      expect(result.reasonSummary).toContain(result.grade);
    });

    it('should describe recent interaction', async () => {
      const relationship = createMockRelationship();
      const interactions = [createInteraction(12)];

      const result = await service.calculateForRelationship(relationship, interactions);

      expect(result.reasonSummary).toContain('Recent interaction');
      expect(result.reasonSummary).toContain('12 days');
    });

    it('should include interaction count', async () => {
      const relationship = createMockRelationship();
      const interactions = createRecentInteractions(7, 30);

      const result = await service.calculateForRelationship(relationship, interactions);

      expect(result.reasonSummary).toContain('Interaction volume');
      expect(result.reasonSummary).toContain('7');
    });
  });

  describe('Batch Calculation', () => {
    it('should calculate scores for multiple relationships', async () => {
      const relationships = [
        createMockRelationship('rel_1'),
        createMockRelationship('rel_2'),
        createMockRelationship('rel_3'),
      ];

      const interactionsByRel = new Map<string, Interaction[]>();
      interactionsByRel.set('rel_1', createRecentInteractions(15, 10));
      interactionsByRel.set('rel_2', createRecentInteractions(5, 60));
      interactionsByRel.set('rel_3', createRecentInteractions(1, 200));

      const results = await service.calculateBatch(relationships, interactionsByRel);

      expect(results.size).toBe(3);
      expect(results.get('rel_1')!.grade).toBe('AAA');
      expect(results.get('rel_2')!.grade).toBe('A');
      expect(results.get('rel_3')!.grade).toBe('BB');
    });
  });
});

// Helper functions

function createMockRelationship(id = 'rel_test'): Relationship {
  return {
    id,
    displayName: 'Test Relationship',
    roleOrSegment: 'Test Segment',
    status: 'STABLE',
    valueOutlook: 'Test outlook',
    continuityGrade: 'B' as ContinuityGrade,
    continuityScore: 0,
    firmId: 'firm_test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createInteraction(daysAgo: number): Interaction {
  const occurredAt = new Date();
  occurredAt.setDate(occurredAt.getDate() - daysAgo);

  return {
    id: `int_${Date.now()}_${Math.random()}`,
    relationshipId: 'rel_test',
    type: 'EMAIL',
    direction: 'OUTBOUND',
    occurredAt,
    valueEventWeight: 1,
    createdAt: new Date(),
  };
}

function createRecentInteractions(count: number, lastDaysAgo: number): Interaction[] {
  const interactions: Interaction[] = [];

  for (let i = 0; i < count; i++) {
    // Spread interactions over last year, with most recent one at lastDaysAgo
    const daysAgo = lastDaysAgo + (i * 30);
    interactions.push(createInteraction(daysAgo));
  }

  return interactions;
}
