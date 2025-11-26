// Types for Comment Management

export interface Comment {
  id: string;
  content: string;
  rating: number; // 1-5
  like: number;
  dislike: number;
  userId: string;
  courseId: string;
  courseName?: string;
  parentId?: string | null; // ID của comment gốc (nếu là reply)
  reply?: Comment | null; // Reply của instructor (nếu có)
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface CommentStats {
  totalComments: number;
  unrepliedComments: number;
  averageRating: number;
  recentComments: number; // Comments trong 24h
  ratingDistribution?: {
    [key: string]: number; // "1": 5, "2": 10, ...
  };
}

export interface CommentFilter {
  page?: number;
  limit?: number;
  courseId?: string;
  rating?: number; // 1-5
  hasReply?: boolean; // true: đã phản hồi, false: chưa phản hồi
  sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'likes';
}

export interface CommentListResponse {
  items: Comment[];
  pagination: {
    totalPage: number;
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

