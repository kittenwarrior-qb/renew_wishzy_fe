import type { ApiResponse, PaginatedResponse } from '@/types/common';

export type DocumentEntityType = 'COURSE' | 'CHAPTER' | 'LECTURE';

export type Document = {
  id: string;
  name: string;
  notes?: string;
  descriptions?: string;
  fileUrl?: string;
  entityId: string;
  entityType: DocumentEntityType;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type DocumentFilter = {
  page?: number;
  limit?: number;
  name?: string;
  entityId?: string;
  entityType?: DocumentEntityType;
  createdBy?: string;
};

export type DocumentListResponse = ApiResponse<PaginatedResponse<Document>>;

export type DocumentDetailResponse = ApiResponse<Document & { message: string }>;
