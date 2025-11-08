import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import type { 
  Category, 
  CategoryFilter, 
  CategoryListResponse, 
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '@/types/category';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/hooks/useApi';

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
  const params: Record<string, any> = {
    page: filter?.page,
    limit: filter?.limit,
    parentId: filter?.parentId,
    isSubCategory: filter?.isSubCategory,
  };
  if (filter?.search) params.search = filter.search;
  else if (filter?.name) params.name = filter.name;

  return useApiQuery<CategoryListResponse>(
    CATEGORY_ENDPOINTS.list,
    {
      params,
      staleTime: 10 * 60 * 1000, // 10 minutes
      select: (res: any): CategoryListResponse => {
        const payload = res?.data ?? res;
        const items: Category[] = payload?.items ?? [];
        const p = payload?.pagination ?? {};
        return {
          data: items,
          total: p?.totalItems ?? 0,
          page: p?.currentPage ?? filter?.page ?? 1,
          limit: p?.itemsPerPage ?? filter?.limit ?? 10,
          totalPages: p?.totalPage ?? 0,
        } as CategoryListResponse;
      },
    }
  );
};

// Category detail hook
export const useCategoryDetail = (id: string) => {
  return useApiQuery<Category>(
    `${CATEGORY_ENDPOINTS.detail}/${id}`,
    {
      enabled: !!id,
      staleTime: 15 * 60 * 1000, // 15 minutes
      select: (res: any): Category => {
        const payload = res?.data ?? res;
        if (!payload) return {} as Category;
        const { message, success, url, ...rest } = payload as any;
        return rest as Category;
      },
    }
  );
};

// Create category hook
export const useCreateCategory = () => {
  return useApiMutation<any, CreateCategoryRequest>(
    CATEGORY_ENDPOINTS.create,
    'POST',
    {
      invalidateQueries: [CATEGORY_ENDPOINTS.list],
    }
  );
};

// Update category hook
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, UpdateCategoryRequest>({
    mutationFn: async (variables) => {
      const { id, ...data } = variables;
      return apiRequest<any>(`${CATEGORY_ENDPOINTS.update}/${id}`, {
        method: 'PUT',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_ENDPOINTS.list] });
    },
  });
};

// Delete category hook
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => {
      return apiRequest<any>(`${CATEGORY_ENDPOINTS.delete}/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_ENDPOINTS.list] });
    },
  });
};

// Parent categories hook (categories without parent)
export const useParentCategories = () => {
  return useApiQuery<CategoryListResponse>(
    CATEGORY_ENDPOINTS.list,
    {
      params: { isSubCategory: false },
      staleTime: 30 * 60 * 1000, // 30 minutes
      select: (res: any): CategoryListResponse => {
        const payload = res?.data ?? res;
        const items: Category[] = payload?.items ?? [];
        const p = payload?.pagination ?? {};
        return {
          data: items,
          total: p?.totalItems ?? 0,
          page: p?.currentPage ?? 1,
          limit: p?.itemsPerPage ?? 10,
          totalPages: p?.totalPage ?? 0,
        } as CategoryListResponse;
      },
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
      select: (res: any): CategoryListResponse => {
        const items: Category[] = res?.items ?? [];
        const p = res?.pagination ?? {};
        return {
          data: items,
          total: p?.totalItems ?? 0,
          page: p?.currentPage ?? 1,
          limit: p?.itemsPerPage ?? 10,
          totalPages: p?.totalPage ?? 0,
        } as CategoryListResponse;
      },
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
      select: (res: any): CategoryListResponse => {
        const items: Category[] = res?.items ?? [];
        const p = res?.pagination ?? {};
        return {
          data: items,
          total: p?.totalItems ?? 0,
          page: p?.currentPage ?? 1,
          limit: p?.itemsPerPage ?? 10,
          totalPages: p?.totalPage ?? 0,
        } as CategoryListResponse;
      },
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
      select: (res: any): CategoryListResponse => {
        const items: Category[] = res?.items ?? [];
        const p = res?.pagination ?? {};
        return {
          data: items,
          total: p?.totalItems ?? 0,
          page: p?.currentPage ?? 1,
          limit: p?.itemsPerPage ?? 10,
          totalPages: p?.totalPage ?? 0,
        } as CategoryListResponse;
      },
    }
  );
};
