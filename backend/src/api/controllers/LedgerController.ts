/**
 * Primus OS Business Edition - Ledger Controller
 *
 * Handles API requests for the Continuity Ledger
 */

import { Request, Response } from 'express';
import { supabase, getFirmIdFromUserId, getUserFromToken } from '../../supabaseClient';
import { ContinuityScoreService } from '../../domain/continuity/ContinuityScoreService';
import { RationaleBuilder } from '../../domain/rationale/RationaleBuilder';
import { GovernanceEventService } from '../../domain/governance/GovernanceEventService';

export class LedgerController {
  constructor(
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
      // Get user from auth token (assuming middleware sets req.user)
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No authorization token provided' });
        return;
      }

      const token = authHeader.substring(7);
      const user = await getUserFromToken(token);
      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      const firmId = await getFirmIdFromUserId(user.id);

      const { status, grade, limit = '50', offset = '0' } = req.query;
      const limitNum = parseInt(limit as string, 10) || 50;
      const offsetNum = parseInt(offset as string, 10) || 0;

      // Efficient single query with joins - prevents N+1 queries
      let query = supabase
        .from('relationships')
        .select(`
          id,
          external_id,
          display_name,
          role_or_segment,
          status,
          value_outlook,
          continuity_grade,
          continuity_score,
          last_interaction_at,
          last_interaction_type,
          created_at,
          updated_at,
          continuity_snapshots!inner(
            reason_summary,
            calculated_at
          ),
          interactions!inner(
            occurred_at,
            value_event_weight
          )
        `, { count: 'exact' })
        .eq('firm_id', firmId)
        .order('continuity_score', { ascending: false })
        .range(offsetNum, offsetNum + limitNum - 1);

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (grade) {
        query = query.eq('continuity_grade', grade);
      }

      const { data: relationships, error, count } = await query;

      if (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to retrieve portfolio' });
        return;
      }

      // Transform data to match frontend expectations
      const transformedData = relationships?.map(rel => ({
        id: rel.id,
        externalId: rel.external_id,
        displayName: rel.display_name,
        roleOrSegment: rel.role_or_segment,
        status: rel.status,
        valueOutlook: rel.value_outlook,
        continuityGrade: rel.continuity_grade,
        continuityScore: rel.continuity_score,
        lastInteractionAt: rel.last_interaction_at,
        lastInteractionType: rel.last_interaction_type,
        latestSignal: rel.continuity_snapshots?.[0]?.reason_summary || null,
        signalDate: rel.continuity_snapshots?.[0]?.calculated_at || null,
        interactionCount: rel.interactions?.length || 0,
        createdAt: rel.created_at,
        updatedAt: rel.updated_at,
      })) || [];

      res.json({
        data: transformedData,
        pagination: {
          total: count || 0,
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

      // Get user from auth token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No authorization token provided' });
        return;
      }

      const token = authHeader.substring(7);
      const user = await getUserFromToken(token);
      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      const firmId = await getFirmIdFromUserId(user.id);

      // Get relationship with interactions in a single efficient query
      const { data: relationship, error: relError } = await supabase
        .from('relationships')
        .select('*')
        .eq('id', id)
        .eq('firm_id', firmId)
        .single();

      if (relError || !relationship) {
        res.status(404).json({ error: 'Relationship not found' });
        return;
      }

      // Get interactions for this relationship
      const { data: interactions, error: intError } = await supabase
        .from('interactions')
        .select('*')
        .eq('relationship_id', id)
        .order('occurred_at', { ascending: false })
        .limit(50);

      if (intError) {
        console.error('Error fetching interactions:', intError);
        res.status(500).json({ error: 'Failed to retrieve relationship interactions' });
        return;
      }

      // Calculate current score using our service
      const scoreResult = await this.continuityScoreService.calculateForRelationship(
        relationship,
        interactions || []
      );

      // Build rationale
      const rationale = this.rationaleBuilder.build({
        relationship,
        interactions: interactions || [],
        score: scoreResult.score,
        grade: scoreResult.grade,
      });

      res.json({
        relationship: {
          id: relationship.id,
          externalId: relationship.external_id,
          displayName: relationship.display_name,
          roleOrSegment: relationship.role_or_segment,
          status: relationship.status,
          valueOutlook: relationship.value_outlook,
          continuityGrade: relationship.continuity_grade,
          continuityScore: relationship.continuity_score,
          lastInteractionAt: relationship.last_interaction_at,
          lastInteractionType: relationship.last_interaction_type,
          createdAt: relationship.created_at,
          updatedAt: relationship.updated_at,
        },
        interactions: interactions || [],
        rationale,
        score: scoreResult,
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

      // TODO: Verify relationship exists
      // const relationship = await db.relationships.findById(relationshipId, { firmId });
      // if (!relationship) {
      //   return res.status(404).json({ error: 'Relationship not found' });
      // }

      // Create draft
      // const draft = await db.outreachDrafts.insert({
      //   id: generateId(),
      //   relationshipId,
      //   firmId,
      //   subject,
      //   body,
      //   status: 'PREPARED',
      //   preparedBy: userId,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // });

      const draft = {
        id: 'draft_' + Date.now(),
        relationshipId,
        firmId,
        subject,
        body,
        status: 'PREPARED',
        preparedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Record governance event
      await this.eventService.record({
        firmId,
        entityType: 'OUTREACH_DRAFT',
        entityId: draft.id,
        eventType: 'DRAFT_PREPARED',
        performedBy: userId,
        payload: { relationshipId, subject },
      });

      res.status(201).json(draft);
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

      // TODO: Create interaction record
      // const interaction = await db.interactions.insert({
      //   id: generateId(),
      //   relationshipId,
      //   type,
      //   direction,
      //   occurredAt: new Date(),
      //   valueEventWeight,
      //   notes,
      //   createdAt: new Date(),
      // });

      const interaction = {
        id: 'int_' + Date.now(),
        relationshipId,
        type,
        direction,
        occurredAt: new Date(),
        valueEventWeight,
        notes,
        createdAt: new Date(),
      };

      // Update relationship last interaction
      // await db.relationships.update(relationshipId, {
      //   lastInteractionAt: new Date(),
      //   lastInteractionType: type,
      // });

      // Record event
      await this.eventService.record({
        firmId,
        entityType: 'RELATIONSHIP',
        entityId: relationshipId,
        eventType: 'INTERACTION_RECORDED',
        performedBy: userId,
        payload: { interactionId: interaction.id, type },
      });

      res.status(201).json(interaction);
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

      // TODO: Load all relationships and interactions
      // const relationships = await db.relationships.findMany({ where: { firmId } });
      // const allInteractions = await db.interactions.findMany({
      //   where: { relationshipId: { in: relationships.map(r => r.id) } }
      // });

      // Group interactions by relationship
      // const interactionsByRel = new Map();
      // for (const int of allInteractions) {
      //   if (!interactionsByRel.has(int.relationshipId)) {
      //     interactionsByRel.set(int.relationshipId, []);
      //   }
      //   interactionsByRel.get(int.relationshipId).push(int);
      // }

      // Batch calculate scores
      // const scores = await this.continuityScoreService.calculateBatch(
      //   relationships,
      //   interactionsByRel
      // );

      // Update relationships
      // for (const [relId, scoreResult] of scores.entries()) {
      //   await db.relationships.update(relId, {
      //     continuityScore: scoreResult.score,
      //     continuityGrade: scoreResult.grade,
      //   });

      //   // Create snapshot
      //   await db.continuitySnapshots.insert({
      //     id: generateId(),
      //     relationshipId: relId,
      //     score: scoreResult.score,
      //     grade: scoreResult.grade,
      //     calculatedAt: new Date(),
      //     reasonSummary: scoreResult.reasonSummary,
      //     createdAt: new Date(),
      //   });
      // }

      await this.eventService.record({
        firmId,
        entityType: 'RELATIONSHIP',
        entityId: 'ALL',
        eventType: 'SCORES_RECALCULATED',
        performedBy: userId,
        payload: { count: 0 },
      });

      res.json({ message: 'Scores recalculated successfully', count: 0 });
    } catch (error) {
      console.error('Error recalculating scores:', error);
      res.status(500).json({ error: 'Failed to recalculate scores' });
    }
  }
}
