/**
 * Primus OS Business Edition - Relationship Repository
 *
 * Data access layer for relationships table
 */

import { Database } from '../db/connection';
import { Relationship, RelationshipStatus, ContinuityGrade, InteractionType } from '../../types';

export class RelationshipRepository {
  /**
   * Find all relationships for a firm
   */
  async findByFirm(params: {
    firmId: string;
    status?: RelationshipStatus;
    grade?: ContinuityGrade;
    limit?: number;
    offset?: number;
  }): Promise<Relationship[]> {
    const { firmId, status, grade, limit = 50, offset = 0 } = params;

    let query = `
      SELECT
        id, external_id as "externalId", display_name as "displayName",
        role_or_segment as "roleOrSegment", status, value_outlook as "valueOutlook",
        continuity_grade as "continuityGrade", continuity_score as "continuityScore",
        last_interaction_at as "lastInteractionAt",
        last_interaction_type as "lastInteractionType",
        firm_id as "firmId", created_at as "createdAt", updated_at as "updatedAt"
      FROM relationships
      WHERE firm_id = $1
    `;

    const queryParams: any[] = [firmId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (grade) {
      query += ` AND continuity_grade = $${paramIndex}`;
      queryParams.push(grade);
      paramIndex++;
    }

    query += ` ORDER BY continuity_score DESC, display_name ASC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await Database.query<Relationship>(query, queryParams);
    return result.rows;
  }

  /**
   * Find relationship by ID
   */
  async findById(id: string, firmId: string): Promise<Relationship | null> {
    const query = `
      SELECT
        id, external_id as "externalId", display_name as "displayName",
        role_or_segment as "roleOrSegment", status, value_outlook as "valueOutlook",
        continuity_grade as "continuityGrade", continuity_score as "continuityScore",
        last_interaction_at as "lastInteractionAt",
        last_interaction_type as "lastInteractionType",
        firm_id as "firmId", created_at as "createdAt", updated_at as "updatedAt"
      FROM relationships
      WHERE id = $1 AND firm_id = $2
    `;

    const result = await Database.query<Relationship>(query, [id, firmId]);
    return result.rows[0] || null;
  }

  /**
   * Insert new relationship
   */
  async insert(relationship: Relationship): Promise<Relationship> {
    const query = `
      INSERT INTO relationships (
        id, external_id, display_name, role_or_segment, status, value_outlook,
        continuity_grade, continuity_score, last_interaction_at, last_interaction_type,
        firm_id, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      RETURNING
        id, external_id as "externalId", display_name as "displayName",
        role_or_segment as "roleOrSegment", status, value_outlook as "valueOutlook",
        continuity_grade as "continuityGrade", continuity_score as "continuityScore",
        last_interaction_at as "lastInteractionAt",
        last_interaction_type as "lastInteractionType",
        firm_id as "firmId", created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await Database.query<Relationship>(query, [
      relationship.id,
      relationship.externalId,
      relationship.displayName,
      relationship.roleOrSegment,
      relationship.status,
      relationship.valueOutlook,
      relationship.continuityGrade,
      relationship.continuityScore,
      relationship.lastInteractionAt,
      relationship.lastInteractionType,
      relationship.firmId,
      relationship.createdAt,
      relationship.updatedAt,
    ]);

    return result.rows[0];
  }

  /**
   * Update relationship
   */
  async update(id: string, updates: Partial<Relationship>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.displayName !== undefined) {
      fields.push(`display_name = $${paramIndex++}`);
      values.push(updates.displayName);
    }
    if (updates.roleOrSegment !== undefined) {
      fields.push(`role_or_segment = $${paramIndex++}`);
      values.push(updates.roleOrSegment);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.valueOutlook !== undefined) {
      fields.push(`value_outlook = $${paramIndex++}`);
      values.push(updates.valueOutlook);
    }
    if (updates.continuityGrade !== undefined) {
      fields.push(`continuity_grade = $${paramIndex++}`);
      values.push(updates.continuityGrade);
    }
    if (updates.continuityScore !== undefined) {
      fields.push(`continuity_score = $${paramIndex++}`);
      values.push(updates.continuityScore);
    }
    if (updates.lastInteractionAt !== undefined) {
      fields.push(`last_interaction_at = $${paramIndex++}`);
      values.push(updates.lastInteractionAt);
    }
    if (updates.lastInteractionType !== undefined) {
      fields.push(`last_interaction_type = $${paramIndex++}`);
      values.push(updates.lastInteractionType);
    }

    if (fields.length === 0) return;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE relationships
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await Database.query(query, values);
  }

  /**
   * Count relationships by firm
   */
  async countByFirm(firmId: string): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM relationships WHERE firm_id = $1`;
    const result = await Database.query<{ count: string }>(query, [firmId]);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Batch insert relationships (optimized with multi-value INSERT)
   */
  async batchInsert(relationships: Relationship[]): Promise<void> {
    if (relationships.length === 0) return;

    // PostgreSQL has a limit of ~65535 parameters, with 13 fields per row = ~5000 rows max
    const BATCH_SIZE = 1000;

    const client = await Database.getClient();
    try {
      await client.query('BEGIN');

      for (let i = 0; i < relationships.length; i += BATCH_SIZE) {
        const batch = relationships.slice(i, i + BATCH_SIZE);

        // Build multi-value INSERT: INSERT INTO ... VALUES ($1,$2,...),($14,$15,...),(...)
        const valuesClauses: string[] = [];
        const allParams: any[] = [];

        batch.forEach((rel, idx) => {
          const offset = idx * 13;
          valuesClauses.push(
            `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13})`
          );
          allParams.push(
            rel.id,
            rel.externalId,
            rel.displayName,
            rel.roleOrSegment,
            rel.status,
            rel.valueOutlook,
            rel.continuityGrade,
            rel.continuityScore,
            rel.lastInteractionAt,
            rel.lastInteractionType,
            rel.firmId,
            rel.createdAt,
            rel.updatedAt
          );
        });

        const query = `
          INSERT INTO relationships (
            id, external_id, display_name, role_or_segment, status, value_outlook,
            continuity_grade, continuity_score, last_interaction_at, last_interaction_type,
            firm_id, created_at, updated_at
          ) VALUES ${valuesClauses.join(', ')}
        `;

        await client.query(query, allParams);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Batch update continuity scores (optimized with CASE statement)
   * Fixes N+1 query pattern when recalculating scores
   */
  async batchUpdateScores(
    updates: Array<{ id: string; continuityScore: number; continuityGrade: ContinuityGrade }>
  ): Promise<void> {
    if (updates.length === 0) return;

    // Build SQL with CASE statements for bulk update
    const ids = updates.map((u) => u.id);
    const scoreCase = updates
      .map((u) => `WHEN '${u.id}' THEN ${u.continuityScore}`)
      .join(' ');
    const gradeCase = updates
      .map((u) => `WHEN '${u.id}' THEN '${u.continuityGrade}'`)
      .join(' ');

    const query = `
      UPDATE relationships
      SET
        continuity_score = CASE id ${scoreCase} END,
        continuity_grade = CASE id ${gradeCase} END,
        updated_at = NOW()
      WHERE id = ANY($1::text[])
    `;

    await Database.query(query, [ids]);
  }
}
