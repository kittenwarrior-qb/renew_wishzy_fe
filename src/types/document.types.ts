export interface Document {
  id: string;
  name: string;
  notes?: string;
  descriptions?: string;
  fileUrl: string;
  entityId: string;
  entityType: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDocumentDto {
  name: string;
  notes?: string;
  descriptions?: string;
  fileUrl: string;
  entityId: string;
  entityType: string;
}

export interface UpdateDocumentDto {
  name?: string;
  notes?: string;
  descriptions?: string;
  fileUrl?: string;
  entityId?: string;
  entityType?: string;
}

export interface DocumentListResponse {
  items: Document[];
  pagination?: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPage: number;
  };
}
