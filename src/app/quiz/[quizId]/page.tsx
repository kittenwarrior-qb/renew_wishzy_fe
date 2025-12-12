"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { QuizExam } from "@/components/quiz";
import { Quiz, QuizSubmission } from "@/src/types/quiz";
import { getQuiz, submitQuiz } from "@/src/services/quiz";
import { useQueryHook } from "@/src/hooks/useQueryHook";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [error, setError] = useState<string | null>(null);

  const {
    data: quizData,
    isLoading: loading,
    isError,
  } = useQueryHook(["quiz", quizId], () => getQuiz(quizId, false));

  // Transform API response to Quiz type
  const quiz: Quiz | null = quizData
    ? {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description,
        timeLimit: quizData.timeLimit,
        duration: quizData.timeLimit, 
        questions: quizData.questions.map((q: any) => ({
          id: q.id,
          question: q.questionText,
          type: "single", 
          answers: q.answerOptions.map((opt: any) => ({
            id: opt.id,
            text: opt.optionText,
          })),
        })),
      }
    : null;

  const handleSubmit = async (submission: QuizSubmission) => {
    try {
      const result = await submitQuiz(submission);
      router.push(`/quiz/${quizId}/result?attemptId=${result.attemptId}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || isError || !quiz) {
    return (
      <div className="max-w-[1300px] mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
            <p className="text-muted-foreground mb-4">
              {error || "Không thể tải bài kiểm tra. Vui lòng thử lại sau."}
            </p>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-8">
      <QuizExam quiz={quiz} onSubmit={handleSubmit} />
    </div>
  );
}
