import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { commentService, Comment } from "@/services/comment"

export interface AdminComment extends Comment {
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
  }
}

export interface AdminCommentListParams {
  page?: number
  limit?: number
  courseId?: string
}

export interface AdminCommentListResponse {
  data: AdminComment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useAdminCommentList(params: AdminCommentListParams = {}) {
  return useQuery<AdminCommentListResponse>({
    queryKey: ["admin", "comments", params.page, params.limit, params.courseId],
    queryFn: async () => {
      // Use listByCourse if courseId is present, otherwise list all?
      // Actually commentService.list supports params, so we can use that.
      // But wait, the user wants "comments in lessons". 
      // If it's general comments, commentService.list is fine.
      
      const result = await commentService.list({
        page: params.page || 1,
        limit: params.limit || 10,
        courseId: params.courseId,
      })
      
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
