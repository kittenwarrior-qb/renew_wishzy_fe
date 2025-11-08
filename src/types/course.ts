export interface Course {
  id: number | string;
  title: string;
  description: string;
  thumbnail?: string;
  image?: string; // For backward compatibility
  price: number | string;
  originalPrice?: number;
  duration: number | string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  categoryId?: string;
  instructor: string | {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  students?: number; // For backward compatibility
  totalStudents?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isPreview: boolean;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
  completedAt?: string;
}

export interface CourseFilter extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  minPrice?: number;
  maxPrice?: number;
  instructor?: string;
  isPublished?: boolean;
  sortBy?: 'title' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
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
  lessons?: Lesson[];
  isEnrolled?: boolean;
}
