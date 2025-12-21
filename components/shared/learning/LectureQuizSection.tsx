'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, FileQuestion } from 'lucide-react';
import { useLectureQuizStatus } from '@/src/hooks/useLectureQuiz';
import { InlineQuiz } from './InlineQuiz';
import { Skeleton } from '@/components/ui/skeleton';

interface LectureQuizSectionProps {
  lectureId: string;
  enrollmentId: string;
  onQuizComplete?: (allPassed: boolean) => void;
}

export function LectureQuizSection({
  lectureId,
  enrollmentId,
  onQuizComplete,
}: LectureQuizSectionProps) {
  const { data: quizStatus, isLoading, isError, refetch } = useLectureQuizStatus(lectureId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !quizStatus) {
    return null;
  }

  // If lecture doesn't require quiz, don't show anything
  if (!quizStatus.requiresQuiz || quizStatus.quizzes.length === 0) {
    return null;
  }

  const handleQuizComplete = (passed: boolean) => {
    refetch();
    if (onQuizComplete && passed) {
      onQuizComplete(true);
    }
  };

  // If all quizzes passed, show success message
  if (quizStatus.allPassed) {
    return (
      <Card className="border-green-500/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/30">
              <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Bài kiểm tra</CardTitle>
              <CardDescription className="text-green-600">
                Bạn đã hoàn thành tất cả bài kiểm tra!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Show inline quiz for each quiz that hasn't been passed
  return (
    <div className="space-y-4">
      {quizStatus.quizzes.map((quiz) => (
        <InlineQuiz
          key={quiz.id}
          quizId={quiz.id}
          enrollmentId={enrollmentId}
          lectureId={lectureId}
          onQuizComplete={handleQuizComplete}
        />
      ))}
    </div>
  );
}
