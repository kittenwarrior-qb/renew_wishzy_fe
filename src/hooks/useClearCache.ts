import { useQueryClient } from '@tanstack/react-query';
import { cache } from '@/lib/cache';
import { enrollmentService } from '@/services/enrollment';

/**
 * Hook to clear cache when needed
 */
export function useClearCache() {
  const queryClient = useQueryClient();

  const clearAllCache = () => {
    // Clear React Query cache
    queryClient.clear();
    
    // Clear localStorage cache
    cache.clearAll();
    
    // Clear enrollment cache
    enrollmentService.clearCache();
  };

  const clearCourseCache = (courseId: string) => {
    // Clear specific course cache
    queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
    queryClient.invalidateQueries({ queryKey: ['chapters', 'course', courseId] });
    queryClient.invalidateQueries({ queryKey: ['enrollment', 'course', courseId] });
    
    // Clear from localStorage
    cache.remove(`courses_${courseId}`);
    cache.remove(`chapters_course_${courseId}`);
    cache.remove(`enrollment_course_${courseId}`);
  };

  const clearExpiredCache = () => {
    cache.clearExpired();
  };

  return {
    clearAllCache,
    clearCourseCache,
    clearExpiredCache,
  };
}
