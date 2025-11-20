import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { ApiResponse, PaginatedResponse } from '@/types/common';

const buildQueryParams = (params?: Record<string, unknown>): string => {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const apiRequest = async <TData = unknown>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: unknown;
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
  }
): Promise<TData> => {
  const { method = 'GET', data, params, headers } = options || {};

  const url = `${endpoint}${buildQueryParams(params)}`;

  const config: any = {
    method: method.toLowerCase(),
    headers: headers || {},
  };

  if (data) {
    config.data = data;
    
    // Debug log for FormData
    if (data instanceof FormData) {
      console.log('Sending FormData to:', url);
      for (const pair of (data as any).entries()) {
        console.log('FormData entry:', pair[0], pair[1]);
      }
    }
  }

  const response = await api.request({ url, ...config });
  return response.data;
};

export const useApiQuery = <TData = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & {
    params?: Record<string, unknown>;
  }
) => {
  const { params, ...queryOptions } = options || {};

  return useQuery<TData, TError>({
    queryKey: [endpoint, params],
    queryFn: () => apiRequest<TData>(endpoint, { params }),
    ...queryOptions,
  });
};

export const useApiMutation = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> & {
    invalidateQueries?: string[];
    getParams?: (variables: TVariables) => Record<string, unknown>;
  }
) => {
  const queryClient = useQueryClient();
  const { invalidateQueries, getParams, ...mutationOptions } = options || {};

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const params = getParams?.(variables);
      return apiRequest<TData>(endpoint, {
        method,
        data: variables,
        params,
      });
    },
    onSuccess: (data, variables, context, unknown) => {
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [endpoint] });
      }

      // @ts-ignore - Handling different versions of react-query
      mutationOptions.onSuccess?.(data, variables, context);
    },
    ...mutationOptions,
  });
};

export const useApiPost = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> & {
    invalidateQueries?: string[];
    getParams?: (variables: TVariables) => Record<string, unknown>;
  }
) => useApiMutation<TData, TVariables, TError>(endpoint, 'POST', options);

export const useApiPut = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> & {
    invalidateQueries?: string[];
    getParams?: (variables: TVariables) => Record<string, unknown>;
  }
) => useApiMutation<TData, TVariables, TError>(endpoint, 'PUT', options);

export const useApiPatch = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> & {
    invalidateQueries?: string[];
    getParams?: (variables: TVariables) => Record<string, unknown>;
  }
) => useApiMutation<TData, TVariables, TError>(endpoint, 'PATCH', options);

export const useApiDelete = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> & {
    invalidateQueries?: string[];
    getParams?: (variables: TVariables) => Record<string, unknown>;
  }
) => useApiMutation<TData, TVariables, TError>(endpoint, 'DELETE', options);

// Paginated Query Hook
export const useApiPaginatedQuery = <TData = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseQueryOptions<PaginatedResponse<TData>, TError>, 'queryKey' | 'queryFn'> & {
    params?: Record<string, unknown>;
  }
) => {
  return useApiQuery<PaginatedResponse<TData>, TError>(endpoint, options);
};
