import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category';
import type {
  Category,
  CategoryFilter,
  CategoryListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '@/types/category';


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

  return useQuery<any, unknown, CategoryListResponse>({
    queryKey: [CATEGORY_ENDPOINTS.list, params],
    queryFn: async () => categoryService.list(params),
    staleTime: 10 * 60 * 1000,
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
  });
};

export const useDeletedCategories = (filter?: Pick<CategoryFilter, 'page' | 'limit' | 'name'>) => {
  const params: Record<string, any> = {
    page: filter?.page,
    limit: filter?.limit,
  };
  if (filter?.name) params.name = filter.name;

  return useQuery<any, unknown, CategoryListResponse>({
    queryKey: [`${CATEGORY_ENDPOINTS.list}/trash`, params],
    queryFn: async () => categoryService.trash(params),
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
  });
};


export const useCategoryDetail = (id: string) => {
  return useQuery<any, unknown, Category>({
    queryKey: [CATEGORY_ENDPOINTS.detail, id],
    queryFn: async () => categoryService.get(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
    select: (res: any): Category => {
      const payload = res?.data ?? res;
      const cat = (payload && typeof payload === 'object' && 'data' in payload) ? (payload as any).data : payload;
      return (cat ?? {}) as Category;
    },
  });
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation<any, unknown, CreateCategoryRequest>({
    mutationFn: async (data) => categoryService.create(data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORY_ENDPOINTS.list] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, UpdateCategoryRequest>({
    mutationFn: async (variables) => {
      const { id, ...data } = variables;
      return categoryService.update(id, data as any);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_ENDPOINTS.list] });
      if (variables?.id != null) {
        queryClient.invalidateQueries({ queryKey: [`${CATEGORY_ENDPOINTS.detail}/${variables.id}`] });
      }
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => categoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_ENDPOINTS.list] });
    },
  });
};

export const useRestoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => categoryService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_ENDPOINTS.list] });
    },
  });
};

export const useParentCategories = () => {
  return useQuery<any, unknown, CategoryListResponse>({
    queryKey: [CATEGORY_ENDPOINTS.list, { limit: 1000 }],
    queryFn: async () => categoryService.parents({ limit: 1000 }),
    staleTime: 30 * 60 * 1000,
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
  });
};

export const useSubCategories = (parentId: string, page: number = 1, limit: number = 10) => {
  return useQuery<any, unknown, CategoryListResponse>({
    queryKey: [CATEGORY_ENDPOINTS.list, { parentId, page, limit, isSubCategory: true }],
    // BE only exposes GET /categories with filters, no dedicated subcategories endpoint
    queryFn: async () => categoryService.list({ parentId, page, limit, isSubCategory: true } as any),
    enabled: !!parentId,
    staleTime: 15 * 60 * 1000,
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
  });
};

export const useSubCategoriesCount = (parentId: string) => {
  return useQuery<any, unknown, CategoryListResponse>({
    queryKey: [CATEGORY_ENDPOINTS.list, { parentId, limit: 1, isSubCategory: true }],
    queryFn: async () => categoryService.list({ parentId, limit: 1, isSubCategory: true } as any),
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
  });
};
export const useAllCategories = () => {
  return useQuery<CategoryListResponse>({
    queryKey: ['all-categories'],
    queryFn: async () => categoryService.list({ limit: 1000 }),
    staleTime: 60 * 60 * 1000,
    select: (res: any): CategoryListResponse => {
      const payload = res?.data ?? res;
      const items: Category[] = payload?.items ?? [];
      const p = payload?.pagination ?? {};
      return {
        data: items,
        total: p?.totalItems ?? 0,
        page: p?.currentPage ?? 1,
        limit: p?.itemsPerPage ?? 1000,
        totalPages: p?.totalPage ?? 0,
      } as CategoryListResponse;
    },
  });
};

export const usePopularCategories = (limit = 8) => {
  return useQuery<CategoryListResponse>({
    queryKey: ['all-categories'],
    queryFn: async () => categoryService.list({ limit: 1000 }),
    staleTime: 60 * 60 * 1000,
    select: (res: any): CategoryListResponse => {
      const payload = res?.data ?? res;
      const allItems: Category[] = payload?.items ?? [];

      // Sort by totalCourses descending and take top limit
      const sortedItems = [...allItems]
        .sort((a, b) => (b.totalCourses ?? 0) - (a.totalCourses ?? 0))
        .slice(0, limit);

      return {
        data: sortedItems,
        total: sortedItems.length,
        page: 1,
        limit: limit,
        totalPages: 1,
      } as CategoryListResponse;
    },
  });
};

export const useSearchCategories = (searchTerm?: string) => {
  return useQuery<any, unknown, CategoryListResponse>({
    queryKey: [`${CATEGORY_ENDPOINTS.list}/search`, { q: searchTerm }],
    queryFn: async () => (searchTerm && searchTerm.length > 2 ? categoryService.search(searchTerm) : Promise.resolve({} as any)),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 5 * 60 * 1000,
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
  });
};
