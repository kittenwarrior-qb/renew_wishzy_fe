"use client";

import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2 } from "lucide-react";
import { useTranslations } from "@/providers/TranslationProvider";
import type { Enrollment } from "@/types/enrollment";
import { CourseEnrollmentCard } from "@/components/shared/profile/CourseEnrollmentCard";

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
    <div className="space-y-8">
      {inProgressCourses.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            {translate("continueLearning")}
          </h4>
          <div className="flex flex-col gap-4">
            {inProgressCourses.map((enrollment) => (
              <CourseEnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
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
          <div className="flex flex-col gap-4">
            {allCourses.map((enrollment) => (
              <CourseEnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

