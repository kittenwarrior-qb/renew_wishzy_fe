export type VoucherType = 'percent' | 'fixed'
export type VoucherApplyScope = 'all' | 'category' | 'course'

export interface Voucher {
  id: string
  code: string
  name: string
  discountType: VoucherType
  discountValue: number
  maxDiscountAmount?: number | null
  minOrderAmount?: number | null
  perUserLimit?: number | null
  totalLimit?: number | null
  applyScope: VoucherApplyScope
  categoryId?: string | null
  courseId?: string | null
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateVoucherRequest {
  code: string
  name: string
  discountType: VoucherType
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  perUserLimit?: number
  totalLimit?: number
  applyScope: VoucherApplyScope
  categoryId?: string
  courseId?: string
  isActive?: boolean
  startDate?: string | null
  endDate?: string | null
}

export interface UpdateVoucherRequest {
  code?: string
  name?: string
  discountType?: VoucherType
  discountValue?: number
  maxDiscountAmount?: number | null
  minOrderAmount?: number | null
  perUserLimit?: number | null
  totalLimit?: number | null
  applyScope?: VoucherApplyScope
  categoryId?: string | null
  courseId?: string | null
  isActive?: boolean
  startDate?: string | null
  endDate?: string | null
}

export interface VoucherResponse {
  success: boolean
  data: { voucher: Voucher }
  message: string
  url: string
}

export interface VouchersResponse {
  success: boolean
  data: { vouchers: Voucher[] }
  message: string
  url: string
}
