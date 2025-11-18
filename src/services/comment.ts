import api from "./api";

const BASE = "/comments";

export type Comment = {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  rating: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
};

export type CommentFilter = {
  page?: number;
  limit?: number;
  courseId?: string;
};

export type CreateCommentRequest = {
  userId: string;
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
  async listByCourse(courseId: string): Promise<CommentListResponse> {
    const res = await api.get<CommentListResponse>(`/courses/${courseId}/comments`);
    return res.data;
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
};
