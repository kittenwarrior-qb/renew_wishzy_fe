import { useMutation, useQueryClient } from '@tanstack/react-query'
import { lectureService } from '@/services/lecture'

const CHAPTER_ENDPOINT = 'chapters'

type BaseLecturePayload = {
  courseId?: string
  name: string
  description?: string
  fileUrl: string
  duration: number
  isPreview?: boolean
  orderIndex: number
}

export type CreateLecturePayload = BaseLecturePayload & {
  chapterId: string
}

export type UpdateLecturePayload = BaseLecturePayload & {
  id: string
  chapterId?: string
}

export const useCreateLecture = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, CreateLecturePayload>({
    mutationFn: async ({ chapterId, courseId, ...data }) => lectureService.create({ ...(data as any), chapterId }),
    onSuccess: (_d, vars) => {
      if (vars?.courseId) qc.invalidateQueries({ queryKey: [CHAPTER_ENDPOINT, 'course', vars.courseId] })
    },
  })
}

export const useUpdateLecture = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, UpdateLecturePayload>({
    mutationFn: async ({ id, ...data }) => lectureService.update(id, data as any),
    onSuccess: (_d, vars) => {
      if (vars?.courseId) qc.invalidateQueries({ queryKey: [CHAPTER_ENDPOINT, 'course', vars.courseId] })
      if (vars?.id) qc.invalidateQueries({ queryKey: [`lectures/${vars.id}`] })
    },
  })
}

export const useDeleteLecture = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string; courseId?: string }>({
    mutationFn: async ({ id }) => lectureService.remove(id),
    onSuccess: (_d, vars) => {
      if (vars?.courseId) qc.invalidateQueries({ queryKey: [CHAPTER_ENDPOINT, 'course', vars.courseId] })
    },
  })
}
