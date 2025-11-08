export interface ApiResponse<T = unknown> {
  data?: T;
  message: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: unknown;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T = unknown> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== HTTP METHOD TYPES =====
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// ===== FILTER BASE TYPE =====
export interface BaseFilter extends PaginationParams {
  isActive?: boolean;
  createdAt?: {
    from?: string;
    to?: string;
  };
  updatedAt?: {
    from?: string;
    to?: string;
  };
}
