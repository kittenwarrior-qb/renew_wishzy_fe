import { useQuery } from "@tanstack/react-query"
import { categoryBlogService, CategoryBlogListResponse, CategoryBlog } from "@/services/category-blog"

const ENDPOINT = "category-blogs"

export const useCategoryBlogList = (params?: any) => {
    return useQuery({
        queryKey: [ENDPOINT, params],
        queryFn: async () => categoryBlogService.list(params),
        staleTime: 5 * 60 * 1000,
        select: (res: any) => {
            const data = res?.data ?? res
            return {
                items: data?.items ?? data ?? [],
                pagination: data?.pagination ?? {}
            }
        }
    })
}
export type { CategoryBlog }
