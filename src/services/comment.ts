import api from "./api";

const BASE = "/feedbacks";

export type Comment = {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  rating: number;
  like: number;
  dislike: number;
  createdAt: string;
  updatedAt: string;
};

export type CommentFilter = {
  page?: number;
  limit?: number;
  courseId?: string;
};

export type CreateCommentRequest = {
  courseId: string;
  content: string;
  rating: number;
};

export type UpdateCommentRequest = Partial<CreateCommentRequest>;

export type CommentListResponse = {
  items: Comment[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPage: number;
  };
};

export type CommentResponse = {
  data: Comment;
};

export type CommentMutationResponse = {
  data: Comment;
  message?: string;
};

export const commentService = {
  async list(params?: Record<string, any>): Promise<CommentListResponse> {
    const res = await api.get<CommentListResponse>(BASE, { params });
    return res.data;
  },
  async listByCourse(courseId: string, page: number = 1, limit: number = 10): Promise<CommentListResponse> {
    const res = await api.get<any>(`${BASE}/course/${courseId}`, {
      params: { page, limit }
    });
    console.log('Comment API Response:', res.data);
    
    // Handle different response formats
    // If wrapped in { data: { items, pagination } }
    if (res.data?.data?.items) {
      return res.data.data;
    }
    // If direct { items, pagination }
    if (res.data?.items) {
      return res.data;
    }
    // Fallback
    return { items: [], pagination: { totalItems: 0, currentPage: 1, itemsPerPage: 10, totalPage: 0 } };
  },
  async get(id: string): Promise<CommentResponse> {
    const res = await api.get<CommentResponse>(`${BASE}/${id}`);
    return res.data;
  },
  async create(data: CreateCommentRequest): Promise<CommentMutationResponse> {
    const res = await api.post<CommentMutationResponse>(BASE, data);
    return res.data;
  },
  async update(id: string, data: UpdateCommentRequest): Promise<CommentMutationResponse> {
    const res = await api.put<CommentMutationResponse>(`${BASE}/${id}`, data);
    return res.data;
  },
  async like(id: string): Promise<CommentMutationResponse> {
    const res = await api.patch<CommentMutationResponse>(`${BASE}/${id}/like`);
    return res.data;
  },
  async dislike(id: string): Promise<CommentMutationResponse> {
    const res = await api.patch<CommentMutationResponse>(`${BASE}/${id}/dislike`);
    return res.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const res = await api.delete<{ message: string }>(`${BASE}/${id}`);
    return res.data;
  },
};
