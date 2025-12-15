// Instructor Management Types - Based on API Contract Specification

// ============= COMMON TYPES =============
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<{
  items: T[];
  pagination: PaginationMeta;
}> {}

// ============= COMMENTS TYPES =============
export interface Comment {
  id: string;
  content: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  courseId: string;
  courseName: string;
  lectureId?: string;
  lectureTitle?: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'replied' | 'resolved';
  repliesCount: number;
  lastReplyAt?: string;
  isInappropriate: boolean;
  parentCommentId?: string;
}

export interface CommentReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorType: 'instructor' | 'student';
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

export interface CommentListQuery {
  page?: number;
  limit?: number;
  courseId?: string;
  status?: 'pending' | 'replied' | 'resolved' | 'all';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'studentName';
  sortOrder?: 'asc' | 'desc';
}

export interface CommentListResponse extends PaginatedResponse<Comment> {
  data: {
    items: Comment[];
    pagination: PaginationMeta;
    statistics: {
      totalComments: number;
      pendingComments: number;
      repliedComments: number;
      resolvedComments: number;
    };
  };
}

export interface CommentDetailResponse extends ApiResponse<{
  comment: Comment;
  replies: CommentReply[];
}> {}

export interface ReplyCommentRequest {
  content: string;
}

export interface UpdateCommentStatusRequest {
  status: 'pending' | 'replied' | 'resolved';
  reason?: string;
}

// ============= FEEDBACKS TYPES =============
export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  courseId: string;
  courseName: string;
  createdAt: string;
  updatedAt: string;
  isReplied: boolean;
  reply?: FeedbackReply;
  helpfulCount: number;
  isHelpfulByInstructor: boolean;
  verifiedPurchase: boolean;
}

export interface FeedbackReply {
  id: string;
  content: string;
  instructorId: string;
  instructorName: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

export interface FeedbackListQuery {
  page?: number;
  limit?: number;
  courseId?: string;
  rating?: number;
  ratingRange?: 'high' | 'low' | 'all';
  hasReply?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
}

export interface FeedbackListResponse extends PaginatedResponse<Feedback> {
  data: {
    items: Feedback[];
    pagination: PaginationMeta;
    statistics: {
      totalFeedbacks: number;
      averageRating: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
      highRatings: number;
      needReply: number;
    };
  };
}

export interface ReplyFeedbackRequest {
  content: string;
}

// ============= DOCUMENTS TYPES =============
export interface Document {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  courseId: string;
  courseName: string;
  lectureId?: string;
  lectureTitle?: string;
  uploadedAt: string;
  downloadCount: number;
  status: 'active' | 'archived' | 'processing';
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pageCount?: number;
  };
  description?: string;
}

export interface DocumentListQuery {
  page?: number;
  limit?: number;
  courseId?: string;
  lectureId?: string;
  fileType?: string;
  search?: string;
  sortBy?: 'uploadedAt' | 'name' | 'size' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}

export interface DocumentListResponse extends PaginatedResponse<Document> {
  data: {
    items: Document[];
    pagination: PaginationMeta;
    statistics: {
      totalDocuments: number;
      totalDownloads: number;
      totalSize: number;
      averageDownloadsPerDocument: number;
      fileTypeDistribution: Record<string, number>;
    };
  };
}

export interface UploadDocumentRequest {
  file: File;
  courseId: string;
  lectureId?: string;
  description?: string;
  name?: string;
}

// ============= STUDENTS TYPES =============
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

export interface StudentListQuery {
  page?: number;
  limit?: number;
  courseId?: string;
  status?: 'active' | 'inactive' | 'completed' | 'all';
  search?: string;
  sortBy?: 'name' | 'joinDate' | 'lastActivity' | 'progress';
  sortOrder?: 'asc' | 'desc';
}

export interface StudentListResponse extends PaginatedResponse<Student> {
  data: {
    items: Student[];
    pagination: PaginationMeta;
    statistics: {
      totalStudents: number;
      activeStudents: number;
      averageProgress: number;
      totalEnrollments: number;
      completionRate: number;
    };
  };
}

// ============= REVENUE TYPES =============
export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  amount: number;
  currency: string;
  grossAmount: number;
  platformFee: number;
  instructorEarning: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'disputed';
  paymentMethod: string;
  paymentProvider: string;
  transactionDate: string;
  completedAt?: string;
  refundedAt?: string;
  refundReason?: string;
  transactionFee: number;
  exchangeRate?: number;
}

export interface CourseRevenue {
  courseId: string;
  courseName: string;
  coursePrice: number;
  totalRevenue: number;
  totalEnrollments: number;
  totalRefunds: number;
  refundAmount: number;
  netRevenue: number;
  averageRevenuePerStudent: number;
  conversionRate: number;
  period: {
    firstSale: string;
    lastSale: string;
  };
}

export interface RevenueSummary {
  totalRevenue: number;
  totalGrossRevenue: number;
  platformFees: number;
  netRevenue: number;
  totalTransactions: number;
  totalRefunds: number;
  refundAmount: number;
  averageOrderValue: number;
  currency: string;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface RevenueChartData {
  period: string;
  revenue: number;
  transactions: number;
  refunds: number;
  netRevenue: number;
}

export interface RevenueQuery {
  page?: number;
  limit?: number;
  courseId?: string;
  voucherId?: string;
  // Note: Backend doesn't support date filtering yet
  startDate?: string;
  endDate?: string;
  currency?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

export interface RevenueResponse extends ApiResponse<{
  items: Transaction[];
  pagination: PaginationMeta;
  statistics: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
  };
}> {}

// ============= ERROR TYPES =============
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  timestamp: string;
  path: string;
  method: string;
}

export enum ErrorCodes {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_UUID = "INVALID_UUID",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  CANNOT_REPLY_TO_OWN_COMMENT = "CANNOT_REPLY_TO_OWN_COMMENT",
  COMMENT_ALREADY_RESOLVED = "COMMENT_ALREADY_RESOLVED",
  COURSE_NOT_OWNED = "COURSE_NOT_OWNED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
}