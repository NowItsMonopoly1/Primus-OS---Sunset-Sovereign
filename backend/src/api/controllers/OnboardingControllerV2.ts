/**
 * Primus OS Business Edition - Onboarding Controller (Database-Backed)
 *
 * Handles API requests for firm onboarding and ledger source mapping
 */

import { Request, Response } from 'express';
import { MappingEngine } from '../../domain/mapping/MappingEngine';
import { ContinuityScoreService } from '../../domain/continuity/ContinuityScoreService';
import { GovernanceEventService } from '../../domain/governance/GovernanceEventService';
import { LedgerSourceRepository } from '../../infra/repositories/LedgerSourceRepository';
import { FieldMappingRepository } from '../../infra/repositories/FieldMappingRepository';
import { RelationshipRepository } from '../../infra/repositories/RelationshipRepository';
import { InteractionRepository } from '../../infra/repositories/InteractionRepository';
import { v4 as uuidv4 } from 'uuid';

export class OnboardingController {
  constructor(
    private mappingEngine: MappingEngine,
    private continuityScoreService: ContinuityScoreService,
    private eventService: GovernanceEventService,
    private ledgerSourceRepo: LedgerSourceRepository,
    private fieldMappingRepo: FieldMappingRepository,
    private relationshipRepo: RelationshipRepository,
    private interactionRepo: InteractionRepository
  ) {}

  /**
   * GET /api/onboarding/ledger-sources
   * Get all ledger sources for a firm
   */
  async getLedgerSources(req: Request, res: Response): Promise<void> {
    try {
      const firmId = (req as any).user?.firmId;

      const sources = await this.ledgerSourceRepo.findByFirm(firmId);

      res.json({ data: sources });
    } catch (error) {
      console.error('Error getting ledger sources:', error);
      res.status(500).json({ error: 'Failed to retrieve ledger sources' });
    }
  }

  /**
   * POST /api/onboarding/ledger-sources
   * Create a new ledger source
   */
  async createLedgerSource(req: Request, res: Response): Promise<void> {
    try {
      const { sourceType, sourceName } = req.body;
      const firmId = (req as any).user?.firmId;
      const userId = (req as any).user?.id;

      if (!sourceType || !sourceName) {
        res.status(400).json({ error: 'sourceType and sourceName are required' });
        return;
      }

      const source = {
        id: uuidv4(),
        firmId,
        sourceType,
        sourceName,
        status: 'PENDING' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedSource = await this.ledgerSourceRepo.insert(source);

      await this.eventService.record({
        firmId,
        entityType: 'MAPPING',
        entityId: savedSource.id,
        eventType: 'LEDGER_SOURCE_CREATED',
        performedBy: userId,
        payload: { sourceType, sourceName },
      });

      res.status(201).json(savedSource);
    } catch (error) {
      console.error('Error creating ledger source:', error);
      res.status(500).json({ error: 'Failed to create ledger source' });
    }
  }

  /**
   * POST /api/onboarding/preview-fields
   * Preview field mappings from sample data
   */
  async previewFields(req: Request, res: Response): Promise<void> {
    try {
      const { ledgerSourceId, sampleHeaders } = req.body;
      const firmId = (req as any).user?.firmId;

      if (!sampleHeaders || !Array.isArray(sampleHeaders)) {
        res.status(400).json({ error: 'sampleHeaders array is required' });
        return;
      }

      // Verify ledger source exists and belongs to firm
      if (ledgerSourceId) {
        const source = await this.ledgerSourceRepo.findById(ledgerSourceId, firmId);
        if (!source) {
          res.status(404).json({ error: 'Ledger source not found' });
          return;
        }
      }

      const suggestions = await this.mappingEngine.previewMapping({
        rawColumns: sampleHeaders,
      });

      res.json({ suggestions });
    } catch (error) {
      console.error('Error previewing fields:', error);
      res.status(500).json({ error: 'Failed to preview field mappings' });
    }
  }

  /**
   * POST /api/onboarding/approve-fields
   * Save approved field mappings
   */
  async approveFields(req: Request, res: Response): Promise<void> {
    try {
      const { ledgerSourceId, mappings } = req.body;
      const firmId = (req as any).user?.firmId;
      const userId = (req as any).user?.id;

      if (!ledgerSourceId || !mappings || !Array.isArray(mappings)) {
        res.status(400).json({ error: 'ledgerSourceId and mappings array are required' });
        return;
      }

      // Verify ledger source exists and belongs to firm
      const source = await this.ledgerSourceRepo.findById(ledgerSourceId, firmId);
      if (!source) {
        res.status(404).json({ error: 'Ledger source not found' });
        return;
      }

      // Delete existing mappings for this source
      await this.fieldMappingRepo.deleteByLedgerSource(ledgerSourceId);

      // Insert new mappings
      const fieldMappings = mappings.map((m: any) => ({
        id: uuidv4(),
        ledgerSourceId,
        sourceField: m.sourceField,
        targetField: m.targetField,
        createdAt: new Date(),
      }));

      await this.fieldMappingRepo.batchInsert(fieldMappings);

      // Update source status to ACTIVE
      await this.ledgerSourceRepo.updateStatus(ledgerSourceId, 'ACTIVE');

      await this.eventService.record({
        firmId,
        entityType: 'MAPPING',
        entityId: ledgerSourceId,
        eventType: 'FIELD_MAPPINGS_APPROVED',
        performedBy: userId,
        payload: { count: mappings.length },
      });

      res.json({ message: 'Field mappings saved successfully', count: mappings.length });
    } catch (error) {
      console.error('Error approving fields:', error);
      res.status(500).json({ error: 'Failed to save field mappings' });
    }
  }

  /**
   * POST /api/onboarding/run-assessment
   * Import data and run initial continuity assessment
   */
  async runAssessment(req: Request, res: Response): Promise<void> {
    try {
      const { ledgerSourceId, rawRecords } = req.body;
      const firmId = (req as any).user?.firmId;
      const userId = (req as any).user?.id;

      if (!ledgerSourceId || !rawRecords || !Array.isArray(rawRecords)) {
        res.status(400).json({ error: 'ledgerSourceId and rawRecords array are required' });
        return;
      }

      // Verify ledger source
      const source = await this.ledgerSourceRepo.findById(ledgerSourceId, firmId);
      if (!source) {
        res.status(404).json({ error: 'Ledger source not found' });
        return;
      }

      // Load approved mappings
      const mappings = await this.fieldMappingRepo.findByLedgerSource(ledgerSourceId);

      if (mappings.length === 0) {
        res.status(400).json({ error: 'No field mappings found. Please approve mappings first.' });
        return;
      }

      // Apply mappings to transform raw records
      const { relationships, interactions } = await this.mappingEngine.applyMapping({
        ledgerSourceId,
        firmId,
        rawRecords,
        mappings,
      });

      // Persist relationships and interactions
      await this.relationshipRepo.batchInsert(relationships);
      await this.interactionRepo.batchInsert(interactions);

      // Calculate continuity scores
      const interactionsByRel = new Map();
      for (const int of interactions) {
        if (!interactionsByRel.has(int.relationshipId)) {
          interactionsByRel.set(int.relationshipId, []);
        }
        interactionsByRel.get(int.relationshipId).push(int);
      }

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

      // Generate portfolio assessment
      const assessment = await this.mappingEngine.generateAssessment({
        relationships: Array.from(scores.entries()).map(([id, score]) => {
          const rel = relationships.find((r) => r.id === id)!;
          return {
            ...rel,
            continuityScore: score.score,
            continuityGrade: score.grade,
          };
        }),
      });

      await this.eventService.record({
        firmId,
        entityType: 'MAPPING',
        entityId: ledgerSourceId,
        eventType: 'INITIAL_ASSESSMENT_COMPLETED',
        performedBy: userId,
        payload: { relationshipCount: relationships.length },
      });

      res.json({
        assessment,
        importedCount: relationships.length,
      });
    } catch (error) {
      console.error('Error running assessment:', error);
      res.status(500).json({ error: 'Failed to run assessment' });
    }
  }
}
