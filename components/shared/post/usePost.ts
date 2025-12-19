import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postService, type Post, type PostStatus } from '@/services/post'

const ENDPOINT = 'blogs'

export type PostList = {
  items: Post[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type PostFilter = Partial<{
  page: number
  limit: number
  q: string
  categoryId: string
  isActive: boolean
}>

export const usePostList = (filter?: PostFilter) => {
  const params: Record<string, any> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
    search: filter?.q,
    category: filter?.categoryId,
    isActive: filter?.isActive,
  }
  return useQuery<PostList>({
    queryKey: [ENDPOINT, params],
    queryFn: async () => postService.list(params),
    staleTime: 5 * 60 * 1000,
    select: (res: any): PostList => {
      const payload = res?.data ?? res
      const items: Post[] = payload?.items ?? payload?.data ?? []
      const p = payload?.pagination ?? {}
      return {
        items,
        total: p?.totalItems ?? payload?.total ?? items.length ?? 0,
        page: p?.currentPage ?? payload?.page ?? params.page,
        limit: p?.itemsPerPage ?? payload?.limit ?? params.limit,
        totalPages: p?.totalPage ?? payload?.totalPages ?? ((p?.totalItems && p?.itemsPerPage) ? Math.ceil(p.totalItems / p.itemsPerPage) : 0),
      }
    },
  })
}

export const usePostDetail = (id?: string) => {
  return useQuery<Post | null>({
    queryKey: [ENDPOINT, id],
    queryFn: async () => (id ? postService.get(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    select: (res: any): Post | null => {
      const payload = res?.data ?? res
      return (payload ?? null) as Post | null
    },
  })
}

export const useCreatePost = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, Partial<Post>>({
    mutationFn: async (data) => postService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [ENDPOINT] }) },
  })
}

export const useUpdatePost = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string } & Partial<Post>>({
    mutationFn: async ({ id, ...data }) => postService.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
      if (vars?.id) qc.invalidateQueries({ queryKey: [ENDPOINT, vars.id] })
    },
  })
}

export const useDeletePost = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => postService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [ENDPOINT] }) },
  })
}
