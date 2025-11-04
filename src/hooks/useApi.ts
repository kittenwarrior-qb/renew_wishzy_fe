import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { buildApiUrl } from '@/utils/ApiClient';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const getJwtExpiry = (token?: string | null): number | null => {
  if (!token) {
    return null;
  }
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    const payloadB64: string = parts[1] ?? '';
    if (!payloadB64) {
      return null;
    }
    const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp : null;
  } catch {
    return null;
  }
};

const isTokenExpiredOrNear = (token?: string | null, skewSeconds = 30): boolean => {
  const exp = getJwtExpiry(token || null);
  if (!exp) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return now >= exp - skewSeconds;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshUrl = buildApiUrl('auth/refresh-token');
      const response = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        useAuthStore.getState().logout();
        return null;
      }

      const data = await response.json();
      if (data.accessToken) {
        // Update only the token if user is not present; keep user as-is
        const { user: existingUser } = useAuthStore.getState();
        if (existingUser) {
          useAuthStore.getState().login(existingUser, data.accessToken);
        } else {
          // No user profile yet; just write token directly
          // The next authorized request can fetch user info if needed
          useAuthStore.setState((state: { user: unknown }) => ({
            token: data.accessToken,
            isAuthenticated: Boolean(data.accessToken && state.user != null),
          }));
        }
        return data.accessToken;
      }

      return null;
    } catch {
      useAuthStore.getState().logout();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const apiRequest = async <TData = unknown>(
  endpoint: string,
  options?: RequestInit & { queryParams?: Record<string, string> },
  retryCount = 0,
): Promise<TData> => {
  let url = buildApiUrl(endpoint);

  if (options?.queryParams) {
    const params = new URLSearchParams(options.queryParams);
    url = `${url}?${params.toString()}`;
  }

  const { queryParams, ...fetchOptions } = options || {};
  let currentToken = useAuthStore.getState().token;

  // Proactively refresh if token missing or expired (once per request)
  if (!currentToken || isTokenExpiredOrNear(currentToken)) {
    await refreshAccessToken();
    currentToken = useAuthStore.getState().token;
  }

  if (retryCount > 0) {
    currentToken = useAuthStore.getState().token;
  }

  const hasBody = typeof fetchOptions.body !== 'undefined';
  const baseHeaders: Record<string, string> = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
  };

  const isCrossOrigin = /^https?:\/\//i.test(url)
    && typeof window !== 'undefined'
    && !url.startsWith(window.location.origin);

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
    ...(isCrossOrigin ? { mode: 'cors' as const } : {}),
    headers: {
      ...baseHeaders,
      ...fetchOptions?.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401 && retryCount === 0) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return apiRequest<TData>(endpoint, options, 1);
      }
      useAuthStore.getState().logout();
    }

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
