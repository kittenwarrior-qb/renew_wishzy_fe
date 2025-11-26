// Types for Sale Management

export enum SaleType {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

export interface SaleInfo {
  saleType: SaleType;
  value: number; // Nếu percent: 0-50, Nếu fixed: số tiền
  saleStartDate?: string; // ISO 8601
  saleEndDate?: string; // ISO 8601
}

export type SaleStatus = 'active' | 'upcoming' | 'expired' | 'none';

export interface CourseSale {
  courseId: string;
  courseName: string;
  price: number; // Giá gốc
  saleInfo?: SaleInfo | null;
  salePrice?: number; // Giá sau sale (calculated)
  saleStatus?: SaleStatus; // Status của sale (calculated)
}

// Helper function để tính giá sale
export function calculateSalePrice(price: number, saleInfo?: SaleInfo | null): number {
  if (!saleInfo) return price;

  const now = new Date();
  const startDate = saleInfo.saleStartDate ? new Date(saleInfo.saleStartDate) : null;
  const endDate = saleInfo.saleEndDate ? new Date(saleInfo.saleEndDate) : null;

  // Kiểm tra thời gian sale
  if (startDate && now < startDate) return price; // Chưa bắt đầu
  if (endDate && now > endDate) return price; // Đã kết thúc

  // Tính giá sale
  if (saleInfo.saleType === SaleType.PERCENT) {
    const discount = price * (saleInfo.value / 100);
    return Math.max(0, price - discount);
  } else if (saleInfo.saleType === SaleType.FIXED) {
    return Math.max(0, price - saleInfo.value);
  }

  return price;
}

// Helper function để tính sale status
export function getSaleStatus(saleInfo?: SaleInfo | null): SaleStatus {
  if (!saleInfo) return 'none';

  const now = new Date();
  const startDate = saleInfo.saleStartDate ? new Date(saleInfo.saleStartDate) : null;
  const endDate = saleInfo.saleEndDate ? new Date(saleInfo.saleEndDate) : null;

  if (startDate && now < startDate) return 'upcoming';
  if (endDate && now > endDate) return 'expired';
  return 'active';
}

// Helper function để tính % giảm giá
export function getDiscountPercentage(price: number, saleInfo?: SaleInfo | null): number {
  if (!saleInfo) return 0;

  const salePrice = calculateSalePrice(price, saleInfo);
  if (salePrice === price) return 0;

  return Math.round(((price - salePrice) / price) * 100);
}

