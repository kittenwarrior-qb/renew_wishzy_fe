import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chapterService } from "@/services/chapter";
import {
  getPersistedQueryData,
  persistQueryData,
  clearPersistedQueryData,
} from "@/lib/queryClient";

export type ChapterLecture = {
  id: string;
  name: string;
  duration?: number;
  isPreview?: boolean;
  orderIndex: number;
  fileUrl?: string | null;
};

export type Chapter = {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  courseId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  lecture?: ChapterLecture[];
};

const ENDPOINT = "chapters";

export const useChapterList = (courseId?: string) => {
  return useQuery<{ items: Chapter[] }>({
    queryKey: [ENDPOINT, "course", courseId],
    queryFn: async () => {
      // Try to get from localStorage first
      const cached = getPersistedQueryData<any>([
        ENDPOINT,
        "course",
        courseId || "",
      ]);
      if (cached) {
        return cached;
      }

      // Fetch from API
      const result = await chapterService.getChapterByCourseId(
        courseId as string
      );

      // Persist to localStorage
      persistQueryData([ENDPOINT, "course", courseId || ""], result, 10);

      return result;
    },
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000, // Increased to 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    select: (res: any): { items: Chapter[] } => {
      const payload = res?.data ?? res;
      const items = payload?.items ?? [];
      return { items: items as Chapter[] };
    },
  });
};

type CreateChapterInput = {
  courseId: string;
  name: string;
  description?: string;
  duration?: number;
  orderIndex?: number;
};

export const useCreateChapter = () => {
  const qc = useQueryClient();
  return useMutation<any, unknown, CreateChapterInput>({
    mutationFn: async ({ courseId, ...data }) =>
      chapterService.create({ ...(data as any), courseId }),
    onSuccess: (_d, vars) => {
      if (vars?.courseId) {
        // Clear localStorage cache for this query
        clearPersistedQueryData([ENDPOINT, "course", vars.courseId]);
        // Invalidate query to refetch
        qc.invalidateQueries({ queryKey: [ENDPOINT, "course", vars.courseId] });
      }
    },
  });
};

export const useUpdateChapter = () => {
  const qc = useQueryClient();
  return useMutation<
    any,
    unknown,
    { id: string; courseId?: string } & Partial<Chapter>
  >({
    mutationFn: async ({ id, ...data }) => chapterService.update(id, data),
    onSuccess: (_d, vars) => {
      if (vars?.courseId) {
        // Clear localStorage cache
        clearPersistedQueryData([ENDPOINT, "course", vars.courseId]);
        qc.invalidateQueries({ queryKey: [ENDPOINT, "course", vars.courseId] });
      }
      if (vars?.id)
        qc.invalidateQueries({ queryKey: [`${ENDPOINT}/${vars.id}`] });
    },
  });
};

export const useDeleteChapter = () => {
  const qc = useQueryClient();
  return useMutation<any, unknown, { id: string; courseId?: string }>({
    mutationFn: async ({ id }) => chapterService.remove(id),
    onSuccess: (_d, vars) => {
      if (vars?.courseId) {
        // Clear localStorage cache
        clearPersistedQueryData([ENDPOINT, "course", vars.courseId]);
        qc.invalidateQueries({ queryKey: [ENDPOINT, "course", vars.courseId] });
      }
    },
  });
};
