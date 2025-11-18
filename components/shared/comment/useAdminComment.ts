import { useQuery } from "@tanstack/react-query"
import api from "@/services/api"

const ENDPOINT = "comments-admin"

export type AdminComment = {
    id: string
    content: string
    rating: number
    likes: number
    dislikes: number
    userId: string
    courseId: string
    createdAt: string
    updatedAt: string
}

export type AdminCommentListResponse = {
    data: AdminComment[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export type AdminCommentFilter = {
    page?: number
    limit?: number
    courseId?: string
}

export const useAdminCommentList = (filter?: AdminCommentFilter) => {
    const params: Record<string, any> = {
        page: filter?.page ?? 1,
        limit: filter?.limit ?? 10,
        courseId: filter?.courseId,
    }

    return useQuery<AdminCommentListResponse>({
        queryKey: [ENDPOINT, params],
        queryFn: async (): Promise<AdminCommentListResponse> => {
            const res = await api.get<{ message?: string; items?: any[]; pagination?: any }>("/comments", { params })
            const payload = res.data || {}
            const rawItems = payload.items || []
            const p = payload.pagination || {}

            const items: AdminComment[] = rawItems.map((c: any): AdminComment => ({
                id: String(c.id),
                content: String(c.content ?? ""),
                rating: Number(c.rating ?? 0),
                likes: Number(c.likes ?? c.like ?? 0),
                dislikes: Number(c.dislikes ?? c.dislike ?? 0),
                userId: String(c.userId ?? ""),
                courseId: String(c.courseId ?? ""),
                createdAt: String(c.createdAt ?? ""),
                updatedAt: String(c.updatedAt ?? ""),
            }))

            return {
                data: items,
                total: Number(p.totalItems ?? items.length ?? 0),
                page: Number(p.currentPage ?? params.page ?? 1),
                limit: Number(p.itemsPerPage ?? params.limit ?? 10),
                totalPages: Number(p.totalPage ?? 0),
            }
        },
        staleTime: 5 * 60 * 1000,
    })
}
