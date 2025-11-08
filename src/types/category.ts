export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string | null;
  isSubCategory: boolean;
  icon?: string;
  image?: string;
  order?: number;
  isActive: boolean;
  courseCount?: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  parent?: Category;
}

export interface CategoryFilter extends Record<string, unknown> {
  page?: number;
  limit?: number;
  name?: string;
  parentId?: string;
  isSubCategory?: boolean;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'order' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
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
  description?: string;
  slug: string;
  parentId?: string;
  icon?: string;
  image?: string;
  order?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}
