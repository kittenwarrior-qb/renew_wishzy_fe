import { useAppStore } from '@/stores/useAppStore';
import type { UserRole } from '@/types/auth';

export const useCurrentUser = () => {
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Lấy role trực tiếp từ user object, không có fallback mặc định
  // Role phải được lấy từ API response: 'admin', 'instructor', hoặc 'user'
  const role: UserRole | string | null = user?.role || null;

  return {
    user,
    isAuthenticated,
    role,
    fullName: user?.fullName || null,
    email: user?.email || null,
    id: user?.id || null,
    avatar: user?.avatar || null,
    phone: user?.phone || null,
    verified: user?.verified || false,
  };
};

export const useHasRole = (roles: UserRole | UserRole[] | string | string[]) => {
  const { role } = useCurrentUser();

  if (!role) return false;

  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return rolesArray.includes(role as any);
};

