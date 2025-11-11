import { useApiMutation, useApiQuery } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/hooks/useApi';
import type { ChapterType } from '@/types/chapter/chapter.types';

const CHAPTER_ENDPOINTS = {
  list: 'chapters',
  detail: 'chapters',
  create: 'chapters',
  update: 'chapters',
  delete: 'chapters',
  byCourse: 'chapters/course',
} as const;

export interface CreateChapterRequest {
  name: string;
  courseId: string;
  description?: string;
  duration: number;
}

export interface UpdateChapterRequest extends Partial<CreateChapterRequest> {
  id: string;
}

export interface ChapterListResponse {
  data: ChapterType[];
}

// Get chapters by course ID
export const useChaptersByCourse = (courseId: string) => {
  return useApiQuery<ChapterListResponse>(
    `${CHAPTER_ENDPOINTS.byCourse}/${courseId}`,
    {
      enabled: !!courseId,
      staleTime: 10 * 60 * 1000,
      select: (res: any): ChapterListResponse => {
        const payload = res?.data ?? res;
        const items: ChapterType[] = Array.isArray(payload) ? payload : (payload?.items ?? []);
        return {
          data: items,
        } as ChapterListResponse;
      },
    }
  );
};

// Create chapter hook
export const useCreateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, CreateChapterRequest>({
    mutationFn: async (variables) => {
      return apiRequest<any>(CHAPTER_ENDPOINTS.create, {
        method: 'POST',
        data: variables,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`${CHAPTER_ENDPOINTS.byCourse}/${variables.courseId}`] });
      queryClient.invalidateQueries({ queryKey: [CHAPTER_ENDPOINTS.list] });
    },
  });
};

// Update chapter hook
export const useUpdateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, UpdateChapterRequest>({
    mutationFn: async (variables) => {
      const { id, ...data } = variables;
      return apiRequest<any>(`${CHAPTER_ENDPOINTS.update}/${id}`, {
        method: 'PATCH',
        data,
      });
    },
    onSuccess: (_data, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: [`${CHAPTER_ENDPOINTS.byCourse}/${variables.courseId}`] });
      }
      queryClient.invalidateQueries({ queryKey: [CHAPTER_ENDPOINTS.list] });
    },
  });
};

// Delete chapter hook
export const useDeleteChapter = () => {
  const queryClient = useQueryClient();
  return useMutation<any, unknown, { id: string; courseId?: string }>({
    mutationFn: async ({ id }) => {
      return apiRequest<any>(`${CHAPTER_ENDPOINTS.delete}/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_data, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: [`${CHAPTER_ENDPOINTS.byCourse}/${variables.courseId}`] });
      }
      queryClient.invalidateQueries({ queryKey: [CHAPTER_ENDPOINTS.list] });
    },
  });
};

