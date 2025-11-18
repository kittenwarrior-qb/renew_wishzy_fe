"use client";

import { useState, useEffect } from "react";
import { useStudents } from "@/hooks/useStudents";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStudentCourses } from "@/hooks/useStudentCourses";
import type { Student } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { FullScreenModal } from "@/components/ui/fullscreen-modal";
import {
  StudentTable,
  PaginationControls,
  LoadingState,
  ErrorState,
  EmptyState,
  StudentDetails,
} from "../../components";

const StudentsPage = () => {
  const { role, fullName, user } = useCurrentUser();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 10;

  const isInstructor = role === "instructor";

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const { data, isLoading, isError, error } = useStudents({
    page,
    limit,
    role: role || undefined,
    ...(debouncedSearch && { search: debouncedSearch }),
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
    <div>
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên học viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {pagination && (
        <PaginationControls
          pagination={pagination}
          currentPage={page}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}

      <div className="grid gap-6 mt-6">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState error={error} />
        ) : students.length === 0 ? (
          <EmptyState />
        ) : (
          <StudentTable
            students={students}
            onViewDetails={setSelectedStudent}
          />
        )}
      </div>

      <FullScreenModal
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
        showCloseButton={true}
      >
        <div className="h-full overflow-y-auto p-6">
          {selectedStudent && (
            <StudentDetails
              student={selectedStudent}
              enrollments={enrollments || []}
              isLoadingCourses={isLoadingCourses}
              onBack={() => setSelectedStudent(null)}
            />
          )}
        </div>
      </FullScreenModal>
    </div>
  );
};

export default StudentsPage;

