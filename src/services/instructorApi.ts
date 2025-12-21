// Instructor API Service - Based on API Contract Specification
// Uses mock data in development mode until backend endpoints are implemented

import { api } from '../lib/api';
import { mockInstructorApi, USE_MOCK_INSTRUCTOR_API } from './mockApi';
import { logger } from '@/utils/logger';
import { apiLogger } from '@/utils/apiLogger';
import { transformPagination, transformResponse, safeNumber, clamp } from './instructorApiHelpers';
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
      // Use real API endpoint - this should only return comments from students enrolled in instructor's courses
      const backendParams = {
        page: params.page,
        limit: params.limit,
        // Note: Backend should automatically filter by instructor's courses
        // lectureId: params.courseId, // Removed - let backend handle instructor filtering
        // Backend doesn't support search and status yet, so we filter client-side if needed
      };

      const startTime = performance.now();
      apiLogger.logRequest('/comments/instructor/my-courses', 'GET', backendParams);
      
      const response = await api.get('/comments/instructor/my-courses', { params: backendParams });
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse('/comments/instructor/my-courses', response.data, duration);
      
      // Backend returns: { message: string, items: Comment[], pagination: {...}, statistics: {...} }
      // Handle different possible response structures
      const responseData = response.data?.data || response.data;
      const comments = responseData?.items || responseData || [];
      const pagination = responseData?.pagination || {};
      const statistics = responseData?.statistics || {};
      
      if (comments.length === 0) {
        logger.debug('No comments received from backend');
        return {
          success: true,
          data: {
            items: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
            statistics: { totalComments: 0, pendingComments: 0, repliedComments: 0, resolvedComments: 0 }
          }
        };
      }
      
      // Get course names if needed
      let coursesMap: Record<string, { id: string; name: string }> = {};

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
      const transformedComments = filteredComments
        .map(comment => {
          // Try multiple possible paths for course info
          let courseId = comment.lecture?.chapter?.course?.id || 
                        comment.course?.id || 
                        comment.courseId || '';
          
          let courseName = comment.lecture?.chapter?.course?.name || 
                          comment.course?.name || 
                          comment.courseName || '';
          
          // If we have courseId but no courseName, look it up
          if (courseId && !courseName && coursesMap[courseId]) {
            courseName = coursesMap[courseId].name;
          }
          
          // If we still don't have course info, try to extract from lecture path
          if (!courseId || !courseName) {
            const lectureCourseId = comment.lecture?.courseId || 
                                   comment.lecture?.course?.id ||
                                   comment.lecture?.chapter?.courseId;
            
            if (lectureCourseId && coursesMap[lectureCourseId]) {
              courseId = lectureCourseId;
              courseName = coursesMap[lectureCourseId].name;
            }
          }
          
          // Final fallback
          if (!courseName) {
            courseName = 'Unknown Course';
          }
          
          if (!courseId) {
            courseId = comment.lectureId || comment.lecture?.id || 'unknown';
          }
          
          // Try multiple possible paths for user info
          const studentName = comment.user?.fullName || 
                             comment.user?.name || 
                             comment.userName || 
                             comment.studentName ||
                             `User ${comment.userId || comment.user?.id || 'Unknown'}`;
          
          const studentAvatar = comment.user?.avatar || 
                               comment.user?.profilePicture || 
                               comment.userAvatar || 
                               '/images/avatar-placeholder.png';
          
          // Try multiple possible paths for lecture info
          const lectureTitle = comment.lecture?.name || 
                              comment.lecture?.title || 
                              comment.lectureTitle || 
                              comment.lectureName || 
                              'Unknown Lecture';
          
          return {
            id: comment.id,
            content: comment.content || '',
            studentId: comment.userId || comment.user?.id || '',
            studentName,
            studentAvatar,
            courseId,
            courseName,
            lectureId: comment.lectureId || comment.lecture?.id || '',
            lectureTitle,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            status: comment.status || 'pending',
            repliesCount: comment.repliesCount || comment.replies?.length || 0,
            lastReplyAt: comment.lastReplyAt || null,
            isInappropriate: false,
            parentCommentId: comment.parentId || comment.parentCommentId || null,
          };
        })
        .filter(comment => {
          // Only filter out comments that are completely invalid
          const isValid = comment.id && comment.content && comment.studentName;
          if (!isValid) {
            logger.warn('Filtering out invalid comment', { id: comment.id });
          }
          return isValid;
        });
      
      return {
        success: true,
        data: {
          items: transformedComments,
          pagination: transformPagination(pagination, params),
          statistics: {
            totalComments: statistics.totalComments || transformedComments.length,
            pendingComments: statistics.pendingComments || transformedComments.filter(c => c.status === 'pending').length,
            repliedComments: statistics.repliedComments || transformedComments.filter(c => c.status === 'replied').length,
            resolvedComments: statistics.resolvedComments || transformedComments.filter(c => c.status === 'resolved').length,
          },
        },
      };
    } catch (error) {
      apiLogger.logError('/comments/instructor/my-courses', error, 'GET');
      logger.apiError('/comments/instructor/my-courses', error);
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
      apiLogger.logRequest(`/comments/${commentId}`, 'GET');
      const startTime = performance.now();
      
      const response = await api.get(`/comments/${commentId}`);
      const comment = response.data;
      
      // Get replies
      apiLogger.logRequest(`/comments/${commentId}/replies`, 'GET');
      const repliesResponse = await api.get(`/comments/${commentId}/replies`);
      const replies = repliesResponse.data?.items || [];
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse(`/comments/${commentId}`, { comment, replies }, duration);
      
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
      apiLogger.logError(`/comments/${commentId}`, error, 'GET');
      logger.apiError(`/comments/${commentId}`, error);
      throw error;
    }
  },

  // Reply to comment
  replyToComment: async (commentId: string, data: ReplyCommentRequest): Promise<ApiResponse<any>> => {
    try {
      apiLogger.logRequest(`/comments/${commentId}/reply`, 'POST', data);
      const startTime = performance.now();
      
      const response = await api.post(`/comments/${commentId}/reply`, data);
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse(`/comments/${commentId}/reply`, response.data, duration);
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Phản hồi đã được gửi thành công'
      };
    } catch (error) {
      apiLogger.logError(`/comments/${commentId}/reply`, error, 'POST');
      logger.apiError(`/comments/${commentId}/reply`, error);
      if (USE_MOCK_INSTRUCTOR_API) {
        return mockInstructorApi.replyToComment(commentId, data);
      }
      throw error;
    }
  },

  // Update comment status
  updateCommentStatus: async (commentId: string, data: UpdateCommentStatusRequest): Promise<ApiResponse<any>> => {
    try {
      apiLogger.logRequest(`/comments/${commentId}/status`, 'PATCH', data);
      const startTime = performance.now();
      
      const response = await api.patch(`/comments/${commentId}/status`, data);
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse(`/comments/${commentId}/status`, response.data, duration);
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Trạng thái bình luận đã được cập nhật'
      };
    } catch (error) {
      apiLogger.logError(`/comments/${commentId}/status`, error, 'PATCH');
      logger.apiError(`/comments/${commentId}/status`, error);
      if (USE_MOCK_INSTRUCTOR_API) {
        return mockInstructorApi.updateCommentStatus(commentId, data);
      }
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId: string): Promise<ApiResponse<any>> => {
    try {
      apiLogger.logRequest(`/comments/${commentId}`, 'DELETE');
      const startTime = performance.now();
      
      const response = await api.delete(`/comments/${commentId}`);
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse(`/comments/${commentId}`, response.data, duration);
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Bình luận đã được xóa thành công'
      };
    } catch (error) {
      apiLogger.logError(`/comments/${commentId}`, error, 'DELETE');
      logger.apiError(`/comments/${commentId} (delete)`, error);
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

      const startTime = performance.now();
      apiLogger.logRequest('/feedbacks/instructor/my-courses', 'GET', backendParams);
      
      const response = await api.get('/feedbacks/instructor/my-courses', { params: backendParams });
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse('/feedbacks/instructor/my-courses', response.data, duration);
      
      // Backend returns: { message: string, items: Feedback[], pagination: {...} }
      const responseData = response.data?.data || response.data;
      const feedbacks = responseData?.items || [];
      const pagination = responseData?.pagination || {};
      
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
      // Validate and clamp ratings to 1-5 range
      const validFeedbacks = feedbacks.filter((f: any) => {
        const rating = safeNumber(f.rating);
        return rating >= 1 && rating <= 5;
      });
      
      const totalFeedbacks = validFeedbacks.length;
      const averageRating = totalFeedbacks > 0 
        ? validFeedbacks.reduce((acc: number, f: any) => {
            const rating = clamp(safeNumber(f.rating), 1, 5);
            return acc + rating;
          }, 0) / totalFeedbacks 
        : 0;
      
      // Clamp averageRating to 0-5 range
      const clampedAverageRating = clamp(averageRating, 0, 5);
      
      const ratingDistribution = {
        1: validFeedbacks.filter((f: any) => Math.round(safeNumber(f.rating)) === 1).length,
        2: validFeedbacks.filter((f: any) => Math.round(safeNumber(f.rating)) === 2).length,
        3: validFeedbacks.filter((f: any) => Math.round(safeNumber(f.rating)) === 3).length,
        4: validFeedbacks.filter((f: any) => Math.round(safeNumber(f.rating)) === 4).length,
        5: validFeedbacks.filter((f: any) => Math.round(safeNumber(f.rating)) === 5).length,
      };

      return {
        success: true,
        data: {
          items: transformedFeedbacks,
          pagination: transformPagination(pagination, params),
          statistics: {
            totalFeedbacks,
            averageRating: Math.round(clampedAverageRating * 10) / 10,
            ratingDistribution,
            highRatings: validFeedbacks.filter((f: any) => {
              const rating = safeNumber(f.rating);
              return rating >= 4 && rating <= 5;
            }).length,
            needReply: validFeedbacks.filter((f: any) => !f.isReplied).length,
          },
        },
      };
    } catch (error) {
      apiLogger.logError('/feedbacks/instructor/my-courses', error, 'GET');
      logger.apiError('/feedbacks/instructor/my-courses', error);
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
    logger.warn('Reply to feedback not implemented in backend yet', { feedbackId });
    return {
      success: true,
      data: { message: 'Reply functionality coming soon' },
      message: 'Phản hồi sẽ được triển khai sớm'
    };
  },

  // Mark feedback as helpful - use existing like functionality
  markFeedbackHelpful: async (feedbackId: string): Promise<ApiResponse<any>> => {
    try {
      apiLogger.logRequest(`/feedbacks/${feedbackId}/like`, 'PATCH');
      const startTime = performance.now();
      
      // Use existing like endpoint
      const response = await api.patch(`/feedbacks/${feedbackId}/like`);
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse(`/feedbacks/${feedbackId}/like`, response.data, duration);
      
      return {
        success: true,
        data: response.data,
        message: 'Đã đánh dấu hữu ích'
      };
    } catch (error) {
      apiLogger.logError(`/feedbacks/${feedbackId}/like`, error, 'PATCH');
      logger.apiError(`/feedbacks/${feedbackId}/like`, error);
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

      const startTime = performance.now();
      apiLogger.logRequest('/documents/instructor/my-courses', 'GET', backendParams);
      
      const response = await api.get('/documents/instructor/my-courses', { params: backendParams });
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse('/documents/instructor/my-courses', response.data, duration);
      
      // Backend returns: { message: string, items: Document[], pagination: {...} }
      const responseData = response.data?.data || response.data;
      const documents = responseData?.items || [];
      const pagination = responseData?.pagination || {};
      
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
        } catch (error) {
          logger.warn('Failed to fetch course names', error);
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

        return {
          id: doc.id,
          name: doc.name || 'Unknown Document',
          originalName: doc.name || 'Unknown Document',
          fileType: doc.name?.split('.').pop()?.toLowerCase() || 'unknown',
          mimeType: getMimeType(doc.name?.split('.').pop()?.toLowerCase() || ''),
          size: doc.size || 0, // Use actual size from backend
          url: doc.fileUrl || '#',
          downloadUrl: doc.fileUrl || '#',
          courseId: courseId,
          courseName: courseName,
          lectureId: doc.entityType === 'lecture' ? doc.entityId : null,
          lectureTitle: doc.descriptions || undefined, // Use descriptions for lecture title
          uploadedAt: doc.createdAt,
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
          items: transformedDocuments.map(doc => ({
            ...doc,
            downloadCount: 0, // Added to satisfy Document type requirements
          })),
          pagination: transformPagination(pagination, params),
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
      apiLogger.logError('/documents/instructor/my-courses', error, 'GET');
      logger.apiError('/documents/instructor/my-courses', error);
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
      apiLogger.logRequest('/documents', 'POST', {
        courseId: data.courseId,
        lectureId: data.lectureId,
        fileName: data.file.name,
        fileSize: data.file.size,
      });
      const startTime = performance.now();
      
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
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse('/documents', response.data, duration);
      
      return {
        success: true,
        data: response.data,
        message: 'Tài liệu đã được tải lên thành công'
      };
    } catch (error) {
      apiLogger.logError('/documents', error, 'POST');
      logger.apiError('/documents (upload)', error);
      throw error;
    }
  },

  // Delete document - use existing documents API
  deleteDocument: async (documentId: string): Promise<ApiResponse<any>> => {
    try {
      apiLogger.logRequest(`/documents/${documentId}`, 'DELETE');
      const startTime = performance.now();
      
      const response = await api.delete(`/documents/${documentId}`);
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse(`/documents/${documentId}`, response.data, duration);
      
      return {
        success: true,
        data: response.data,
        message: 'Tài liệu đã được xóa thành công'
      };
    } catch (error) {
      apiLogger.logError(`/documents/${documentId}`, error, 'DELETE');
      logger.apiError(`/documents/${documentId} (delete)`, error);
      throw error;
    }
  },

  // Update document - use existing documents API
  updateDocument: async (documentId: string, data: Partial<UploadDocumentRequest>): Promise<ApiResponse<any>> => {
    try {
      apiLogger.logRequest(`/documents/${documentId}`, 'PATCH', data);
      const startTime = performance.now();
      
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.descriptions = data.description; // Backend uses 'descriptions'
      
      const response = await api.patch(`/documents/${documentId}`, updateData);
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse(`/documents/${documentId}`, response.data, duration);
      
      return {
        success: true,
        data: response.data,
        message: 'Tài liệu đã được cập nhật thành công'
      };
    } catch (error) {
      apiLogger.logError(`/documents/${documentId}`, error, 'PATCH');
      logger.apiError(`/documents/${documentId} (update)`, error);
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
      logger.debug('Creating/updating sale', { courseId });
      
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
      logger.apiError(`/courses/${courseId}/sale (create/update)`, error);
      throw error;
    }
  },

  // Delete sale for a course
  deleteSale: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Deleting sale for course', { courseId });
      
      // TODO: Replace with actual API call when backend endpoint is ready
      // const response = await api.delete(`/courses/${courseId}/sale`);
      
      // Mock successful response
      return {
        success: true,
        data: { courseId },
        message: 'Sale đã được xóa thành công'
      };
    } catch (error) {
      logger.apiError(`/courses/${courseId}/sale (delete)`, error);
      throw error;
    }
  },

  // Get sale details for a course
  getSale: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Getting sale for course', { courseId });
      
      // TODO: Replace with actual API call when backend endpoint is ready
      // const response = await api.get(`/courses/${courseId}/sale`);
      
      // Mock response - no sale found
      return {
        success: true,
        data: null,
        message: 'Không có sale nào cho khóa học này'
      };
    } catch (error) {
      logger.apiError(`/courses/${courseId}/sale (get)`, error);
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