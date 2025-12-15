import api from './api'
import type {
  Voucher,
  CreateVoucherRequest,
  UpdateVoucherRequest,
} from '@/types/voucher'

export type { Voucher, CreateVoucherRequest, UpdateVoucherRequest } from '@/types/voucher'

const VOUCHER_ENDPOINTS = {
  base: '/vouchers',
  byId: (id: string) => `/vouchers/${id}`,
} as const

export const voucherService = {
  async list(params?: Record<string, any>): Promise<{ items: Voucher[]; pagination?: any }> {
    const response = await api.get<any>(VOUCHER_ENDPOINTS.base, { params })
    const root = response?.data ?? {}
    const data = root?.data ?? root
    const items: Voucher[] = data?.items ?? data?.vouchers ?? []
    const pagination = data?.pagination
    return { items, pagination }
  },

  async getById(id: string): Promise<Voucher> {
    const response = await api.get<any>(VOUCHER_ENDPOINTS.byId(id))
    const root = response?.data ?? {}
    const data = root?.data ?? root
    return (data?.voucher ?? data) as Voucher
  },

  async create(body: CreateVoucherRequest): Promise<Voucher> {
    const response = await api.post<any>(VOUCHER_ENDPOINTS.base, body)
    const root = response?.data ?? {}
    const data = root?.data ?? root
    return (data?.voucher ?? data) as Voucher
  },

  async update(id: string, body: UpdateVoucherRequest): Promise<Voucher> {
    const response = await api.patch<any>(VOUCHER_ENDPOINTS.byId(id), body)
    const root = response?.data ?? {}
    const data = root?.data ?? root
    return (data?.voucher ?? data) as Voucher
  },

  async delete(id: string): Promise<Voucher> {
    const response = await api.delete<any>(VOUCHER_ENDPOINTS.byId(id))
    const root = response?.data ?? {}
    const data = root?.data ?? root
    return (data?.voucher ?? data) as Voucher
  },

  async validate(
    code: string,
    orderTotal: number,
    courseIds: string[],
  ): Promise<{
    valid: boolean
    voucher?: Voucher
    discount?: number
    message?: string
  }> {
    const response = await api.post<any>(`${VOUCHER_ENDPOINTS.base}/validate`, {
      code,
      orderTotal,
      courseIds,
    })
    const root = response?.data ?? {}
    return root?.data ?? root
  },
}
