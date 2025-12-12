import api from "./api"
import type {
  Quiz,
  QuizSubmission,
  AdminQuiz,
  AdminQuizListResponse,
  CreateAdminQuizRequest,
  UpdateAdminQuizRequest,
} from "@/types/quiz"

export interface QuizListItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  status: "not-started" | "in-progress" | "completed";
  score?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  completedAt: string | null;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: "in-progress" | "completed" | "abandoned";
  quiz?: any;
}

export interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  answers: Record<string, string[]>;
  submittedAt: string;
  quiz: Quiz;
}

// Các type admin quiz đã được định nghĩa tại '@/types/quiz'

// Lấy danh sách bài kiểm tra
export const getQuizzes = async (page: number = 1, limit: number = 100): Promise<{
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const response = await api.get("/quizzes", {
    params: { page, limit, isPublic: true }
  });
  return response.data;
};

// Lấy danh sách quiz attempts của user
export const getMyQuizAttempts = async (): Promise<QuizAttempt[]> => {
  const response = await api.get("/quiz-attempts/my-attempts");
  // Response được wrap: { success, data: [...], message }
  return response.data?.data || response.data || [];
};

// Lấy chi tiết bài kiểm tra
export const getQuiz = async (
  quizId: string,
  includeAnswers: boolean = false
): Promise<Quiz> => {
  const response = await api.get(`/quizzes/${quizId}`, {
    params: { includeAnswers },
  });
  return response.data.data;
};

// Nộp bài kiểm tra (sử dụng quiz-attempts API)
export const submitQuiz = async (
  submission: QuizSubmission
): Promise<{ attemptId: string }> => {
  // 1. Start attempt
  const attemptResponse = await api.post(`/quiz-attempts/start/${submission.quizId}`);
  // Response được wrap: { success, data: { id, ... }, message }
  const attemptId = attemptResponse.data?.data?.id || attemptResponse.data?.id;
  
  if (!attemptId) {
    console.error("Failed to get attemptId from response:", attemptResponse.data);
    throw new Error("Failed to start quiz attempt");
  }

  // 2. Submit all answers
  for (const [questionId, selectedOptionIds] of Object.entries(submission.answers)) {
    if (selectedOptionIds.length > 0) {
      await api.post(`/quiz-attempts/${attemptId}/answer`, {
        questionId,
        selectedOptionId: selectedOptionIds[0], // Backend chỉ hỗ trợ single choice
      });
    }
  }

  // 3. Complete attempt
  await api.post(`/quiz-attempts/${attemptId}/complete`);

  return { attemptId };
};

// Lấy kết quả bài kiểm tra
export const getQuizResult = async (quizId: string): Promise<QuizResult> => {
  const response = await api.get(`/quizzes/${quizId}/result`);
  return response.data;
};

// Bắt đầu làm bài (tạo attempt)
export const startQuiz = async (
  quizId: string
): Promise<QuizAttempt> => {
  const response = await api.post(`/quiz-attempts/start/${quizId}`);
  return response.data;
};

// Lấy kết quả attempt
export const getAttemptResults = async (attemptId: string): Promise<any> => {
  const response = await api.get(`/quiz-attempts/${attemptId}/results`);
  // Response được wrap: { success, data: {...}, message }
  return response.data?.data || response.data;
};

// Lấy danh sách quiz phục vụ cho admin (có phân trang)
export const listAdminQuizzes = async (
  params?: Record<string, any>
): Promise<AdminQuizListResponse> => {
  const response = await api.get<any>("/quizzes", { params });
  const root = response?.data ?? {};
  const data = root?.data ?? root;

  const items: AdminQuiz[] = (data?.items ?? data?.quizzes ?? data?.data ?? []) as AdminQuiz[];

  const total: number =
    data?.total ??
    data?.pagination?.totalItems ??
    (Array.isArray(items) ? items.length : 0);

  const page: number =
    data?.page ??
    data?.pagination?.currentPage ??
    (params?.page ?? 1);

  const limit: number =
    data?.limit ??
    data?.pagination?.itemsPerPage ??
    (params?.limit ?? (Array.isArray(items) ? items.length || 10 : 10));

  const totalPages: number =
    data?.totalPages ??
    data?.pagination?.totalPage ??
    (total && limit ? Math.ceil(total / limit) : 0);

  return {
    data: items,
    total,
    page,
    limit,
    totalPages,
  };
};

// Xoá quiz (dùng trong admin)
export const deleteAdminQuiz = async (quizId: string): Promise<void> => {
  await api.delete(`/quizzes/${quizId}`);
};

// Tạo quiz (dùng trong admin)
export const createAdminQuiz = async (
  body: CreateAdminQuizRequest
): Promise<any> => {
  const response = await api.post<any>("/quizzes", body);
  const root = response?.data ?? {};
  return root?.data ?? root;
};

// Cập nhật quiz (dùng trong admin)
export const updateAdminQuiz = async (
  id: string,
  body: UpdateAdminQuizRequest
): Promise<any> => {
  const response = await api.patch<any>(`/quizzes/${id}`, body);
  const root = response?.data ?? {};
  return root?.data ?? root;
};
