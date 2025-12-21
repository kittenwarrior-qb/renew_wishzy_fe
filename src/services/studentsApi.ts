// Students API Service - Using real backend endpoints
import { api } from '../lib/api';
import { logger } from '@/utils/logger';
import { apiLogger } from '@/utils/apiLogger';
import { transformPagination } from './instructorApiHelpers';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'not_started' | 'ongoing' | 'completed';
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  certificateUrl?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  course?: {
    id: string;
    title: string;
    thumbnail?: string;
    price: number;
  };
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  lastActivity: string;
  status: 'active' | 'inactive';
  enrollments: StudentEnrollment[];
  totalEnrolledCourses: number;
  totalCompletedCourses: number;
  averageProgress: number;
  totalTimeSpent: number;
  totalCertificatesEarned: number;
}

export interface StudentEnrollment {
  enrollmentId: string;
  courseId: string;
  courseName: string;
  enrolledAt: string;
  progress: number;
  completedAt?: string;
  lastAccessedAt: string;
  status: 'enrolled' | 'completed' | 'dropped' | 'expired';
  timeSpent: number;
  completedLectures: number;
  totalLectures: number;
  grade?: number;
}

export interface StudentsListResponse {
  success: boolean;
  data: {
    items: Student[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    statistics: {
      totalStudents: number;
      activeStudents: number;
      averageProgress: number;
      totalEnrollments: number;
      completionRate: number;
    };
  };
}

export interface StudentsListQuery {
  page?: number;
  limit?: number;
  courseId?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============= STUDENTS API =============
export const studentsApi = {
  // Get students list (enrollments for instructor's courses)
  getStudents: async (params: StudentsListQuery): Promise<StudentsListResponse> => {
    try {
      // Use new instructor enrollments API
      const backendParams = {
        page: params.page,
        limit: params.limit,
        courseId: params.courseId,
        status: params.status,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      };

      const startTime = performance.now();
      apiLogger.logRequest('/instructor/enrollments', 'GET', backendParams);
      
      const response = await api.get('/instructor/enrollments', { params: backendParams });

      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse('/instructor/enrollments', response.data, duration);

      // Backend returns: { success, data: { items, pagination, statistics }, message }
      const backendData = response.data?.data?.data;
      const enrollments = backendData?.items || [];
      const pagination = backendData?.pagination || {};
      const backendStatistics = backendData?.statistics || {};

      // Group enrollments by userId to aggregate data per student
      // Note: API returns enrollments (1 student can have multiple enrollments)
      // We need to group by userId to get unique students
      const studentsMap = new Map<string, any>();

      enrollments.forEach((enrollment: Enrollment) => {
        const userId = enrollment.userId;

        if (!studentsMap.has(userId)) {
          // Create new student entry
          studentsMap.set(userId, {
            id: userId,
            name: enrollment.user?.fullName || 'Unknown',
            email: enrollment.user?.email || '',
            avatar: enrollment.user?.avatar || '',
            enrollments: [],
            totalEnrolledCourses: 0,
            totalCompletedCourses: 0,
            totalProgress: 0,
            lastActivity: enrollment.enrolledAt,
            joinDate: enrollment.enrolledAt,
            status: 'active'
          });
        }

        const student = studentsMap.get(userId);
        student.enrollments.push(enrollment);
        student.totalEnrolledCourses++;

        if (enrollment.status === 'completed') {
          student.totalCompletedCourses++;
        }

        student.totalProgress += (enrollment.progress || 0);

        // Update last activity to most recent
        if (new Date(enrollment.enrolledAt) > new Date(student.lastActivity)) {
          student.lastActivity = enrollment.enrolledAt;
        }

        // Update join date to earliest
        if (new Date(enrollment.enrolledAt) < new Date(student.joinDate)) {
          student.joinDate = enrollment.enrolledAt;
        }
      });

      // Transform to array and calculate average progress
      const transformedStudents = Array.from(studentsMap.values()).map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        enrollments: student.enrollments.map((e: Enrollment) => ({
          enrollmentId: e.id,
          courseId: e.courseId,
          courseName: e.course?.title || 'Unknown Course',
          enrolledAt: e.enrolledAt,
          progress: e.progress || 0,
          completedAt: e.completedAt,
          lastAccessedAt: e.enrolledAt, // Use enrolledAt as fallback
          status: e.status === 'completed' ? 'completed' :
                  e.status === 'ongoing' ? 'enrolled' : 'enrolled',
          timeSpent: 0, // Not available from BE
          completedLectures: 0, // Not available from BE
          totalLectures: 0, // Not available from BE
          grade: undefined
        })),
        totalEnrolledCourses: student.totalEnrolledCourses,
        totalCompletedCourses: student.totalCompletedCourses,
        averageProgress: student.totalEnrolledCourses > 0
          ? Math.round(student.totalProgress / student.totalEnrolledCourses)
          : 0,
        lastActivity: student.lastActivity,
        joinDate: student.joinDate,
        status: (student.totalEnrolledCourses > student.totalCompletedCourses ? 'active' : 'inactive') as 'active' | 'inactive',
        totalTimeSpent: 0, // Not available from BE
        totalCertificatesEarned: 0 // Not available from BE
      }));

      // Calculate correct pagination based on unique students, not enrollments
      const totalUniqueStudents = transformedStudents.length;
      const correctedPagination = {
        page: params.page || 1,
        limit: params.limit || 10,
        total: totalUniqueStudents, // Use unique students count, not enrollments count
        totalPages: Math.ceil(totalUniqueStudents / (params.limit || 10)),
        hasNext: (params.page || 1) < Math.ceil(totalUniqueStudents / (params.limit || 10)),
        hasPrev: (params.page || 1) > 1
      };

      return {
        success: true,
        data: {
          items: transformedStudents,
          pagination: correctedPagination, // Use corrected pagination
          statistics: {
            totalStudents: totalUniqueStudents, // Use unique students count
            activeStudents: backendStatistics.activeStudents || transformedStudents.filter(s => s.status === 'active').length,
            averageProgress: Math.round(backendStatistics.averageProgress || 0),
            totalEnrollments: enrollments.length, // Keep original enrollments count for reference
            completionRate: enrollments.length > 0
              ? Math.round((enrollments.filter((e: Enrollment) => e.status === 'completed').length / enrollments.length) * 100)
              : 0
          },
        },
      };
    } catch (error) {
      apiLogger.logError('/instructor/enrollments', error, 'GET');
      logger.apiError('/instructor/enrollments', error);
      throw error;
    }
  },

  // Get student progress detail
  getStudentProgress: async (studentId: string, courseId?: string) => {
    try {
      const params = courseId ? { courseId } : {};
      apiLogger.logRequest(`/enrollments/user/${studentId}`, 'GET', params);
      const startTime = performance.now();
      
      const response = await api.get(`/enrollments/user/${studentId}`, { params });
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse(`/enrollments/user/${studentId}`, response.data, duration);
      
      return response.data;
    } catch (error) {
      apiLogger.logError(`/enrollments/user/${studentId}`, error, 'GET');
      logger.apiError(`/enrollments/user/${studentId}`, error);
      throw error;
    }
  },

  // Send message to student (placeholder - would need messaging system)
  sendMessageToStudent: async (studentId: string, message: string) => {
    try {
      apiLogger.logRequest(`/instructor/students/${studentId}/message`, 'POST', { message });
      // This would need a messaging/notification system
      // For now, just return success
      return {
        success: true,
        data: { messageId: 'mock-message-id' },
        message: 'Message sent successfully',
      };
    } catch (error) {
      apiLogger.logError(`/instructor/students/${studentId}/message`, error, 'POST');
      logger.apiError(`/instructor/students/${studentId}/message`, error);
      throw error;
    }
  },
};