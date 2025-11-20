/**
 * LocalStorage cache utility with TTL support
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const CACHE_PREFIX = 'wishzy_cache_';

export const cache = {
  /**
   * Set cache with TTL
   */
  set<T>(key: string, data: T, ttlMinutes: number = 10): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000,
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set cache:', error);
    }
  },

  /**
   * Get cache if not expired
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;

      const cached: CacheItem<T> = JSON.parse(item);
      const now = Date.now();

      // Check if expired
      if (now - cached.timestamp > cached.ttl) {
        this.remove(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      return null;
    }
  },

  /**
   * Remove specific cache
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove cache:', error);
    }
  },

  /**
   * Clear all cache with prefix
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },

  /**
   * Clear expired cache
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const cached: CacheItem<any> = JSON.parse(item);
              if (now - cached.timestamp > cached.ttl) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // Invalid cache item, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  },
};

// Clear expired cache on load
if (typeof window !== 'undefined') {
  cache.clearExpired();
}
