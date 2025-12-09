import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { commentService, Comment } from "@/services/comment"

export interface AdminFeedback extends Comment {
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  course?: {
    id: string
    name: string
    thumbnail?: string
    categoryName?: string
  }
}

export interface AdminFeedbackListParams {
  page?: number
  limit?: number
  courseId?: string
}

export interface AdminFeedbackListResponse {
  data: AdminFeedback[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useAdminFeedbackList(params: AdminFeedbackListParams = {}) {
  return useQuery<AdminFeedbackListResponse>({
    queryKey: ["admin", "feedbacks", params.page, params.limit, params.courseId],
    queryFn: async () => {
      const result = await commentService.list({
        page: params.page || 1,
        limit: params.limit || 10,
        courseId: params.courseId,
      })
      
      // Transform response to match expected format
      return {
        data: result.items || [],
        total: result.pagination?.totalItems || 0,
        page: result.pagination?.currentPage || params.page || 1,
        limit: result.pagination?.itemsPerPage || params.limit || 10,
        totalPages: result.pagination?.totalPage || 1,
      }
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}
