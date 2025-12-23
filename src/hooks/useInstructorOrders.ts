import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  orderDetails?: {
    id: string;
    courseId: string;
    price: number;
    course?: {
      id: string;
      name: string;
      thumbnail?: string;
    };
  }[];
}

export interface OrdersResponse {
  items: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics?: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
  };
}

export interface OrdersQuery {
  page?: number;
  limit?: number;
  status?: string;
  courseId?: string;
}

export const useInstructorOrders = (params: OrdersQuery = {}) => {
  return useQuery({
    queryKey: ['instructor-orders', params],
    queryFn: async () => {
      const response = await api.get<{ data: OrdersResponse }>('/orders/instructor-revenue', {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.status && { status: params.status }),
          ...(params.courseId && { courseId: params.courseId }),
        },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};