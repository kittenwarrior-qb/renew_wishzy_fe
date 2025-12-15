"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateQuiz } from "@/hooks/useQuizzes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Switch from "@/components/ui/switch";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { notify } from "@/components/shared/admin/Notifications";
import Link from "next/link";

interface AnswerOption {
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface Question {
  questionText: string;
  points: number;
  orderIndex: number;
  answerOptions: AnswerOption[];
}

const CreateQuizPage = () => {
  const router = useRouter();
  const { mutate: createQuiz, isPending } = useCreateQuiz();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
    isFree: true,
    price: 0,
    timeLimit: 30,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: "",
      points: 1,
      orderIndex: 0,
      answerOptions: [
        { optionText: "", isCorrect: false, orderIndex: 0 },
        { optionText: "", isCorrect: false, orderIndex: 1 },
      ],
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        points: 1,
        orderIndex: questions.length,
        answerOptions: [
          { optionText: "", isCorrect: false, orderIndex: 0 },
          { optionText: "", isCorrect: false, orderIndex: 1 },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      notify({ title: "Lỗi", description: "Quiz phải có ít nhất 1 câu hỏi", variant: "destructive" });
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    newQuestions.forEach((q, i) => (q.orderIndex = i));
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const addAnswerOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    question.answerOptions.push({
      optionText: "",
      isCorrect: false,
      orderIndex: question.answerOptions.length,
    });
    setQuestions(newQuestions);
  };

  const removeAnswerOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    if (question.answerOptions.length === 2) {
      notify({ title: "Lỗi", description: "Câu hỏi phải có ít nhất 2 đáp án", variant: "destructive" });
      return;
    }
    question.answerOptions = question.answerOptions.filter((_, i) => i !== optionIndex);
    question.answerOptions.forEach((opt, i) => (opt.orderIndex = i));
    setQuestions(newQuestions);
  };

  const updateAnswerOption = (
    questionIndex: number,
    optionIndex: number,
    field: keyof AnswerOption,
    value: any
  ) => {
    const newQuestions = [...questions];
    (newQuestions[questionIndex].answerOptions[optionIndex] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title.trim()) {
      notify({ title: "Lỗi", description: "Vui lòng nhập tiêu đề quiz", variant: "destructive" });
      return;
    }

    if (questions.length === 0) {
      notify({ title: "Lỗi", description: "Quiz phải có ít nhất 1 câu hỏi", variant: "destructive" });
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        notify({
          title: "Lỗi",
          description: `Câu hỏi ${i + 1}: Vui lòng nhập nội dung câu hỏi`,
          variant: "destructive",
        });
        return;
      }

      if (q.answerOptions.length < 2) {
        notify({
          title: "Lỗi",
          description: `Câu hỏi ${i + 1}: Phải có ít nhất 2 đáp án`,
          variant: "destructive",
        });
        return;
      }

      const hasCorrectAnswer = q.answerOptions.some((opt) => opt.isCorrect);
      if (!hasCorrectAnswer) {
        notify({
          title: "Lỗi",
          description: `Câu hỏi ${i + 1}: Phải có ít nhất 1 đáp án đúng`,
          variant: "destructive",
        });
        return;
      }

      for (let j = 0; j < q.answerOptions.length; j++) {
        if (!q.answerOptions[j].optionText.trim()) {
          notify({
            title: "Lỗi",
            description: `Câu hỏi ${i + 1}, Đáp án ${j + 1}: Vui lòng nhập nội dung đáp án`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    const payload = {
      ...formData,
      questions: questions.map((q) => ({
        questionText: q.questionText,
        points: q.points,
        orderIndex: q.orderIndex,
        answerOptions: q.answerOptions.map((opt) => ({
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          orderIndex: opt.orderIndex,
        })),
      })),
    };

    createQuiz(payload, {
      onSuccess: () => {
        notify({ title: "Thành công", description: "Tạo quiz thành công", variant: "success" });
        router.push("/instructor/quizzes");
      },
      onError: (error: any) => {
        notify({
          title: "Lỗi",
          description: error?.message || "Không thể tạo quiz",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/instructor/quizzes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Tạo Quiz Mới</h1>
          </div>
          <p className="text-muted-foreground ml-14">Tạo bài quiz mới cho học viên</p>
        </div>
      </div>

      {/* Quiz Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Tiêu đề<span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ví dụ: JavaScript Fundamentals Quiz"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả ngắn về nội dung quiz"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Thời gian (phút)</Label>
              <Input
                id="timeLimit"
                type="number"
                min={1}
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) || 0 })}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá (VNĐ)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                disabled={formData.isFree}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic">Công khai</Label>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isFree">Miễn phí</Label>
              <Switch
                id="isFree"
                checked={formData.isFree}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, isFree: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Câu hỏi ({questions.length})</CardTitle>
            <Button onClick={addQuestion} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm câu hỏi
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, qIndex) => (
            <Card key={qIndex} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Câu hỏi {qIndex + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Nội dung câu hỏi<span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                    placeholder="Nhập nội dung câu hỏi"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Điểm</Label>
                  <Input
                    type="number"
                    min={1}
                    value={question.points}
                    onChange={(e) => updateQuestion(qIndex, "points", Number(e.target.value) || 1)}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Đáp án</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAnswerOption(qIndex)}
                      className="gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      Thêm đáp án
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {question.answerOptions.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <Switch
                          checked={option.isCorrect}
                          onCheckedChange={(checked: boolean) =>
                            updateAnswerOption(qIndex, oIndex, "isCorrect", checked)
                          }
                        />
                        <Input
                          value={option.optionText}
                          onChange={(e) =>
                            updateAnswerOption(qIndex, oIndex, "optionText", e.target.value)
                          }
                          placeholder={`Đáp án ${oIndex + 1}`}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAnswerOption(qIndex, oIndex)}
                          className="text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bật công tắc để đánh dấu đáp án đúng
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-background border-t pt-4">
        <Link href="/instructor/quizzes">
          <Button variant="outline">Huỷ</Button>
        </Link>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Đang tạo..." : "Tạo Quiz"}
        </Button>
      </div>
    </div>
  );
};

export default CreateQuizPage;
