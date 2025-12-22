/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

import { logger } from './logger';
import { notify } from '@/components/shared/admin/Notifications';

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class ErrorHandler {
  /**
   * Handle API errors
   */
  static handleApiError(error: any, context?: string): void {
    const errorMessage = error?.response?.data?.error?.message 
      || error?.response?.data?.message 
      || error?.message 
      || 'Đã xảy ra lỗi không xác định';

    const errorCode = error?.response?.data?.error?.code || 'UNKNOWN_ERROR';
    const statusCode = error?.response?.status || 500;

    logger.error(`API Error${context ? ` [${context}]` : ''}:`, {
      message: errorMessage,
      code: errorCode,
      statusCode,
      error: error?.response?.data || error,
    });

    // Show user-friendly notification
    notify({
      title: this.getErrorTitle(statusCode),
      description: errorMessage,
      variant: 'destructive',
    });
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: any): void {
    const errors = error?.response?.data?.errors || error?.response?.data?.error?.details || [];
    
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors[0];
      const message = firstError?.message || 'Dữ liệu không hợp lệ';
      
      logger.warn('Validation Error:', errors);
      
      notify({
        title: 'Lỗi xác thực',
        description: message,
        variant: 'destructive',
      });
    } else {
      this.handleApiError(error, 'Validation');
    }
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: any): void {
    logger.error('Network Error:', error);
    
    notify({
      title: 'Lỗi kết nối',
      description: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
      variant: 'destructive',
    });
  }

  /**
   * Get user-friendly error title based on status code
   */
  private static getErrorTitle(statusCode: number): string {
    switch (statusCode) {
      case 401:
        return 'Không có quyền truy cập';
      case 403:
        return 'Bị từ chối truy cập';
      case 404:
        return 'Không tìm thấy';
      case 422:
        return 'Dữ liệu không hợp lệ';
      case 429:
        return 'Quá nhiều yêu cầu';
      case 500:
        return 'Lỗi máy chủ';
      default:
        return 'Đã xảy ra lỗi';
    }
  }

  /**
   * Extract error message from error object
   */
  static getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    return error?.response?.data?.error?.message 
      || error?.response?.data?.message 
      || error?.message 
      || 'Đã xảy ra lỗi không xác định';
  }
}

