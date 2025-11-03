import type { ApiResponse } from '@/types/common';

export type Lecture = {
  id: string;
  name: string;
  description?: string;
  chapterId: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// Backend returns: { message: string, ...lectures (spread array) }
// The spread creates object with numeric indices, so we need to handle it as Record<number, Lecture>
export type LectureListResponse = ApiResponse<{
  message: string;
  [key: number]: Lecture;
  length?: number;
}>;

export type LectureDetailResponse = ApiResponse<Lecture & { message: string }>;
