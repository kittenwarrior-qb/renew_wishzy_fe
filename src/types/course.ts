export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export type SaleType = 'percent' | 'fixed';

export type SaleInfo = {
  saleType: SaleType;
  value: number;
  saleStartDate: string;
  saleEndDate: string;
};

export type Course = {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  thumbnail?: string;
  price: number | string;
  saleInfo?: SaleInfo | null;
  rating: number;
  status?: boolean;
  averageRating: number | string;
  numberOfStudents: number;
  level: CourseLevel;
  totalDuration: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    notes?: string | null;
    parentId?: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
  } | null;
  createdBy: string;
  creator?: {
    id: string;
    email: string;
    fullName: string;
    avatar?: string | null;
    passwordModified?: boolean;
  } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
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
  status?: boolean | string;
};

export type PaginationInfo = {
  totalPage: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
};

export type CourseListResponse = {
  data: {
    items: Course[];
    pagination: PaginationInfo;
  };
  message?: string;
};

export type CourseDetailResponse = {
  data: Course;
  message?: string;
};
