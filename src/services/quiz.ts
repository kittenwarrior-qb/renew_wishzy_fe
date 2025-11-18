import api from "./api";
import { Quiz, QuizSubmission } from "@/src/types/quiz";

export interface QuizListItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  status: "not-started" | "in-progress" | "completed";
  score?: number;
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

// Lấy danh sách bài kiểm tra
export const getQuizzes = async (): Promise<QuizListItem[]> => {
  const response = await api.get("/quizzes");
  return response.data;
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

// Nộp bài kiểm tra
export const submitQuiz = async (
  submission: QuizSubmission
): Promise<QuizResult> => {
  const response = await api.post(
    `/quizzes/${submission.quizId}/submit`,
    submission
  );
  return response.data;
};

// Lấy kết quả bài kiểm tra
export const getQuizResult = async (quizId: string): Promise<QuizResult> => {
  const response = await api.get(`/quizzes/${quizId}/result`);
  return response.data;
};

// Bắt đầu làm bài (tạo session)
export const startQuiz = async (
  quizId: string
): Promise<{ sessionId: string }> => {
  const response = await api.post(`/quizzes/${quizId}/start`);
  return response.data;
};
