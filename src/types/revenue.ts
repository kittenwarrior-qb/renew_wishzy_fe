// Types for Revenue Management

export interface RevenueStatistics {
  totalRevenue: number; // Tổng doanh thu
  monthlyRevenue: number; // Doanh thu tháng này
  totalStudents: number; // Tổng số học viên
  totalCourses: number; // Tổng số khóa học
  averageRevenuePerCourse: number; // Doanh thu trung bình mỗi khóa học
  growthRate: number; // Tỷ lệ tăng trưởng (%)
}

export interface CourseRevenue {
  courseId: string;
  courseName: string;
  thumbnail?: string;
  categoryName?: string;
  price: number;
  totalRevenue: number; // Tổng doanh thu từ khóa học này
  totalSales: number; // Số lượng đơn hàng (OrderDetail)
  totalStudents: number; // Số lượng học viên (Enrollment)
  enrollmentCount: number; // Số lượng enrollment
  averageRating?: number;
  createdAt: string;
}

export interface RevenueByPeriod {
  period: string; // "2024-01", "2024-02", etc.
  revenue: number;
  sales: number; // Số lượng đơn hàng
  students: number; // Số lượng học viên mới
}

export interface TopSellingCourse extends CourseRevenue {
  rank: number;
}

export interface RevenueResponse {
  statistics: RevenueStatistics;
  topSellingCourses: TopSellingCourse[];
  coursesWithMostStudents: CourseRevenue[];
  revenueByPeriod: RevenueByPeriod[]; // Theo tháng hoặc theo ngày
}

export interface RevenueFilter {
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  period?: 'day' | 'week' | 'month' | 'year'; // Period for grouping
  limit?: number; // Limit for top courses
}

