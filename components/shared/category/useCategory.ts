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

export const useCategoryList = (filter?: CategoryFilter) => {
  const params: Record<string, any> = {
    page: filter?.page,
    limit: filter?.limit,
    parentId: filter?.parentId,
  };
  if (typeof filter?.isSubCategory === 'boolean') params.isSubCategory = filter.isSubCategory;
  else if (!filter?.parentId) params.isSubCategory = false;
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

// Trash (deleted categories)
export const useDeletedCategories = (filter?: Pick<CategoryFilter, 'page' | 'limit' | 'name'>) => {
  const params: Record<string, any> = {
    page: filter?.page,
    limit: filter?.limit,
  };
  if (filter?.name) params.name = filter.name;

  return useApiQuery<CategoryListResponse>(
    `${CATEGORY_ENDPOINTS.list}/trash`,
    {
      params,
      staleTime: 5 * 60 * 1000,
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


export const useCategoryDetail = (id: string) => {
  return useApiQuery<Category>(
    `${CATEGORY_ENDPOINTS.detail}/${id}`,
    {
      enabled: !!id,
      staleTime: 15 * 60 * 1000,
      select: (res: any): Category => {
        const payload = res?.data ?? res;
        const cat = (payload && typeof payload === 'object' && 'data' in payload) ? (payload as any).data : payload;
        return (cat ?? {}) as Category;
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_ENDPOINTS.list] });
      if (variables?.id != null) {
        queryClient.invalidateQueries({ queryKey: [`${CATEGORY_ENDPOINTS.detail}/${variables.id}`] });
      }
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

// Restore deleted category hook
export const useRestoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => {
      return apiRequest<any>(`${CATEGORY_ENDPOINTS.update}/${id}/restore`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_ENDPOINTS.list] });
    },
  });
};

export const useParentCategories = () => {
  return useApiQuery<CategoryListResponse>(
    CATEGORY_ENDPOINTS.list,
    {
      params: { limit: 1000 },
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
export const useSubCategories = (parentId: string, page: number = 1, limit: number = 10) => {
  return useApiQuery<CategoryListResponse>(
    CATEGORY_ENDPOINTS.list,
    {
      params: { parentId, isSubCategory: true, page, limit },
      enabled: !!parentId,
      staleTime: 15 * 60 * 1000, // 15 minutes
      select: (res: any): CategoryListResponse => {
        const payload = res?.data ?? res;
        const items: Category[] = payload?.items ?? [];
        const p = payload?.pagination ?? {};
        return {
          data: items,
          total: p?.totalItems ?? 0,
          page: p?.currentPage ?? page ?? 1,
          limit: p?.itemsPerPage ?? limit ?? 10,
          totalPages: p?.totalPage ?? 0,
        } as CategoryListResponse;
      },
    }
  );
};

// Subcategories count hook (lightweight count via pagination total)
export const useSubCategoriesCount = (parentId: string) => {
  return useApiQuery<CategoryListResponse>(
    CATEGORY_ENDPOINTS.list,
    {
      params: { parentId, isSubCategory: true, limit: 1 },
      enabled: !!parentId,
      staleTime: 15 * 60 * 1000,
      select: (res: any): CategoryListResponse => {
        const payload = res?.data ?? res;
        const p = payload?.pagination ?? {};
        return {
          data: [],
          total: p?.totalItems ?? 0,
          page: 1,
          limit: 1,
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
