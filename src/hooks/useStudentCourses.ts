import { useQuery } from '@tanstack/react-query';
import { enrollmentService } from '@/services/enrollment';
import type { Enrollment } from '@/types/enrollment';

export const useStudentCourses = (studentId: string | null) => {
  return useQuery({
    queryKey: ['student-courses', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      return await enrollmentService.getEnrollmentsByUserId(studentId);
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

