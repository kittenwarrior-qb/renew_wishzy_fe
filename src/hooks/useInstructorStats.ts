import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface InstructorStats {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  totalFeedbacks: number;
  overallRating: number;
  courses: {
    courseId: string;
    courseName: string;
    averageRating: number;
    studentCount: number;
    commentCount: number;
    revenue: number;
  }[];
}

interface RevenueDataPoint {
  period: string;
  year?: number;
  month?: number;
  week?: number;
  day?: number;
  startDate?: string;
  endDate?: string;
  revenue: number;
  orderCount: number;
  courseSoldCount: number;
}

interface RevenueStats {
  mode: 'day' | 'week' | 'month' | 'year';
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  totalStudents: number;
  totalCourses: number;
  averageRevenuePerCourse: number;
  growthRate: number;
  details: RevenueDataPoint[];
  startDate?: string;
  endDate?: string;
}

interface RevenueStatsParams {
  mode: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

export const useInstructorStats = () => {
  return useQuery({
    queryKey: ['instructor-stats'],
    queryFn: async () => {
      const response = await api.get<{ data: InstructorStats }>('/stat/instructor');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useRevenueStats = (params: RevenueStatsParams) => {
  return useQuery({
    queryKey: ['revenue-stats', params],
    queryFn: async () => {
      const response = await api.get<{ data: RevenueStats }>('/stat/revenue', {
        params: {
          mode: params.mode,
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
        },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
