"use client";

import { useState } from "react";
import { useStudents } from "@/hooks/useStudents";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStudentCourses } from "@/hooks/useStudentCourses";
import type { Student } from "@/types/user";
import {
  StudentTable,
  StudentListHeader,
  PaginationControls,
  LoadingState,
  ErrorState,
  EmptyState,
  StudentDetails,
} from "./components";

const StudentsPage = () => {
  const { role, fullName, user } = useCurrentUser();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const isInstructor = role === "instructor";
  const isAdmin = role === "admin";
  
  const { data, isLoading, isError, error } = useStudents({
    page,
    limit,
    role: role || undefined,
    ...(isInstructor && {
      fullName: fullName || undefined,
      email: user?.email || undefined,
    }),
  });

  const students = data?.data.data.items || [];
  const pagination = data?.data.data.pagination;

  const { data: enrollments, isLoading: isLoadingCourses } = useStudentCourses(
    selectedStudent?.id || null
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <StudentListHeader
        instructorName={fullName || undefined}
        isInstructor={isInstructor}
      />

      {!selectedStudent && pagination && (
        <PaginationControls
          pagination={pagination}
          currentPage={page}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}

      <div className="grid gap-6">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState error={error} />
        ) : selectedStudent ? (
          <StudentDetails
            student={selectedStudent}
            enrollments={enrollments || []}
            isLoadingCourses={isLoadingCourses}
            onBack={() => setSelectedStudent(null)}
          />
        ) : students.length === 0 ? (
          <EmptyState />
        ) : (
          <StudentTable
            students={students}
            onViewDetails={setSelectedStudent}
          />
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
