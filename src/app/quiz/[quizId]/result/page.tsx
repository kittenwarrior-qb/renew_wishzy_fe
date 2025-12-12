"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Home,
  RotateCcw,
} from "lucide-react";
import { getAttemptResults } from "@/services/quiz";
import { toast } from "sonner";

interface QuizResult {
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
    description: string;
  };
  results: Array<{
    question: string;
    points: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
  }>;
}

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params.quizId as string;
  const attemptId = searchParams.get("attemptId");

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attemptId) {
      fetchResult();
    } else {
      setLoading(false);
      toast.error("Không tìm thấy kết quả bài kiểm tra");
    }
  }, [attemptId]);

  const fetchResult = async () => {
    if (!attemptId) return;
    
    try {
      setLoading(true);
      const data = await getAttemptResults(attemptId);
      setResult(data);
    } catch (error: any) {
      console.error("Error fetching result:", error);
      toast.error("Không thể tải kết quả bài kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (startedAt: string, completedAt: string) => {
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const seconds = Math.floor((end - start) / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes} phút ${secs} giây`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Xuất sắc", variant: "default" as const };
    if (score >= 80) return { label: "Giỏi", variant: "default" as const };
    if (score >= 70) return { label: "Khá", variant: "secondary" as const };
    if (score >= 50)
      return { label: "Trung bình", variant: "secondary" as const };
    return { label: "Yếu", variant: "destructive" as const };
  };

  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-[1300px] mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Không tìm thấy kết quả bài kiểm tra
            </p>
            <Button onClick={() => router.push(`/${params.locale}/dashboard`)}>
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const score = Math.round(result.attempt.percentage);
  const correctCount = result.results.filter((r) => r.isCorrect).length;
  const totalQuestions = result.results.length;
  const scoreBadge = getScoreBadge(score);

  return (
    <div className="max-w-[1300px] mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Award className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">Kết quả bài kiểm tra</CardTitle>
          <CardDescription className="text-lg">
            {result.quiz.title}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Điểm số */}
          <div className="text-center py-8 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span
                className={`text-6xl font-bold ${getScoreColor(score)}`}
              >
                {score}
              </span>
              <span className="text-3xl text-muted-foreground">/100</span>
            </div>
            <Badge variant={scoreBadge.variant} className="text-base px-4 py-1">
              {scoreBadge.label}
            </Badge>
          </div>

          {/* Thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {correctCount}
                </div>
                <div className="text-sm text-muted-foreground">Câu đúng</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {totalQuestions - correctCount}
                </div>
                <div className="text-sm text-muted-foreground">Câu sai</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(result.attempt.startedAt, result.attempt.completedAt)}
                </div>
                <div className="text-sm text-muted-foreground">Thời gian</div>
              </CardContent>
            </Card>
          </div>

          {/* Chi tiết */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tổng số câu hỏi:
                  </span>
                  <span className="font-semibold">{totalQuestions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số câu đúng:</span>
                  <span className="font-semibold text-green-600">
                    {correctCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số câu sai:</span>
                  <span className="font-semibold text-red-600">
                    {totalQuestions - correctCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tỷ lệ đúng:</span>
                  <span className="font-semibold">
                    {result.attempt.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Điểm số:</span>
                  <span className="font-semibold">
                    {result.attempt.totalScore}/{result.attempt.maxScore}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/${params.locale}/quiz`)}
            >
              <Home className="w-4 h-4 mr-2" />
              Danh sách bài kiểm tra
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push(`/${params.locale}/quiz/${quizId}`)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Làm lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
