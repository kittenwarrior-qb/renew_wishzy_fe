"use client"
import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppStore } from "@/stores/useAppStore"

type Options = {
  allowedRoles?: string[]
  redirectTo?: string
}

export function useInstructorGuard(options: Options = {}) {
  const { allowedRoles = ["instructor"], redirectTo } = options
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
    if (!storeHydrated) {
      setReady(false)
      return
    }
    
    // Wait a bit to ensure store has fully hydrated
    const timer = setTimeout(() => {
      if (!isAuthenticated || !isAllowed) {
        // Role-based redirect
        if (redirectTo) {
          router.replace(redirectTo)
        } else {
          // Redirect based on user role
          if (role === "admin") {
            router.replace("/admin")
          } else if (role === "instructor") {
            router.replace("/instructor")
          } else {
            router.replace("/")
          }
        }
        setReady(false)
        return
      }
      setReady(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [storeHydrated, isAuthenticated, isAllowed, router, redirectTo, role])

  return {
    ready,
    user,
    isAllowed,
  }
}

