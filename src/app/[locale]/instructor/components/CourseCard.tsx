"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Star, Users } from "lucide-react";
import Link from "next/link";
import type { Enrollment } from "@/types/enrollment";
import { useTranslations } from "@/providers/TranslationProvider";

interface CourseCardProps {
  enrollment: Enrollment;
}

export const CourseCard = ({ enrollment }: CourseCardProps) => {
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);
  const { course, progress, status } = enrollment;
  const progressValue = parseFloat(progress) || 0;
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} ${translate("minutes")}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}${translate("hour")} ${mins}${translate("minutes")}` : `${hours}${translate("hour")}`;
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numPrice);
  };

  return (
    <Link href={`/course-detail/${course.id}?view=student`}>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 h-full flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-primary/30" />
              </div>
            )}
            {progressValue > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/90">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{translate("progress")}</span>
                  <span className="text-xs font-semibold">{progressValue.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="p-4 space-y-3 flex-1 flex flex-col">
            <h5 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors h-12">
              {course.name}
            </h5>
            
            <div className="h-8">
              {course.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap min-h-[24px]">
              <Badge variant="outline" className="text-xs capitalize">
                {course.level}
              </Badge>
              {status === "in_progress" && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  {translate("inProgress")}
                </Badge>
              )}
              {status === "completed" && (
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                  {translate("completed")}
                </Badge>
              )}
              {status === "not_started" && (
                <Badge variant="secondary" className="text-xs bg-gray-500/10 text-gray-600">
                  {translate("notStarted")}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>{formatDuration(course.totalDuration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <span>{parseFloat(course.averageRating).toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span>{course.numberOfStudents} {translate("students")}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-primary">
                <span className="truncate">{formatPrice(course.price)}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground border-t pt-2 space-y-1 mt-auto">
              <div>
                <span className="font-medium">{translate("enrollmentDate")}: </span>
                {new Date(enrollment.enrollmentDate).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}
              </div>
              <div>
                <span className="font-medium">{translate("lastAccess")}: </span>
                {new Date(enrollment.lastAccess).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

