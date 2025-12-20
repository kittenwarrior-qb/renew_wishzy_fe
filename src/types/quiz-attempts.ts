// Quiz Attempt Types for Admin/Instructor

export interface QuizAttemptUser {
  id: string;
  fullName: string;
  email: string;
}

export interface QuizAttemptQuiz {
  id: string;
  title: string;
  description?: string;
}

export interface QuizAttemptListItem {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  completedAt: string | null;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  user: QuizAttemptUser | null;
  quiz: QuizAttemptQuiz | null;
}

export interface QuizAttemptListResponse {
  data: QuizAttemptListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuizAttemptAnswerOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuizAttemptUserAnswer {
  selectedOptionId: string;
  selectedOptionText: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuizAttemptQuestion {
  id: string;
  questionText: string;
  points: number;
  orderIndex: number;
  userAnswer: QuizAttemptUserAnswer | null;
  correctAnswer: {
    id: string;
    optionText: string;
  } | null;
  answerOptions: QuizAttemptAnswerOption[];
}

export interface QuizAttemptDetail {
  id: string;
  startedAt: string;
  completedAt: string | null;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  user: QuizAttemptUser;
  quiz: QuizAttemptQuiz;
  questions: QuizAttemptQuestion[];
}
