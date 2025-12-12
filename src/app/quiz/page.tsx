"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, FileText, PlayCircle, CheckCircle } from "lucide-react";
import { getQuizzes, getMyQuizAttempts, type QuizAttempt } from "@/services/quiz";
import { toast } from "sonner";

interface QuizItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  status: "not-started" | "in-progress" | "completed";
  score?: number;
  attemptId?: string;
}

export default function QuizListPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách quiz
      const quizzesResponse = await getQuizzes(1, 100);
      console.log("quizzesResponse:", quizzesResponse);
      
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

      // Kết hợp dữ liệu quiz với attempts
      // Handle nested response structure - API trả về { success, message, data }
      const responseData = quizzesResponse as any;
      const quizList = responseData?.data?.items 
        ?? responseData?.data?.data 
        ?? responseData?.data 
        ?? responseData?.items
        ?? [];
      
      console.log("quizList:", quizList);
      
      const combinedQuizzes: QuizItem[] = (Array.isArray(quizList) ? quizList : []).map((quiz: any) => {
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
          duration: quiz.timeLimit || 0,
          totalQuestions: quiz.questions?.length || 0,
          status,
          score,
          attemptId,
        };
      });

      setQuizzes(combinedQuizzes);
    } catch (error: any) {
      console.error("Error fetching quizzes:", error);
      toast.error("Không thể tải danh sách bài kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: QuizItem["status"]) => {
    switch (status) {
      case "not-started":
        return <Badge variant="secondary">Chưa làm</Badge>;
      case "in-progress":
        return <Badge variant="default">Đang làm</Badge>;
      case "completed":
        return (
          <Badge variant="outline" className="border-green-600 text-green-600">
            Đã hoàn thành
          </Badge>
        );
    }
  };

  const handleStartQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  const handleViewResult = (quiz: QuizItem) => {
    if (quiz.attemptId) {
      router.push(`/quiz/${quiz.id}/result?attemptId=${quiz.attemptId}`);
    } else {
      router.push(`/quiz/${quiz.id}/result`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto py-8 px-4">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bài kiểm tra trắc nghiệm</h1>
        <p className="text-muted-foreground">
          Danh sách các bài kiểm tra của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <FileText className="w-8 h-8 text-primary" />
                {getStatusBadge(quiz.status)}
              </div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.duration} phút</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{quiz.totalQuestions} câu hỏi</span>
                </div>
                {quiz.status === "completed" && quiz.score !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      Điểm: {quiz.score}/100
                    </span>
                  </div>
                )}
              </div>

              {quiz.status === "completed" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewResult(quiz)}
                >
                  Xem kết quả
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleStartQuiz(quiz.id)}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {quiz.status === "in-progress" ? "Tiếp tục làm" : "Bắt đầu"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có bài kiểm tra nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
