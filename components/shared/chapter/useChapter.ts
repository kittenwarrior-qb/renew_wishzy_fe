import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chapterService } from '@/services/chapter'

export type Chapter = {
  id: string
  name: string
  description?: string
  duration?: number
  courseId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

const ENDPOINT = 'chapters'

export const useChapterList = (courseId?: string) => {
  return useQuery<{ items: Chapter[] }>({
    queryKey: [ENDPOINT, 'course', courseId],
    queryFn: async () => chapterService.getChapterByCourseId(courseId as string),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    select: (res: any): { items: Chapter[] } => {
      const payload = res?.data ?? res
      const items = payload?.items ?? []
      return { items: items as Chapter[] }
    },
  })
}

export const useCreateChapter = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { courseId: string } & Partial<Chapter>>({
    mutationFn: async ({ courseId, ...data }) => chapterService.create({ ...(data as any), courseId }),
    onSuccess: (_d, vars) => {
      if (vars?.courseId) qc.invalidateQueries({ queryKey: [ENDPOINT, 'course', vars.courseId] })
    },
  })
}

export const useUpdateChapter = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string; courseId?: string } & Partial<Chapter>>({
    mutationFn: async ({ id, ...data }) => chapterService.update(id, data),
    onSuccess: (_d, vars) => {
      if (vars?.courseId) qc.invalidateQueries({ queryKey: [ENDPOINT, 'course', vars.courseId] })
      if (vars?.id) qc.invalidateQueries({ queryKey: [`${ENDPOINT}/${vars.id}`] })
    },
  })
}

export const useDeleteChapter = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string; courseId?: string }>({
    mutationFn: async ({ id }) => chapterService.remove(id),
    onSuccess: (_d, vars) => {
      if (vars?.courseId) qc.invalidateQueries({ queryKey: [ENDPOINT, 'course', vars.courseId] })
    },
  })
}
