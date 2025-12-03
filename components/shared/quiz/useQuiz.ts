import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryHook } from "@/src/hooks/useQueryHook";
import {
  listAdminQuizzes,
  createAdminQuiz,
  updateAdminQuiz,
  deleteAdminQuiz,
} from "@/src/services/quiz";
import type {
  AdminQuiz,
  AdminQuizListResponse,
  CreateAdminQuizRequest,
  UpdateAdminQuizRequest,
} from "@/src/types/quiz";

const ENDPOINT = "admin-quizzes";

export type AdminQuizFilter = {
  page?: number;
  limit?: number;
};

export const useAdminQuizList = (filter?: AdminQuizFilter) => {
  const params: Record<string, any> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
  };

  return useQueryHook<AdminQuizListResponse>(
    [ENDPOINT, JSON.stringify(params)],
    () => listAdminQuizzes(params),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useCreateAdminQuiz = () => {
  const qc = useQueryClient();
  return useMutation<any, unknown, CreateAdminQuizRequest>({
    mutationFn: async (body) => createAdminQuiz(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] });
    },
  });
};

export const useUpdateAdminQuiz = () => {
  const qc = useQueryClient();
  return useMutation<any, unknown, { id: string } & UpdateAdminQuizRequest>({
    mutationFn: async ({ id, ...body }) => updateAdminQuiz(id, body),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: [ENDPOINT, { id: vars.id }] });
    },
  });
};

export const useDeleteAdminQuiz = () => {
  const qc = useQueryClient();
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => deleteAdminQuiz(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] });
    },
  });
};

export const useAdminQuizDetail = (id?: string) => {
  return useQueryHook<AdminQuiz>(
    [ENDPOINT, id || ''],
    async () => {
      const api = (await import("@/services/api")).default;
      const response = await api.get(`/quizzes/${id}/admin-details`);
      return response.data.data || response.data;
    },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  );
};
