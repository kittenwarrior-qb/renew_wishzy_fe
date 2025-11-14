import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderService, type OrderListParams, type OrderStatus } from '@/services/order'
import type { OrderDetailResponse } from '@/types/order-detail.types'

const ENDPOINT = 'orders'

export type OrderListItem = Record<string, unknown>
export type OrderList = {
  data: OrderListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const useOrderList = (filter?: OrderListParams) => {
  const params: Record<string, unknown> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
    id: filter?.id,
    courseId: filter?.courseId,
    voucherId: filter?.voucherId,
  }
  return useQuery<OrderList>({
    queryKey: [ENDPOINT, params],
    queryFn: async () => orderService.list(params as Record<string, any>),
    staleTime: 5 * 60 * 1000,
    select: (res: unknown): OrderList => {
      const anyRes = res as any
      const payload = anyRes?.data ?? anyRes
      const items = payload?.items ?? []
      const p = payload?.pagination ?? {}
      return {
        data: items,
        total: p?.totalItems ?? items.length ?? 0,
        page: p?.currentPage ?? params.page,
        limit: p?.itemsPerPage ?? params.limit,
        totalPages: p?.totalPage ?? (p?.totalItems && p?.itemsPerPage ? Math.ceil(p.totalItems / p.itemsPerPage) : 0),
      }
    },
  })
}

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string; status: OrderStatus }>({
    mutationFn: async ({ id, status }) => orderService.updateStatus(id, status),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      if (vars?.id) qc.invalidateQueries({ queryKey: ['orders', vars.id] })
    },
  })
}

export const useOrderDetail = (id?: string) => {
  return useQuery<OrderDetailResponse | null>({
    queryKey: [ENDPOINT, id],
    queryFn: async () => (id ? orderService.getOrderById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    select: (res: unknown): OrderDetailResponse | null => {
      const anyRes = res as any
      const payload = anyRes?.data ?? anyRes
      return (payload ?? null) as OrderDetailResponse | null
    },
  })
}
