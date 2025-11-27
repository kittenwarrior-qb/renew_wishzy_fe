"use client";

import { Enrollment } from "@/src/types/enrollment";
import { Clock, BookOpen, TrendingUp, MessageSquare, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { lectureService } from "@/src/services/lecture";

interface CourseEnrollmentCardProps {
  enrollment: Enrollment;
}

export const CourseEnrollmentCard = ({
  enrollment,
}: CourseEnrollmentCardProps) => {
  const { course, progress, status, lastAccess } = enrollment;
  const router = useRouter();
  const [lectureName, setLectureName] = useState<string | null>(null);

  // Duration is already in seconds, format it correctly
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  };

  const getStatusLabel = (status: Enrollment['status']) => {
    if (Number(progress) >= 100) {
      return "Hoàn tất";
    }
    if (progress > 0 && status === "not_started") {
      return "Đang học";
    }
    
    switch (status) {
      case "not_started":
        return "Chưa bắt đầu";
      case "ongoing":
        return "Đang học";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const getStatusColor = (status: Enrollment['status']) => {
    // Show "completed" color for courses with 100% progress
    if (Number(progress) >= 100) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
    if (progress > 0 && status === "not_started") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
    
    switch (status) {
      case "not_started":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Cơ bản";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      default:
        return level;
    }
  };

  const handleFeedbackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/course-detail/${course.id}?scrollTo=feedback`);
  };

  const lectureId = enrollment.attributes?.lectureOnlearning?.lectureId;
  const learningUrl = lectureId 
    ? `/learning/${course.id}/${lectureId}` 
    : `/learning/${course.id}`;

  const lectureOnlearning = enrollment.attributes?.lectureOnlearning;
  const lectureProgress = lectureOnlearning 
    ? Math.round((lectureOnlearning.currentTime / lectureOnlearning.duration) * 100)
    : 0;

  useEffect(() => {
    const fetchLectureName = async () => {
      if (!lectureId) return;
      
      try {
        const lecture = await lectureService.get(lectureId);
        setLectureName(lecture.name);
      } catch (error) {
        console.error('Failed to fetch lecture name:', error);
      }
    };

    fetchLectureName();
  }, [lectureId]);

  const isCompleted = Number(progress) >= 100;

  const cardContent = (
    <div 
      className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
    >
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="w-48 h-48 flex-shrink-0 relative overflow-hidden bg-muted">
            <img
              src={course.thumbnail}
              alt={course.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {/* Progress overlay */}
            {progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center justify-between text-white text-xs mb-1.5">
                  <span className="font-medium">Tiến độ khóa học</span>
                  <span className="font-semibold">{Number(progress).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 rounded-full shadow-lg"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-semibold text-foreground transition-colors line-clamp-2">
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
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{formatDuration(course.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                    <span>{getLevelLabel(course.level)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 flex-shrink-0" />
                    <span>Tiến độ: {Number(progress).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Current Lecture Info */}
                {lectureOnlearning && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Đang học</p>
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {lectureName || 'Bài giảng hiện tại'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lectureProgress}%
                      </Badge>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${lectureProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.floor(Math.round(lectureOnlearning.currentTime) / 60)}:{String(Math.round(lectureOnlearning.currentTime) % 60).padStart(2, '0')} / {Math.floor(Math.round(lectureOnlearning.duration) / 60)}:{String(Math.round(lectureOnlearning.duration) % 60).padStart(2, '0')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Truy cập lần cuối:{" "}
                  {new Date(lastAccess).toLocaleDateString("vi-VN")}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleFeedbackClick}
                    className="relative text-sm text-gray-400 hover:text-foreground transition-colors cursor-pointer group flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Đánh giá
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </button>
                  {Number(progress) >= 100 ? (
                    <Button
                      size="sm"
                      className="bg-primary text-black hover:bg-primary/90 font-medium gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/certificates/${enrollment.id}`);
                      }}
                    >
                      <Award className="h-4 w-4" />
                      Xem chứng chỉ
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-primary text-black hover:bg-primary/90 font-medium"
                    >
                      {status === 'not_started' && progress === 0 ? 'Bắt đầu học' : 'Tiếp tục học'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );

  return <Link href={learningUrl}>{cardContent}</Link>;
};
