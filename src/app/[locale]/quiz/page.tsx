"use client";

import { useParams, useRouter } from "next/navigation";
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

interface QuizItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  status: "not-started" | "in-progress" | "completed";
  score?: number;
}

export default function QuizListPage() {
  const params = useParams();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch danh sách quiz từ API
    // fetchQuizzes()

    // Mock data để demo
    setTimeout(() => {
      const mockQuizzes: QuizItem[] = [
        {
          id: "quiz-1",
          title: "Bài kiểm tra Lập trình Web",
          description: "Kiểm tra kiến thức về HTML, CSS và JavaScript cơ bản",
          duration: 30,
          totalQuestions: 20,
          status: "not-started",
        },
        {
          id: "quiz-2",
          title: "Bài kiểm tra React & Next.js",
          description:
            "Kiểm tra kiến thức về React hooks, components và Next.js routing",
          duration: 45,
          totalQuestions: 25,
          status: "in-progress",
        },
        {
          id: "quiz-3",
          title: "Bài kiểm tra TypeScript",
          description:
            "Kiểm tra kiến thức về TypeScript types, interfaces và generics",
          duration: 40,
          totalQuestions: 30,
          status: "completed",
          score: 85,
        },
      ];

      setQuizzes(mockQuizzes);
      setLoading(false);
    }, 1000);
  }, []);

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
    router.push(`/${params.locale}/quiz/${quizId}`);
  };

  const handleViewResult = (quizId: string) => {
    router.push(`/${params.locale}/quiz/${quizId}/result`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
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
    <div className="container mx-auto py-8 px-4">
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
                  onClick={() => handleViewResult(quiz.id)}
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
