import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bannerService, type Banner } from '@/services/banner'

const ENDPOINT = 'banners'

export type BannerListResponse = {
  data: Banner[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type BannerFilter = Partial<{
  page: number
  limit: number
  title: string
}>

export const useBannerList = (filter?: BannerFilter) => {
  const params: Record<string, any> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
    title: filter?.title,
  }
  return useQuery<BannerListResponse>({
    queryKey: [ENDPOINT, params],
    queryFn: async () => bannerService.list(params),
    staleTime: 5 * 60 * 1000,
    select: (res: any): BannerListResponse => {
      const payload = res?.data ?? res
      const items: Banner[] = payload?.items ?? payload?.banners ?? []
      const p = payload?.pagination ?? {}
      return {
        data: items as Banner[],
        total: p?.totalItems ?? items.length ?? 0,
        page: p?.currentPage ?? params.page,
        limit: p?.itemsPerPage ?? params.limit,
        totalPages: p?.totalPage ?? (p?.totalItems && p?.itemsPerPage ? Math.ceil(p.totalItems / p.itemsPerPage) : 0),
      }
    },
  })
}

export const useCreateBanner = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, Partial<Banner>>({
    mutationFn: async (data) => bannerService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
    },
  })
}

export const useUpdateBanner = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string } & Partial<Banner>>({
    mutationFn: async ({ id, ...data }) => bannerService.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
      if (vars?.id) qc.invalidateQueries({ queryKey: [`${ENDPOINT}/${vars.id}`] })
    },
  })
}

export const useDeleteBanner = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => bannerService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
    },
  })
}
