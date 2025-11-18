"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  duration: number; // thời gian làm bài (phút)
  onTimeUp: () => void;
}

export function QuizTimer({ duration, onTimeUp }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // chuyển sang giây

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft <= 300; // cảnh báo khi còn 5 phút
  const isCritical = timeLeft <= 60; // nguy hiểm khi còn 1 phút

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-colors",
        isCritical
          ? "bg-destructive text-destructive-foreground animate-pulse"
          : isWarning
          ? "bg-orange-500 text-white"
          : "bg-primary text-primary-foreground"
      )}
    >
      {isCritical ? (
        <AlertCircle className="w-5 h-5" />
      ) : (
        <Clock className="w-5 h-5" />
      )}
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
