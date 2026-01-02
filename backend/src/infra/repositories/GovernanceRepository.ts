/**
 * Primus OS Business Edition - Governance Repository
 *
 * Data access layer for governance batches, drafts, and events
 */

import { Database } from '../db/connection';
import {
  GovernanceBatch,
  OutreachDraft,
  GovernanceEvent,
  BatchStatus,
  DraftStatus,
} from '../../types';
import { v4 as uuidv4 } from 'uuid';

export class GovernanceRepository {
  // ============================================
  // GOVERNANCE BATCHES
  // ============================================

  async findBatchesByFirm(firmId: string, status?: BatchStatus): Promise<GovernanceBatch[]> {
    let query = `
      SELECT
        id, firm_id as "firmId", label, status,
        created_by as "createdBy", approved_by as "approvedBy",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM governance_batches
      WHERE firm_id = $1
    `;

    const params: any[] = [firmId];

    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await Database.query<GovernanceBatch>(query, params);
    return result.rows;
  }

  async findBatchById(id: string): Promise<GovernanceBatch | null> {
    const query = `
      SELECT
        id, firm_id as "firmId", label, status,
        created_by as "createdBy", approved_by as "approvedBy",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM governance_batches
      WHERE id = $1
    `;

    const result = await Database.query<GovernanceBatch>(query, [id]);
    return result.rows[0] || null;
  }

  async insertBatch(batch: GovernanceBatch): Promise<GovernanceBatch> {
    const query = `
      INSERT INTO governance_batches (
        id, firm_id, label, status, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id, firm_id as "firmId", label, status,
        created_by as "createdBy", approved_by as "approvedBy",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await Database.query<GovernanceBatch>(query, [
      batch.id,
      batch.firmId,
      batch.label,
      batch.status,
      batch.createdBy,
      batch.createdAt,
      batch.updatedAt,
    ]);

    return result.rows[0];
  }

  async updateBatchStatus(
    id: string,
    status: BatchStatus,
    approvedBy?: string
  ): Promise<void> {
    const query = `
      UPDATE governance_batches
      SET status = $1, approved_by = $2, updated_at = NOW()
      WHERE id = $3
    `;

    await Database.query(query, [status, approvedBy, id]);
  }

  // ============================================
  // OUTREACH DRAFTS
  // ============================================

  async findDraftsByBatch(batchId: string): Promise<OutreachDraft[]> {
    const query = `
      SELECT
        id, relationship_id as "relationshipId", firm_id as "firmId",
        body, subject, status, prepared_by as "preparedBy",
        approved_by as "approvedBy", governance_batch_id as "governanceBatchId",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM outreach_drafts
      WHERE governance_batch_id = $1
      ORDER BY created_at ASC
    `;

    const result = await Database.query<OutreachDraft>(query, [batchId]);
    return result.rows;
  }

  async findDraftById(id: string): Promise<OutreachDraft | null> {
    const query = `
      SELECT
        id, relationship_id as "relationshipId", firm_id as "firmId",
        body, subject, status, prepared_by as "preparedBy",
        approved_by as "approvedBy", governance_batch_id as "governanceBatchId",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM outreach_drafts
      WHERE id = $1
    `;

    const result = await Database.query<OutreachDraft>(query, [id]);
    return result.rows[0] || null;
  }

  async insertDraft(draft: OutreachDraft): Promise<OutreachDraft> {
    const query = `
      INSERT INTO outreach_drafts (
        id, relationship_id, firm_id, body, subject, status,
        prepared_by, governance_batch_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id, relationship_id as "relationshipId", firm_id as "firmId",
        body, subject, status, prepared_by as "preparedBy",
        approved_by as "approvedBy", governance_batch_id as "governanceBatchId",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await Database.query<OutreachDraft>(query, [
      draft.id,
      draft.relationshipId,
      draft.firmId,
      draft.body,
      draft.subject,
      draft.status,
      draft.preparedBy,
      draft.governanceBatchId,
      draft.createdAt,
      draft.updatedAt,
    ]);

    return result.rows[0];
  }

  async updateDraftBatch(draftId: string, batchId: string | null, status: DraftStatus): Promise<void> {
    const query = `
      UPDATE outreach_drafts
      SET governance_batch_id = $1, status = $2, updated_at = NOW()
      WHERE id = $3
    `;

    await Database.query(query, [batchId, status, draftId]);
  }

  async updateDraftsInBatch(batchId: string, status: DraftStatus, approvedBy?: string): Promise<void> {
    const query = `
      UPDATE outreach_drafts
      SET status = $1, approved_by = $2, updated_at = NOW()
      WHERE governance_batch_id = $3
    `;

    await Database.query(query, [status, approvedBy, batchId]);
  }

  // ============================================
  // GOVERNANCE EVENTS
  // ============================================

  async insertEvent(event: GovernanceEvent): Promise<GovernanceEvent> {
    const id = uuidv4();

    const query = `
      INSERT INTO governance_events (
        id, firm_id, entity_type, entity_id, event_type,
        performed_by, payload, occurred_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id, firm_id as "firmId", entity_type as "entityType",
        entity_id as "entityId", event_type as "eventType",
        performed_by as "performedBy", payload, occurred_at as "occurredAt"
    `;

    const result = await Database.query<GovernanceEvent>(query, [
      id,
      event.firmId,
      event.entityType,
      event.entityId,
      event.eventType,
      event.performedBy,
      JSON.stringify(event.payload),
      event.occurredAt,
    ]);

    return result.rows[0];
  }

  async findEventsByEntity(
    entityType: string,
    entityId: string
  ): Promise<GovernanceEvent[]> {
    const query = `
      SELECT
        id, firm_id as "firmId", entity_type as "entityType",
        entity_id as "entityId", event_type as "eventType",
        performed_by as "performedBy", payload, occurred_at as "occurredAt"
      FROM governance_events
      WHERE entity_type = $1 AND entity_id = $2
      ORDER BY occurred_at DESC
    `;

    const result = await Database.query<GovernanceEvent>(query, [entityType, entityId]);
    return result.rows;
  }

  async findEventsByFirm(firmId: string, limit = 50): Promise<GovernanceEvent[]> {
    const query = `
      SELECT
        id, firm_id as "firmId", entity_type as "entityType",
        entity_id as "entityId", event_type as "eventType",
        performed_by as "performedBy", payload, occurred_at as "occurredAt"
      FROM governance_events
      WHERE firm_id = $1
      ORDER BY occurred_at DESC
      LIMIT $2
    `;

    const result = await Database.query<GovernanceEvent>(query, [firmId, limit]);
    return result.rows;
  }
}
