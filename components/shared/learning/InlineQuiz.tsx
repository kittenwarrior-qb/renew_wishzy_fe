'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  XCircle,
  Send,
  Trophy,
  RotateCcw,
  Loader2,
  FileQuestion,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useQuizForTaking,
  useStartQuizAttempt,
  useCompleteAttemptAndCheckLecture,
} from '@/src/hooks/useLectureQuiz';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { lectureQuizService } from '@/src/services/lecture-quiz';

interface InlineQuizProps {
  quizId: string;
  enrollmentId: string;
  lectureId: string;
  onQuizComplete?: (passed: boolean) => void;
}

interface QuestionResult {
  isCorrect: boolean;
  correctAnswer: string;
}

export function InlineQuiz({
  quizId,
  enrollmentId,
  onQuizComplete,
}: InlineQuizProps) {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [passed, setPassed] = useState(false);
  const [resultsMap, setResultsMap] = useState<Map<string, QuestionResult>>(new Map());

  const { data: quiz, isLoading: loadingQuiz } = useQuizForTaking(quizId, true);
  const startAttempt = useStartQuizAttempt();
  const completeAttempt = useCompleteAttemptAndCheckLecture();

  // Auto-start quiz attempt when component mounts
  useEffect(() => {
    if (quiz && !attemptId && !startAttempt.isPending) {
      startAttempt.mutateAsync(quizId).then((attempt) => {
        setAttemptId(attempt.id);
      }).catch((error) => {
        toast.error('Không thể bắt đầu bài kiểm tra', {
          description: error?.message || 'Vui lòng thử lại',
        });
      });
    }
  }, [quiz, quizId]);

  // Handle answer selection - ONLY save locally, NO API call
  const handleSelectAnswer = (questionId: string, optionId: string) => {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Submit all answers at once when clicking submit button
  const handleSubmitQuiz = useCallback(async () => {
    if (!attemptId || !quiz) return;

    setIsSubmitting(true);

    try {
      // Submit all answers in one batch call
      const answerPromises = Object.entries(answers).map(([questionId, selectedOptionId]) =>
        api.post(`/quiz-attempts/${attemptId}/answer`, { questionId, selectedOptionId })
          .catch(() => {})
      );
      await Promise.all(answerPromises);

      // Complete attempt and get results
      const completionResult = await completeAttempt.mutateAsync({
        attemptId,
        enrollmentId,
      });

      // Fetch detailed results immediately
      const detailedResults = await lectureQuizService.getAttemptResults(attemptId);
      
      // Build results map from API response
      const newResultsMap = new Map<string, QuestionResult>();
      if (detailedResults?.results) {
        detailedResults.results.forEach((r, index) => {
          const question = quiz?.questions?.[index];
          if (question) {
            newResultsMap.set(question.id, {
              isCorrect: r.isCorrect,
              correctAnswer: r.correctAnswer,
            });
          }
        });
      }
      
      setResultsMap(newResultsMap);
      setPassed(completionResult.passed);
      setShowResults(true);

      // Always call onQuizComplete when quiz is done (passed or not for progress tracking)
      if (completionResult.passed) {
        toast.success('🎉 Chúc mừng! Bạn đã vượt qua bài kiểm tra!');
        onQuizComplete?.(true);
      }
    } catch (error: any) {
      toast.error('Không thể nộp bài', {
        description: error?.message || 'Vui lòng thử lại',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptId, enrollmentId, completeAttempt, onQuizComplete, answers, quiz]);

  const handleRetry = async () => {
    setShowResults(false);
    setAnswers({});
    setResultsMap(new Map());
    setAttemptId(null);
    setPassed(false);
    
    try {
      const attempt = await startAttempt.mutateAsync(quizId);
      setAttemptId(attempt.id);
    } catch (error: any) {
      toast.error('Không thể bắt đầu lại bài kiểm tra');
    }
  };

  const totalQuestions = quiz?.questions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const canSubmit = answeredCount === totalQuestions && !isSubmitting;

  if (loadingQuiz) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!quiz) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileQuestion className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
              )}
            </div>
          </div>
          <Badge variant="outline">
            {answeredCount}/{totalQuestions} câu
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {quiz.questions?.map((question, qIndex) => {
          const result = resultsMap.get(question.id);
          const isCorrect = result?.isCorrect;
          const hasResult = showResults && result !== undefined;

          return (
            <div
              key={question.id}
              className="p-4 rounded-lg border border-border"
            >
              <div className="flex items-start gap-2 mb-3">
                <Badge variant="secondary" className="shrink-0">
                  Câu {qIndex + 1}
                </Badge>
                <span className="font-medium">{question.questionText}</span>
                {hasResult && (
                  isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 ml-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 shrink-0 ml-auto" />
                  )
                )}
              </div>

              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleSelectAnswer(question.id, value)}
                className="space-y-2"
                disabled={showResults}
              >
                {question.answerOptions
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((option) => {
                    const isSelected = answers[question.id] === option.id;
                    const isCorrectOption = result?.correctAnswer === option.optionText;
                    // Only show styling when we have results
                    const showAsWrong = hasResult && isSelected && !isCorrect;
                    const showCorrectIcon = hasResult && isCorrectOption;

                    return (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          showAsWrong
                            ? 'border-red-500 bg-red-100 dark:bg-red-900/30'
                            : isSelected && !showResults
                            ? 'border-primary bg-primary/5'
                            : isSelected && hasResult && isCorrect
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        } ${showResults ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50'}`}
                        onClick={() => handleSelectAnswer(question.id, option.id)}
                      >
                        <RadioGroupItem value={option.id} id={option.id} disabled={showResults} />
                        <Label
                          htmlFor={option.id}
                          className={`flex-1 ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          {option.optionText}
                        </Label>
                        {showCorrectIcon && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {showAsWrong && <XCircle className="h-4 w-4 text-red-600" />}
                      </div>
                    );
                  })}
              </RadioGroup>
            </div>
          );
        })}

        <div className="flex items-center justify-between pt-4 border-t">
          {showResults ? (
            <>
              <div className="flex items-center gap-2">
                {passed ? (
                  <>
                    <Trophy className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">Đã vượt qua!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-600">Chưa đạt - Hãy thử lại</span>
                  </>
                )}
              </div>
              {!passed && (
                <Button onClick={handleRetry} disabled={startAttempt.isPending}>
                  {startAttempt.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Làm lại
                </Button>
              )}
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                {answeredCount < totalQuestions
                  ? `Còn ${totalQuestions - answeredCount} câu chưa trả lời`
                  : 'Đã trả lời tất cả câu hỏi'}
              </span>
              <Button onClick={handleSubmitQuiz} disabled={!canSubmit}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Nộp bài
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
