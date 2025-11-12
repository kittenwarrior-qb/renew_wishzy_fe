export interface Enrollment {
  id: string;
  userId: string;
  detailOrderId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: string;
  lastAccess: string;
  certificateUrl: string | null;
  createdAt: string;
  updatedAt: string;
  course: EnrollmentCourse;
  user: EnrollmentUser;
}

export interface EnrollmentCourse {
  id: string;
  name: string;
  description: string;
  notes: string;
  thumbnail: string;
  price: string;
  saleInfo: {
    value: number;
    saleType: string;
    saleEndDate: string;
    saleStartDate: string;
  } | null;
  rating: number;
  status: boolean;
  averageRating: string;
  numberOfStudents: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalDuration: number;
  categoryId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EnrollmentUser {
  passwordModified: boolean;
  id: string;
  email: string;
  fullName: string;
  avatar: string;
}

export interface MyLearningResponse {
  enrollments: Enrollment[];
}
