"use client";

import React, { useState, useEffect } from "react";
import { QuizCard } from "@/components/quiz/quiz-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuizzes, getMyQuizAttempts, type QuizAttempt } from "@/services/quiz";

interface QuizItem {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  status: "not-started" | "in-progress" | "completed";
  score?: number;
  attemptId?: string;
}

export const QuizSection: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getQuizzes(1, 6); // Lấy 6 quiz cho trang chủ
      
      // Lấy attempts (có thể fail nếu chưa đăng nhập)
      let attemptsData: QuizAttempt[] = [];
      try {
        attemptsData = await getMyQuizAttempts();
      } catch (error) {
        console.log("User not logged in or no attempts found");
      }

      // Tạo map attempts theo quizId
      const attemptsMap = new Map<string, QuizAttempt>();
      if (Array.isArray(attemptsData)) {
        attemptsData.forEach((attempt) => {
          const existing = attemptsMap.get(attempt.quizId);
          // Giữ attempt mới nhất
          if (!existing || new Date(attempt.startedAt) > new Date(existing.startedAt)) {
            attemptsMap.set(attempt.quizId, attempt);
          }
        });
      }
      
      // Handle nested response structure
      const responseData = response as any;
      const quizList = responseData?.data?.items 
        ?? responseData?.data?.data 
        ?? responseData?.data 
        ?? responseData?.items
        ?? [];

      const mappedQuizzes: QuizItem[] = (Array.isArray(quizList) ? quizList : []).map((quiz: any) => {
        const attempt = attemptsMap.get(quiz.id);
        
        let status: "not-started" | "in-progress" | "completed" = "not-started";
        let score: number | undefined;
        let attemptId: string | undefined;

        if (attempt) {
          attemptId = attempt.id;
          if (attempt.status === "completed") {
            status = "completed";
            score = Math.round(attempt.percentage);
          } else if (attempt.status === "in-progress") {
            status = "in-progress";
          }
        }

        return {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || "",
          questionCount: quiz.questions?.length || 0,
          timeLimit: quiz.timeLimit || 0,
          status,
          score,
          attemptId,
        };
      });

      setQuizzes(mappedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12">
      <div className="max-w-[1300px] mx-auto px-4 pt-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bài kiểm tra</h2>
          <p className="text-muted-foreground">
            Chọn một bài kiểm tra để bắt đầu thử thách bản thân
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                id={quiz.id}
                title={quiz.title}
                description={quiz.description}
                questionCount={quiz.questionCount}
                timeLimit={quiz.timeLimit}
                status={quiz.status}
                score={quiz.score}
                attemptId={quiz.attemptId}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Chưa có bài kiểm tra nào
          </p>
        )}
      </div>
    </section>
  );
};
