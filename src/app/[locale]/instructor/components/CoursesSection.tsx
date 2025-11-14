"use client";

import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2 } from "lucide-react";
import { useTranslations } from "@/providers/TranslationProvider";
import type { Enrollment } from "@/types/enrollment";
import { CourseCard } from "./CourseCard";

interface CoursesSectionProps {
  enrollments: Enrollment[];
  isLoading: boolean;
}

export const CoursesSection = ({
  enrollments,
  isLoading,
}: CoursesSectionProps) => {
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);

  const inProgressCourses = enrollments.filter(
    (e) => e.status === "in_progress"
  );
  const allCourses = enrollments;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {inProgressCourses.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {translate("continueLearning")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {inProgressCourses.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {translate("allMaterials")}
          </h4>
          <Badge variant="secondary">{allCourses.length}</Badge>
        </div>
        {allCourses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{translate("noCoursesEnrolled")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {allCourses.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

