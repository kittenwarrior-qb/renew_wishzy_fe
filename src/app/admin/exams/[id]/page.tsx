"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminQuizDetail } from "@/components/shared/quiz/useQuiz";
import { ArrowLeft, Clock, FileText, CheckCircle2 } from "lucide-react";
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay";

export default function ExamDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();

  const { data: quiz, isPending } = useAdminQuizDetail(id);

  if (isPending) {
    return <LoadingOverlay show={true} />;
  }

  if (!quiz) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy bài kiểm tra</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 md:px-6 py-4">
        <button
          onClick={() => router.push(`/admin/exams`)}
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Trở về
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-muted-foreground">{quiz.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{quiz.timeLimit || 0} phút</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span>{(quiz as any).questions?.length || 0} câu hỏi</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                quiz.isPublic
                  ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                  : "bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-300"
              }`}
            >
              {quiz.isPublic ? "Công khai" : "Riêng tư"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                quiz.isFree
                  ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                  : "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
              }`}
            >
              {quiz.isFree
                ? "Miễn phí"
                : `${Number(quiz.price || 0).toLocaleString("vi-VN")} VNĐ`}
            </span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Danh sách câu hỏi</h2>
        <div className="space-y-6">
          {(quiz as any).questions?.map((question: any, qIndex: number) => (
            <div
              key={question.id}
              className="bg-card rounded-lg border p-4 md:p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                  {qIndex + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">{question.questionText}</p>
                  <p className="text-sm text-muted-foreground">
                    {question.points} điểm
                  </p>
                </div>
              </div>

              <div className="space-y-2 ml-11">
                {question.answerOptions?.map((option: any, oIndex: number) => (
                  <div
                    key={option.id}
                    className={`flex items-start gap-3 p-3 rounded-md border ${
                      option.isCorrect
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5">
                      {option.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <p className="flex-1">{option.optionText}</p>
                    {option.isCorrect && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Đáp án đúng
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
