import { useQuery } from '@tanstack/react-query'
import { usersService, type User } from '@/services/users'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export type UserList = {
  data: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const usePendingInstructorCount = () => {
  return useQuery<{ total: number }>({
    queryKey: [ENDPOINT, 'instructors', 'pending-count'],
    queryFn: async () => usersService.list({ role: 'instructor', page: 1, limit: 100 }),
    staleTime: 30 * 1000,
    select: (res: any): { total: number } => {
      const root = res ?? {}
      const payload = root?.data?.data ?? root?.data ?? root
      const items: any[] = payload?.items ?? (Array.isArray(payload) ? payload : [])
      const pending = items.filter((u: any) => !u?.isInstructorActive)
      return { total: pending.length }
    },
  })
}

export type UserFilter = Partial<{
  page: number
  limit: number
  fullName: string
  email: string
  role: string
}>

const ENDPOINT = 'users'

export const useUserList = (filter?: UserFilter) => {
  const params: Record<string, any> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
    fullName: filter?.fullName,
    email: filter?.email,
    role: filter?.role,
  }
  return useQuery<UserList>({
    queryKey: [ENDPOINT, params],
    queryFn: async () => usersService.list(params),
    staleTime: 5 * 60 * 1000,
    select: (res: any): UserList => {
      // Support shapes: { success, data: { items, pagination } }, { data: { items, pagination } }, or { items, pagination }
      const root = res ?? {}
      const payload = root?.data?.data ?? root?.data ?? root
      const items = payload?.items ?? []
      const p = payload?.pagination ?? {}
      return {
        data: items as User[],
        total: p?.totalItems ?? items.length ?? 0,
        page: p?.currentPage ?? params.page,
        limit: p?.itemsPerPage ?? params.limit,
        totalPages: p?.totalPage ?? 0,
      }
    },
  })
}

export const useUserDetail = (id?: string) => {
  return useQuery<User | null>({
    queryKey: [ENDPOINT, id],
    queryFn: async () => usersService.get(id as string),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    select: (res: any): User | null => {
      const payload = res?.data ?? res
      const item = (payload && typeof payload === 'object' && 'data' in payload) ? (payload as any).data : payload
      return (item ?? null) as User | null
    },
  })
}

export type InstructorFilter = Partial<{
  page: number
  limit: number
  fullName: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  role: string
}>

type ListOptions = { enabled?: boolean }

export const useInstructorList = (filter?: InstructorFilter, options?: ListOptions) => {
  const params: Record<string, any> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
    fullName: filter?.fullName,
    email: filter?.email,
    role: filter?.role ?? 'instructor',
    status: filter?.status,
  }
  return useQuery<UserList>({
    queryKey: [ENDPOINT, 'instructors', params],
    queryFn: async () => usersService.list(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
    select: (res: any): UserList => {
      const root = res ?? {}
      const payload = root?.data?.data ?? root?.data ?? root
      const items = payload?.items ?? []
      const p = payload?.pagination ?? {}
      return {
        data: items as User[],
        total: p?.totalItems ?? items.length ?? 0,
        page: p?.currentPage ?? params.page,
        limit: p?.itemsPerPage ?? params.limit,
        totalPages: p?.totalPage ?? 0,
      }
    },
  })
}

export const useApproveInstructor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.approveInstructor(id),
    onSuccess: (res: any) => {
      toast.success(res?.message || 'Đã duyệt giảng viên')
      qc.invalidateQueries({ queryKey: [ENDPOINT, 'instructors'] })
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể duyệt giảng viên'
      toast.error(msg)
    }
  })
}

export const useRejectInstructor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => usersService.rejectInstructor(id, reason ? { reason } : undefined),
    onSuccess: (res: any) => {
      toast.success(res?.message || 'Đã từ chối giảng viên')
      qc.invalidateQueries({ queryKey: [ENDPOINT, 'instructors'] })
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể từ chối giảng viên'
      toast.error(msg)
    }
  })
}
