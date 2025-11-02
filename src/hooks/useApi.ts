import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { buildApiUrl } from '@/utils/ApiClient';

export const apiRequest = async <TData = unknown>(
  endpoint: string,
  options?: RequestInit & { queryParams?: Record<string, string> },
): Promise<TData> => {
  const { token } = useAuthStore.getState();
  let url = buildApiUrl(endpoint);

  if (options?.queryParams) {
    const params = new URLSearchParams(options.queryParams);
    url = `${url}?${params.toString()}`;
  }

  const { queryParams, ...fetchOptions } = options || {};

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<TData>;
};

export const useApiQuery = <TData = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & {
    queryParams?: Record<string, string>;
  },
) => {
  const { queryParams, ...queryOptions } = options || {};
  return useQuery<TData, TError>({
    queryKey: [endpoint, queryParams],
    queryFn: () => apiRequest<TData>(endpoint, { queryParams }),
    ...queryOptions,
  });
};

export const useApiMutation = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'GET' = 'POST',
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> & {
    queryParams?: (variables: TVariables) => Record<string, string>;
  },
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const queryParams = options?.queryParams?.(variables);
      return apiRequest<TData>(endpoint, {
        method,
        ...(variables && method !== 'GET' && { body: JSON.stringify(variables) }),
        ...(queryParams && { queryParams }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    ...options,
  });
};

export const useApiPost = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) => useApiMutation<TData, TVariables, TError>(endpoint, 'POST', options);

export const useApiPut = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) => useApiMutation<TData, TVariables, TError>(endpoint, 'PUT', options);

export const useApiDelete = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) => useApiMutation<TData, TVariables, TError>(endpoint, 'DELETE', options);

export const useApiPatch = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) => useApiMutation<TData, TVariables, TError>(endpoint, 'PATCH', options);
