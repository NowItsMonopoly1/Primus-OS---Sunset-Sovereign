/**
 * Primus OS Business Edition - Simple In-Memory Cache
 *
 * Lightweight caching layer for reducing database queries
 * Production: Replace with Redis for multi-instance deployments
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class SimpleCache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set item in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    this.store.set(key, {
      data,
      expiresAt,
    });
  }

  /**
   * Delete item from cache
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Delete all items matching a pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanupInterval(intervalMs = 60000): NodeJS.Timeout {
    return setInterval(() => this.cleanup(), intervalMs);
  }
}

// Global cache instance
export const cache = new SimpleCache();

// Start cleanup every minute
cache.startCleanupInterval();
