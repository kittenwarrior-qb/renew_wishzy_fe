import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

export interface Feedback {
  id: string;
  content: string;
  rating: number;
  like: number;
  dislike: number;
  userId: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  course?: {
    id: string;
    name: string;
  };
}

export interface FeedbacksParams {
  page?: number;
  limit?: number;
  courseId?: string;
}

interface FeedbacksResponse {
  message: string;
  items: Feedback[];
  pagination: {
    totalPage: number;
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export const useFeedbacks = (params?: FeedbacksParams) => {
  return useQuery({
    queryKey: ['feedbacks', params],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: FeedbacksResponse; message: string }>('/feedbacks', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          ...(params?.courseId && { courseId: params.courseId }),
        },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useFeedbacksByCourse = (courseId: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['feedbacks', 'course', courseId, page, limit],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: FeedbacksResponse; message: string }>(`/feedbacks/course/${courseId}`, {
        params: { page, limit },
      });
      return response.data.data;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useFeedback = (feedbackId: string) => {
  return useQuery({
    queryKey: ['feedback', feedbackId],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Feedback; message: string }>(`/feedbacks/${feedbackId}`);
      return response.data.data;
    },
    enabled: !!feedbackId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useInstructorFeedbacks = (params?: FeedbacksParams) => {
  return useQuery({
    queryKey: ['instructor-feedbacks', params],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: FeedbacksResponse; message: string }>('/feedbacks/instructor/my-courses', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          ...(params?.courseId && { courseId: params.courseId }),
        },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
