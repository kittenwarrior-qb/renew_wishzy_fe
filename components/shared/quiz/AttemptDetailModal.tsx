"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, User, Award } from "lucide-react";
import { useAdminQuizAttemptDetail } from "@/src/hooks/useAdminQuizAttempts";
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay";
import { cn } from "@/lib/utils";

interface AttemptDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attemptId: string | null;
}

export function AttemptDetailModal({
  open,
  onOpenChange,
  attemptId,
}: AttemptDetailModalProps) {
  const { data: attempt, isLoading, isError } = useAdminQuizAttemptDetail(attemptId || "");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">Đang làm</Badge>;
      case "abandoned":
        return <Badge className="bg-red-100 text-red-800">Đã bỏ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent sticky top-0 z-10 backdrop-blur-sm">
          <DialogTitle className="text-xl font-semibold">Chi tiết bài làm</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="relative min-h-[200px] p-6">
            <LoadingOverlay show={true} />
          </div>
        )}

        {isError && (
          <div className="text-center py-12 px-6 text-destructive">
            Không thể tải chi tiết bài làm
          </div>
        )}

        {attempt && (
          <div className="p-6 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Thông tin học viên
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="font-medium">{attempt.user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{attempt.user.email}</p>
                </CardContent>
              </Card>

              {/* Score Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Kết quả
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{attempt.totalScore}</span>
                    <span className="text-muted-foreground">/ {attempt.maxScore} điểm</span>
                    <span className={cn(
                      "text-lg font-semibold",
                      attempt.percentage >= 80 ? "text-green-600" :
                      attempt.percentage >= 50 ? "text-yellow-600" : "text-red-600"
                    )}>
                      ({Number(attempt.percentage).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(attempt.status)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quiz Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bài kiểm tra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{attempt.quiz.title}</p>
                {attempt.quiz.description && (
                  <p className="text-sm text-muted-foreground">{attempt.quiz.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Bắt đầu: {formatDate(attempt.startedAt)}
                  </span>
                  {attempt.completedAt && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Hoàn thành: {formatDate(attempt.completedAt)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Questions and Answers */}
            <div className="space-y-4">
              <h3 className="font-semibold">Chi tiết câu trả lời</h3>
              {attempt.questions
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((question, index) => (
                  <Card
                    key={question.id}
                    className={cn(
                      "border-l-4",
                      question.userAnswer?.isCorrect
                        ? "border-l-green-500"
                        : question.userAnswer
                        ? "border-l-red-500"
                        : "border-l-gray-300"
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-sm font-medium">
                          Câu {index + 1}: {question.questionText}
                        </CardTitle>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline">
                            {question.userAnswer?.pointsEarned || 0}/{question.points} điểm
                          </Badge>
                          {question.userAnswer?.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : question.userAnswer ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <span className="text-sm text-muted-foreground">Chưa trả lời</span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid gap-2">
                        {question.answerOptions
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                          .map((option) => {
                            const isUserAnswer =
                              question.userAnswer?.selectedOptionId === option.id;
                            const isCorrect = option.isCorrect;

                            return (
                              <div
                                key={option.id}
                                className={cn(
                                  "p-2 rounded-md border text-sm",
                                  isCorrect && "bg-green-50 border-green-200 dark:bg-green-950/30",
                                  isUserAnswer && !isCorrect && "bg-red-50 border-red-200 dark:bg-red-950/30",
                                  !isUserAnswer && !isCorrect && "bg-muted/30"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrect && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                  )}
                                  {isUserAnswer && !isCorrect && (
                                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                                  )}
                                  <span>{option.optionText}</span>
                                  {isUserAnswer && (
                                    <Badge variant="outline" className="ml-auto text-xs">
                                      Đã chọn
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
