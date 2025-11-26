import api from "./api"
import type { InstructorStatsResponse, RevenueApiResponse, RevenueMode } from "@/types/revenue"

export const statService = {
  async getInstructorStats(): Promise<InstructorStatsResponse> {
    const response = await api.get("/stat/instructor")
    return response.data?.data ?? response.data
  },
  async getRevenue(params: { mode: RevenueMode; startDate?: string; endDate?: string }): Promise<RevenueApiResponse> {
    const response = await api.get("/stat/revenue", { params })
    return response.data?.data ?? response.data
  },
}

