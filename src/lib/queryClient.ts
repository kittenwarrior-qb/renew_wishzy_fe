import { QueryClient } from '@tanstack/react-query';
import { cache } from './cache';

/**
 * Custom query client with localStorage persistence
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

/**
 * Persist query data to localStorage
 */
export function persistQueryData(queryKey: string[], data: any, ttlMinutes: number = 10) {
  const key = queryKey.join('_');
  cache.set(key, data, ttlMinutes);
}

/**
 * Get persisted query data from localStorage
 */
export function getPersistedQueryData<T>(queryKey: string[]): T | null {
  const key = queryKey.join('_');
  return cache.get<T>(key);
}

/**
 * Clear persisted query data
 */
export function clearPersistedQueryData(queryKey: string[]) {
  const key = queryKey.join('_');
  cache.remove(key);
}
