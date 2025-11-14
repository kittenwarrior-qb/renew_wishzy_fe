import { useAppStore } from '@/stores/useAppStore';

export const getCurrentUser = () => {
  return useAppStore.getState().user;
};

export const getCurrentUserRole = (): string | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

export const getCurrentUserFullName = (): string | null => {
  const user = getCurrentUser();
  return user?.fullName || null;
};

export const isUserAuthenticated = (): boolean => {
  return useAppStore.getState().isAuthenticated;
};

export const hasRole = (roles: string | string[]): boolean => {
  const role = getCurrentUserRole();
  if (!role) return false;

  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return rolesArray.includes(role);
};

