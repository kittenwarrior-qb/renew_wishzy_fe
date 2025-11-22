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

    const response = await api.get<UserListResponse>(
      USER_ENDPOINTS.base,
      { params: apiParams }
    );
    return response.data;
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

  async getInstructorStudents(params?: Omit<UserListParams, 'role' | 'fullName' | 'email'>): Promise<UserListResponse> {
    const apiParams: Record<string, unknown> = { ...params };
    delete apiParams.size;
    delete apiParams.instructorId;

    Object.keys(apiParams).forEach((key) => {
      if (apiParams[key] === undefined) {
        delete apiParams[key];
      }
    });

    const response = await api.get<UserListResponse>(
      USER_ENDPOINTS.instructorStudents,
      { params: apiParams }
    );
    return response.data;
  },
};

