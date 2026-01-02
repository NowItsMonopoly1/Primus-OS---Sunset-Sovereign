/**
 * Primus OS Business Edition - Database Connection
 *
 * PostgreSQL connection pool management
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export interface DBClient {
  query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
  release: () => void;
}

export class Database {
  /**
   * Execute a query with automatic connection handling
   */
  static async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await pool.query<T>(text, params);
      const duration = Date.now() - start;

      if (process.env.NODE_ENV === 'development') {
        console.log('[DB Query]', {
          text: text.substring(0, 100),
          duration: `${duration}ms`,
          rows: res.rowCount,
        });
      }

      return res;
    } catch (error) {
      console.error('[DB Error]', { text, params, error });
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  static async getClient(): Promise<PoolClient> {
    const client = await pool.connect();
    return client;
  }

  /**
   * Execute multiple queries in a transaction
   */
  static async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('[DB Health Check Failed]', error);
      return false;
    }
  }

  /**
   * Close all connections (for graceful shutdown)
   */
  static async close(): Promise<void> {
    await pool.end();
  }
}
