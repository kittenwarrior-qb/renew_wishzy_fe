import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileQuestion } from "lucide-react";
import Link from "next/link";

interface QuizCardProps {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  timeLimit: number;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  id,
  title,
  description,
  questionCount,
  timeLimit,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
        {description && (
          <CardDescription className="line-clamp-3">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileQuestion className="w-4 h-4" />
            <span>{questionCount} câu hỏi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{timeLimit} phút</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Link href={`/quiz/${id}`} className="w-full">
          <Button className="w-full">Bắt đầu làm bài</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};