"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useTranslations } from "@/providers/TranslationProvider";
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
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-1">
              {translate("studentDetails")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {translate("viewStudentInfo")}
            </p>
          </div>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <Eye className="h-4 w-4 rotate-180" />
            {translate("backToList")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

