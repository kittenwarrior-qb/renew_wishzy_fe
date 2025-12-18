"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuizAdminDetails } from "@/hooks/useQuizzes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

const QuizDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const { data: quiz, isLoading, isError } = useQuizAdminDetails(quizId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy quiz</p>
        <Link href="/instructor/quizzes">
          <Button variant="link" className="mt-4">
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/instructor/quizzes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
          </div>
          <p className="text-muted-foreground ml-14">Chi tiết bài quiz</p>
        </div>
        <Link href={`/instructor/quizzes/${quizId}/edit`}>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        </Link>
      </div>

      {/* Quiz Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
              <p className="text-base">
                {quiz.isPublic ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    Công khai
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    Riêng tư
                  </span>
                )}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Giá</p>
              <p className="text-base">
                {quiz.isFree ? (
                  <span className="text-green-600 font-medium">Miễn phí</span>
                ) : (
                  <span className="font-medium">{formatCurrency(quiz.price)}</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Thời gian</p>
              <p className="text-base">{quiz.timeLimit ? `${quiz.timeLimit} phút` : "Không giới hạn"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Lượt làm</p>
              <p className="text-base font-medium">{quiz.totalAttempts}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Lượt chia sẻ</p>
              <p className="text-base font-medium">{quiz.shareCount}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Số câu hỏi</p>
              <p className="text-base font-medium">{quiz.questions?.length || 0}</p>
            </div>
          </div>

          {quiz.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Mô tả</p>
              <p className="text-base">{quiz.description}</p>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Ngày tạo</p>
                <p>{new Date(quiz.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cập nhật lần cuối</p>
                <p>{new Date(quiz.updatedAt).toLocaleString("vi-VN")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Câu hỏi ({quiz.questions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {quiz.questions && quiz.questions.length > 0 ? (
            quiz.questions.map((question, qIndex) => (
              <Card key={question.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Câu hỏi {qIndex + 1} ({question.points} điểm)
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-medium">{question.questionText}</p>

                  <div className="space-y-2 pl-4">
                    {question.answerOptions && question.answerOptions.length > 0 ? (
                      question.answerOptions.map((option, oIndex) => (
                        <div
                          key={option.id}
                          className={`flex items-start gap-2 p-2 rounded ${
                            option.isCorrect ? "bg-green-50 border border-green-200" : "bg-muted/30"
                          }`}
                        >
                          {option.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className={option.isCorrect ? "text-green-900 font-medium" : ""}>
                              {String.fromCharCode(65 + oIndex)}. {option.optionText}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Không có đáp án</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Không có câu hỏi nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizDetailsPage;
