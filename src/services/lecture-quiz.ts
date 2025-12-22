import api from '@/lib/api';

export interface LectureQuizAttempt {
  id: string;
  percentage: number;
  passed: boolean;
  completedAt: string;
}

export interface LectureQuiz {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  timeLimit?: number;
  passingScore: number;
  attempts: LectureQuizAttempt[];
  bestScore: number | null;
  passed: boolean;
}

export interface LectureQuizStatus {
  requiresQuiz: boolean;
  quizzes: LectureQuiz[];
  allPassed: boolean;
}

export interface QuizCompletionResult {
  attempt: {
    id: string;
    percentage: number;
    totalScore: number;
    maxScore: number;
    status: string;
  };
  passed: boolean;
  lectureCompleted: boolean;
  message: string;
}

export const lectureQuizService = {
  /**
   * Get quiz status for a lecture
   */
  async getLectureQuizStatus(lectureId: string): Promise<LectureQuizStatus> {
    const response = await api.get(`/quiz-attempts/lecture/${lectureId}/status`);
    return response.data?.data || response.data;
  },

  /**
   * Check if user has completed all quizzes for a lecture
   */
  async checkLectureQuizCompletion(lectureId: string): Promise<{
    passed: boolean;
    requiresQuiz: boolean;
    quizzes: Array<{
      id: string;
      title: string;
      passingScore: number;
      bestAttempt: { percentage: number; passed: boolean } | null;
    }>;
  }> {
    const response = await api.get(`/quiz-attempts/lecture/${lectureId}/check-completion`);
    return response.data?.data || response.data;
  },

  /**
   * Complete quiz attempt and check lecture completion
   */
  async completeAttemptAndCheckLecture(
    attemptId: string,
    enrollmentId?: string,
  ): Promise<QuizCompletionResult> {
    const response = await api.post(`/quiz-attempts/${attemptId}/complete-and-check`, {
      enrollmentId,
    });
    return response.data?.data || response.data;
  },

  /**
   * Start a quiz attempt
   */
  async startQuizAttempt(quizId: string): Promise<{ id: string }> {
    const response = await api.post(`/quiz-attempts/start/${quizId}`);
    return response.data?.data || response.data;
  },

  /**
   * Submit answer for a question
   */
  async submitAnswer(
    attemptId: string,
    questionId: string,
    selectedOptionId: string,
  ): Promise<void> {
    await api.post(`/quiz-attempts/${attemptId}/answer`, {
      questionId,
      selectedOptionId,
    });
  },

  /**
   * Get quiz for taking (without correct answers)
   */
  async getQuizForTaking(quizId: string): Promise<{
    id: string;
    title: string;
    description?: string;
    timeLimit?: number;
    passingScore: number;
    questions: Array<{
      id: string;
      questionText: string;
      points: number;
      orderIndex: number;
      answerOptions: Array<{
        id: string;
        optionText: string;
        orderIndex: number;
      }>;
    }>;
  }> {
    const response = await api.get(`/quizzes/${quizId}`, {
      params: { includeAnswers: 'false' },
    });
    return response.data?.data || response.data;
  },

  /**
   * Get attempt results
   */
  async getAttemptResults(attemptId: string): Promise<{
    attempt: {
      id: string;
      startedAt: string;
      completedAt: string;
      totalScore: number;
      maxScore: number;
      percentage: number;
    };
    quiz: {
      id: string;
      title: string;
      description?: string;
    };
    results: Array<{
      question: string;
      points: number;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      pointsEarned: number;
    }>;
  }> {
    const response = await api.get(`/quiz-attempts/${attemptId}/results`);
    return response.data?.data || response.data;
  },
};
