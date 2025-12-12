"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import {
  QuizForm,
  type QuizFormValue,
  type QuizFormError,
} from "@/components/shared/quiz/QuizForm";
import { notify } from "@/components/shared/admin/Notifications";
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore";
import { useCreateAdminQuiz } from "@/components/shared/quiz/useQuiz";
import { Button } from "@/components/ui/button";

export default function CreateExamPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "vi";
  const router = useRouter();
  const { setPrimaryAction } = useAdminHeaderStore();

  const { mutate: createQuiz, isPending: creating } = useCreateAdminQuiz();

  const [form, setForm] = React.useState<QuizFormValue>({
    title: "",
    description: "",
    isPublic: true,
    isFree: true,
    price: 0,
    timeLimit: "",
    questions: [
      {
        questionText: "",
        points: "",
        answerOptions: [
          { optionText: "", isCorrect: true },
          { optionText: "", isCorrect: false },
        ],
      },
    ],
  });
  const [errors, setErrors] = React.useState<QuizFormError>({});

  const validateCreate = React.useCallback(
    (v: QuizFormValue): QuizFormError => {
      const e: QuizFormError = {};
      if (!v.title.trim()) e.title = "Vui lòng nhập tiêu đề";

      const priceNum = v.price === "" ? 0 : Number(v.price);
      if (Number.isNaN(priceNum) || priceNum < 0) e.price = "Giá không hợp lệ";

      const tlNum = v.timeLimit === "" ? 0 : Number(v.timeLimit);
      if (tlNum <= 0) e.timeLimit = "Thời gian làm phải > 0";

      if (!v.questions.length) {
        e.questions = "Cần ít nhất 1 câu hỏi";
        return e;
      }

      for (let i = 0; i < v.questions.length; i++) {
        const q = v.questions[i];
        if (!q.questionText.trim()) {
          e.questions = `Câu hỏi ${i + 1} thiếu nội dung`;
          break;
        }
        const pts = q.points === "" ? 0 : Number(q.points);
        if (pts <= 0) {
          e.questions = `Điểm của câu hỏi ${i + 1} phải > 0`;
          break;
        }
        if (!q.answerOptions || q.answerOptions.length < 2) {
          e.questions = `Câu hỏi ${i + 1} cần ít nhất 2 đáp án`;
          break;
        }
        const hasCorrect = q.answerOptions.some((a) => a.isCorrect);
        if (!hasCorrect) {
          e.questions = `Câu hỏi ${i + 1} cần ít nhất 1 đáp án đúng`;
          break;
        }
        const hasEmpty = q.answerOptions.some((a) => !a.optionText.trim());
        if (hasEmpty) {
          e.questions = `Một số đáp án của câu hỏi ${i + 1} còn trống`;
          break;
        }
      }

      return e;
    },
    []
  );

  const handleSubmit = React.useCallback(() => {
    if (creating) return;

    const e = validateCreate(form);
    setErrors(e);
    if (Object.keys(e).length) return;

    createQuiz(
      {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        isPublic: !!form.isPublic,
        isFree: !!form.isFree,
        price: form.price === "" ? 0 : Number(form.price),
        timeLimit: form.timeLimit === "" ? undefined : Number(form.timeLimit),
        questions: form.questions.map((q, qIndex) => ({
          questionText: q.questionText.trim(),
          points: q.points === "" ? 1 : Number(q.points),
          orderIndex: qIndex,
          answerOptions: q.answerOptions.map((a, aIndex) => ({
            optionText: a.optionText.trim(),
            isCorrect: !!a.isCorrect,
            orderIndex: aIndex,
          })),
        })),
      },
      {
        onSuccess: () => {
          notify({ title: "Đã tạo", variant: "success" });
          router.push(`/admin/exams`);
        },
        onError: (err: any) =>
          notify({
            title: "Lỗi",
            description: String(err?.message || "Không thể tạo bài kiểm tra"),
            variant: "destructive",
          }),
      }
    );
  }, [creating, form, validateCreate, createQuiz, router]);

  React.useEffect(() => {
    setPrimaryAction(null);
    return () => setPrimaryAction(null);
  }, [setPrimaryAction]);

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 bg-background border-b px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Bài kiểm tra</h1>
      </div>
      <div className="p-4 md:p-6">
        <QuizForm
          value={form}
          onChange={setForm}
          error={errors}
          mode="create"
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant={"ghost"}
            type="button"
            onClick={() => router.push(`/admin/exams`)}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={creating}>
            {creating ? "Đang tạo..." : "Tạo bài kiểm tra"}
          </Button>
        </div>
      </div>
    </div>
  );
}
