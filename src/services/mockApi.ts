// Mock API Service - For development testing

import type {
  CommentListResponse,
  FeedbackListResponse,
  DocumentListResponse,
  StudentListResponse,
  RevenueResponse,
  Comment,
  Feedback,
  Document,
  Student,
  ApiResponse
} from '@/types/instructor';

// Mock data
const mockComments: Comment[] = [
  {
    id: "1",
    content: "Bài giảng này rất hay, nhưng tôi có một câu hỏi về phần React Hooks. Có thể giải thích thêm không?",
    studentId: "student-1",
    studentName: "Nguyễn Văn A",
    studentAvatar: "/images/avatar-placeholder.png",
    courseId: "course-1",
    courseName: "React Native từ A-Z",
    lectureId: "lecture-1",
    lectureTitle: "Bài 3: React Hooks cơ bản",
    createdAt: "2024-12-14T10:30:00Z",
    updatedAt: "2024-12-14T10:30:00Z",
    status: "pending",
    repliesCount: 0,
    isInappropriate: false
  },
  {
    id: "2",
    content: "Code example không chạy được trên máy tôi. Có thể do version khác nhau không?",
    studentId: "student-2",
    studentName: "Trần Thị B",
    studentAvatar: "/images/avatar-placeholder.png",
    courseId: "course-2",
    courseName: "JavaScript Advanced",
    lectureId: "lecture-2",
    lectureTitle: "Bài 5: Async/Await",
    createdAt: "2024-12-13T15:45:00Z",
    updatedAt: "2024-12-13T16:00:00Z",
    status: "replied",
    repliesCount: 2,
    lastReplyAt: "2024-12-13T16:00:00Z",
    isInappropriate: false
  },
  {
    id: "3",
    content: "Cảm ơn thầy đã giải thích rất chi tiết. Bây giờ tôi đã hiểu rõ hơn về concept này.",
    studentId: "student-3",
    studentName: "Lê Văn C",
    studentAvatar: "/images/avatar-placeholder.png",
    courseId: "course-3",
    courseName: "Node.js Backend",
    lectureId: "lecture-3",
    lectureTitle: "Bài 7: Database Integration",
    createdAt: "2024-12-12T09:20:00Z",
    updatedAt: "2024-12-12T10:00:00Z",
    status: "resolved",
    repliesCount: 1,
    lastReplyAt: "2024-12-12T10:00:00Z",
    isInappropriate: false
  }
];

const mockFeedbacks: Feedback[] = [
  {
    id: "1",
    rating: 5,
    comment: "Khóa học tuyệt vời! Giảng viên giải thích rất rõ ràng và dễ hiểu. Nội dung cập nhật và thực tế.",
    studentId: "student-1",
    studentName: "Nguyễn Văn A",
    studentAvatar: "/images/avatar-placeholder.png",
    courseId: "course-1",
    courseName: "React Native từ A-Z",
    createdAt: "2024-12-14T10:30:00Z",
    updatedAt: "2024-12-14T10:30:00Z",
    isReplied: false,
    helpfulCount: 8,
    isHelpfulByInstructor: false,
    verifiedPurchase: true
  },
  {
    id: "2",
    rating: 4,
    comment: "Nội dung hay nhưng có một số phần hơi khó hiểu. Mong thầy có thể giải thích thêm.",
    studentId: "student-2",
    studentName: "Trần Thị B",
    studentAvatar: "/images/avatar-placeholder.png",
    courseId: "course-2",
    courseName: "JavaScript Advanced",
    createdAt: "2024-12-13T15:45:00Z",
    updatedAt: "2024-12-13T16:00:00Z",
    isReplied: true,
    reply: {
      id: "reply-1",
      content: "Cảm ơn bạn đã đánh giá. Tôi sẽ cập nhật thêm ví dụ để dễ hiểu hơn.",
      instructorId: "instructor-1",
      instructorName: "Giảng viên ABC",
      createdAt: "2024-12-13T16:00:00Z",
      updatedAt: "2024-12-13T16:00:00Z",
      isEdited: false
    },
    helpfulCount: 5,
    isHelpfulByInstructor: true,
    verifiedPurchase: true
  },
  {
    id: "3",
    rating: 5,
    comment: "Rất hài lòng với khóa học. Code examples rất hữu ích và có thể áp dụng ngay vào công việc.",
    studentId: "student-3",
    studentName: "Lê Văn C",
    studentAvatar: "/images/avatar-placeholder.png",
    courseId: "course-3",
    courseName: "Node.js Backend",
    createdAt: "2024-12-12T09:20:00Z",
    updatedAt: "2024-12-12T09:20:00Z",
    isReplied: true,
    reply: {
      id: "reply-2",
      content: "Rất vui khi biết khóa học hữu ích cho công việc của bạn!",
      instructorId: "instructor-1",
      instructorName: "Giảng viên ABC",
      createdAt: "2024-12-12T10:00:00Z",
      updatedAt: "2024-12-12T10:00:00Z",
      isEdited: false
    },
    helpfulCount: 12,
    isHelpfulByInstructor: false,
    verifiedPurchase: true
  }
];

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "React Native Fundamentals.pdf",
    originalName: "react-native-fundamentals.pdf",
    fileType: "pdf",
    mimeType: "application/pdf",
    size: 2621440, // 2.5 MB in bytes
    url: "/documents/react-native-fundamentals.pdf",
    downloadUrl: "/api/documents/1/download",
    courseId: "course-1",
    courseName: "React Native từ A-Z",
    lectureId: "lecture-1",
    lectureTitle: "Bài 1: Giới thiệu React Native",
    uploadedAt: "2024-12-14T10:30:00Z",
    downloadCount: 45,
    status: "active",
    description: "Tài liệu cơ bản về React Native"
  },
  {
    id: "2",
    name: "JavaScript ES6 Cheat Sheet.pdf",
    originalName: "js-es6-cheat-sheet.pdf",
    fileType: "pdf",
    mimeType: "application/pdf",
    size: 1887436, // 1.8 MB in bytes
    url: "/documents/js-es6-cheat-sheet.pdf",
    downloadUrl: "/api/documents/2/download",
    courseId: "course-2",
    courseName: "JavaScript Advanced",
    lectureId: "lecture-2",
    lectureTitle: "Bài 2: ES6 Features",
    uploadedAt: "2024-12-13T15:45:00Z",
    downloadCount: 67,
    status: "active"
  },
  {
    id: "3",
    name: "API Design Guidelines.docx",
    originalName: "api-design-guidelines.docx",
    fileType: "docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 911360, // 890 KB in bytes
    url: "/documents/api-design-guidelines.docx",
    downloadUrl: "/api/documents/3/download",
    courseId: "course-3",
    courseName: "Node.js Backend",
    lectureId: "lecture-3",
    lectureTitle: "Bài 5: RESTful API Design",
    uploadedAt: "2024-12-12T09:20:00Z",
    downloadCount: 23,
    status: "active"
  }
];

const mockStudents: Student[] = [
  {
    id: "student-1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    avatar: "/images/avatar-placeholder.png",
    joinDate: "2024-11-15T00:00:00Z",
    lastActivity: "2024-12-14T08:30:00Z",
    status: "active",
    enrollments: [
      {
        enrollmentId: "enroll-1",
        courseId: "course-1",
        courseName: "React Native từ A-Z",
        enrolledAt: "2024-11-15T00:00:00Z",
        progress: 65,
        lastAccessedAt: "2024-12-14T08:30:00Z",
        status: "enrolled",
        timeSpent: 1200, // 20 hours
        completedLectures: 13,
        totalLectures: 20
      }
    ],
    totalEnrolledCourses: 3,
    totalCompletedCourses: 1,
    averageProgress: 65,
    totalTimeSpent: 3600, // 60 hours
    totalCertificatesEarned: 1
  },
  {
    id: "student-2",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    avatar: "/images/avatar-placeholder.png",
    joinDate: "2024-11-10T00:00:00Z",
    lastActivity: "2024-12-13T14:20:00Z",
    status: "active",
    enrollments: [
      {
        enrollmentId: "enroll-2",
        courseId: "course-2",
        courseName: "JavaScript Advanced",
        enrolledAt: "2024-11-10T00:00:00Z",
        progress: 100,
        completedAt: "2024-12-01T00:00:00Z",
        lastAccessedAt: "2024-12-13T14:20:00Z",
        status: "completed",
        timeSpent: 1800, // 30 hours
        completedLectures: 25,
        totalLectures: 25,
        grade: 95
      }
    ],
    totalEnrolledCourses: 2,
    totalCompletedCourses: 2,
    averageProgress: 100,
    totalTimeSpent: 4200, // 70 hours
    totalCertificatesEarned: 2
  }
];

// Mock API functions with delay to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockInstructorApi = {
  // Comments API
  getComments: async (params: any): Promise<CommentListResponse> => {
    await delay(500); // Simulate network delay
    
    let filteredComments = [...mockComments];
    
    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredComments = filteredComments.filter(comment =>
        comment.content.toLowerCase().includes(search) ||
        comment.studentName.toLowerCase().includes(search) ||
        comment.courseName.toLowerCase().includes(search)
      );
    }
    
    if (params.status && params.status !== 'all') {
      filteredComments = filteredComments.filter(comment => comment.status === params.status);
    }
    
    if (params.courseId) {
      filteredComments = filteredComments.filter(comment => comment.courseId === params.courseId);
    }
    
    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = filteredComments.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        items: paginatedComments,
        pagination: {
          page,
          limit,
          total: filteredComments.length,
          totalPages: Math.ceil(filteredComments.length / limit),
          hasNext: endIndex < filteredComments.length,
          hasPrev: page > 1
        },
        statistics: {
          totalComments: mockComments.length,
          pendingComments: mockComments.filter(c => c.status === 'pending').length,
          repliedComments: mockComments.filter(c => c.status === 'replied').length,
          resolvedComments: mockComments.filter(c => c.status === 'resolved').length
        }
      }
    };
  },

  replyToComment: async (commentId: string, data: { content: string }): Promise<ApiResponse<any>> => {
    await delay(300);
    
    // Find and update comment
    const commentIndex = mockComments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      mockComments[commentIndex].status = 'replied';
      mockComments[commentIndex].repliesCount += 1;
      mockComments[commentIndex].lastReplyAt = new Date().toISOString();
    }
    
    return {
      success: true,
      data: { message: 'Reply sent successfully' },
      message: 'Đã gửi phản hồi thành công'
    };
  },

  updateCommentStatus: async (commentId: string, data: { status: string }): Promise<ApiResponse<any>> => {
    await delay(200);
    
    const commentIndex = mockComments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      mockComments[commentIndex].status = data.status as any;
      mockComments[commentIndex].updatedAt = new Date().toISOString();
    }
    
    return {
      success: true,
      data: { message: 'Status updated successfully' },
      message: 'Đã cập nhật trạng thái'
    };
  },

  deleteComment: async (commentId: string): Promise<ApiResponse<any>> => {
    await delay(200);
    
    const commentIndex = mockComments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      mockComments.splice(commentIndex, 1);
    }
    
    return {
      success: true,
      data: { message: 'Comment deleted successfully' },
      message: 'Đã xóa bình luận'
    };
  },

  // Feedbacks API
  getFeedbacks: async (params: any): Promise<FeedbackListResponse> => {
    await delay(500);
    
    let filteredFeedbacks = [...mockFeedbacks];
    
    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredFeedbacks = filteredFeedbacks.filter(feedback =>
        feedback.comment.toLowerCase().includes(search) ||
        feedback.studentName.toLowerCase().includes(search) ||
        feedback.courseName.toLowerCase().includes(search)
      );
    }
    
    if (params.ratingRange) {
      if (params.ratingRange === 'high') {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.rating >= 4);
      } else if (params.ratingRange === 'low') {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.rating <= 3);
      }
    }
    
    if (params.courseId) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.courseId === params.courseId);
    }
    
    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);
    
    // Calculate statistics
    const totalFeedbacks = mockFeedbacks.length;
    const averageRating = mockFeedbacks.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacks;
    const ratingDistribution = {
      1: mockFeedbacks.filter(f => f.rating === 1).length,
      2: mockFeedbacks.filter(f => f.rating === 2).length,
      3: mockFeedbacks.filter(f => f.rating === 3).length,
      4: mockFeedbacks.filter(f => f.rating === 4).length,
      5: mockFeedbacks.filter(f => f.rating === 5).length,
    };
    
    return {
      success: true,
      data: {
        items: paginatedFeedbacks,
        pagination: {
          page,
          limit,
          total: filteredFeedbacks.length,
          totalPages: Math.ceil(filteredFeedbacks.length / limit),
          hasNext: endIndex < filteredFeedbacks.length,
          hasPrev: page > 1
        },
        statistics: {
          totalFeedbacks,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution,
          highRatings: mockFeedbacks.filter(f => f.rating >= 4).length,
          needReply: mockFeedbacks.filter(f => !f.isReplied).length
        }
      }
    };
  },

  replyToFeedback: async (feedbackId: string, data: { content: string }): Promise<ApiResponse<any>> => {
    await delay(300);
    
    const feedbackIndex = mockFeedbacks.findIndex(f => f.id === feedbackId);
    if (feedbackIndex !== -1) {
      mockFeedbacks[feedbackIndex].isReplied = true;
      mockFeedbacks[feedbackIndex].reply = {
        id: `reply-${Date.now()}`,
        content: data.content,
        instructorId: "instructor-1",
        instructorName: "Giảng viên ABC",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEdited: false
      };
    }
    
    return {
      success: true,
      data: { message: 'Reply sent successfully' },
      message: 'Đã gửi phản hồi thành công'
    };
  },

  markFeedbackHelpful: async (feedbackId: string): Promise<ApiResponse<any>> => {
    await delay(200);
    
    const feedbackIndex = mockFeedbacks.findIndex(f => f.id === feedbackId);
    if (feedbackIndex !== -1) {
      mockFeedbacks[feedbackIndex].isHelpfulByInstructor = !mockFeedbacks[feedbackIndex].isHelpfulByInstructor;
      if (mockFeedbacks[feedbackIndex].isHelpfulByInstructor) {
        mockFeedbacks[feedbackIndex].helpfulCount += 1;
      } else {
        mockFeedbacks[feedbackIndex].helpfulCount -= 1;
      }
    }
    
    return {
      success: true,
      data: { message: 'Marked as helpful' },
      message: 'Đã đánh dấu hữu ích'
    };
  },

  // Documents API
  getDocuments: async (params: any): Promise<DocumentListResponse> => {
    await delay(500);
    
    let filteredDocuments = [...mockDocuments];
    
    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.name.toLowerCase().includes(search) ||
        doc.courseName.toLowerCase().includes(search) ||
        (doc.lectureTitle && doc.lectureTitle.toLowerCase().includes(search))
      );
    }
    
    if (params.fileType) {
      filteredDocuments = filteredDocuments.filter(doc => doc.fileType === params.fileType);
    }
    
    if (params.courseId) {
      filteredDocuments = filteredDocuments.filter(doc => doc.courseId === params.courseId);
    }
    
    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);
    
    // Calculate statistics
    const totalDocuments = mockDocuments.length;
    const totalDownloads = mockDocuments.reduce((acc, doc) => acc + doc.downloadCount, 0);
    const totalSize = mockDocuments.reduce((acc, doc) => acc + doc.size, 0);
    
    return {
      success: true,
      data: {
        items: paginatedDocuments,
        pagination: {
          page,
          limit,
          total: filteredDocuments.length,
          totalPages: Math.ceil(filteredDocuments.length / limit),
          hasNext: endIndex < filteredDocuments.length,
          hasPrev: page > 1
        },
        statistics: {
          totalDocuments,
          totalDownloads,
          totalSize,
          averageDownloadsPerDocument: Math.round(totalDownloads / totalDocuments),
          fileTypeDistribution: mockDocuments.reduce((acc, doc) => {
            acc[doc.fileType] = (acc[doc.fileType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      }
    };
  },

  // Students API
  getStudents: async (params: any): Promise<StudentListResponse> => {
    await delay(500);
    
    let filteredStudents = [...mockStudents];
    
    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredStudents = filteredStudents.filter(student =>
        student.name.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search)
      );
    }
    
    if (params.status && params.status !== 'all') {
      filteredStudents = filteredStudents.filter(student => student.status === params.status);
    }
    
    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
    
    // Calculate statistics
    const totalStudents = mockStudents.length;
    const activeStudents = mockStudents.filter(s => s.status === 'active').length;
    const averageProgress = mockStudents.reduce((acc, s) => acc + s.averageProgress, 0) / totalStudents;
    const totalEnrollments = mockStudents.reduce((acc, s) => acc + s.totalEnrolledCourses, 0);
    const completedCourses = mockStudents.reduce((acc, s) => acc + s.totalCompletedCourses, 0);
    
    return {
      success: true,
      data: {
        items: paginatedStudents,
        pagination: {
          page,
          limit,
          total: filteredStudents.length,
          totalPages: Math.ceil(filteredStudents.length / limit),
          hasNext: endIndex < filteredStudents.length,
          hasPrev: page > 1
        },
        statistics: {
          totalStudents,
          activeStudents,
          averageProgress: Math.round(averageProgress),
          totalEnrollments,
          completionRate: Math.round((completedCourses / totalEnrollments) * 100)
        }
      }
    };
  },

  // Revenue API
  getRevenue: async (params: any): Promise<RevenueResponse> => {
    await delay(800);
    
    // Mock revenue data
    const mockTransactions = [
      {
        id: "txn-1",
        studentId: "student-1",
        studentName: "Nguyễn Văn A",
        studentEmail: "nguyenvana@email.com",
        courseId: "course-1",
        courseName: "React Native từ A-Z",
        amount: 299000,
        currency: "VND",
        grossAmount: 299000,
        platformFee: 29900,
        instructorEarning: 269100,
        status: "completed" as const,
        paymentMethod: "credit_card",
        paymentProvider: "VNPay",
        transactionDate: "2024-12-14T10:30:00Z",
        completedAt: "2024-12-14T10:31:00Z",
        transactionFee: 8970
      },
      {
        id: "txn-2",
        studentId: "student-2",
        studentName: "Trần Thị B",
        studentEmail: "tranthib@email.com",
        courseId: "course-2",
        courseName: "JavaScript Advanced",
        amount: 399000,
        currency: "VND",
        grossAmount: 399000,
        platformFee: 39900,
        instructorEarning: 359100,
        status: "completed" as const,
        paymentMethod: "e_wallet",
        paymentProvider: "Momo",
        transactionDate: "2024-12-13T15:45:00Z",
        completedAt: "2024-12-13T15:46:00Z",
        transactionFee: 11970
      }
    ];
    
    const summary = {
      totalRevenue: 45000000,
      totalGrossRevenue: 47000000,
      platformFees: 2000000,
      netRevenue: 43000000,
      totalTransactions: 156,
      totalRefunds: 3,
      refundAmount: 897000,
      averageOrderValue: 288461,
      currency: "VND",
      period: {
        startDate: params.startDate || "2024-01-01",
        endDate: params.endDate || "2024-12-14"
      }
    };
    
    const courseRevenue = [
      {
        courseId: "course-1",
        courseName: "React Native từ A-Z",
        coursePrice: 299000,
        totalRevenue: 15000000,
        totalEnrollments: 50,
        totalRefunds: 1,
        refundAmount: 299000,
        netRevenue: 14701000,
        averageRevenuePerStudent: 300000,
        conversionRate: 0.15,
        period: {
          firstSale: "2024-01-15T00:00:00Z",
          lastSale: "2024-12-14T10:30:00Z"
        }
      }
    ];
    
    const revenueChart = [
      { period: "2024-12-01", revenue: 1200000, transactions: 4, refunds: 0, netRevenue: 1080000 },
      { period: "2024-12-02", revenue: 800000, transactions: 3, refunds: 0, netRevenue: 720000 },
      { period: "2024-12-03", revenue: 1500000, transactions: 5, refunds: 299000, netRevenue: 901000 }
    ];
    
    return {
      success: true,
      data: {
        summary,
        transactions: mockTransactions,
        courseRevenue,
        revenueChart
      }
    };
  }
};

// Flag to enable/disable mock API
export const USE_MOCK_API = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

// Flag specifically for instructor APIs (force mock until backend is ready)
// This ensures instructor features work in development even when NEXT_PUBLIC_API_URL is set
// Set to false to use real API with seeded data
export const USE_MOCK_INSTRUCTOR_API = false; // Changed to false to use real API with seeded data