import type { ApiResponse, PaginatedResponse } from '@/types/common';

export type Category = {
  id: string;
  name: string;
  notes?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type CategoryFilter = {
  page?: number;
  limit?: number;
  name?: string;
  parentId?: string;
  isSubCategory?: boolean;
};

export type CategoryListResponse = ApiResponse<PaginatedResponse<Category>>;
export type CategoryDetailResponse = ApiResponse<Category & { message?: string }>;
