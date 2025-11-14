import api from "./api";

const BASE = "/posts";

export type PostStatus = "draft" | "published" | "archived";

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  status: PostStatus;
  categories?: string[];
  tags?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type PostListParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: PostStatus | "__all";
  categoryId?: string;
  tag?: string;
};

export const postService = {
  async list(params?: Record<string, any>) {
    const res = await api.get(BASE, { params });
    return res.data;
  },
  async get(id: string) {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },
  async create(data: Partial<Post>) {
    const res = await api.post(BASE, data);
    return res.data;
  },
  async update(id: string, data: Partial<Post>) {
    const res = await api.patch(`${BASE}/${id}`, data);
    return res.data;
  },
  async remove(id: string) {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  },
};
