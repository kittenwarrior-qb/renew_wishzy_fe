"use client"
import React from "react"
import HeaderAdmin from "@/components/shared/layout/HeaderAdmin"
import AdminAppSidebar from "@/components/shared/layout/AdminAppSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const leaveProceedRef = React.useRef<null | (() => void)>(null)
  const [openLeaveConfirm, setOpenLeaveConfirm] = React.useState(false)

  React.useEffect(() => {
    const onUnsaved = (e: Event) => {
      const detail = (e as CustomEvent).detail as { proceed?: () => void } | undefined
      leaveProceedRef.current = detail?.proceed ?? null
      setOpenLeaveConfirm(true)
    }
    window.addEventListener("unsaved-changes", onUnsaved as EventListener)
    return () => window.removeEventListener("unsaved-changes", onUnsaved as EventListener)
  }, [])

  return (
    <SidebarProvider style={{ ["--sidebar-width"]: "20rem", ["--sidebar-width-icon"]: "3.75rem" } as React.CSSProperties}>
      <AdminAppSidebar />
      <SidebarInset className="md:!m-0 md:!ml-0 md:!rounded-none md:!shadow-none">
        <HeaderAdmin />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
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
  )
}
