import api from "./api";
import { PaginationResponse } from "./category-blog";

const BASE = "/comment-blogs";

export interface CommentBlog {
    id: string;
    content: string;
    userId: string;
    user: {
        id: string;
        fullName: string;
        avatar?: string;
    };
    blogId: string;
    parentId?: string;
    likes: number;
    createdAt: string;
    updatedAt: string;
    replies?: CommentBlog[];
}

export interface CreateCommentBlogDto {
    content: string;
    blogId: string;
    parentId?: string;
}

export interface UpdateCommentBlogDto {
    content: string;
}

export const commentBlogService = {
    async listByBlog(blogId: string, params?: { page?: number; limit?: number }) {
        const res = await api.get<PaginationResponse<CommentBlog>>(`${BASE}/blog/${blogId}`, { params });
        return res.data;
    },

    async create(data: CreateCommentBlogDto) {
        const res = await api.post<CommentBlog>(BASE, data);
        return res.data;
    },

    async update(id: string, data: UpdateCommentBlogDto) {
        const res = await api.put<CommentBlog>(`${BASE}/${id}`, data);
        return res.data;
    },

    async remove(id: string) {
        const res = await api.delete(`${BASE}/${id}`);
        return res.data;
    },

    async toggleLike(id: string) {
        const res = await api.patch(`${BASE}/${id}/like`);
        return res.data;
    }
};
