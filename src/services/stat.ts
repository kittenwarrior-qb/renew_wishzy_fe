import api from "./api"
import type { 
  InstructorStatsResponse, 
  RevenueApiResponse, 
  RevenueMode, 
  HotCourse,
  TopStudentsResponse,
  TopInstructorsResponse,
  TopStudentsSortBy,
  TopInstructorsSortBy
} from "@/types/revenue"

export const statService = {
  async getInstructorStats(): Promise<InstructorStatsResponse> {
    const response = await api.get<{ success: boolean; data: InstructorStatsResponse; message: string }>("/stat/instructor")
    // BE có TransformInterceptor wrap response: { success, data: InstructorStatsResponse, message, url }
    // Vậy response.data.data sẽ là InstructorStatsResponse
    return response.data.data
  },

  async getDashboardSummary(): Promise<{
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
    todayOrders: number;
    todayRevenue: number;
  }> {
    const response = await api.get("/stat/dashboard-summary");
    return response.data?.data ?? response.data;
  },

  async getRevenue(params: { mode: RevenueMode; startDate?: string; endDate?: string }): Promise<RevenueApiResponse> {
    const response = await api.get("/stat/revenue", {
      params,
    });
    return response.data?.data ?? response.data;
  },

  async getDailyRevenue(startDate?: string, endDate?: string): Promise<RevenueApiResponse> {
    return this.getRevenue({ mode: 'day', startDate, endDate });
  },
  async getHotCourses(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: HotCourse[]; total: number }> {
    const response = await api.get("/stat/hot-courses", { params });
    return response.data;
  },
  
  async getTopStudents(params?: {
    limit?: number;
    sortBy?: TopStudentsSortBy;
  }): Promise<TopStudentsResponse> {
    const response = await api.get("/stat/top-students", { params });
    return response.data?.data ?? response.data;
  },

  async getTopInstructors(params?: {
    limit?: number;
    sortBy?: TopInstructorsSortBy;
  }): Promise<TopInstructorsResponse> {
    const response = await api.get("/stat/top-instructors", { params });
    return response.data?.data ?? response.data;
  },

  async getTopCoursesByRevenue(limit: number = 10): Promise<{
    data: {
      courseId: string;
      courseName: string;
      thumbnail: string | null;
      instructorName: string;
      totalStudents: number;
      totalRevenue: number;
    }[];
    total: number;
  }> {
    const response = await api.get("/stat/top-courses-by-revenue", { params: { limit } });
    return response.data?.data ?? response.data;
  },
}

