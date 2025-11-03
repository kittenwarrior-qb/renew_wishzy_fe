import type { User } from '@/types/auth';
import type { ApiResponse } from '@/types/common';
import { useApiQuery } from '@/hooks/useApi';

const userEndpoints = {
  me: 'users/me',
} as const;

export const UserHook = () => {
  const useCurrentUser = () => {
    return useApiQuery<ApiResponse<User & { message: string }>>(
      userEndpoints.me,
    );
  };

  return {
    useCurrentUser,
  };
};

export const useCurrentUser = () => UserHook().useCurrentUser();
