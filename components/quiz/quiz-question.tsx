"use client";

import { QuizQuestion as QuizQuestionType } from "@/src/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  onAnswerChange: (questionId: string, answerIds: string[]) => void;
}

export function QuizQuestion({
  question,
  questionNumber,
  onAnswerChange,
}: QuizQuestionProps) {
  const handleSingleChoice = (answerId: string) => {
    onAnswerChange(question.id, [answerId]);
  };

  const handleMultipleChoice = (answerId: string, checked: boolean) => {
    const currentAnswers = question.selectedAnswers || [];
    const newAnswers = checked
      ? [...currentAnswers, answerId]
      : currentAnswers.filter((id) => id !== answerId);
    onAnswerChange(question.id, newAnswers);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-start gap-3">
          <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {questionNumber}
          </span>
          <span className="flex-1">{question.question}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground ml-11">
          {question.type === "single" ? "Chọn 1 đáp án" : "Chọn nhiều đáp án"}
        </p>
      </CardHeader>
      <CardContent className="ml-11">
        {question.type === "single" ? (
          <RadioGroup
            value={question.selectedAnswers?.[0] || ""}
            onValueChange={handleSingleChoice}
          >
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                  question.selectedAnswers?.includes(answer.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent"
                )}
              >
                <RadioGroupItem value={answer.id} id={answer.id} />
                <Label
                  htmlFor={answer.id}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {answer.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-2">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                  question.selectedAnswers?.includes(answer.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent"
                )}
              >
                <Checkbox
                  id={answer.id}
                  checked={question.selectedAnswers?.includes(answer.id)}
                  onCheckedChange={(checked) =>
                    handleMultipleChoice(answer.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={answer.id}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {answer.text}
                </Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
