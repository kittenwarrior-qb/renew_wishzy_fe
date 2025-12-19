import api from "./api";

const BASE = "/blogs";

export type PostStatus = "draft" | "published" | "archived";

export type Comment = {
  id: string;
  content: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  replies?: Comment[];
};

export type Post = {
  id: string;
  title: string;
  content: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  categoryId?: string;
  views: number;
  authorId: string;
  author?: {
    id: string;
    fullName: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
  };
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
};

export type PostListParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
};

export const postService = {
  async list(params?: PostListParams) {
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
    const res = await api.put(`${BASE}/${id}`, data);
    return res.data;
  },
  async remove(id: string) {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  },
};
