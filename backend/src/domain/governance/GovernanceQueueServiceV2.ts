/**
 * Primus OS Business Edition - Governance Queue Service (Database-Backed)
 *
 * Manages state transitions for outreach drafts and governance batches.
 * Enforces "Prepare → Approval Batch → Approve → Execute" workflow.
 */

import { OutreachDraft, GovernanceBatch, DraftStatus, BatchStatus } from '../../types';
import { GovernanceEventService } from './GovernanceEventService';
import { GovernanceRepository } from '../../infra/repositories/GovernanceRepository';
import { v4 as uuidv4 } from 'uuid';

export class GovernanceQueueService {
  constructor(
    private repository: GovernanceRepository,
    private events: GovernanceEventService
  ) {}

  /**
   * Create a new governance batch
   */
  async createBatch(params: {
    firmId: string;
    label: string;
    createdBy: string;
  }): Promise<GovernanceBatch> {
    const batch: GovernanceBatch = {
      id: uuidv4(),
      firmId: params.firmId,
      label: params.label,
      status: 'OPEN',
      createdBy: params.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedBatch = await this.repository.insertBatch(batch);

    await this.events.record({
      firmId: params.firmId,
      entityType: 'BATCH',
      entityId: savedBatch.id,
      eventType: 'BATCH_CREATED',
      performedBy: params.createdBy,
      payload: { label: batch.label },
    });

    return savedBatch;
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
    // Load and validate
    const draft = await this.repository.findDraftById(params.draftId);
    const batch = await this.repository.findBatchById(params.batchId);

    if (!draft) {
      throw new Error('Draft not found');
    }

    if (!batch) {
      throw new Error('Batch not found');
    }

    if (draft.status !== 'PREPARED') {
      throw new Error('Draft must be in PREPARED state to add to batch');
    }

    if (batch.status !== 'OPEN') {
      throw new Error('Batch must be OPEN to add drafts');
    }

    // Update draft
    await this.repository.updateDraftBatch(params.draftId, params.batchId, 'IN_BATCH');

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
    const draft = await this.repository.findDraftById(params.draftId);

    if (!draft) {
      throw new Error('Draft not found');
    }

    await this.repository.updateDraftBatch(params.draftId, null, 'PREPARED');

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
    const batch = await this.repository.findBatchById(params.batchId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    if (batch.status !== 'OPEN') {
      throw new Error('Only OPEN batches can be submitted for review');
    }

    await this.repository.updateBatchStatus(params.batchId, 'UNDER_REVIEW');

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
    const batch = await this.repository.findBatchById(params.batchId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    if (batch.status !== 'OPEN' && batch.status !== 'UNDER_REVIEW') {
      throw new Error('Batch must be OPEN or UNDER_REVIEW to approve');
    }

    // Update batch
    await this.repository.updateBatchStatus(params.batchId, 'APPROVED', params.actorId);

    // Update all drafts in batch
    await this.repository.updateDraftsInBatch(params.batchId, 'APPROVED', params.actorId);

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
    const batch = await this.repository.findBatchById(params.batchId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    await this.repository.updateBatchStatus(params.batchId, 'OPEN');

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
    const batch = await this.repository.findBatchById(params.batchId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    if (batch.status !== 'APPROVED') {
      throw new Error('Only APPROVED batches can be executed');
    }

    // Update batch
    await this.repository.updateBatchStatus(params.batchId, 'EXECUTED');

    // Update all drafts in batch
    await this.repository.updateDraftsInBatch(params.batchId, 'EXECUTED');

    await this.events.record({
      firmId: params.firmId,
      entityType: 'BATCH',
      entityId: params.batchId,
      eventType: 'BATCH_EXECUTED',
      performedBy: params.actorId,
      payload: {},
    });

    // TODO: Trigger external integrations (email, CRM, etc.)
  }

  /**
   * Archive a batch
   */
  async archiveBatch(params: {
    batchId: string;
    actorId: string;
    firmId: string;
  }): Promise<void> {
    await this.repository.updateBatchStatus(params.batchId, 'ARCHIVED');

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
    return this.repository.findBatchesByFirm(firmId, status);
  }

  /**
   * Get drafts in a batch
   */
  async getDraftsInBatch(batchId: string): Promise<OutreachDraft[]> {
    return this.repository.findDraftsByBatch(batchId);
  }

  /**
   * Create an outreach draft
   */
  async createDraft(params: {
    relationshipId: string;
    firmId: string;
    subject: string;
    body: string;
    preparedBy: string;
  }): Promise<OutreachDraft> {
    const draft: OutreachDraft = {
      id: uuidv4(),
      relationshipId: params.relationshipId,
      firmId: params.firmId,
      subject: params.subject,
      body: params.body,
      status: 'PREPARED',
      preparedBy: params.preparedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedDraft = await this.repository.insertDraft(draft);

    await this.events.record({
      firmId: params.firmId,
      entityType: 'OUTREACH_DRAFT',
      entityId: savedDraft.id,
      eventType: 'DRAFT_PREPARED',
      performedBy: params.preparedBy,
      payload: { relationshipId: params.relationshipId, subject: params.subject },
    });

    return savedDraft;
  }
}
