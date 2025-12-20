import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentBlogService, type CreateCommentBlogDto } from "@/services/comment-blog";

const QUERY_KEY = ["comment-blogs"];

export const useCommentBlogList = (blogId: string, params?: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: [...QUERY_KEY, "blog", blogId, params],
        queryFn: () => commentBlogService.listByBlog(blogId, params),
        enabled: !!blogId,
        select: (res: any) => res?.data ?? res,
    });
};

export const useCommentBlogListAll = (params?: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: [...QUERY_KEY, "all", params],
        queryFn: () => commentBlogService.listAll(params),
        select: (res: any) => res?.data ?? res,
    });
};

export const useCreateCommentBlog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCommentBlogDto) => commentBlogService.create(data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["blogs", variables.blogId] });
        },
    });
};

export const useToggleLikeCommentBlog = (blogId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => commentBlogService.toggleLike(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, "blog", blogId] });
        },
    });
};

export const useDeleteCommentBlog = (blogId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => commentBlogService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["blogs", blogId] });
        },
    });
};
