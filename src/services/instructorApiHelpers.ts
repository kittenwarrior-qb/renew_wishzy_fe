/**
 * Helper functions for Instructor API response transformation
 * These functions ensure consistent response format across all instructor APIs
 */

import { logger } from '@/utils/logger';

/**
 * Transform backend pagination format to frontend format
 */
export function transformPagination(backendPagination: any, params: { page?: number; limit?: number }) {
  const page = backendPagination?.currentPage || backendPagination?.page || params.page || 1;
  const limit = backendPagination?.itemsPerPage || backendPagination?.limit || params.limit || 10;
  const total = backendPagination?.totalItems || backendPagination?.total || 0;
  const totalPages = backendPagination?.totalPage || backendPagination?.totalPages || Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

/**
 * Transform backend response to standard frontend format
 */
export function transformResponse<T>(
  backendResponse: any,
  transformItems: (items: any[]) => T[],
  calculateStatistics?: (items: any[]) => any
): {
  success: boolean;
  data: {
    items: T[];
    pagination: ReturnType<typeof transformPagination>;
    statistics?: any;
  };
  message?: string;
} {
  // Handle different response structures
  const responseData = backendResponse?.data || backendResponse;
  const items = responseData?.items || [];
  const pagination = responseData?.pagination || {};
  const statistics = responseData?.statistics;

  // Transform items
  const transformedItems = transformItems(items);

  // Transform pagination
  const transformedPagination = transformPagination(pagination, {
    page: pagination.currentPage,
    limit: pagination.itemsPerPage,
  });

  // Calculate statistics if not provided and calculator is available
  const finalStatistics = statistics || (calculateStatistics ? calculateStatistics(items) : undefined);

  return {
    success: true,
    data: {
      items: transformedItems,
      pagination: transformedPagination,
      ...(finalStatistics && { statistics: finalStatistics }),
    },
    message: backendResponse?.message,
  };
}

/**
 * Safe number conversion with validation
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

