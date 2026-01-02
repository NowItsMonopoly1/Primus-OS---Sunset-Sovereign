/**
 * Primus OS Business Edition - Field Mapping Repository
 *
 * Data access layer for field_mappings table with caching
 */

import { Database } from '../db/connection';
import { FieldMapping, TargetField } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { cache } from '../cache/SimpleCache';

export class FieldMappingRepository {
  private CACHE_PREFIX = 'field_mappings:';
  private CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Find all mappings for a ledger source (cached)
   */
  async findByLedgerSource(ledgerSourceId: string): Promise<FieldMapping[]> {
    const cacheKey = `${this.CACHE_PREFIX}${ledgerSourceId}`;

    // Try cache first
    const cached = cache.get<FieldMapping[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss - query database
    const query = `
      SELECT
        id, ledger_source_id as "ledgerSourceId",
        source_field as "sourceField", target_field as "targetField",
        created_at as "createdAt"
      FROM field_mappings
      WHERE ledger_source_id = $1
      ORDER BY created_at ASC
    `;

    const result = await Database.query<FieldMapping>(query, [ledgerSourceId]);

    // Cache the result
    cache.set(cacheKey, result.rows, this.CACHE_TTL);

    return result.rows;
  }

  /**
   * Insert new field mapping (invalidates cache)
   */
  async insert(mapping: FieldMapping): Promise<FieldMapping> {
    const id = mapping.id || uuidv4();

    const query = `
      INSERT INTO field_mappings (
        id, ledger_source_id, source_field, target_field, created_at
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id, ledger_source_id as "ledgerSourceId",
        source_field as "sourceField", target_field as "targetField",
        created_at as "createdAt"
    `;

    const result = await Database.query<FieldMapping>(query, [
      id,
      mapping.ledgerSourceId,
      mapping.sourceField,
      mapping.targetField,
      mapping.createdAt,
    ]);

    // Invalidate cache
    this.invalidateCache(mapping.ledgerSourceId);

    return result.rows[0];
  }

  /**
   * Batch insert mappings (invalidates cache)
   */
  async batchInsert(mappings: FieldMapping[]): Promise<void> {
    if (mappings.length === 0) return;

    const client = await Database.getClient();

    try {
      await client.query('BEGIN');

      for (const mapping of mappings) {
        const id = mapping.id || uuidv4();

        await client.query(
          `INSERT INTO field_mappings (
            id, ledger_source_id, source_field, target_field, created_at
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (ledger_source_id, source_field) DO UPDATE
          SET target_field = EXCLUDED.target_field`,
          [id, mapping.ledgerSourceId, mapping.sourceField, mapping.targetField, mapping.createdAt]
        );
      }

      await client.query('COMMIT');

      // Invalidate cache for all affected ledger sources
      const uniqueSources = [...new Set(mappings.map((m) => m.ledgerSourceId))];
      uniqueSources.forEach((sourceId) => this.invalidateCache(sourceId));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete all mappings for a ledger source (invalidates cache)
   */
  async deleteByLedgerSource(ledgerSourceId: string): Promise<void> {
    const query = `
      DELETE FROM field_mappings
      WHERE ledger_source_id = $1
    `;

    await Database.query(query, [ledgerSourceId]);

    // Invalidate cache
    this.invalidateCache(ledgerSourceId);
  }

  /**
   * Delete specific mapping (invalidates cache)
   */
  async delete(id: string): Promise<void> {
    // First get the ledger source ID for cache invalidation
    const selectQuery = `
      SELECT ledger_source_id as "ledgerSourceId"
      FROM field_mappings
      WHERE id = $1
    `;

    const selectResult = await Database.query<{ ledgerSourceId: string }>(selectQuery, [id]);

    const query = `
      DELETE FROM field_mappings
      WHERE id = $1
    `;

    await Database.query(query, [id]);

    // Invalidate cache if mapping was found
    if (selectResult.rows.length > 0) {
      this.invalidateCache(selectResult.rows[0].ledgerSourceId);
    }
  }

  /**
   * Invalidate cache for a ledger source
   */
  private invalidateCache(ledgerSourceId: string): void {
    const cacheKey = `${this.CACHE_PREFIX}${ledgerSourceId}`;
    cache.delete(cacheKey);
  }
}
