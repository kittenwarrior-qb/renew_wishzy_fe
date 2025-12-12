import { useAppStore } from "@/stores/useAppStore"

/**
 * Hook to get role-based redirect URL
 * Returns the appropriate URL based on user role
 */
export function useRoleBasedRedirect() {
  const { user } = useAppStore()
  const role = String(user?.role ?? "").toLowerCase()

  const getRedirectUrl = (): string => {
    switch (role) {
      case "admin":
        return "/admin"
      case "instructor":
        return "/instructor"
      default:
        return "/"
    }
  }

  return {
    redirectUrl: getRedirectUrl(),
    role,
  }
}
