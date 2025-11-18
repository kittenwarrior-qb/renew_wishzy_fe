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
  duration:number;
}

export interface QuizSubmission {
  quizId: string;
  answers: Record<string, string[]>; // questionId -> answerIds
  timeSpent: number; // thời gian đã làm (giây)
  submittedAt: Date;
}
