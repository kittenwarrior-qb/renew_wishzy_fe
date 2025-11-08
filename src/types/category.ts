export interface Category {
  id: string;
  name: string;
  notes?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CategoryFilter extends Record<string, unknown> {
  page?: number;
  limit?: number;
  name?: string;
  parentId?: string;
  search?: string;
}

export interface CategoryListResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryDetailResponse {
  data: Category;
}

export interface CreateCategoryRequest {
  name: string;
  notes?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}
