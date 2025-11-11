import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import type {
  Course,
  CourseFilter,
  CourseListResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  UpdateCourseStatusRequest
} from '@/types/course/course.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/hooks/useApi';

// Course endpoints
const COURSE_ENDPOINTS = {
  list: 'courses',
  detail: 'courses',
  create: 'courses',
  update: 'courses',
  delete: 'courses',
  updateStatus: 'courses',
} as const;

export const useCourseList = (filter?: CourseFilter) => {
  const params: Record<string, any> = {
    page: filter?.page,
    limit: filter?.limit,
  };
  if (filter?.search) params.search = filter.search;
  else if (filter?.name) params.name = filter.name;
  if (filter?.categoryId) params.categoryId = filter.categoryId;
  if (typeof filter?.status === 'boolean') params.status = filter.status;

  return useApiQuery<CourseListResponse>(
    COURSE_ENDPOINTS.list,
    {
      params,
      staleTime: 10 * 60 * 1000, // 10 minutes
      select: (res: any): CourseListResponse => {
        const payload = res?.data ?? res;
        const items: Course[] = payload?.items ?? [];
        const p = payload?.pagination ?? {};
        return {
          data: items,
          total: p?.totalItems ?? 0,
          page: p?.currentPage ?? filter?.page ?? 1,
          limit: p?.itemsPerPage ?? filter?.limit ?? 10,
          totalPages: p?.totalPage ?? 0,
        } as CourseListResponse;
      },
    }
  );
};

// Trash (deleted courses)
export const useDeletedCourses = (filter?: Pick<CourseFilter, 'page' | 'limit' | 'name'>) => {
  const params: Record<string, any> = {
    page: filter?.page,
    limit: filter?.limit,
  };
  if (filter?.name) params.name = filter.name;

  return useApiQuery<CourseListResponse>(
    `${COURSE_ENDPOINTS.list}/trash`,
    {
      params,
      staleTime: 5 * 60 * 1000,
      select: (res: any): CourseListResponse => {
        const payload = res?.data ?? res;
        const items: Course[] = payload?.items ?? [];
        const p = payload?.pagination ?? {};
        return {
          data: items,
          total: p?.totalItems ?? 0,
          page: p?.currentPage ?? filter?.page ?? 1,
          limit: p?.itemsPerPage ?? filter?.limit ?? 10,
          totalPages: p?.totalPage ?? 0,
        } as CourseListResponse;
      },
    }
  );
};

export const useCourseDetail = (id: string) => {
  return useApiQuery<Course>(
    `${COURSE_ENDPOINTS.detail}/${id}`,
    {
      enabled: !!id,
      staleTime: 15 * 60 * 1000,
      select: (res: any): Course => {
        const payload = res?.data ?? res;
        const course = (payload && typeof payload === 'object' && 'data' in payload) ? (payload as any).data : payload;
        return (course ?? {}) as Course;
      },
    }
  );
};

// Create course hook
export const useCreateCourse = () => {
  return useApiMutation<any, CreateCourseRequest>(
    COURSE_ENDPOINTS.create,
    'POST',
    {
      invalidateQueries: [COURSE_ENDPOINTS.list],
    }
  );
};

// Update course hook
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, UpdateCourseRequest>({
    mutationFn: async (variables) => {
      const { id, ...data } = variables;
      return apiRequest<any>(`${COURSE_ENDPOINTS.update}/${id}`, {
        method: 'PUT',
        data,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [COURSE_ENDPOINTS.list] });
      if (variables?.id != null) {
        queryClient.invalidateQueries({ queryKey: [`${COURSE_ENDPOINTS.detail}/${variables.id}`] });
      }
    },
  });
};

// Delete course hook (soft delete - moves to trash)
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => {
      return apiRequest<any>(`${COURSE_ENDPOINTS.delete}/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidate both list and trash queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: [COURSE_ENDPOINTS.list] });
      // Also invalidate any queries with deleted filter
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0] as string;
          return queryKey === COURSE_ENDPOINTS.list;
        }
      });
    },
  });
};

// Update course status hook
export const useUpdateCourseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, UpdateCourseStatusRequest>({
    mutationFn: async ({ id, status }) => {
      return apiRequest<any>(`${COURSE_ENDPOINTS.updateStatus}/${id}/status`, {
        method: 'PATCH',
        data: { status },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [COURSE_ENDPOINTS.list] });
      if (variables?.id != null) {
        queryClient.invalidateQueries({ queryKey: [`${COURSE_ENDPOINTS.detail}/${variables.id}`] });
      }
    },
  });
};

// Restore deleted course hook
export const useRestoreCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => {
      return apiRequest<any>(`${COURSE_ENDPOINTS.update}/${id}/restore`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_ENDPOINTS.list] });
    },
  });
};

