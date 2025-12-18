// API Client Configuration

import axios, { AxiosInstance, AxiosError } from 'axios';
import { notify } from '@/components/shared/admin/Notifications';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your auth store
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Note: X-Request-ID removed due to CORS policy
    // Backend needs to allow this header in Access-Control-Allow-Headers
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          handleUnauthorized();
          break;
          
        case 403:
          // Forbidden
          notify({
            title: "Không có quyền truy cập",
            description: "Bạn không có quyền thực hiện hành động này",
            variant: "destructive"
          });
          break;
          
        case 404:
          // Not found
          notify({
            title: "Không tìm thấy",
            description: "Tài nguyên không tồn tại",
            variant: "destructive"
          });
          break;
          
        case 422:
          // Validation error
          handleValidationError(data);
          break;
          
        case 429:
          // Rate limit exceeded
          notify({
            title: "Quá nhiều yêu cầu",
            description: "Vui lòng thử lại sau ít phút",
            variant: "destructive"
          });
          break;
          
        case 500:
          // Server error
          notify({
            title: "Lỗi máy chủ",
            description: "Đã xảy ra lỗi, vui lòng thử lại sau",
            variant: "destructive"
          });
          break;
          
        default:
          // Other errors
          notify({
            title: "Lỗi",
            description: data?.error?.message || "Đã xảy ra lỗi không xác định",
            variant: "destructive"
          });
      }
    } else if (error.request) {
      // Network error
      notify({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến máy chủ",
        variant: "destructive"
      });
    } else {
      // Other error
      notify({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi không xác định",
        variant: "destructive"
      });
    }
    
    return Promise.reject(error);
  }
);

// Helper functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function handleUnauthorized(): void {
  // Clear auth data
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user_data');
  
  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

function handleValidationError(data: any): void {
  const errors = data?.error?.details || {};
  const firstError = Object.values(errors)[0] as string;
  
  notify({
    title: "Dữ liệu không hợp lệ",
    description: firstError || "Vui lòng kiểm tra lại thông tin",
    variant: "destructive"
  });
}

// Export types for better TypeScript support
export type ApiResponse<T = any> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ApiError = {
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
};

// Utility functions for common API operations
export const apiUtils = {
  // Build query string from object
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  },
  
  // Handle file download
  downloadFile: async (url: string, filename?: string): Promise<void> => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },
  
  // Upload file with progress
  uploadFile: async (
    url: string, 
    file: File, 
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }
    
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(Math.round(progress));
        }
      },
    });
  }
};

export default api;