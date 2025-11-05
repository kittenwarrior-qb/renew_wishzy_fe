import type { ApiResponse } from '@/types/common';

export type Chapter = {
  id: string;
  name: string;
  description?: string;
  duration: number;
  courseId: string;
  course?: {
    id: string;
    name: string;
  };
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type ChapterListResponse = ApiResponse<{
  items: Chapter[];
  message: string;
}>;

export type ChapterDetailResponse = ApiResponse<Chapter & { message: string }>;
