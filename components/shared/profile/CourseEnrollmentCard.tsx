"use client";

import { Enrollment } from "@/src/types/enrollment";
import { Clock, BookOpen, TrendingUp, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CourseEnrollmentCardProps {
  enrollment: Enrollment;
}

export const CourseEnrollmentCard = ({ enrollment }: CourseEnrollmentCardProps) => {
  const { course, progress, status, lastAccess } = enrollment;
  const router = useRouter();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'Chưa bắt đầu';
      case 'in_progress':
        return 'Đang học';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung cấp';
      case 'advanced':
        return 'Nâng cao';
      default:
        return level;
    }
  };

  const handleFeedbackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/course-detail/${course.id}?scrollTo=feedback`);
  };

  return (
    <Link href={`/learning/${course.id}`}>
      <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer  relative">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="md:w-64 h-48 md:h-auto relative overflow-hidden bg-muted">
            <img
              src={course.thumbnail}
              alt={course.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {parseFloat(progress) > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {course.name}
                  </h3>
                  <Badge className={getStatusColor(status)}>
                    {getStatusLabel(status)}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {course.description}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(course.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>{getLevelLabel(course.level)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    <span>Tiến độ: {parseFloat(progress).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Truy cập lần cuối: {new Date(lastAccess).toLocaleDateString('vi-VN')}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFeedbackClick}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Đánh giá
                  </Button>
                  <span className="text-sm font-medium text-primary group-hover:underline">
                    {parseFloat(progress) > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
