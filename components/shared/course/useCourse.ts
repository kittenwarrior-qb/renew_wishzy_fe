import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/services/course'

export type Course = {
  id: string
  name: string
  description?: string
  notes?: string
  thumbnail?: string
  price: number
  saleInfo?: Record<string, unknown>
  rating: number
  status: boolean
  averageRating: number
  numberOfStudents: number
  level: 'beginner' | 'intermediate' | 'advanced'
  totalDuration: number
  categoryId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  category?: { id: string; name: string } | null
}

export type CourseListResponse = {
  data: Course[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CourseFilter = Partial<{
  page: number
  limit: number
  name: string
  categoryId: string
  createdBy: string
  rating: number
  courseLevel: 'beginner' | 'intermediate' | 'advanced'
  minPrice: number
  maxPrice: number
  status: boolean
}>

const ENDPOINT = 'courses'

export const useCourseList = (filter?: CourseFilter) => {
  const params: Record<string, any> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
    name: filter?.name,
    categoryId: filter?.categoryId,
    createdBy: filter?.createdBy,
    rating: filter?.rating,
    courseLevel: filter?.courseLevel,
    minPrice: filter?.minPrice,
    maxPrice: filter?.maxPrice,
    status: typeof filter?.status === 'boolean' ? filter?.status : undefined,
  }
  return useQuery<any, unknown, CourseListResponse>({
    queryKey: [ENDPOINT, params],
    queryFn: async () => courseService.list(params),
    staleTime: 5 * 60 * 1000,
    select: (res: any): CourseListResponse => {
      const payload = res?.data ?? res
      const items: Course[] = payload?.items ?? []
      const p = payload?.pagination ?? {}
      return {
        data: items as Course[],
        total: p?.totalItems ?? 0,
        page: p?.currentPage ?? params.page,
        limit: p?.itemsPerPage ?? params.limit,
        totalPages: p?.totalPage ?? 0,
      }
    },
  })
}

export const useCourseDetail = (id?: string) => {
  return useQuery<any, unknown, Course>({
    queryKey: [ENDPOINT, id],
    queryFn: async () => courseService.get(id as string),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    select: (res: any): Course => {
      const payload = res?.data ?? res
      const item = (payload && typeof payload === 'object' && 'data' in payload) ? (payload as any).data : payload
      return item as Course
    },
  })
}

export const useCreateCourse = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, Partial<Course>>({
    mutationFn: async (data) => courseService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
    },
  })
}

export const useUpdateCourse = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string } & Partial<Course>>({
    mutationFn: async ({ id, ...data }) => courseService.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
      if (vars?.id) qc.invalidateQueries({ queryKey: [`${ENDPOINT}/${vars.id}`] })
    },
  })
}

export const useToggleCourseStatus = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => courseService.toggleStatus(id),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
      if (vars?.id) qc.invalidateQueries({ queryKey: [`${ENDPOINT}/${vars.id}`] })
    },
  })
}

export const useDeleteCourse = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => courseService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
    },
  })
}
