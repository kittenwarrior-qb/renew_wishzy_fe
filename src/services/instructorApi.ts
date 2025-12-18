// Instructor API Service - Based on API Contract Specification
// Uses mock data in development mode until backend endpoints are implemented

import { api } from '../lib/api';
import { mockInstructorApi, USE_MOCK_INSTRUCTOR_API } from './mockApi';
import type {
  // Comments
  CommentListQuery,
  CommentListResponse,
  CommentDetailResponse,
  ReplyCommentRequest,
  UpdateCommentStatusRequest,
  
  // Feedbacks
  FeedbackListQuery,
  FeedbackListResponse,
  ReplyFeedbackRequest,
  
  // Documents
  DocumentListQuery,
  DocumentListResponse,
  UploadDocumentRequest,
  
  // Students
  StudentListQuery,
  StudentListResponse,
  
  // Revenue
  RevenueQuery,
  RevenueResponse,
  
  // Common
  ApiResponse
} from '@/types/instructor';

// ============= COMMENTS API =============
export const commentsApi = {
  // Get comments list
  getComments: async (params: CommentListQuery): Promise<CommentListResponse> => {
    try {
      // Use real API endpoint
      const backendParams = {
        page: params.page,
        limit: params.limit,
        lectureId: params.courseId, // Backend uses lectureId, frontend sends courseId
        // Backend doesn't support search and status yet, so we filter client-side if needed
      };

      const response = await api.get('/comments/instructor/my-courses', { params: backendParams });
      
      console.log('Comments API response:', response.data);
      
      // Backend returns: { success: boolean, data: { items: Comment[], pagination: {...}, statistics: {...} }, message: string }
      const comments = response.data?.data?.items || [];
      const pagination = response.data?.data?.pagination || {};
      const statistics = response.data?.data?.statistics || {};
      
      // Apply client-side filtering if needed
      let filteredComments = [...comments];
      
      if (params.search) {
        const search = params.search.toLowerCase();
        filteredComments = filteredComments.filter(comment =>
          comment.content?.toLowerCase().includes(search) ||
          comment.user?.fullName?.toLowerCase().includes(search)
        );
      }
      
      if (params.status && params.status !== 'all') {
        filteredComments = filteredComments.filter(comment => comment.status === params.status);
      }

      // Transform backend data to match frontend expectations
      const transformedComments = filteredComments.map(comment => ({
        id: comment.id,
        content: comment.content,
        studentId: comment.userId,
        studentName: comment.user?.fullName || 'Unknown Student',
        studentAvatar: comment.user?.avatar || '/images/avatar-placeholder.png',
        courseId: comment.lecture?.chapter?.course?.id || '',
        courseName: comment.lecture?.chapter?.course?.name || 'Unknown Course',
        lectureId: comment.lectureId,
        lectureTitle: comment.lecture?.name || 'Unknown Lecture',
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        status: comment.status,
        repliesCount: comment.repliesCount || 0,
        lastReplyAt: comment.lastReplyAt || null,
        isInappropriate: false, // Backend doesn't have this field yet
        parentCommentId: comment.parentId,
      }));

      return {
        success: true,
        data: {
          items: transformedComments,
          pagination: {
            page: pagination.currentPage || params.page || 1,
            limit: pagination.itemsPerPage || params.limit || 10,
            total: pagination.totalItems || comments.length,
            totalPages: pagination.totalPage || Math.ceil(comments.length / (params.limit || 10)),
            hasNext: (pagination.currentPage || 1) * (pagination.itemsPerPage || 10) < (pagination.totalItems || comments.length),
            hasPrev: (pagination.currentPage || 1) > 1,
          },
          statistics: {
            totalComments: statistics.totalComments || 0,
            pendingComments: statistics.pendingComments || 0,
            repliedComments: statistics.repliedComments || 0,
            resolvedComments: statistics.resolvedComments || 0,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Fallback to mock data if API fails
      if (USE_MOCK_INSTRUCTOR_API) {
        return mockInstructorApi.getComments(params);
      }
      throw error;
    }
  },

  // Get comment details with replies
  getCommentDetail: async (commentId: string): Promise<CommentDetailResponse> => {
    try {
      const response = await api.get(`/comments/${commentId}`);
      const comment = response.data;
      
      // Get replies
      const repliesResponse = await api.get(`/comments/${commentId}/replies`);
      const replies = repliesResponse.data?.items || [];
      
      return {
        success: true,
        data: {
          comment: {
            id: comment.id,
            content: comment.content,
            studentId: comment.userId,
            studentName: comment.user?.fullName || 'Unknown Student',
            studentAvatar: comment.user?.avatar || '/images/avatar-placeholder.png',
            courseId: comment.lecture?.chapter?.course?.id || '',
            courseName: comment.lecture?.chapter?.course?.name || 'Unknown Course',
            lectureId: comment.lectureId,
            lectureTitle: comment.lecture?.name || 'Unknown Lecture',
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            status: comment.status,
            repliesCount: replies.length,
            lastReplyAt: replies.length > 0 ? replies[replies.length - 1].createdAt : null,
            isInappropriate: false,
            parentCommentId: comment.parentId,
          },
          replies: replies.map((reply: any) => ({
            id: reply.id,
            content: reply.content,
            authorId: reply.userId,
            authorName: reply.user?.fullName || 'Unknown User',
            authorType: 'instructor', // Assuming replies are from instructors
            authorAvatar: reply.user?.avatar || '/images/avatar-placeholder.png',
            createdAt: reply.createdAt,
            updatedAt: reply.updatedAt,
            isEdited: reply.createdAt !== reply.updatedAt,
          })),
        },
      };
    } catch (error) {
      console.error('Error fetching comment detail:', error);
      throw error;
    }
  },

  // Reply to comment
  replyToComment: async (commentId: string, data: ReplyCommentRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/comments/${commentId}/reply`, data);
      return {
        success: true,
        data: response.data,
        message: 'Phản hồi đã được gửi thành công'
      };
    } catch (error) {
      console.error('Error replying to comment:', error);
      if (USE_MOCK_INSTRUCTOR_API) {
        return mockInstructorApi.replyToComment(commentId, data);
      }
      throw error;
    }
  },

  // Update comment status
  updateCommentStatus: async (commentId: string, data: UpdateCommentStatusRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.patch(`/comments/${commentId}/status`, data);
      return {
        success: true,
        data: response.data,
        message: 'Trạng thái bình luận đã được cập nhật'
      };
    } catch (error) {
      console.error('Error updating comment status:', error);
      if (USE_MOCK_INSTRUCTOR_API) {
        return mockInstructorApi.updateCommentStatus(commentId, data);
      }
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Bình luận đã được xóa thành công'
      };
    } catch (error) {
      console.error('Error deleting comment:', error);
      if (USE_MOCK_INSTRUCTOR_API) {
        return mockInstructorApi.deleteComment(commentId);
      }
      throw error;
    }
  }
};

// ============= FEEDBACKS API =============
export const feedbacksApi = {
  // Get feedbacks list
  getFeedbacks: async (params: FeedbackListQuery): Promise<FeedbackListResponse> => {
    try {
      // Use real API endpoint
      const backendParams = {
        page: params.page,
        limit: params.limit,
        courseId: params.courseId,
        // Backend doesn't support search and ratingRange yet, so we filter client-side if needed
      };

      const response = await api.get('/feedbacks/instructor/my-courses', { params: backendParams });
      
      console.log('Feedbacks API response:', response.data);
      
      // Backend returns: { success: boolean, data: { items: Feedback[], pagination: {...} }, message: string }
      const feedbacks = response.data?.data?.items || [];
      const pagination = response.data?.data?.pagination || {};
      
      // Apply client-side filtering if needed
      let filteredFeedbacks = [...feedbacks];
      
      if (params.search) {
        const search = params.search.toLowerCase();
        filteredFeedbacks = filteredFeedbacks.filter(feedback =>
          feedback.content?.toLowerCase().includes(search) ||
          feedback.user?.fullName?.toLowerCase().includes(search) ||
          feedback.course?.name?.toLowerCase().includes(search)
        );
      }
      
      if (params.ratingRange) {
        if (params.ratingRange === 'high') {
          filteredFeedbacks = filteredFeedbacks.filter(f => f.rating >= 4);
        } else if (params.ratingRange === 'low') {
          filteredFeedbacks = filteredFeedbacks.filter(f => f.rating <= 3);
        }
      }

      // Transform backend data to match frontend expectations
      const transformedFeedbacks = filteredFeedbacks.map(feedback => ({
        id: feedback.id,
        rating: feedback.rating,
        comment: feedback.content || '', // Backend uses 'content', frontend expects 'comment'
        studentId: feedback.userId,
        studentName: feedback.user?.fullName || 'Unknown Student',
        studentAvatar: feedback.user?.avatar || '/images/avatar-placeholder.png',
        courseId: feedback.courseId,
        courseName: feedback.course?.name || 'Unknown Course',
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        isReplied: false, // Backend doesn't have this field yet
        reply: undefined, // Backend doesn't have replies yet
        helpfulCount: feedback.like || 0, // Backend uses 'like' field
        isHelpfulByInstructor: false, // Backend doesn't track this yet
        verifiedPurchase: true, // Assume all are verified since they come from enrollments
      }));

      // Calculate statistics
      const totalFeedbacks = feedbacks.length;
      const averageRating = totalFeedbacks > 0 
        ? feedbacks.reduce((acc: number, f: any) => acc + f.rating, 0) / totalFeedbacks 
        : 0;
      const ratingDistribution = {
        1: feedbacks.filter((f: any) => f.rating === 1).length,
        2: feedbacks.filter((f: any) => f.rating === 2).length,
        3: feedbacks.filter((f: any) => f.rating === 3).length,
        4: feedbacks.filter((f: any) => f.rating === 4).length,
        5: feedbacks.filter((f: any) => f.rating === 5).length,
      };

      return {
        success: true,
        data: {
          items: transformedFeedbacks,
          pagination: {
            page: pagination.currentPage || params.page || 1,
            limit: pagination.itemsPerPage || params.limit || 10,
            total: pagination.totalItems || totalFeedbacks,
            totalPages: pagination.totalPage || Math.ceil(totalFeedbacks / (params.limit || 10)),
            hasNext: (pagination.currentPage || 1) * (pagination.itemsPerPage || 10) < (pagination.totalItems || totalFeedbacks),
            hasPrev: (pagination.currentPage || 1) > 1,
          },
          statistics: {
            totalFeedbacks,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
            highRatings: feedbacks.filter((f: any) => f.rating >= 4).length,
            needReply: feedbacks.filter((f: any) => !f.isReplied).length, // All need reply since backend doesn't have replies yet
          },
        },
      };
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      // Fallback to mock data if API fails
      if (USE_MOCK_INSTRUCTOR_API) {
        return mockInstructorApi.getFeedbacks(params);
      }
      throw error;
    }
  },

  // Reply to feedback - placeholder for future implementation
  replyToFeedback: async (feedbackId: string, data: ReplyFeedbackRequest): Promise<ApiResponse<any>> => {
    // Backend doesn't have reply functionality yet, use mock for now
    if (USE_MOCK_INSTRUCTOR_API) {
      return mockInstructorApi.replyToFeedback(feedbackId, data);
    }
    
    // TODO: Implement when backend has reply functionality
    console.log('Reply to feedback not implemented in backend yet:', { feedbackId, data });
    return {
      success: true,
      data: { message: 'Reply functionality coming soon' },
      message: 'Phản hồi sẽ được triển khai sớm'
    };
  },

  // Mark feedback as helpful - use existing like functionality
  markFeedbackHelpful: async (feedbackId: string): Promise<ApiResponse<any>> => {
    try {
      // Use existing like endpoint
      const response = await api.patch(`/feedbacks/${feedbackId}/like`);
      return {
        success: true,
        data: response.data,
        message: 'Đã đánh dấu hữu ích'
      };
    } catch (error) {
      console.error('Error marking feedback helpful:', error);
      if (USE_MOCK_INSTRUCTOR_API) {
        return mockInstructorApi.markFeedbackHelpful(feedbackId);
      }
      throw error;
    }
  }
};

// ============= DOCUMENTS API =============
export const documentsApi = {
  // Get documents list
  getDocuments: async (params: DocumentListQuery): Promise<DocumentListResponse> => {
    try {
      // Use real API endpoint
      const backendParams = {
        page: params.page,
        limit: params.limit,
        entityId: params.courseId, // Backend uses entityId instead of courseId
        // Backend doesn't support search and fileType yet, so we filter client-side if needed
      };

      const response = await api.get('/documents/instructor/my-courses', { params: backendParams });
      
      console.log('Documents API response:', response.data);
      
      // Backend returns: { success: boolean, data: { items: Document[], pagination: {...} }, message: string }
      const documents = response.data?.data?.items || [];
      const pagination = response.data?.data?.pagination || {};
      
      // Get unique course IDs from documents where entityType is 'course'
      const courseIds = [...new Set(
        documents
          .filter((doc: any) => doc.entityType === 'course')
          .map((doc: any) => doc.entityId)
          .filter(Boolean)
      )];

      // Fetch course names for the course IDs
      let courseNamesMap: Record<string, string> = {};
      if (courseIds.length > 0) {
        try {
          const coursesResponse = await api.get('/courses/instructor/my-courses', {
            params: { page: 1, limit: 100 }
          });
          const courses = coursesResponse.data?.data?.items || [];
          courseNamesMap = courses.reduce((acc: Record<string, string>, course: any) => {
            acc[course.id] = course.name || 'Unknown Course';
            return acc;
          }, {});
          console.log('📚 Course names map:', courseNamesMap);
        } catch (error) {
          console.warn('Failed to fetch course names:', error);
        }
      }
      
      // Apply client-side filtering if needed
      let filteredDocuments = [...documents];
      
      if (params.search) {
        const search = params.search.toLowerCase();
        filteredDocuments = filteredDocuments.filter(doc =>
          doc.name?.toLowerCase().includes(search) ||
          doc.descriptions?.toLowerCase().includes(search)
        );
      }
      
      if (params.fileType) {
        // Extract file extension from name or fileUrl
        filteredDocuments = filteredDocuments.filter(doc => {
          const extension = doc.name?.split('.').pop()?.toLowerCase();
          return extension === params.fileType;
        });
      }

      // Helper function to estimate file size from URL
      const estimateFileSize = (fileUrl: string, fileName: string): number => {
        // Estimate based on file extension
        const extension = fileName?.split('.').pop()?.toLowerCase() || '';
        const baseSizes: Record<string, number> = {
          'pdf': 2 * 1024 * 1024,      // 2MB
          'docx': 500 * 1024,          // 500KB
          'doc': 300 * 1024,           // 300KB
          'pptx': 5 * 1024 * 1024,     // 5MB
          'ppt': 3 * 1024 * 1024,      // 3MB
          'xlsx': 200 * 1024,          // 200KB
          'xls': 150 * 1024,           // 150KB
          'png': 1 * 1024 * 1024,      // 1MB
          'jpg': 800 * 1024,           // 800KB
          'jpeg': 800 * 1024,          // 800KB
          'gif': 500 * 1024,           // 500KB
          'zip': 10 * 1024 * 1024,     // 10MB
          'rar': 8 * 1024 * 1024,      // 8MB
          'mp4': 50 * 1024 * 1024,     // 50MB
          'avi': 100 * 1024 * 1024,    // 100MB
          'txt': 50 * 1024,            // 50KB
        };
        
        return baseSizes[extension] || 1 * 1024 * 1024; // Default 1MB
      };

      // Transform backend data to match frontend expectations
      const transformedDocuments = filteredDocuments.map(doc => {
        let courseName = 'Unknown Course';
        let courseId = '';
        
        if (doc.entityType === 'course') {
          // For course documents, use the entityId to get course name
          courseId = doc.entityId;
          courseName = courseNamesMap[doc.entityId] || 'Unknown Course';
        } else if (doc.entityType === 'lecture') {
          // For lecture documents, try to match with course names from descriptions
          const descriptions = doc.descriptions || '';
          const matchedCourse = Object.entries(courseNamesMap).find(([id, name]) => 
            descriptions.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(descriptions.toLowerCase())
          );
          
          if (matchedCourse) {
            courseId = matchedCourse[0];
            courseName = matchedCourse[1];
          } else {
            // If no match found, use the first course as fallback
            const firstCourse = Object.entries(courseNamesMap)[0];
            if (firstCourse) {
              courseId = firstCourse[0];
              courseName = firstCourse[1];
            } else {
              courseName = 'Unknown Course';
            }
          }
        }

        // Estimate file size
        const estimatedSize = estimateFileSize(doc.fileUrl || '', doc.name || '');

        return {
          id: doc.id,
          name: doc.name || 'Unknown Document',
          originalName: doc.name || 'Unknown Document',
          fileType: doc.name?.split('.').pop()?.toLowerCase() || 'unknown',
          mimeType: getMimeType(doc.name?.split('.').pop()?.toLowerCase() || ''),
          size: estimatedSize, // Use estimated size
          url: doc.fileUrl || '#',
          downloadUrl: doc.fileUrl || '#',
          courseId: courseId,
          courseName: courseName,
          lectureId: doc.entityType === 'lecture' ? doc.entityId : null,
          lectureTitle: doc.descriptions || undefined, // Use descriptions for lecture title
          uploadedAt: doc.createdAt,
          downloadCount: 0, // Backend doesn't track downloads yet
          status: 'active' as 'active' | 'archived' | 'processing',
          description: doc.descriptions || '',
        };
      });

      // Calculate statistics
      const totalDocuments = documents.length;
      const totalDownloads = 0; // Backend doesn't track this yet
      const totalSize = 0; // Backend doesn't provide this yet

      return {
        success: true,
        data: {
          items: transformedDocuments,
          pagination: {
            page: pagination.currentPage || params.page || 1,
            limit: pagination.itemsPerPage || params.limit || 10,
            total: pagination.totalItems || totalDocuments,
            totalPages: pagination.totalPage || Math.ceil(totalDocuments / (params.limit || 10)),
            hasNext: (pagination.currentPage || 1) * (pagination.itemsPerPage || 10) < (pagination.totalItems || totalDocuments),
            hasPrev: (pagination.currentPage || 1) > 1,
          },
          statistics: {
            totalDocuments,
            totalDownloads,
            totalSize,
            averageDownloadsPerDocument: 0,
            fileTypeDistribution: transformedDocuments.reduce((acc, doc) => {
              acc[doc.fileType] = (acc[doc.fileType] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
          },
        },
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Fallback to mock data if API fails
      if (USE_MOCK_INSTRUCTOR_API) {
        return mockInstructorApi.getDocuments(params);
      }
      throw error;
    }
  },

  // Upload document - use existing documents API
  uploadDocument: async (
    data: UploadDocumentRequest,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<any>> => {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('entityId', data.courseId); // Backend uses entityId
      formData.append('entityType', data.lectureId ? 'lecture' : 'course'); // Backend uses entityType
      if (data.description) formData.append('descriptions', data.description); // Backend uses 'descriptions'
      if (data.name) formData.append('name', data.name);

      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Tài liệu đã được tải lên thành công'
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Delete document - use existing documents API
  deleteDocument: async (documentId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Tài liệu đã được xóa thành công'
      };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Update document - use existing documents API
  updateDocument: async (documentId: string, data: Partial<UploadDocumentRequest>): Promise<ApiResponse<any>> => {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.descriptions = data.description; // Backend uses 'descriptions'
      
      const response = await api.patch(`/documents/${documentId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Tài liệu đã được cập nhật thành công'
      };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }
};

// ============= STUDENTS API =============
// Import studentsApi directly to avoid circular dependency
import { studentsApi as realStudentsApi, StudentsListResponse } from './studentsApi';

export const studentsApi = {
  // Get students list
  getStudents: async (params: StudentListQuery): Promise<StudentsListResponse> => {
    if (USE_MOCK_INSTRUCTOR_API) {
      return mockInstructorApi.getStudents(params);
    }
    // Use real instructor enrollments API
    return realStudentsApi.getStudents(params);

  },

  // Get student progress detail
  getStudentProgress: async (studentId: string, courseId?: string): Promise<ApiResponse<any>> => {
    return realStudentsApi.getStudentProgress(studentId, courseId);
  },

  // Send message to student
  sendMessageToStudent: async (studentId: string, message: string): Promise<ApiResponse<any>> => {
    return realStudentsApi.sendMessageToStudent(studentId, message);
  }
};

// ============= REVENUE API =============
export const revenueApi = {
  // Get revenue overview
  getRevenue: async (params: RevenueQuery): Promise<RevenueResponse> => {
    if (USE_MOCK_INSTRUCTOR_API) {
      return mockInstructorApi.getRevenue(params);
    }
    // Use real orders API
    const { revenueApi: realRevenueApi } = await import('./revenueApi');
    return realRevenueApi.getRevenue(params) as any;
  },

  // Export revenue report
  exportRevenueReport: async (params: RevenueQuery, format: 'csv' | 'xlsx' = 'xlsx'): Promise<Blob> => {
    const { revenueApi: realRevenueApi } = await import('./revenueApi');
    return realRevenueApi.exportRevenueReport(params, format);
  }
};

// ============= SALES API =============
export const salesApi = {
  // Create or update sale for a course
  createOrUpdateSale: async (courseId: string, saleData: {
    saleType: 'percent' | 'fixed';
    value: number;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<any>> => {
    try {
      // For now, we'll use a mock implementation since the backend endpoint might not exist yet
      console.log('Creating/updating sale:', { courseId, saleData });
      
      // TODO: Replace with actual API call when backend endpoint is ready
      // const response = await api.post(`/courses/${courseId}/sale`, saleData);
      
      // Mock successful response
      return {
        success: true,
        data: {
          id: `sale_${Date.now()}`,
          courseId,
          ...saleData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        message: 'Sale đã được tạo/cập nhật thành công'
      };
    } catch (error) {
      console.error('Error creating/updating sale:', error);
      throw error;
    }
  },

  // Delete sale for a course
  deleteSale: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      console.log('Deleting sale for course:', courseId);
      
      // TODO: Replace with actual API call when backend endpoint is ready
      // const response = await api.delete(`/courses/${courseId}/sale`);
      
      // Mock successful response
      return {
        success: true,
        data: { courseId },
        message: 'Sale đã được xóa thành công'
      };
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  },

  // Get sale details for a course
  getSale: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      console.log('Getting sale for course:', courseId);
      
      // TODO: Replace with actual API call when backend endpoint is ready
      // const response = await api.get(`/courses/${courseId}/sale`);
      
      // Mock response - no sale found
      return {
        success: true,
        data: null,
        message: 'Không có sale nào cho khóa học này'
      };
    } catch (error) {
      console.error('Error getting sale:', error);
      throw error;
    }
  }
};

// ============= HELPER FUNCTIONS =============
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
  };
  return mimeTypes[extension] || 'application/octet-stream';
}

// ============= UTILITY FUNCTIONS =============
export const instructorApiUtils = {
  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format currency
  formatCurrency: (amount: number, currency: string = 'VND'): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // Format date
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get file icon based on type
  getFileTypeIcon: (fileType: string): string => {
    const iconMap: Record<string, string> = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      zip: '📦',
      rar: '📦',
      '7z': '📦'
    };
    return iconMap[fileType.toLowerCase()] || '📄';
  },

  // Validate file upload
  validateFileUpload: (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'pdf', 'doc', 'docx', 'txt', 'rtf',
      'jpg', 'jpeg', 'png', 'gif', 'webp',
      'mp4', 'avi', 'mov', 'wmv',
      'zip', 'rar', '7z'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 100MB limit' };
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return { isValid: false, error: 'File type not supported' };
    }

    return { isValid: true };
  }
};

// Export all APIs
export const instructorApi = {
  comments: commentsApi,
  feedbacks: feedbacksApi,
  documents: documentsApi,
  students: studentsApi,
  revenue: revenueApi,
  sales: salesApi,
  utils: instructorApiUtils
};