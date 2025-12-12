"use client";

import type { Student } from "@/types/user";
import type { Enrollment } from "@/types/enrollment";
import { StudentProfile } from "./StudentProfile";
import { ContactInfo } from "./ContactInfo";
import { CoursesSection } from "./CoursesSection";

interface StudentDetailsProps {
  student: Student;
  enrollments: Enrollment[];
  isLoadingCourses: boolean;
  onBack: () => void;
}

export const StudentDetails = ({
  student,
  enrollments,
  isLoadingCourses,
  onBack,
}: StudentDetailsProps) => {
  return (
    <div className="space-y-6">
      <div className="pb-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">
            Student Details
          </h2>
          <p className="text-sm text-muted-foreground">
            View detailed student information and course progress
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <StudentProfile student={student} />
        <div className="space-y-6 flex-1">
          <ContactInfo student={student} />
          <CoursesSection
            enrollments={enrollments}
            isLoading={isLoadingCourses}
          />
        </div>
      </div>
    </div>
  );
};

