import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService, type Comment, type CommentFilter, type CreateCommentRequest, type UpdateCommentRequest, type CommentMutationResponse } from '@/services/comment';

const ENDPOINT = 'comments';

export type CommentListResponse = {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const useCommentList = (filter?: CommentFilter) => {
  const params = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
    courseId: filter?.courseId,
  };
  return useQuery<CommentListResponse>({
    queryKey: [ENDPOINT, params],
    queryFn: async (): Promise<CommentListResponse> => {
      const res = await commentService.list(params);
      const items = res.items ?? [];
      const p = res.pagination;
      return {
        data: items,
        total: p.totalItems ?? items.length,
        page: p.currentPage ?? params.page,
        limit: p.itemsPerPage ?? params.limit,
        totalPages: p.totalPage ?? (p.totalItems && p.itemsPerPage ? Math.ceil(p.totalItems / p.itemsPerPage) : 0),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCommentDetail = (id?: string) => {
  return useQuery<Comment | null>({
    queryKey: [ENDPOINT, id],
    queryFn: async () => {
      if (!id) return null;
      const res = await commentService.get(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation<CommentMutationResponse, unknown, CreateCommentRequest>({
    mutationFn: async (data) => commentService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] });
    },
  });
};

export const useUpdateComment = () => {
  const qc = useQueryClient();
  return useMutation<CommentMutationResponse, unknown, { id: string } & UpdateCommentRequest>({
    mutationFn: async ({ id, ...data }) => commentService.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] });
      if (vars?.id) qc.invalidateQueries({ queryKey: [ENDPOINT, vars.id] });
    },
  });
};

export const useLikeComment = () => {
  const qc = useQueryClient();
  return useMutation<CommentMutationResponse, unknown, { id: string }>({
    mutationFn: async ({ id }) => commentService.like(id),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] });
      if (vars?.id) qc.invalidateQueries({ queryKey: [ENDPOINT, vars.id] });
    },
  });
};

export const useDislikeComment = () => {
  const qc = useQueryClient();
  return useMutation<CommentMutationResponse, unknown, { id: string }>({
    mutationFn: async ({ id }) => commentService.dislike(id),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] });
      if (vars?.id) qc.invalidateQueries({ queryKey: [ENDPOINT, vars.id] });
    },
  });
};
