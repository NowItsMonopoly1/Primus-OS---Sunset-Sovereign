/**
 * Primus OS Business Edition - Ledger Source Repository
 *
 * Data access layer for ledger_sources table
 */

import { Database } from '../db/connection';
import { LedgerSource, LedgerSourceType, LedgerSourceStatus } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export class LedgerSourceRepository {
  /**
   * Find all ledger sources for a firm
   */
  async findByFirm(firmId: string): Promise<LedgerSource[]> {
    const query = `
      SELECT
        id, firm_id as "firmId", source_type as "sourceType",
        source_name as "sourceName", status,
        created_at as "createdAt", updated_at as "updatedAt"
      FROM ledger_sources
      WHERE firm_id = $1
      ORDER BY created_at DESC
    `;

    const result = await Database.query<LedgerSource>(query, [firmId]);
    return result.rows;
  }

  /**
   * Find ledger source by ID
   */
  async findById(id: string, firmId: string): Promise<LedgerSource | null> {
    const query = `
      SELECT
        id, firm_id as "firmId", source_type as "sourceType",
        source_name as "sourceName", status,
        created_at as "createdAt", updated_at as "updatedAt"
      FROM ledger_sources
      WHERE id = $1 AND firm_id = $2
    `;

    const result = await Database.query<LedgerSource>(query, [id, firmId]);
    return result.rows[0] || null;
  }

  /**
   * Insert new ledger source
   */
  async insert(source: LedgerSource): Promise<LedgerSource> {
    const id = source.id || uuidv4();

    const query = `
      INSERT INTO ledger_sources (
        id, firm_id, source_type, source_name, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id, firm_id as "firmId", source_type as "sourceType",
        source_name as "sourceName", status,
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await Database.query<LedgerSource>(query, [
      id,
      source.firmId,
      source.sourceType,
      source.sourceName,
      source.status,
      source.createdAt,
      source.updatedAt,
    ]);

    return result.rows[0];
  }

  /**
   * Update ledger source status
   */
  async updateStatus(id: string, status: LedgerSourceStatus): Promise<void> {
    const query = `
      UPDATE ledger_sources
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;

    await Database.query(query, [status, id]);
  }

  /**
   * Delete ledger source
   */
  async delete(id: string, firmId: string): Promise<void> {
    const query = `
      DELETE FROM ledger_sources
      WHERE id = $1 AND firm_id = $2
    `;

    await Database.query(query, [id, firmId]);
  }
}
