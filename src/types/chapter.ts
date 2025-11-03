import type { ApiResponse } from '@/types/common';

export type Chapter = {
  id: string;
  name: string;
  description?: string;
  courseId: string;
  course?: {
    id: string;
    name: string;
  };
  order?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type ChapterListResponse = ApiResponse<{
  items: Chapter[];
  message: string;
}>;

export type ChapterDetailResponse = ApiResponse<Chapter & { message: string }>;
