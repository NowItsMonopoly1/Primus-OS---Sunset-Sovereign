/**
 * Primus OS Business Edition - Governance Queue Service
 *
 * Manages state transitions for:
 * - Outreach drafts
 * - Governance batches
 *
 * Enforces "Prepare → Approval Batch → Approve → Execute" workflow.
 */

import { OutreachDraft, GovernanceBatch, DraftStatus, BatchStatus } from '../../types';
import { GovernanceEventService } from './GovernanceEventService';

export class GovernanceQueueService {
  constructor(private events: GovernanceEventService) {}

  /**
   * Create a new governance batch
   */
  async createBatch(params: {
    firmId: string;
    label: string;
    createdBy: string;
  }): Promise<GovernanceBatch> {
    const batch: GovernanceBatch = {
      id: this.generateId(),
      firmId: params.firmId,
      label: params.label,
      status: 'OPEN',
      createdBy: params.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: Persist to database
    // await db.governanceBatches.insert(batch);

    await this.events.record({
      firmId: params.firmId,
      entityType: 'BATCH',
      entityId: batch.id,
      eventType: 'BATCH_CREATED',
      performedBy: params.createdBy,
      payload: { label: batch.label },
    });

    return batch;
  }

  /**
   * Add a draft to a batch
   */
  async addDraftToBatch(params: {
    draftId: string;
    batchId: string;
    actorId: string;
    firmId: string;
  }): Promise<void> {
    // TODO: Load draft and batch from database
    // const draft = await db.outreachDrafts.findById(draftId);
    // const batch = await db.governanceBatches.findById(batchId);

    // Validate state transitions
    // if (draft.status !== 'PREPARED') {
    //   throw new Error('Draft must be in PREPARED state to add to batch');
    // }
    // if (batch.status !== 'OPEN') {
    //   throw new Error('Batch must be OPEN to add drafts');
    // }

    // Update draft
    // await db.outreachDrafts.update(draftId, {
    //   status: 'IN_BATCH',
    //   governanceBatchId: batchId,
    // });

    await this.events.record({
      firmId: params.firmId,
      entityType: 'OUTREACH_DRAFT',
      entityId: params.draftId,
      eventType: 'DRAFT_ADDED_TO_BATCH',
      performedBy: params.actorId,
      payload: { batchId: params.batchId },
    });
  }

  /**
   * Remove a draft from a batch
   */
  async removeDraftFromBatch(params: {
    draftId: string;
    batchId: string;
    actorId: string;
    firmId: string;
  }): Promise<void> {
    // TODO: Validate and update
    // await db.outreachDrafts.update(draftId, {
    //   status: 'PREPARED',
    //   governanceBatchId: null,
    // });

    await this.events.record({
      firmId: params.firmId,
      entityType: 'OUTREACH_DRAFT',
      entityId: params.draftId,
      eventType: 'DRAFT_REMOVED_FROM_BATCH',
      performedBy: params.actorId,
      payload: { batchId: params.batchId },
    });
  }

  /**
   * Submit batch for review
   */
  async submitBatchForReview(params: {
    batchId: string;
    actorId: string;
    firmId: string;
  }): Promise<void> {
    // TODO: Load and validate
    // const batch = await db.governanceBatches.findById(batchId);
    // if (batch.status !== 'OPEN') {
    //   throw new Error('Only OPEN batches can be submitted for review');
    // }

    // await db.governanceBatches.update(batchId, {
    //   status: 'UNDER_REVIEW',
    // });

    await this.events.record({
      firmId: params.firmId,
      entityType: 'BATCH',
      entityId: params.batchId,
      eventType: 'BATCH_SUBMITTED_FOR_REVIEW',
      performedBy: params.actorId,
      payload: {},
    });
  }

  /**
   * Approve a batch (admin only)
   */
  async approveBatch(params: {
    batchId: string;
    actorId: string;
    firmId: string;
  }): Promise<void> {
    // TODO: Load batch and all drafts
    // const batch = await db.governanceBatches.findById(batchId);
    // if (batch.status !== 'OPEN' && batch.status !== 'UNDER_REVIEW') {
    //   throw new Error('Batch must be OPEN or UNDER_REVIEW to approve');
    // }

    // Update batch
    // await db.governanceBatches.update(batchId, {
    //   status: 'APPROVED',
    //   approvedBy: actorId,
    // });

    // Update all drafts in batch
    // await db.outreachDrafts.updateMany(
    //   { governanceBatchId: batchId },
    //   { status: 'APPROVED', approvedBy: actorId }
    // );

    await this.events.record({
      firmId: params.firmId,
      entityType: 'BATCH',
      entityId: params.batchId,
      eventType: 'BATCH_APPROVED',
      performedBy: params.actorId,
      payload: {},
    });
  }

  /**
   * Reject a batch (return to OPEN with comments)
   */
  async rejectBatch(params: {
    batchId: string;
    actorId: string;
    firmId: string;
    reason: string;
  }): Promise<void> {
    // TODO: Load and validate
    // await db.governanceBatches.update(batchId, {
    //   status: 'OPEN',
    // });

    await this.events.record({
      firmId: params.firmId,
      entityType: 'BATCH',
      entityId: params.batchId,
      eventType: 'BATCH_REJECTED',
      performedBy: params.actorId,
      payload: { reason: params.reason },
    });
  }

  /**
   * Execute a batch (mark as sent to external systems)
   */
  async executeBatch(params: {
    batchId: string;
    actorId: string;
    firmId: string;
  }): Promise<void> {
    // TODO: Load and validate
    // const batch = await db.governanceBatches.findById(batchId);
    // if (batch.status !== 'APPROVED') {
    //   throw new Error('Only APPROVED batches can be executed');
    // }

    // Update batch
    // await db.governanceBatches.update(batchId, {
    //   status: 'EXECUTED',
    // });

    // Update all drafts in batch
    // await db.outreachDrafts.updateMany(
    //   { governanceBatchId: batchId },
    //   { status: 'EXECUTED' }
    // );

    await this.events.record({
      firmId: params.firmId,
      entityType: 'BATCH',
      entityId: params.batchId,
      eventType: 'BATCH_EXECUTED',
      performedBy: params.actorId,
      payload: {},
    });

    // TODO: Trigger external integrations (email, CRM, etc.)
    // await this.triggerExecution(batchId);
  }

  /**
   * Archive a batch
   */
  async archiveBatch(params: {
    batchId: string;
    actorId: string;
    firmId: string;
  }): Promise<void> {
    // TODO: Update status
    // await db.governanceBatches.update(batchId, {
    //   status: 'ARCHIVED',
    // });

    await this.events.record({
      firmId: params.firmId,
      entityType: 'BATCH',
      entityId: params.batchId,
      eventType: 'BATCH_ARCHIVED',
      performedBy: params.actorId,
      payload: {},
    });
  }

  /**
   * Get all batches for a firm
   */
  async getBatchesForFirm(
    firmId: string,
    status?: BatchStatus
  ): Promise<GovernanceBatch[]> {
    // TODO: Implement database query
    // return await db.governanceBatches.findMany({
    //   where: { firmId, ...(status && { status }) },
    //   orderBy: { createdAt: 'desc' }
    // });
    return [];
  }

  /**
   * Get drafts in a batch
   */
  async getDraftsInBatch(batchId: string): Promise<OutreachDraft[]> {
    // TODO: Implement database query
    // return await db.outreachDrafts.findMany({
    //   where: { governanceBatchId: batchId },
    //   orderBy: { createdAt: 'asc' }
    // });
    return [];
  }

  /**
   * Validate state transition
   */
  private validateBatchTransition(
    currentStatus: BatchStatus,
    newStatus: BatchStatus
  ): boolean {
    const allowedTransitions: Record<BatchStatus, BatchStatus[]> = {
      OPEN: ['UNDER_REVIEW', 'ARCHIVED'],
      UNDER_REVIEW: ['APPROVED', 'OPEN', 'ARCHIVED'],
      APPROVED: ['EXECUTED', 'ARCHIVED'],
      EXECUTED: ['ARCHIVED'],
      ARCHIVED: [],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  private generateId(): string {
    // TODO: Use proper UUID generation
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
