import { useQuery } from "@tanstack/react-query"
import { statService } from "@/services/stat"
import type { RevenueMode } from "@/types/revenue"

export function useInstructorStats() {
  return useQuery({
    queryKey: ["stat", "instructor"],
    queryFn: () => statService.getInstructorStats(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRevenueStats(params: { mode: RevenueMode; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["stat", "revenue", params],
    queryFn: () => statService.getRevenue(params),
    staleTime: 5 * 60 * 1000,
    enabled: !!params.mode,
  })
}

