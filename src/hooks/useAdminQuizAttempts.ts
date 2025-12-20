import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { QuizAttemptListResponse, QuizAttemptDetail } from '@/src/types/quiz-attempts';

interface AdminAttemptsFilters {
  page?: number;
  limit?: number;
  status?: string;
  quizId?: string;
  userId?: string;
}

/**
 * Hook to fetch quiz attempts for admin/instructor
 * Admins see all attempts, instructors see only their quiz attempts
 */
export function useAdminQuizAttempts(filters: AdminAttemptsFilters = {}) {
  const { page = 1, limit = 10, status, quizId, userId } = filters;

  return useQuery({
    queryKey: ['admin-quiz-attempts', page, limit, status, quizId, userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (status) params.append('status', status);
      if (quizId) params.append('quizId', quizId);
      if (userId) params.append('userId', userId);

      const response = await api.get<{ success: boolean; data: QuizAttemptListResponse; message: string }>(
        `/quiz-attempts/admin/all?${params.toString()}`
      );
      return response.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch single quiz attempt details for admin/instructor
 */
export function useAdminQuizAttemptDetail(attemptId: string) {
  return useQuery({
    queryKey: ['admin-quiz-attempt-detail', attemptId],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: QuizAttemptDetail; message: string }>(
        `/quiz-attempts/admin/${attemptId}`
      );
      return response.data.data;
    },
    enabled: !!attemptId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
