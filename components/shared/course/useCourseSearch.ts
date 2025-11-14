import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/services/course'

export type CourseListItem = { id: string; name: string }

export const useSearchCourses = (q?: string) => {
  return useQuery<any, unknown, { data: CourseListItem[] }>({
    queryKey: ['courses/search', { q }],
    queryFn: async () => {
      if (!q || q.length < 2) return { data: [] }
      const res = await courseService.list({ page: 1, limit: 10, name: q, search: q })
      const payload = res?.data ?? res
      const items = payload?.items ?? payload?.courses ?? []
      return { data: items.map((c: any) => ({ id: String(c.id), name: c.name || c.title || c.slug || String(c.id) })) }
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!q && q.length >= 2,
    initialData: { data: [] },
  })
}
