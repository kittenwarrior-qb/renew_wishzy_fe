"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Switch from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { useUnsavedChanges } from "@/components/shared/course/CourseForm";
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog";

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

interface QuizFormData {
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
}

interface LectureQuizFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  title?: string;
  defaultValue?: {
    title: string;
    description: string;
    timeLimit: number;
    questions: Question[];
  };
  onSubmit: (data: QuizFormData) => void;
}

const emptyQuestion = (): Question => ({
  questionText: "",
  points: 1,
  orderIndex: 0,
  answerOptions: [
    { optionText: "", isCorrect: false, orderIndex: 0 },
    { optionText: "", isCorrect: false, orderIndex: 1 },
  ],
});

export function LectureQuizFormModal({
  open,
  onOpenChange,
  loading,
  title = "Thêm bài kiểm tra",
  defaultValue,
  onSubmit,
}: LectureQuizFormModalProps) {
  const [formData, setFormData] = React.useState<QuizFormData>({
    title: "",
    description: "",
    timeLimit: 10,
    questions: [emptyQuestion()],
  });
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [dirty, setDirty] = React.useState(false);
  const [openDiscard, setOpenDiscard] = React.useState(false);
  useUnsavedChanges(dirty && open);

  // Reset form when opening or when defaultValue changes
  React.useEffect(() => {
    if (open) {
      if (defaultValue) {
        setFormData({
          title: defaultValue.title || "",
          description: defaultValue.description || "",
          timeLimit: defaultValue.timeLimit || 10,
          questions: defaultValue.questions?.length > 0
            ? defaultValue.questions.map((q, i) => ({
                ...q,
                orderIndex: i,
                answerOptions: q.answerOptions.map((a, j) => ({
                  ...a,
                  orderIndex: j,
                })),
              }))
            : [emptyQuestion()],
        });
      } else {
        setFormData({
          title: "",
          description: "",
          timeLimit: 10,
          questions: [emptyQuestion()],
        });
      }
      setErrors({});
      setDirty(false);
    }
  }, [open, defaultValue]);

  const updateField = (field: keyof QuizFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setDirty(true);
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined as any });
    }
  };

  const addQuestion = () => {
    const newQuestions = [
      ...formData.questions,
      {
        ...emptyQuestion(),
        orderIndex: formData.questions.length,
      },
    ];
    updateField("questions", newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length === 1) {
      setErrors({ ...errors, questions: "Bài kiểm tra phải có ít nhất 1 câu hỏi" });
      return;
    }
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    newQuestions.forEach((q, i) => (q.orderIndex = i));
    updateField("questions", newQuestions);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...formData.questions];
    (newQuestions[index] as any)[field] = value;
    setFormData({ ...formData, questions: newQuestions });
    setDirty(true);
  };

  const addAnswerOption = (questionIndex: number) => {
    const newQuestions = [...formData.questions];
    const question = newQuestions[questionIndex];
    question.answerOptions.push({
      optionText: "",
      isCorrect: false,
      orderIndex: question.answerOptions.length,
    });
    setFormData({ ...formData, questions: newQuestions });
    setDirty(true);
  };

  const removeAnswerOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...formData.questions];
    const question = newQuestions[questionIndex];
    if (question.answerOptions.length === 2) {
      setErrors({ ...errors, [`q${questionIndex}_answers`]: "Câu hỏi phải có ít nhất 2 đáp án" });
      return;
    }
    question.answerOptions = question.answerOptions.filter((_, i) => i !== optionIndex);
    question.answerOptions.forEach((opt, i) => (opt.orderIndex = i));
    setFormData({ ...formData, questions: newQuestions });
    setDirty(true);
  };

  const updateAnswerOption = (
    questionIndex: number,
    optionIndex: number,
    field: keyof AnswerOption,
    value: any
  ) => {
    const newQuestions = [...formData.questions];
    (newQuestions[questionIndex].answerOptions[optionIndex] as any)[field] = value;
    setFormData({ ...formData, questions: newQuestions });
    setDirty(true);
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (formData.questions.length === 0) {
      newErrors.questions = "Bài kiểm tra phải có ít nhất 1 câu hỏi";
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.questionText.trim()) {
        newErrors[`q${i}_text`] = `Câu hỏi ${i + 1}: Nội dung là bắt buộc`;
      }
      if (q.answerOptions.length < 2) {
        newErrors[`q${i}_answers`] = `Câu hỏi ${i + 1}: Phải có ít nhất 2 đáp án`;
      }
      const hasCorrect = q.answerOptions.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        newErrors[`q${i}_correct`] = `Câu hỏi ${i + 1}: Phải có ít nhất 1 đáp án đúng`;
      }
      for (let j = 0; j < q.answerOptions.length; j++) {
        if (!q.answerOptions[j].optionText.trim()) {
          newErrors[`q${i}_a${j}`] = `Câu ${i + 1}, Đáp án ${j + 1}: Nội dung là bắt buộc`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(formData);
  };

  const handleClose = () => {
    if (dirty) {
      setOpenDiscard(true);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o && dirty) {
            setOpenDiscard(true);
            return;
          }
          onOpenChange(o);
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent sticky top-0 z-10 backdrop-blur-sm">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Quiz Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">
                  Tiêu đề<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quiz-title"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Ví dụ: Bài kiểm tra cuối bài"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-description">Mô tả</Label>
                <Textarea
                  id="quiz-description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Mô tả ngắn về bài kiểm tra"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-timeLimit">Thời gian (phút)</Label>
                <Input
                  id="quiz-timeLimit"
                  type="number"
                  min={1}
                  value={formData.timeLimit}
                  onChange={(e) => updateField("timeLimit", Number(e.target.value) || 10)}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Câu hỏi ({formData.questions.length})</Label>
                <Button type="button" size="sm" onClick={addQuestion} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm câu hỏi
                </Button>
              </div>
              {errors.questions && <p className="text-sm text-destructive">{errors.questions}</p>}

              <div className="space-y-4">
                {formData.questions.map((question, qIndex) => (
                  <Card key={qIndex} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Câu hỏi {qIndex + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Textarea
                          value={question.questionText}
                          onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                          placeholder="Nhập nội dung câu hỏi"
                          rows={2}
                        />
                        {errors[`q${qIndex}_text`] && (
                          <p className="text-sm text-destructive">{errors[`q${qIndex}_text`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Điểm</Label>
                        <Input
                          type="number"
                          min={1}
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, "points", Number(e.target.value) || 1)}
                          placeholder="1"
                          className="w-24"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Đáp án</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addAnswerOption(qIndex)}
                            className="gap-2"
                          >
                            <Plus className="h-3 w-3" />
                            Thêm đáp án
                          </Button>
                        </div>
                        {errors[`q${qIndex}_answers`] && (
                          <p className="text-sm text-destructive">{errors[`q${qIndex}_answers`]}</p>
                        )}
                        {errors[`q${qIndex}_correct`] && (
                          <p className="text-sm text-destructive">{errors[`q${qIndex}_correct`]}</p>
                        )}

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
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAnswerOption(qIndex, oIndex)}
                                className="text-destructive hover:text-destructive shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {errors[`q${qIndex}_a${oIndex}`] && (
                                <p className="text-sm text-destructive">{errors[`q${qIndex}_a${oIndex}`]}</p>
                              )}
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
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/30">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Huỷ
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminActionDialog
        open={openDiscard}
        onOpenChange={setOpenDiscard}
        title="Bỏ thay đổi?"
        description={<span>Các thay đổi trong form sẽ bị mất. Bạn có chắc muốn đóng?</span>}
        confirmText="Đóng"
        confirmVariant="default"
        loading={false}
        position="top"
        onConfirm={() => {
          setOpenDiscard(false);
          onOpenChange(false);
          setDirty(false);
        }}
      />
    </>
  );
}
