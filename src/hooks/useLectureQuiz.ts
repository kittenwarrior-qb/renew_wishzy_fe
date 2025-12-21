import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lectureQuizService, LectureQuizStatus, QuizCompletionResult } from '@/src/services/lecture-quiz';
import { enrollmentService } from '@/src/services/enrollment';

/**
 * Hook to get quiz status for a lecture
 */
export function useLectureQuizStatus(lectureId: string, enabled: boolean = true) {
  return useQuery<LectureQuizStatus>({
    queryKey: ['lecture-quiz-status', lectureId],
    queryFn: () => lectureQuizService.getLectureQuizStatus(lectureId),
    enabled: !!lectureId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

/**
 * Hook to check lecture quiz completion
 */
export function useLectureQuizCompletion(lectureId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['lecture-quiz-completion', lectureId],
    queryFn: () => lectureQuizService.checkLectureQuizCompletion(lectureId),
    enabled: !!lectureId && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to get quiz for taking
 */
export function useQuizForTaking(quizId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['quiz-for-taking', quizId],
    queryFn: () => lectureQuizService.getQuizForTaking(quizId),
    enabled: !!quizId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to start quiz attempt
 */
export function useStartQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => lectureQuizService.startQuizAttempt(quizId),
    onSuccess: () => {
      // Invalidate quiz status queries
      queryClient.invalidateQueries({ queryKey: ['lecture-quiz-status'] });
    },
  });
}

/**
 * Hook to submit answer
 */
export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({
      attemptId,
      questionId,
      selectedOptionId,
    }: {
      attemptId: string;
      questionId: string;
      selectedOptionId: string;
    }) => lectureQuizService.submitAnswer(attemptId, questionId, selectedOptionId),
  });
}

/**
 * Hook to complete attempt and check lecture
 */
export function useCompleteAttemptAndCheckLecture() {
  const queryClient = useQueryClient();

  return useMutation<
    QuizCompletionResult,
    Error,
    { attemptId: string; enrollmentId?: string }
  >({
    mutationFn: ({ attemptId, enrollmentId }) =>
      lectureQuizService.completeAttemptAndCheckLecture(attemptId, enrollmentId),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['lecture-quiz-status'] });
      queryClient.invalidateQueries({ queryKey: ['lecture-quiz-completion'] });
      
      if (data.lectureCompleted) {
        // Clear localStorage cache to ensure fresh data
        enrollmentService.clearCache();
        // Invalidate enrollment data to refresh completed lectures
        queryClient.invalidateQueries({ queryKey: ['enrollment'] });
        queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      }
    },
  });
}

/**
 * Hook to get attempt results
 */
export function useAttemptResults(attemptId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['quiz-attempt-results', attemptId],
    queryFn: () => lectureQuizService.getAttemptResults(attemptId),
    enabled: !!attemptId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
