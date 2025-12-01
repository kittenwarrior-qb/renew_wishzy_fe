import api from "./api"
import type { InstructorStatsResponse, RevenueApiResponse, RevenueMode, HotCourse } from "@/types/revenue"

export const statService = {
  async getInstructorStats(): Promise<InstructorStatsResponse> {
    const response = await api.get("/stat/instructor")
    return response.data?.data ?? response.data
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
}

