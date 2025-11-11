import api from "./api";

export type User = {
  id: string;
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  dob?: string | null;
  gender?: string | null;
  verified: boolean;
  isEmailVerified?: boolean;
  address?: string | null;
  avatar?: string | null;
  age?: number | null;
  phone?: string | null;
  loginType?: string;
  role: string;
  isInstructorActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserListResponse = {
  data: {
    items: User[];
    pagination: {
      totalPage: number;
      totalItems: number;
      currentPage: number;
      itemsPerPage: number;
    };
  } | User[];
};

export type InstructorStatus = 'approved' | 'rejected' | 'pending';

const BASE = "/users";

export const usersService = {
  async list(params?: Record<string, any>) {
    const res = await api.get(BASE, { params });
    return res.data;
  },
  async get(id: string) {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },
  async approveInstructor(id: string) {
    const res = await api.post(`${BASE}/${id}/instructor/approve`);
    return res.data;
  },
  async rejectInstructor(id: string, data?: { reason?: string }) {
    const res = await api.post(`${BASE}/${id}/instructor/reject`, data ?? {});
    return res.data;
  },
};
