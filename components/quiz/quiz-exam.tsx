"use client";

import { useState, useCallback, useMemo } from "react";
import { Quiz, QuizSubmission } from "@/src/types/quiz";
import { QuizQuestion } from "./quiz-question";
import { QuizTimer } from "./quiz-timer";
import { QuizNavigation } from "./quiz-navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

interface QuizExamProps {
  quiz: Quiz;
  onSubmit: (submission: QuizSubmission) => void;
}

export function QuizExam({ quiz, onSubmit }: QuizExamProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const answeredQuestions = useMemo(() => {
    return new Set(
      Object.entries(answers)
        .filter(([_, answerIds]) => answerIds.length > 0)
        .map(([questionId]) => {
          const index = quiz.questions.findIndex((q) => q.id === questionId);
          return String(index);
        })
    );
  }, [answers, quiz.questions]);

  const handleAnswerChange = useCallback(
    (questionId: string, answerIds: string[]) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: answerIds,
      }));
    },
    []
  );

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNavigate = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitClick = () => {
    setShowSubmitDialog(true);
  };

  const handleConfirmSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const submission: QuizSubmission = {
      quizId: quiz.id,
      answers,
      timeSpent,
      submittedAt: new Date(),
    };
    onSubmit(submission);
  };

  const handleTimeUp = () => {
    handleConfirmSubmit();
  };

  const questionsWithAnswers = quiz.questions.map((q) => ({
    ...q,
    selectedAnswers: answers[q.id] || [],
  }));

  const answeredCount = answeredQuestions.size;
  const totalQuestions = quiz.questions.length;

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{quiz.title}</CardTitle>
              {quiz.description && (
                <CardDescription className="text-base">
                  {quiz.description}
                </CardDescription>
              )}
            </div>
            <QuizTimer duration={quiz.timeLimit} onTimeUp={handleTimeUp} />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <QuizQuestion
            question={questionsWithAnswers[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            onAnswerChange={handleAnswerChange}
          />

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Câu trước
            </Button>

            <span className="text-sm text-muted-foreground">
              Câu {currentQuestionIndex + 1} / {totalQuestions}
            </span>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button onClick={handleNext}>
                Câu tiếp
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmitClick} variant="default">
                <Send className="w-4 h-4 mr-2" />
                Nộp bài
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <QuizNavigation
            totalQuestions={totalQuestions}
            answeredQuestions={answeredQuestions}
            currentQuestion={currentQuestionIndex}
            onNavigate={handleNavigate}
          />

          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng số câu:</span>
                  <span className="font-semibold">{totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đã trả lời:</span>
                  <span className="font-semibold text-green-600">
                    {answeredCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chưa trả lời:</span>
                  <span className="font-semibold text-orange-600">
                    {totalQuestions - answeredCount}
                  </span>
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={handleSubmitClick}
                variant="default"
              >
                <Send className="w-4 h-4 mr-2" />
                Nộp bài
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận nộp bài</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn nộp bài không? Sau khi nộp bài, bạn sẽ không
              thể thay đổi câu trả lời.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tổng số câu:</span>
                <span className="font-semibold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Đã trả lời:</span>
                <span className="font-semibold text-green-600">
                  {answeredCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Chưa trả lời:</span>
                <span className="font-semibold text-orange-600">
                  {totalQuestions - answeredCount}
                </span>
              </div>
            </div>
            {answeredCount < totalQuestions && (
              <p className="mt-4 text-sm text-orange-600">
                ⚠️ Bạn còn {totalQuestions - answeredCount} câu chưa trả lời
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmSubmit}>Xác nhận nộp bài</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
