import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/course';
import { chapterService } from '@/services/chapter';
import { enrollmentService } from '@/services/enrollment';
import { persistQueryData } from '@/lib/queryClient';

/**
 * Hook to prefetch learning data for better performance
 */
export function usePrefetchLearning(courseId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!courseId) return;

    // Prefetch course details
    queryClient.prefetchQuery({
      queryKey: ['courses', courseId],
      queryFn: async () => {
        const result = await courseService.get(courseId);
        persistQueryData(['courses', courseId], result, 15);
        return result;
      },
      staleTime: 15 * 60 * 1000,
    });

    // Prefetch chapters
    queryClient.prefetchQuery({
      queryKey: ['chapters', 'course', courseId],
      queryFn: async () => {
        const result = await chapterService.getChapterByCourseId(courseId);
        persistQueryData(['chapters', 'course', courseId], result, 10);
        return result;
      },
      staleTime: 10 * 60 * 1000,
    });

    // Prefetch enrollment (skip cache for fresh data)
    queryClient.prefetchQuery({
      queryKey: ['enrollment', 'course', courseId],
      queryFn: () => enrollmentService.getEnrollmentByCourseId(courseId, true),
      staleTime: 0, // Always fetch fresh
    });
  }, [courseId, queryClient]);
}

/**
 * Prefetch adjacent lectures for smoother navigation
 */
export function usePrefetchAdjacentLectures(
  courseId: string,
  currentLectureId: string,
  allLectures: Array<{ lecture: { id: string; videoUrl?: string } }>
) {
  useEffect(() => {
    const currentIndex = allLectures.findIndex(l => l.lecture.id === currentLectureId);
    
    // Prefetch next lecture video
    if (currentIndex >= 0 && currentIndex < allLectures.length - 1) {
      const nextLecture = allLectures[currentIndex + 1];
      if (nextLecture.lecture.videoUrl) {
        // Create a link element to prefetch video
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'video';
        link.href = nextLecture.lecture.videoUrl;
        document.head.appendChild(link);

        return () => {
          document.head.removeChild(link);
        };
      }
    }
  }, [currentLectureId, allLectures]);
}
