import type { CourseItemType } from './course-item.types';

export type Course = CourseItemType;

export interface CourseFilter extends Record<string, unknown> {
  page?: number;
  limit?: number;
  name?: string;
  search?: string;
  categoryId?: string;
  status?: boolean;
  deleted?: boolean;
}

export interface CourseListResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseDetailResponse {
  data: Course;
}

export interface CreateCourseRequest {
  name: string;
  description?: string;
  notes?: string;
  thumbnail?: string;
  price: number;
  categoryId: string;
  level?: string;
  status?: boolean;
  totalDuration?: number;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  id: string;
}

export interface UpdateCourseStatusRequest {
  id: string;
  status: boolean;
}

