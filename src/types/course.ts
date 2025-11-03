import type { ApiResponse, PaginatedResponse } from '@/types/common';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export type SaleType = 'percent' | 'fixed';

export type SaleInfo = {
  saleType?: SaleType;
  value?: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
};

export type Course = {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  thumbnail?: string;
  price: number;
  saleInfo?: SaleInfo;
  rating: number;
  status?: boolean;
  averageRating: number;
  numberOfStudents: number;
  level: CourseLevel;
  totalDuration: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  createdBy: string;
  creator?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type CourseFilter = {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: string;
  courseLevel?: CourseLevel;
  createdBy?: string;
  rating?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
};

export type CourseListResponse = ApiResponse<PaginatedResponse<Course>>;
export type CourseDetailResponse = ApiResponse<Course & { message?: string }>;
