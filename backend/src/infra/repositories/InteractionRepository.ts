/**
 * Primus OS Business Edition - Interaction Repository
 *
 * Data access layer for interactions table
 */

import { Database } from '../db/connection';
import { Interaction } from '../../types';

export class InteractionRepository {
  /**
   * Find interactions for a relationship
   */
  async findByRelationship(
    relationshipId: string,
    limit = 50
  ): Promise<Interaction[]> {
    const query = `
      SELECT
        id, relationship_id as "relationshipId", type, direction,
        occurred_at as "occurredAt", value_event_weight as "valueEventWeight",
        notes, source_system as "sourceSystem", created_at as "createdAt"
      FROM interactions
      WHERE relationship_id = $1
      ORDER BY occurred_at DESC
      LIMIT $2
    `;

    const result = await Database.query<Interaction>(query, [relationshipId, limit]);
    return result.rows;
  }

  /**
   * Find interactions for multiple relationships (batch with limit per relationship)
   * Uses window function to prevent loading millions of records
   */
  async findByRelationships(
    relationshipIds: string[],
    limitPerRelationship = 100
  ): Promise<Map<string, Interaction[]>> {
    if (relationshipIds.length === 0) {
      return new Map();
    }

    // Use window function to limit interactions per relationship
    // This prevents loading millions of records for large portfolios
    const query = `
      WITH ranked_interactions AS (
        SELECT
          id, relationship_id as "relationshipId", type, direction,
          occurred_at as "occurredAt", value_event_weight as "valueEventWeight",
          notes, source_system as "sourceSystem", created_at as "createdAt",
          ROW_NUMBER() OVER (PARTITION BY relationship_id ORDER BY occurred_at DESC) as rn
        FROM interactions
        WHERE relationship_id = ANY($1)
      )
      SELECT
        id, "relationshipId", type, direction, "occurredAt",
        "valueEventWeight", notes, "sourceSystem", "createdAt"
      FROM ranked_interactions
      WHERE rn <= $2
      ORDER BY "occurredAt" DESC
    `;

    const result = await Database.query<Interaction>(query, [relationshipIds, limitPerRelationship]);

    const interactionsByRel = new Map<string, Interaction[]>();

    for (const interaction of result.rows) {
      if (!interactionsByRel.has(interaction.relationshipId)) {
        interactionsByRel.set(interaction.relationshipId, []);
      }
      interactionsByRel.get(interaction.relationshipId)!.push(interaction);
    }

    return interactionsByRel;
  }

  /**
   * Insert new interaction
   */
  async insert(interaction: Interaction): Promise<Interaction> {
    const query = `
      INSERT INTO interactions (
        id, relationship_id, type, direction, occurred_at,
        value_event_weight, notes, source_system, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id, relationship_id as "relationshipId", type, direction,
        occurred_at as "occurredAt", value_event_weight as "valueEventWeight",
        notes, source_system as "sourceSystem", created_at as "createdAt"
    `;

    const result = await Database.query<Interaction>(query, [
      interaction.id,
      interaction.relationshipId,
      interaction.type,
      interaction.direction,
      interaction.occurredAt,
      interaction.valueEventWeight,
      interaction.notes,
      interaction.sourceSystem,
      interaction.createdAt,
    ]);

    return result.rows[0];
  }

  /**
   * Batch insert interactions (optimized with multi-value INSERT)
   */
  async batchInsert(interactions: Interaction[]): Promise<void> {
    if (interactions.length === 0) return;

    // PostgreSQL has a limit of ~65535 parameters, with 9 fields per row = ~7000 rows max
    const BATCH_SIZE = 2000;

    const client = await Database.getClient();
    try {
      await client.query('BEGIN');

      for (let i = 0; i < interactions.length; i += BATCH_SIZE) {
        const batch = interactions.slice(i, i + BATCH_SIZE);

        // Build multi-value INSERT
        const valuesClauses: string[] = [];
        const allParams: any[] = [];

        batch.forEach((int, idx) => {
          const offset = idx * 9;
          valuesClauses.push(
            `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`
          );
          allParams.push(
            int.id,
            int.relationshipId,
            int.type,
            int.direction,
            int.occurredAt,
            int.valueEventWeight,
            int.notes,
            int.sourceSystem,
            int.createdAt
          );
        });

        const query = `
          INSERT INTO interactions (
            id, relationship_id, type, direction, occurred_at,
            value_event_weight, notes, source_system, created_at
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
   * Get interaction count for a relationship
   */
  async countByRelationship(relationshipId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM interactions
      WHERE relationship_id = $1
    `;

    const result = await Database.query<{ count: string }>(query, [relationshipId]);
    return parseInt(result.rows[0].count, 10);
  }
}
