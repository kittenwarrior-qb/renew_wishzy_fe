import type { SaleInfo, CourseSale } from '@/types/sale';
import { SaleType, calculateSalePrice, getSaleStatus, getDiscountPercentage } from '@/types/sale';

// Mock data cho Sale Management
export const mockSaleInfo: SaleInfo = {
  saleType: SaleType.PERCENT,
  value: 20,
  saleStartDate: '2024-12-01T00:00:00Z',
  saleEndDate: '2024-12-31T23:59:59Z',
};

export const mockCourseSales: CourseSale[] = [
  {
    courseId: '1',
    courseName: 'Lập trình JavaScript từ cơ bản đến nâng cao',
    price: 500000,
    saleInfo: {
      saleType: SaleType.PERCENT,
      value: 20,
      saleStartDate: '2024-12-01T00:00:00Z',
      saleEndDate: '2024-12-31T23:59:59Z',
    },
    salePrice: calculateSalePrice(500000, {
      saleType: SaleType.PERCENT,
      value: 20,
      saleStartDate: '2024-12-01T00:00:00Z',
      saleEndDate: '2024-12-31T23:59:59Z',
    }),
    saleStatus: getSaleStatus({
      saleType: SaleType.PERCENT,
      value: 20,
      saleStartDate: '2024-12-01T00:00:00Z',
      saleEndDate: '2024-12-31T23:59:59Z',
    }),
  },
  {
    courseId: '2',
    courseName: 'React.js - Xây dựng ứng dụng web hiện đại',
    price: 600000,
    saleInfo: {
      saleType: SaleType.FIXED,
      value: 100000,
      saleStartDate: '2024-11-15T00:00:00Z',
      saleEndDate: '2024-12-15T23:59:59Z',
    },
    salePrice: calculateSalePrice(600000, {
      saleType: SaleType.FIXED,
      value: 100000,
      saleStartDate: '2024-11-15T00:00:00Z',
      saleEndDate: '2024-12-15T23:59:59Z',
    }),
    saleStatus: getSaleStatus({
      saleType: SaleType.FIXED,
      value: 100000,
      saleStartDate: '2024-11-15T00:00:00Z',
      saleEndDate: '2024-12-15T23:59:59Z',
    }),
  },
  {
    courseId: '3',
    courseName: 'Node.js và Express - Backend Development',
    price: 700000,
    saleInfo: null,
    salePrice: 700000,
    saleStatus: 'none',
  },
  {
    courseId: '4',
    courseName: 'UI/UX Design cơ bản',
    price: 450000,
    saleInfo: {
      saleType: SaleType.PERCENT,
      value: 30,
      saleStartDate: '2024-12-20T00:00:00Z',
      saleEndDate: '2025-01-20T23:59:59Z',
    },
    salePrice: calculateSalePrice(450000, {
      saleType: SaleType.PERCENT,
      value: 30,
      saleStartDate: '2024-12-20T00:00:00Z',
      saleEndDate: '2025-01-20T23:59:59Z',
    }),
    saleStatus: getSaleStatus({
      saleType: SaleType.PERCENT,
      value: 30,
      saleStartDate: '2024-12-20T00:00:00Z',
      saleEndDate: '2025-01-20T23:59:59Z',
    }),
  },
];

