"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QuizNavigationProps {
  totalQuestions: number;
  answeredQuestions: Set<string>;
  currentQuestion: number;
  onNavigate: (index: number) => void;
}

export function QuizNavigation({
  totalQuestions,
  answeredQuestions,
  currentQuestion,
  onNavigate,
}: QuizNavigationProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Danh sách câu hỏi</h3>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => i).map((index) => {
            const questionNumber = index + 1;
            const isAnswered = answeredQuestions.has(String(index));
            const isCurrent = currentQuestion === index;

            return (
              <Button
                key={index}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                className={cn(
                  "relative",
                  isAnswered &&
                    !isCurrent &&
                    "border-green-500 bg-green-50 hover:bg-green-100"
                )}
                onClick={() => onNavigate(index)}
              >
                {questionNumber}
                {isAnswered && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </Button>
            );
          })}
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary bg-primary" />
            <span>Câu hiện tại</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50 relative">
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
            </div>
            <span>Đã trả lời</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-border" />
            <span>Chưa trả lời</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
