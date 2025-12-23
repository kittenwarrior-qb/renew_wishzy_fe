"use client"

import React from "react"
import HeaderAdmin from "@/components/shared/layout/HeaderAdmin"
import AdminAppSidebar from "@/components/shared/layout/AdminAppSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Notifications } from "@/components/shared/admin/Notifications"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { useAppStore } from "@/stores/useAppStore"
import { useRouter } from "next/navigation"
import { useAdminGuard } from "@/hooks/useAdminGuard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const leaveProceedRef = React.useRef<null | (() => void)>(null)
  const [openLeaveConfirm, setOpenLeaveConfirm] = React.useState(false)
  const router = useRouter()
  const { ready } = useAdminGuard({ allowedRoles: ["admin"], redirectTo: `/` })
  const theme = useAppStore((state) => state.theme)
  const hasHydrated = useAppStore((state) => state._hasHydrated)
  const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

  React.useEffect(() => {
    if (!hasHydrated) return

    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme, hasHydrated])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const react = require('@ckeditor/ckeditor5-react')
        const classic = require('@ckeditor/ckeditor5-build-classic')
          ; (window as any).__CKE__ = {
            CKEditor: react?.CKEditor,
            ClassicEditor: classic?.default || classic,
          }
      } catch { }
    }

    const onUnsaved = (e: Event) => {
      const detail = (e as CustomEvent).detail as { proceed?: () => void } | undefined
      leaveProceedRef.current = detail?.proceed ?? null
      setOpenLeaveConfirm(true)
    }
    window.addEventListener("unsaved-changes", onUnsaved as EventListener)
    return () => window.removeEventListener("unsaved-changes", onUnsaved as EventListener)
  }, [])

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground" role="status" aria-live="polite" aria-busy="true">
          <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
          <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh">
      <SidebarProvider style={{ ["--sidebar-width"]: "20rem", ["--sidebar-width-icon"]: "3.75rem" } as React.CSSProperties}>
        <AdminAppSidebar />
        <SidebarInset className="md:!m-0 md:!ml-0 md:!rounded-none md:!shadow-none flex flex-col min-h-dvh min-w-0">
          <HeaderAdmin />
          <main className="flex-1 overflow-auto min-w-0">
            {children}
          </main>
        </SidebarInset>
        <Notifications />
        <ConfirmDialog
          open={openLeaveConfirm}
          onOpenChange={setOpenLeaveConfirm}
          title="Rời trang?"
          description={<span>Bạn có thay đổi chưa lưu. Rời trang?</span>}
          confirmText="Rời trang"
          position="top"
          onConfirm={() => {
            setOpenLeaveConfirm(false)
            leaveProceedRef.current?.()
          }}
        />
      </SidebarProvider>
    </div>
  )
}
