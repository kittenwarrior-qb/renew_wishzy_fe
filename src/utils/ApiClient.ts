import { Env } from '@/libs/Env';

/**
 * Get the base API URL for NestJS backend
 * Falls back to relative path if NEXT_PUBLIC_API_URL is not set
 */
export const getApiUrl = (): string => {
  return Env.NEXT_PUBLIC_API_URL || '/api';
};

/**
 * Build full API endpoint URL
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};
