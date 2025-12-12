import api from './api';
import type { User } from '@/types/auth';
import type {
  UserListParams,
  UserListResponse,
  UserResponse,
} from '@/types/user';

const USER_ENDPOINTS = {
  base: '/users',
  byId: (id: string) => `/users/${id}`,
  instructorStudents: '/users/instructors/my-students',
  approveInstructor: (id: string) => `/users/${id}/approve-instructor`,
  rejectInstructor: (id: string) => `/users/${id}/reject-instructor`,
} as const;

export const userService = {
  async getUsers(params?: UserListParams): Promise<UserListResponse> {
    const apiParams: Record<string, unknown> = { ...params };
    delete apiParams.size;
    delete apiParams.instructorId;

    Object.keys(apiParams).forEach((key) => {
      if (apiParams[key] === undefined) {
        delete apiParams[key];
      }
    });

    const response = await api.get<{ message: string; data: { items: User[]; pagination: any } }>(
      USER_ENDPOINTS.base,
      { params: apiParams }
    );
    // BE trả về { message: "...", data: { items: [...], pagination: {...} } }
    // Normalize thành structure: { data: { data: { items, pagination } } }
    return {
      success: true,
      data: {
        data: response.data.data,
      },
      message: response.data.message || 'Users retrieved successfully',
    };
  },

  async getUsersByRole(
    role: 'user' | 'instructor' | 'admin',
    params?: Omit<UserListParams, 'role'>
  ): Promise<UserListResponse> {
    return this.getUsers({ ...params, role });
  },

  async getUserById(userId: string): Promise<User> {
    const response = await api.get<UserResponse>(
      USER_ENDPOINTS.byId(userId)
    );
    return response.data.data.user;
  },

  async getStudents(params?: Omit<UserListParams, 'role'>): Promise<UserListResponse> {
    return this.getUsersByRole('user', params);
  },

  async getInstructors(params?: Omit<UserListParams, 'role'>): Promise<UserListResponse> {
    return this.getUsersByRole('instructor', params);
  },

  async getInstructorStudents(params?: Omit<UserListParams, 'role'>): Promise<UserListResponse> {
    const apiParams: Record<string, unknown> = { ...params };
    delete apiParams.size;
    delete apiParams.instructorId;

    Object.keys(apiParams).forEach((key) => {
      if (apiParams[key] === undefined) {
        delete apiParams[key];
      }
    });

    const response = await api.get<{
      success?: boolean;
      message: string;
      data: {
        data: {
          items: User[];
          pagination: any;
        };
      };
    }>(
      USER_ENDPOINTS.instructorStudents,
      { params: apiParams }
    );
    // BE trả về { success: true, message: "...", data: { data: { items: [...], pagination: {...} } } }
    // Normalize thành structure: { success, data: { data: { items, pagination } }, message }
    return {
      success: response.data.success ?? true,
      data: response.data.data,
      message: response.data.message || 'Students retrieved successfully',
    };
  },
};

