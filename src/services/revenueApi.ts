// Revenue API Service - Using real backend endpoints
import { api } from '../lib/api';
import { logger } from '@/utils/logger';
import { apiLogger } from '@/utils/apiLogger';
import { transformPagination, safeNumber } from './instructorApiHelpers';

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
      title: string;
      thumbnail?: string;
    };
  }[];
}

export interface RevenueResponse {
  success: boolean;
  data: {
    items: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    statistics: {
      totalRevenue: number;
      totalOrders: number;
      completedOrders: number;
      pendingOrders: number;
      averageOrderValue: number;
      monthlyRevenue: number;
      revenueGrowth: number;
    };
  };
}

export interface RevenueQuery {
  page?: number;
  limit?: number;
  courseId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============= REVENUE API =============
export const revenueApi = {
  // Get revenue overview (orders for instructor's courses)
  getRevenue: async (params: RevenueQuery): Promise<RevenueResponse> => {
    try {
      // Only send supported parameters to backend
      const backendParams = {
        page: params.page,
        limit: params.limit,
        courseId: params.courseId,
      };

      // Get orders for current instructor (paginated)
      const startTime = performance.now();
      apiLogger.logRequest('/orders/instructor-revenue', 'GET', backendParams);
      
      const response = await api.get('/orders/instructor-revenue', { params: backendParams });

      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse('/orders/instructor-revenue', response.data, duration);

      // Backend returns: { items: Order[], pagination: {...}, message: string }
      const responseData = response.data?.data || response.data;
      const orders = responseData?.items || [];
      const pagination = responseData?.pagination || {};

      // Calculate statistics from current page orders and pagination info
      // Use pagination.total for accurate total counts
      const totalOrders = pagination.totalItems || orders.length;
      const completedOrders = orders.filter((o: Order) => o.status === 'completed').length;
      const pendingOrders = orders.filter((o: Order) => o.status === 'pending').length;
      
      // Calculate revenue from current page orders
      const currentPageRevenue = orders
        .filter((o: Order) => o.status === 'completed')
        .reduce((sum: number, o: Order) => sum + Number(o.totalPrice || 0), 0);
      
      // Estimate total revenue based on current page data
      // This is an approximation - ideally backend should provide this
      const revenuePerOrder = completedOrders > 0 ? currentPageRevenue / completedOrders : 0;
      const estimatedTotalRevenue = revenuePerOrder * totalOrders;
      
      const averageOrderValue = completedOrders > 0 ? currentPageRevenue / completedOrders : 0;

      // Calculate monthly revenue from current page (approximation)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = orders
        .filter((o: Order) => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getMonth() === currentMonth &&
                 orderDate.getFullYear() === currentYear &&
                 o.status === 'completed';
        })
        .reduce((sum: number, o: Order) => sum + Number(o.totalPrice || 0), 0);

      // If we have a small dataset, try to get all orders for accurate statistics
      let allOrdersStats = null;
      if (totalOrders <= 100) {
        try {
          const allOrdersResponse = await api.get('/orders/instructor-revenue', {
            params: { limit: 1000 } // Get all orders for accurate statistics
          });
          const allOrders = allOrdersResponse.data?.items || [];
          
          if (allOrders.length > 0) {
            const allCompletedOrders = allOrders.filter((o: Order) => o.status === 'completed');
            const allTotalRevenue = allCompletedOrders.reduce((sum: number, o: Order) => sum + Number(o.totalPrice || 0), 0);
            const allMonthlyRevenue = allOrders
              .filter((o: Order) => {
                const orderDate = new Date(o.createdAt);
                return orderDate.getMonth() === currentMonth &&
                       orderDate.getFullYear() === currentYear &&
                       o.status === 'completed';
              })
              .reduce((sum: number, o: Order) => sum + Number(o.totalPrice || 0), 0);
            
            allOrdersStats = {
              totalRevenue: allTotalRevenue,
              completedOrders: allCompletedOrders.length,
              averageOrderValue: allCompletedOrders.length > 0 ? allTotalRevenue / allCompletedOrders.length : 0,
              monthlyRevenue: allMonthlyRevenue
            };
          }
        } catch (error) {
          apiLogger.logError('/orders/instructor-revenue (all)', error, 'GET');
          logger.warn('Failed to fetch all orders for accurate statistics', error);
        }
      }

      // Use accurate stats if available, otherwise use estimates
      const finalStats = allOrdersStats || {
        totalRevenue: estimatedTotalRevenue,
        completedOrders,
        averageOrderValue,
        monthlyRevenue
      };

      // Transform orders to match frontend expected format
      const transformedOrders = orders.flatMap((order: Order) => {
        // Each order can have multiple courses (orderDetails)
        // We need to create a row for each course in the order
        return (order.orderDetails || []).map((detail) => ({
          id: `${order.id}-${detail.id}`,
          orderId: order.id,
          courseName: detail.course?.title || 'Unknown Course',
          courseId: detail.courseId,
          studentName: order.user?.fullName || 'Unknown Student',
          studentEmail: order.user?.email || '',
          amount: order.totalPrice,
          instructorEarning: detail.price, // Price of this specific course
          transactionDate: order.createdAt,
          paymentProvider: order.paymentMethod,
          status: order.status,
        }));
      });

      return {
        success: true,
        data: {
          items: transformedOrders, // Return transformed items for table
          pagination: transformPagination(pagination, params),
          statistics: {
            totalRevenue: finalStats.totalRevenue,
            totalOrders,
            completedOrders: finalStats.completedOrders,
            pendingOrders,
            averageOrderValue: Math.round(finalStats.averageOrderValue),
            monthlyRevenue: finalStats.monthlyRevenue,
            revenueGrowth: 0, // Would need historical data to calculate
          },
        },
      };
    } catch (error) {
      apiLogger.logError('/orders/instructor-revenue', error, 'GET');
      logger.apiError('/orders/instructor-revenue', error);
      throw error;
    }
  },

  // Export revenue report
  exportRevenueReport: async (params: RevenueQuery, format: 'csv' | 'xlsx' = 'xlsx'): Promise<Blob> => {
    try {
      apiLogger.logRequest('/orders/export', 'GET', { ...params, format });
      const startTime = performance.now();
      
      const response = await api.get('/orders/export', {
        params: { ...params, format },
        responseType: 'blob'
      });
      
      const duration = Math.round(performance.now() - startTime);
      apiLogger.logResponse('/orders/export', { type: 'blob', size: response.data.size }, duration);
      
      return response.data;
    } catch (error) {
      apiLogger.logError('/orders/export', error, 'GET');
      logger.apiError('/orders/export', error);
      throw error;
    }
  },
};