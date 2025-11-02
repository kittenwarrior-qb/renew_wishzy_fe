/**
 * Category Types - Các kiểu dữ liệu danh mục
 */

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

export type PaginationMeta = {
  totalPage: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
};

export type PaginatedResponse<T> = {
  message?: string;
  items: T[];
  pagination: PaginationMeta;
};

// API Response wrapper format
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  url?: string;
};

export type CategoryListResponse = ApiResponse<PaginatedResponse<Category>>;
export type CategoryDetailResponse = ApiResponse<Category & { message?: string }>;
