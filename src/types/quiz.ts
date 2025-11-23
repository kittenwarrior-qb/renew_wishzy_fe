export interface QuizAnswer {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "single" | "multiple";
  answers: QuizAnswer[];
  selectedAnswers?: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  timeLimit: number;
  duration: number;
}

export interface QuizSubmission {
  quizId: string;
  answers: Record<string, string[]>; // questionId -> answerIds
  timeSpent: number; // thời gian đã làm (giây)
  submittedAt: Date;
}

// ================= Admin Quiz Types =================

export interface AdminQuiz {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  isFree: boolean;
  price: number;
  timeLimit: number | null;
  totalAttempts?: number;
  shareCount?: number;
  createdAt: string | Date;
}

export interface AdminQuizListResponse {
  data: AdminQuiz[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminQuizAnswerOptionInput {
  optionText: string;
  isCorrect: boolean;
}

export interface AdminQuizQuestionInput {
  questionText: string;
  points: number;
  answerOptions: AdminQuizAnswerOptionInput[];
}

export interface CreateAdminQuizRequest {
  title: string;
  description?: string;
  isPublic?: boolean;
  isFree?: boolean;
  price?: number;
  timeLimit?: number;
  questions: AdminQuizQuestionInput[];
}

export type UpdateAdminQuizRequest = Partial<CreateAdminQuizRequest>;

export interface AdminQuizDetail extends AdminQuiz {
  questions: AdminQuizQuestionInput[];
}
