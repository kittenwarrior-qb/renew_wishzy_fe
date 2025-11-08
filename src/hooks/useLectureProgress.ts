// import { useApiMutation, useApiQuery } from './useApi';
// import type { 
//   LectureProgress, 
//   UpdateLectureProgressDto,
//   CourseProgress 
// } from '@/types/learning';

// export function useLectureProgress(lectureId: string) {
//   return useApiQuery<LectureProgress>(
//     `/learning/lectures/${lectureId}/progress`,
//     {
//       staleTime: 1000 * 60 * 5,
//       enabled: !!lectureId,
//     }
//   );
// }

// export function useUpdateLectureProgress() {
//   return useApiMutation<LectureProgress, UpdateLectureProgressDto>(
//     '/learning/progress',
//     'POST',
//     {
//       invalidateQueries: ['lecture-progress', 'course-progress'],
//     }
//   );
// }

// export function useCourseProgress(courseId: string) {
//   return useApiQuery<CourseProgress>(
//     `/learning/courses/${courseId}/progress`,
//     {
//       staleTime: 1000 * 60 * 5, 
//       enabled: !!courseId,
//     }
//   );
// }

// export function useCompleteLecture() {
//   return useApiMutation<LectureProgress, { lectureId: string }>(
//     '/learning/lectures/complete',
//     'POST',
//     {
//       invalidateQueries: ['lecture-progress', 'course-progress'],
//     }
//   );
// }
