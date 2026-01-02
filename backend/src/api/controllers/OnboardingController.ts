/**
 * Primus OS Business Edition - Onboarding Controller
 *
 * Handles API requests for firm onboarding and ledger source mapping
 */

import { Request, Response } from 'express';
import { MappingEngine } from '../../domain/mapping/MappingEngine';
import { ContinuityScoreService } from '../../domain/continuity/ContinuityScoreService';
import { GovernanceEventService } from '../../domain/governance/GovernanceEventService';

export class OnboardingController {
  constructor(
    private mappingEngine: MappingEngine,
    private continuityScoreService: ContinuityScoreService,
    private eventService: GovernanceEventService
  ) {}

  /**
   * GET /api/onboarding/ledger-sources
   * Get all ledger sources for a firm
   */
  async getLedgerSources(req: Request, res: Response): Promise<void> {
    try {
      const firmId = (req as any).user?.firmId;

      // TODO: Implement database query
      // const sources = await db.ledgerSources.findMany({
      //   where: { firmId },
      //   orderBy: { createdAt: 'desc' }
      // });

      res.json({ data: [] });
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

      // TODO: Create in database
      // const source = await db.ledgerSources.insert({
      //   id: generateId(),
      //   firmId,
      //   sourceType,
      //   sourceName,
      //   status: 'PENDING',
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // });

      const source = {
        id: 'src_' + Date.now(),
        firmId,
        sourceType,
        sourceName,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.eventService.record({
        firmId,
        entityType: 'MAPPING',
        entityId: source.id,
        eventType: 'LEDGER_SOURCE_CREATED',
        performedBy: userId,
        payload: { sourceType, sourceName },
      });

      res.status(201).json(source);
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

      if (!sampleHeaders || !Array.isArray(sampleHeaders)) {
        res.status(400).json({ error: 'sampleHeaders array is required' });
        return;
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

      // TODO: Save mappings to database
      // for (const mapping of mappings) {
      //   await db.fieldMappings.insert({
      //     id: generateId(),
      //     ledgerSourceId,
      //     sourceField: mapping.sourceField,
      //     targetField: mapping.targetField,
      //     createdAt: new Date(),
      //   });
      // }

      // Update source status
      // await db.ledgerSources.update(ledgerSourceId, {
      //   status: 'ACTIVE',
      // });

      await this.eventService.record({
        firmId,
        entityType: 'MAPPING',
        entityId: ledgerSourceId,
        eventType: 'FIELD_MAPPINGS_APPROVED',
        performedBy: userId,
        payload: { count: mappings.length },
      });

      res.json({ message: 'Field mappings saved successfully' });
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

      // TODO: Load mappings from database
      // const mappings = await db.fieldMappings.findMany({
      //   where: { ledgerSourceId }
      // });

      const mappings: any[] = [];

      // Apply mappings
      const { relationships, interactions } = await this.mappingEngine.applyMapping({
        ledgerSourceId,
        firmId,
        rawRecords,
        mappings,
      });

      // TODO: Save to database
      // for (const rel of relationships) {
      //   await db.relationships.insert(rel);
      // }
      // for (const int of interactions) {
      //   await db.interactions.insert(int);
      // }

      // Calculate scores
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

      // Update relationships with scores
      for (const [relId, scoreResult] of scores.entries()) {
        const rel = relationships.find((r) => r.id === relId);
        if (rel) {
          rel.continuityScore = scoreResult.score;
          rel.continuityGrade = scoreResult.grade;
          // TODO: Update in database
        }
      }

      // Generate portfolio assessment
      const assessment = await this.mappingEngine.generateAssessment({
        relationships,
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
