"use client"
import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppStore } from "@/stores/useAppStore"

type Options = {
  allowedRoles?: string[]
  redirectTo?: string
}

export function useAdminGuard(options: Options = {}) {
  const { allowedRoles = ["admin"], redirectTo } = options
  const router = useRouter()
  const { user, isAuthenticated } = useAppStore()

  const [storeHydrated, setStoreHydrated] = React.useState(false)
  const [ready, setReady] = React.useState(false)

  const role = String(user?.role ?? "").toLowerCase()
  const isAllowed = allowedRoles.map(r => r.toLowerCase().trim()).includes(role)

  React.useEffect(() => {
    // Zustand persist hydration awareness
    const hasHydrated = (useAppStore as any).persist?.hasHydrated?.()
    if (hasHydrated) setStoreHydrated(true)
    const unsub = (useAppStore as any).persist?.onFinishHydration?.(() => setStoreHydrated(true))
    return () => { if (typeof unsub === "function") unsub() }
  }, [])

  React.useEffect(() => {
    if (!storeHydrated) return
    
    if (!isAuthenticated || !isAllowed) {
      // Role-based redirect instead of just blocking
      if (redirectTo) {
        router.replace(redirectTo)
      } else {
        // Redirect based on user role
        if (role === "instructor") {
          router.replace("/instructor")
        } else if (role === "admin") {
          router.replace("/admin")
        } else {
          router.replace("/")
        }
      }
      setReady(false)
      return
    }
    setReady(true)
  }, [storeHydrated, isAuthenticated, isAllowed, router, redirectTo, role])

  return {
    ready,
    user,
    isAllowed,
  }
}
