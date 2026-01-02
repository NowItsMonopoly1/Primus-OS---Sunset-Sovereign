/**
 * Primus OS Business Edition - Governance Controller (Database-Backed)
 *
 * Handles API requests for governance batches and approval workflows
 */

import { Request, Response } from 'express';
import { GovernanceRepository } from '../../infra/repositories/GovernanceRepository';
import { GovernanceQueueService } from '../../domain/governance/GovernanceQueueServiceV2';

export class GovernanceController {
  constructor(
    private repository: GovernanceRepository,
    private governanceService: GovernanceQueueService
  ) {}

  /**
   * GET /api/governance/batches
   * List all batches for a firm
   */
  async listBatches(req: Request, res: Response): Promise<void> {
    try {
      const firmId = (req as any).user?.firmId;
      const { status } = req.query;

      const batches = await this.governanceService.getBatchesForFirm(
        firmId,
        status as any
      );

      res.json({ data: batches });
    } catch (error) {
      console.error('Error listing batches:', error);
      res.status(500).json({ error: 'Failed to retrieve batches' });
    }
  }

  /**
   * POST /api/governance/batches
   * Create a new batch
   */
  async createBatch(req: Request, res: Response): Promise<void> {
    try {
      const { label } = req.body;
      const userId = (req as any).user?.id;
      const firmId = (req as any).user?.firmId;

      if (!label) {
        res.status(400).json({ error: 'Label is required' });
        return;
      }

      const batch = await this.governanceService.createBatch({
        firmId,
        label,
        createdBy: userId,
      });

      res.status(201).json(batch);
    } catch (error) {
      console.error('Error creating batch:', error);
      res.status(500).json({ error: 'Failed to create batch' });
    }
  }

  /**
   * GET /api/governance/batches/:id
   * Get batch details with drafts
   */
  async getBatch(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const batch = await this.repository.findBatchById(id);

      if (!batch) {
        res.status(404).json({ error: 'Batch not found' });
        return;
      }

      const drafts = await this.governanceService.getDraftsInBatch(id);

      res.json({
        batch,
        drafts,
      });
    } catch (error) {
      console.error('Error getting batch:', error);
      res.status(500).json({ error: 'Failed to retrieve batch' });
    }
  }

  /**
   * POST /api/governance/batches/:id/add-draft
   * Add a draft to a batch
   */
  async addDraftToBatch(req: Request, res: Response): Promise<void> {
    try {
      const { id: batchId } = req.params;
      const { draftId } = req.body;
      const userId = (req as any).user?.id;
      const firmId = (req as any).user?.firmId;

      if (!draftId) {
        res.status(400).json({ error: 'draftId is required' });
        return;
      }

      await this.governanceService.addDraftToBatch({
        draftId,
        batchId,
        actorId: userId,
        firmId,
      });

      res.json({ message: 'Draft added to batch successfully' });
    } catch (error: any) {
      console.error('Error adding draft to batch:', error);
      res.status(400).json({ error: error.message || 'Failed to add draft to batch' });
    }
  }

  /**
   * POST /api/governance/batches/:id/remove-draft
   * Remove a draft from a batch
   */
  async removeDraftFromBatch(req: Request, res: Response): Promise<void> {
    try {
      const { id: batchId } = req.params;
      const { draftId } = req.body;
      const userId = (req as any).user?.id;
      const firmId = (req as any).user?.firmId;

      await this.governanceService.removeDraftFromBatch({
        draftId,
        batchId,
        actorId: userId,
        firmId,
      });

      res.json({ message: 'Draft removed from batch successfully' });
    } catch (error) {
      console.error('Error removing draft from batch:', error);
      res.status(500).json({ error: 'Failed to remove draft from batch' });
    }
  }

  /**
   * POST /api/governance/batches/:id/submit
   * Submit batch for review
   */
  async submitForReview(req: Request, res: Response): Promise<void> {
    try {
      const { id: batchId } = req.params;
      const userId = (req as any).user?.id;
      const firmId = (req as any).user?.firmId;

      await this.governanceService.submitBatchForReview({
        batchId,
        actorId: userId,
        firmId,
      });

      res.json({ message: 'Batch submitted for review' });
    } catch (error: any) {
      console.error('Error submitting batch:', error);
      res.status(400).json({ error: error.message || 'Failed to submit batch' });
    }
  }

  /**
   * POST /api/governance/batches/:id/approve
   * Approve a batch (admin only)
   */
  async approveBatch(req: Request, res: Response): Promise<void> {
    try {
      const { id: batchId } = req.params;
      const userId = (req as any).user?.id;
      const firmId = (req as any).user?.firmId;
      const userRole = (req as any).user?.role;

      // Admin check
      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      await this.governanceService.approveBatch({
        batchId,
        actorId: userId,
        firmId,
      });

      res.json({ message: 'Batch approved successfully' });
    } catch (error: any) {
      console.error('Error approving batch:', error);
      res.status(400).json({ error: error.message || 'Failed to approve batch' });
    }
  }

  /**
   * POST /api/governance/batches/:id/reject
   * Reject a batch (admin only)
   */
  async rejectBatch(req: Request, res: Response): Promise<void> {
    try {
      const { id: batchId } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user?.id;
      const firmId = (req as any).user?.firmId;
      const userRole = (req as any).user?.role;

      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      if (!reason) {
        res.status(400).json({ error: 'Rejection reason is required' });
        return;
      }

      await this.governanceService.rejectBatch({
        batchId,
        actorId: userId,
        firmId,
        reason,
      });

      res.json({ message: 'Batch rejected' });
    } catch (error) {
      console.error('Error rejecting batch:', error);
      res.status(500).json({ error: 'Failed to reject batch' });
    }
  }

  /**
   * POST /api/governance/batches/:id/execute
   * Execute a batch (admin only)
   */
  async executeBatch(req: Request, res: Response): Promise<void> {
    try {
      const { id: batchId } = req.params;
      const userId = (req as any).user?.id;
      const firmId = (req as any).user?.firmId;
      const userRole = (req as any).user?.role;

      if (userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      await this.governanceService.executeBatch({
        batchId,
        actorId: userId,
        firmId,
      });

      res.json({ message: 'Batch executed successfully' });
    } catch (error: any) {
      console.error('Error executing batch:', error);
      res.status(400).json({ error: error.message || 'Failed to execute batch' });
    }
  }

  /**
   * POST /api/governance/batches/:id/archive
   * Archive a batch
   */
  async archiveBatch(req: Request, res: Response): Promise<void> {
    try {
      const { id: batchId } = req.params;
      const userId = (req as any).user?.id;
      const firmId = (req as any).user?.firmId;

      await this.governanceService.archiveBatch({
        batchId,
        actorId: userId,
        firmId,
      });

      res.json({ message: 'Batch archived' });
    } catch (error) {
      console.error('Error archiving batch:', error);
      res.status(500).json({ error: 'Failed to archive batch' });
    }
  }
}
