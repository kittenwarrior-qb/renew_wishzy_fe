import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

export interface Document {
  id: string;
  name: string;
  notes?: string;
  descriptions?: string;
  fileUrl?: string;
  entityId: string;
  entityType: 'course' | 'chapter' | 'lecture';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsParams {
  page?: number;
  limit?: number;
  entityId?: string;
}

interface DocumentsResponse {
  message: string;
  items: Document[];
  pagination: {
    totalPage: number;
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export const useDocuments = (params?: DocumentsParams) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: DocumentsResponse; message: string }>('/documents', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          ...(params?.entityId && { entityId: params.entityId }),
        },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useInstructorDocuments = (params?: DocumentsParams) => {
  return useQuery({
    queryKey: ['instructor-documents', params],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: DocumentsResponse; message: string }>('/documents/instructor/my-courses', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          ...(params?.entityId && { entityId: params.entityId }),
        },
      });
      return response.data.data; // Backend wraps response in { success, data, message }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDocument = (documentId: string) => {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Document; message: string }>(`/documents/${documentId}`);
      return response.data.data;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      descriptions?: string;
      fileUrl?: string;
      entityId: string;
      entityType: 'course' | 'chapter' | 'lecture';
    }) => {
      const response = await api.post<{ success: boolean; data: Document; message: string }>('/documents', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-documents'] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Document> }) => {
      const response = await api.patch<{ success: boolean; data: Document; message: string }>(`/documents/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{ success: boolean; data: null; message: string }>(`/documents/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-documents'] });
    },
  });
};
