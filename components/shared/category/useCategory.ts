import { useApiQuery, useApiMutation, useApiPaginatedQuery } from '@/hooks/useApi';
import type { 
  Category, 
  CategoryFilter, 
  CategoryListResponse, 
  CategoryDetailResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '@/types/category';
import type { ApiResponse } from '@/types/common';

// Category endpoints
const CATEGORY_ENDPOINTS = {
  list: 'categories',
  detail: 'categories',
  create: 'categories',
  update: 'categories',
  delete: 'categories',
} as const;

// Category list hook with filtering
export const useCategoryList = (filter?: CategoryFilter) => {
  return useApiPaginatedQuery<Category>(
    CATEGORY_ENDPOINTS.list,
    {
      params: filter,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

// Category detail hook
export const useCategoryDetail = (id: string) => {
  return useApiQuery<CategoryDetailResponse>(
    `${CATEGORY_ENDPOINTS.detail}/${id}`,
    {
      enabled: !!id,
      staleTime: 15 * 60 * 1000, // 15 minutes
    }
  );
};

// Create category hook
export const useCreateCategory = () => {
  return useApiMutation<ApiResponse<Category>, CreateCategoryRequest>(
    CATEGORY_ENDPOINTS.create,
    'POST',
    {
      invalidateQueries: [CATEGORY_ENDPOINTS.list],
    }
  );
};

// Update category hook
export const useUpdateCategory = () => {
  return useApiMutation<ApiResponse<Category>, UpdateCategoryRequest>(
    CATEGORY_ENDPOINTS.update,
    'PUT',
    {
      invalidateQueries: [CATEGORY_ENDPOINTS.list, CATEGORY_ENDPOINTS.detail],
      getParams: (variables) => ({ id: variables.id }),
    }
  );
};

// Delete category hook
export const useDeleteCategory = () => {
  return useApiMutation<ApiResponse, { id: string }>(
    CATEGORY_ENDPOINTS.delete,
    'DELETE',
    {
      invalidateQueries: [CATEGORY_ENDPOINTS.list],
      getParams: (variables) => ({ id: variables.id }),
    }
  );
};

// Parent categories hook (categories without parent)
export const useParentCategories = () => {
  return useApiQuery<CategoryListResponse>(
    CATEGORY_ENDPOINTS.list,
    {
      params: { isSubCategory: false },
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );
};

// Subcategories hook (categories with specific parent)
export const useSubCategories = (parentId: string) => {
  return useApiQuery<CategoryListResponse>(
    CATEGORY_ENDPOINTS.list,
    {
      params: { parentId, isSubCategory: true },
      enabled: !!parentId,
      staleTime: 15 * 60 * 1000, // 15 minutes
    }
  );
};

// Popular categories hook
export const usePopularCategories = (limit = 10) => {
  return useApiQuery<CategoryListResponse>(
    `${CATEGORY_ENDPOINTS.list}/popular`,
    {
      params: { limit },
      staleTime: 60 * 60 * 1000, // 1 hour
    }
  );
};

// Search categories hook
export const useSearchCategories = (searchTerm?: string) => {
  return useApiQuery<CategoryListResponse>(
    `${CATEGORY_ENDPOINTS.list}/search`,
    {
      params: searchTerm ? { q: searchTerm } : undefined,
      enabled: !!searchTerm && searchTerm.length > 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};
