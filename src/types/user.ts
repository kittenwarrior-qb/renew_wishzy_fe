import type { User, UserRole } from './auth';
import type { PaginationParams } from './common';

// Re-export UserRole for convenience
export type { UserRole };

export interface UserListParams extends PaginationParams {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
  verified?: boolean;
  instructorId?: string;
  fullName?: string;
  email?: string;
}

export interface UserListResponse {
  success: boolean;
  data: {
    data: {
      items: User[];
      pagination: {
        totalPage: number;
        totalItems: number;
        currentPage: number;
        itemsPerPage: number;
      };
    };
  };
  message: string;
  url?: string;
}

export interface TransformedUserListResponse {
  success: boolean;
  data: {
    data: {
      items: Student[];
      pagination: {
        totalPage: number;
        totalItems: number;
        currentPage: number;
        itemsPerPage: number;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  };
  message: string;
  url?: string;
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
  message: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  courses: string[];
  joinDate: string;
  fullName: string;
  role: string;
  verified: boolean;
}

