// Instructor API Hooks - React Query Integration

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorApi } from '@/services/instructorApi';
import { notify } from '@/components/shared/admin/Notifications';
import type {
  CommentListQuery,
  FeedbackListQuery,
  DocumentListQuery,
  StudentListQuery,
  RevenueQuery,
  ReplyCommentRequest,
  ReplyFeedbackRequest,
  UploadDocumentRequest,
  UpdateCommentStatusRequest
} from '@/types/instructor';

// ============= QUERY KEYS =============
export const instructorQueryKeys = {
  // Comments
  comments: ['instructor', 'comments'] as const,
  commentsList: (params: CommentListQuery) => [...instructorQueryKeys.comments, 'list', params] as const,
  commentDetail: (id: string) => [...instructorQueryKeys.comments, 'detail', id] as const,
  
  // Feedbacks
  feedbacks: ['instructor', 'feedbacks'] as const,
  feedbacksList: (params: FeedbackListQuery) => [...instructorQueryKeys.feedbacks, 'list', params] as const,
  
  // Documents
  documents: ['instructor', 'documents'] as const,
  documentsList: (params: DocumentListQuery) => [...instructorQueryKeys.documents, 'list', params] as const,
  
  // Students
  students: ['instructor', 'students'] as const,
  studentsList: (params: StudentListQuery) => [...instructorQueryKeys.students, 'list', params] as const,
  studentProgress: (studentId: string, courseId?: string) => 
    [...instructorQueryKeys.students, 'progress', studentId, courseId] as const,
  
  // Revenue
  revenue: ['instructor', 'revenue'] as const,
  revenueData: (params: RevenueQuery) => [...instructorQueryKeys.revenue, 'data', params] as const,
};

// ============= COMMENTS HOOKS =============
export const useInstructorComments = (params: CommentListQuery) => {
  return useQuery({
    queryKey: instructorQueryKeys.commentsList(params),
    queryFn: () => instructorApi.comments.getComments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCommentDetail = (commentId: string) => {
  return useQuery({
    queryKey: instructorQueryKeys.commentDetail(commentId),
    queryFn: () => instructorApi.comments.getCommentDetail(commentId),
    enabled: !!commentId,
  });
};

export const useReplyToComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: ReplyCommentRequest }) =>
      instructorApi.comments.replyToComment(commentId, data),
    onSuccess: () => {
      // Invalidate comments queries
      queryClient.invalidateQueries({ queryKey: instructorQueryKeys.comments });
      notify({
        title: "Thành công",
        description: "Đã phản hồi bình luận",
        variant: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.response?.data?.error?.message || "Không thể phản hồi bình luận",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateCommentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentStatusRequest }) =>
      instructorApi.comments.updateCommentStatus(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorQueryKeys.comments });
      notify({
        title: "Thành công",
        description: "Đã cập nhật trạng thái bình luận",
        variant: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.response?.data?.error?.message || "Không thể cập nhật trạng thái",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: string) => instructorApi.comments.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorQueryKeys.comments });
      notify({
        title: "Thành công",
        description: "Đã xóa bình luận",
        variant: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.response?.data?.error?.message || "Không thể xóa bình luận",
        variant: "destructive"
      });
    }
  });
};

// ============= FEEDBACKS HOOKS =============
export const useInstructorFeedbacks = (params: FeedbackListQuery) => {
  return useQuery({
    queryKey: instructorQueryKeys.feedbacksList(params),
    queryFn: () => instructorApi.feedbacks.getFeedbacks(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useReplyToFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ feedbackId, data }: { feedbackId: string; data: ReplyFeedbackRequest }) =>
      instructorApi.feedbacks.replyToFeedback(feedbackId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorQueryKeys.feedbacks });
      notify({
        title: "Thành công",
        description: "Đã phản hồi đánh giá",
        variant: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.response?.data?.error?.message || "Không thể phản hồi đánh giá",
        variant: "destructive"
      });
    }
  });
};

export const useMarkFeedbackHelpful = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (feedbackId: string) => instructorApi.feedbacks.markFeedbackHelpful(feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorQueryKeys.feedbacks });
      notify({
        title: "Thành công",
        description: "Đã đánh dấu hữu ích",
        variant: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.response?.data?.error?.message || "Không thể đánh dấu hữu ích",
        variant: "destructive"
      });
    }
  });
};

// ============= DOCUMENTS HOOKS =============
export const useInstructorDocuments = (params: DocumentListQuery) => {
  return useQuery({
    queryKey: instructorQueryKeys.documentsList(params),
    queryFn: () => instructorApi.documents.getDocuments(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, onProgress }: { data: UploadDocumentRequest; onProgress?: (progress: number) => void }) =>
      instructorApi.documents.uploadDocument(data, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorQueryKeys.documents });
      notify({
        title: "Thành công",
        description: "Đã tải lên tài liệu",
        variant: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.response?.data?.error?.message || "Không thể tải lên tài liệu",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (documentId: string) => instructorApi.documents.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorQueryKeys.documents });
      notify({
        title: "Thành công",
        description: "Đã xóa tài liệu",
        variant: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.response?.data?.error?.message || "Không thể xóa tài liệu",
        variant: "destructive"
      });
    }
  });
};

// ============= STUDENTS HOOKS =============
export const useInstructorStudents = (params: StudentListQuery) => {
  return useQuery({
    queryKey: instructorQueryKeys.studentsList(params),
    queryFn: () => instructorApi.students.getStudents(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useStudentProgress = (studentId: string, courseId?: string) => {
  return useQuery({
    queryKey: instructorQueryKeys.studentProgress(studentId, courseId),
    queryFn: () => instructorApi.students.getStudentProgress(studentId, courseId),
    enabled: !!studentId,
  });
};

export const useSendMessageToStudent = () => {
  return useMutation({
    mutationFn: ({ studentId, message }: { studentId: string; message: string }) =>
      instructorApi.students.sendMessageToStudent(studentId, message),
    onSuccess: () => {
      notify({
        title: "Thành công",
        description: "Đã gửi tin nhắn",
        variant: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.response?.data?.error?.message || "Không thể gửi tin nhắn",
        variant: "destructive"
      });
    }
  });
};

// ============= REVENUE HOOKS =============
export const useInstructorRevenue = (params: RevenueQuery) => {
  return useQuery({
    queryKey: instructorQueryKeys.revenueData(params),
    queryFn: () => instructorApi.revenue.getRevenue(params),
    staleTime: 10 * 60 * 1000, // 10 minutes for revenue data
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useExportRevenueReport = () => {
  return useMutation({
    mutationFn: ({ params, format }: { params: RevenueQuery; format?: 'csv' | 'xlsx' }) =>
      instructorApi.revenue.exportRevenueReport(params, format),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `revenue-report.${variables.format || 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notify({
        title: "Thành công",
        description: "Đã xuất báo cáo doanh thu",
        variant: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.response?.data?.error?.message || "Không thể xuất báo cáo",
        variant: "destructive"
      });
    }
  });
};

// ============= UTILITY HOOKS =============
export const useInvalidateInstructorQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateComments: () => queryClient.invalidateQueries({ queryKey: instructorQueryKeys.comments }),
    invalidateFeedbacks: () => queryClient.invalidateQueries({ queryKey: instructorQueryKeys.feedbacks }),
    invalidateDocuments: () => queryClient.invalidateQueries({ queryKey: instructorQueryKeys.documents }),
    invalidateStudents: () => queryClient.invalidateQueries({ queryKey: instructorQueryKeys.students }),
    invalidateRevenue: () => queryClient.invalidateQueries({ queryKey: instructorQueryKeys.revenue }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['instructor'] }),
  };
};