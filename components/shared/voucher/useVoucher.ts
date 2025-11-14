import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { voucherService, type Voucher, type CreateVoucherRequest, type UpdateVoucherRequest } from '@/services/voucher'

const ENDPOINT = 'vouchers'

export type VoucherListResponse = {
  data: Voucher[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type VoucherFilter = Partial<{
  page: number
  limit: number
  code: string
  isActive: boolean
}>

export const useVoucherList = (filter?: VoucherFilter) => {
  const params: Record<string, any> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
    code: filter?.code,
    isActive: filter?.isActive,
  }
  return useQuery<VoucherListResponse>({
    queryKey: [ENDPOINT, params],
    queryFn: async (): Promise<VoucherListResponse> => {
      const res = await voucherService.list(params)
      const payload = (res as any)?.data ?? res
      const items: Voucher[] = payload?.items ?? payload?.vouchers ?? []
      const p = payload?.pagination ?? {}
      return {
        data: items as Voucher[],
        total: p?.totalItems ?? items.length ?? 0,
        page: p?.currentPage ?? params.page,
        limit: p?.itemsPerPage ?? params.limit,
        totalPages: p?.totalPage ?? (p?.totalItems && p?.itemsPerPage ? Math.ceil(p.totalItems / p.itemsPerPage) : 0),
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateVoucher = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, CreateVoucherRequest>({
    mutationFn: async (data) => voucherService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
    },
  })
}

export const useUpdateVoucher = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string } & UpdateVoucherRequest>({
    mutationFn: async ({ id, ...data }) => voucherService.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
      if (vars?.id) qc.invalidateQueries({ queryKey: [`${ENDPOINT}/${vars.id}`] })
    },
  })
}

export const useDeleteVoucher = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => voucherService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
    },
  })
}
