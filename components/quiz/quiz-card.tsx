import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileQuestion, CheckCircle, PlayCircle } from "lucide-react";
import Link from "next/link";

interface QuizCardProps {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  timeLimit: number;
  status?: "not-started" | "in-progress" | "completed";
  score?: number;
  attemptId?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  id,
  title,
  description,
  questionCount,
  timeLimit,
  status = "not-started",
  score,
  attemptId,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case "in-progress":
        return <Badge variant="default">Đang làm</Badge>;
      case "completed":
        return (
          <Badge variant="outline" className="border-green-600 text-green-600">
            Đã hoàn thành
          </Badge>
        );
      default:
        return null;
    }
  };

  const getButtonContent = () => {
    if (status === "completed") {
      return (
        <Link href={attemptId ? `/quiz/${id}/result?attemptId=${attemptId}` : `/quiz/${id}/result`} className="w-full">
          <Button variant="outline" className="w-full">Xem kết quả</Button>
        </Link>
      );
    }
    return (
      <Link href={`/quiz/${id}`} className="w-full">
        <Button className="w-full">
          <PlayCircle className="w-4 h-4 mr-2" />
          {status === "in-progress" ? "Tiếp tục làm" : "Bắt đầu làm bài"}
        </Button>
      </Link>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
          {getStatusBadge()}
        </div>
        {description && (
          <CardDescription className="line-clamp-3">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="grow">
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
        {status === "completed" && score !== undefined && (
          <div className="flex items-center gap-2 text-sm mt-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">
              Điểm: {score}/100
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto">
        {getButtonContent()}
      </CardFooter>
    </Card>
  );
};