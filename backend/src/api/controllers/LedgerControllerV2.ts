/**
 * Primus OS Business Edition - Ledger Controller (Database-Backed)
 *
 * Handles API requests for the Continuity Ledger with real data
 */

import { Request, Response } from 'express';
import { RelationshipRepository } from '../../infra/repositories/RelationshipRepository';
import { InteractionRepository } from '../../infra/repositories/InteractionRepository';
import { GovernanceRepository } from '../../infra/repositories/GovernanceRepository';
import { ContinuityScoreService } from '../../domain/continuity/ContinuityScoreService';
import { RationaleBuilder } from '../../domain/rationale/RationaleBuilder';
import { GovernanceEventService } from '../../domain/governance/GovernanceEventService';
import { v4 as uuidv4 } from 'uuid';

export class LedgerController {
  constructor(
    private relationshipRepo: RelationshipRepository,
    private interactionRepo: InteractionRepository,
    private governanceRepo: GovernanceRepository,
    private continuityScoreService: ContinuityScoreService,
    private rationaleBuilder: RationaleBuilder,
    private eventService: GovernanceEventService
  ) {}

  /**
   * GET /api/ledger
   * List all relationships for a firm
   */
  async listPortfolio(req: Request, res: Response): Promise<void> {
    try {
      const firmId = (req as any).user?.firmId;
      const { status, grade, limit = 50, offset = 0 } = req.query;

      const relationships = await this.relationshipRepo.findByFirm({
        firmId,
        status: status as any,
        grade: grade as any,
        limit: Number(limit),
        offset: Number(offset),
      });

      const total = await this.relationshipRepo.countByFirm(firmId);

      res.json({
        data: relationships,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      });
    } catch (error) {
      console.error('Error listing portfolio:', error);
      res.status(500).json({ error: 'Failed to retrieve portfolio' });
    }
  }

  /**
   * GET /api/ledger/:id
   * Get detailed relationship with rationale
   */
  async getRelationship(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const firmId = (req as any).user?.firmId;

      const relationship = await this.relationshipRepo.findById(id, firmId);

      if (!relationship) {
        res.status(404).json({ error: 'Relationship not found' });
        return;
      }

      const interactions = await this.interactionRepo.findByRelationship(id, 50);

      // Calculate current score
      const scoreResult = await this.continuityScoreService.calculateForRelationship(
        relationship,
        interactions
      );

      // Update relationship if score changed
      if (
        scoreResult.score !== relationship.continuityScore ||
        scoreResult.grade !== relationship.continuityGrade
      ) {
        await this.relationshipRepo.update(id, {
          continuityScore: scoreResult.score,
          continuityGrade: scoreResult.grade,
        });
      }

      // Build rationale
      const rationale = this.rationaleBuilder.build({
        relationship,
        interactions,
        score: scoreResult.score,
        grade: scoreResult.grade,
      });

      res.json({
        relationship: {
          ...relationship,
          continuityScore: scoreResult.score,
          continuityGrade: scoreResult.grade,
        },
        rationale,
        interactions: interactions.slice(0, 10), // Return last 10 interactions
      });
    } catch (error) {
      console.error('Error getting relationship:', error);
      res.status(500).json({ error: 'Failed to retrieve relationship' });
    }
  }

  /**
   * POST /api/ledger/:id/drafts
   * Create an outreach draft for a relationship
   */
  async createDraft(req: Request, res: Response): Promise<void> {
    try {
      const { id: relationshipId } = req.params;
      const { subject, body } = req.body;
      const userId = (req as any).user?.id;
      const firmId = (req as any).user?.firmId;

      // Validate input
      if (!subject || !body) {
        res.status(400).json({ error: 'Subject and body are required' });
        return;
      }

      // Verify relationship exists
      const relationship = await this.relationshipRepo.findById(relationshipId, firmId);

      if (!relationship) {
        res.status(404).json({ error: 'Relationship not found' });
        return;
      }

      // Create draft
      const draft = {
        id: uuidv4(),
        relationshipId,
        firmId,
        subject,
        body,
        status: 'PREPARED' as const,
        preparedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedDraft = await this.governanceRepo.insertDraft(draft);

      // Record governance event
      await this.eventService.record({
        firmId,
        entityType: 'OUTREACH_DRAFT',
        entityId: savedDraft.id,
        eventType: 'DRAFT_PREPARED',
        performedBy: userId,
        payload: { relationshipId, subject },
      });

      res.status(201).json(savedDraft);
    } catch (error) {
      console.error('Error creating draft:', error);
      res.status(500).json({ error: 'Failed to create draft' });
    }
  }

  /**
   * POST /api/ledger/:id/record-interaction
   * Record a new interaction
   */
  async recordInteraction(req: Request, res: Response): Promise<void> {
    try {
      const { id: relationshipId } = req.params;
      const { type, direction, notes, valueEventWeight = 1 } = req.body;
      const userId = (req as any).user?.id;
      const firmId = (req as any).user?.firmId;

      // Verify relationship exists
      const relationship = await this.relationshipRepo.findById(relationshipId, firmId);

      if (!relationship) {
        res.status(404).json({ error: 'Relationship not found' });
        return;
      }

      // Create interaction record
      const interaction = {
        id: uuidv4(),
        relationshipId,
        type,
        direction,
        occurredAt: new Date(),
        valueEventWeight,
        notes,
        createdAt: new Date(),
      };

      const savedInteraction = await this.interactionRepo.insert(interaction);

      // Update relationship last interaction
      await this.relationshipRepo.update(relationshipId, {
        lastInteractionAt: new Date(),
        lastInteractionType: type,
      });

      // Record event
      await this.eventService.record({
        firmId,
        entityType: 'RELATIONSHIP',
        entityId: relationshipId,
        eventType: 'INTERACTION_RECORDED',
        performedBy: userId,
        payload: { interactionId: savedInteraction.id, type },
      });

      res.status(201).json(savedInteraction);
    } catch (error) {
      console.error('Error recording interaction:', error);
      res.status(500).json({ error: 'Failed to record interaction' });
    }
  }

  /**
   * POST /api/ledger/recalculate-scores
   * Recalculate continuity scores for all relationships (admin)
   */
  async recalculateScores(req: Request, res: Response): Promise<void> {
    try {
      const firmId = (req as any).user?.firmId;
      const userId = (req as any).user?.id;

      // Load all relationships
      const relationships = await this.relationshipRepo.findByFirm({
        firmId,
        limit: 1000,
      });

      // Load interactions for all relationships
      const relationshipIds = relationships.map((r) => r.id);
      const interactionsByRel = await this.interactionRepo.findByRelationships(
        relationshipIds
      );

      // Batch calculate scores
      const scores = await this.continuityScoreService.calculateBatch(
        relationships,
        interactionsByRel
      );

      // Batch update scores (optimized - replaces N+1 update loop)
      const scoreUpdates = Array.from(scores.entries()).map(([id, result]) => ({
        id,
        continuityScore: result.score,
        continuityGrade: result.grade,
      }));

      await this.relationshipRepo.batchUpdateScores(scoreUpdates);
      const updatedCount = scoreUpdates.length;

      await this.eventService.record({
        firmId,
        entityType: 'RELATIONSHIP',
        entityId: 'ALL',
        eventType: 'SCORES_RECALCULATED',
        performedBy: userId,
        payload: { count: updatedCount },
      });

      res.json({ message: 'Scores recalculated successfully', count: updatedCount });
    } catch (error) {
      console.error('Error recalculating scores:', error);
      res.status(500).json({ error: 'Failed to recalculate scores' });
    }
  }
}
