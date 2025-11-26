import { useQueries } from "@tanstack/react-query"
import { courseService } from "@/services/course"

/**
 * Hook để fetch course details cho nhiều courses cùng lúc
 * Dùng để lấy thumbnail và categoryName
 */
export function useCourseDetails(courseIds: string[]) {
  const queries = useQueries({
    queries: courseIds.map((courseId) => ({
      queryKey: ["course", courseId, "detail"],
      queryFn: async () => {
        const response = await courseService.get(courseId)
        // Response format: { success: true, data: { data: Course } }
        const course = response?.data?.data || response?.data || response
        return {
          courseId,
          thumbnail: course?.thumbnail,
          categoryName: course?.category?.name || course?.categoryName,
          price: course?.price,
        }
      },
      enabled: !!courseId,
      staleTime: 5 * 60 * 1000, // Cache 5 phút
    })),
  })

  const isLoading = queries.some((q) => q.isLoading)
  const isError = queries.some((q) => q.isError)

  // Tạo map để dễ tra cứu
  const courseDetailsMap = new Map()
  queries.forEach((query) => {
    if (query.data) {
      courseDetailsMap.set(query.data.courseId, query.data)
    }
  })

  return {
    courseDetailsMap,
    isLoading,
    isError,
  }
}

