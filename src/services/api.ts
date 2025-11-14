import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  withCredentials: true,
} as const;

const TokenManager = {
  get: () => localStorage.getItem('accessToken'),
  set: (token: string) => localStorage.setItem('accessToken', token),
  remove: () => localStorage.removeItem('accessToken'),
};

const api: AxiosInstance = axios.create({
  ...API_CONFIG,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = TokenManager.get();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Only try to refresh token if we have a token
      const currentToken = TokenManager.get();
      if (!currentToken) {
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await api.post('/auth/refresh-token');
        const { accessToken } = refreshResponse.data;
        
        TokenManager.set(accessToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        TokenManager.remove();
        
        // Only redirect to login if user was trying to access protected routes
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const protectedPaths = ['/profile', '/learning', '/instructor', '/admin', '/checkout'];
          const isProtectedRoute = protectedPaths.some(path => currentPath.startsWith(path));
          
          if (isProtectedRoute) {
            window.location.href = '/auth/login';
          }
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
