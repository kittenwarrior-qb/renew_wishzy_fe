import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

export interface Quiz {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  isFree: boolean;
  price: number;
  timeLimit?: number;
  totalAttempts: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    fullName: string;
  };
  questions?: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  orderIndex: number;
  points: number;
  createdAt: string;
  answerOptions?: AnswerOption[];
}

export interface AnswerOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
}

interface QuizzesResponse {
  data: Quiz[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useQuizzes = (page: number = 1, limit: number = 10, isPublic?: boolean) => {
  return useQuery({
    queryKey: ['quizzes', page, limit, isPublic],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: QuizzesResponse; message: string }>('/quizzes', {
        params: { page, limit, isPublic },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useMyQuizzes = () => {
  return useQuery({
    queryKey: ['my-quizzes'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Quiz[]; message: string }>('/quizzes/my-quizzes');
      return response.data.data; // Backend wraps response in { success, data, message }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useQuiz = (quizId: string, includeAnswers: boolean = false) => {
  return useQuery({
    queryKey: ['quiz', quizId, includeAnswers],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Quiz; message: string }>(`/quizzes/${quizId}`, {
        params: { includeAnswers: includeAnswers ? 'true' : 'false' },
      });
      return response.data.data;
    },
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useQuizAdminDetails = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz-admin-details', quizId],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Quiz; message: string }>(`/quizzes/${quizId}/admin-details`);
      return response.data.data;
    },
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useLectureQuizzes = (lectureId: string) => {
  return useQuery({
    queryKey: ['lecture-quizzes', lectureId],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Quiz[]; message: string }>(`/quizzes/lecture/${lectureId}`);
      return response.data.data;
    },
    enabled: !!lectureId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      isPublic?: boolean;
      isFree?: boolean;
      price?: number;
      timeLimit?: number;
      entityId?: string;
      questions: Array<{
        questionText: string;
        orderIndex: number;
        points: number;
        answerOptions: Array<{
          optionText: string;
          isCorrect: boolean;
          orderIndex: number;
        }>;
      }>;
    }) => {
      const response = await api.post<{ success: boolean; data: Quiz; message: string }>('/quizzes', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
      if (variables.entityId) {
        queryClient.invalidateQueries({ queryKey: ['lecture-quizzes', variables.entityId] });
      }
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, entityId }: { id: string; data: Partial<Quiz>; entityId?: string }) => {
      const response = await api.patch<{ success: boolean; data: Quiz; message: string }>(`/quizzes/${id}`, data);
      return { quiz: response.data.data, entityId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-admin-details'] });
      if (result.entityId) {
        queryClient.invalidateQueries({ queryKey: ['lecture-quizzes', result.entityId] });
      }
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, entityId }: { id: string; entityId?: string }) => {
      const response = await api.delete<{ success: boolean; data: null; message: string }>(`/quizzes/${id}`);
      return { data: response.data, entityId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
      if (result.entityId) {
        queryClient.invalidateQueries({ queryKey: ['lecture-quizzes', result.entityId] });
      }
    },
  });
};

// Quiz Attempts hooks
export const useStartQuizAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      const response = await api.post<{ success: boolean; data: QuizAttempt; message: string }>(`/quiz-attempts/start/${quizId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
  });
};

export const useMyQuizAttempts = () => {
  return useQuery({
    queryKey: ['my-quiz-attempts'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: QuizAttempt[]; message: string }>('/quiz-attempts/my-attempts');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useQuizAttemptResults = (attemptId: string) => {
  return useQuery({
    queryKey: ['quiz-attempt-results', attemptId],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any; message: string }>(`/quiz-attempts/${attemptId}/results`);
      return response.data.data;
    },
    enabled: !!attemptId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
