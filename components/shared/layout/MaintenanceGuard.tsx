"use client"

import * as React from "react"

import { useAppStore } from "@/stores/useAppStore"

interface MaintenanceGuardProps {
    children: React.ReactNode
}

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
    const maintenanceMode = useAppStore((state) => state.maintenanceMode)
    const user = useAppStore((state) => state.user)

    const isAdmin = user?.role === "admin"

    if (!maintenanceMode || isAdmin) {
        return <>{children}</>
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="mx-4 max-w-md space-y-3 rounded-2xl border bg-card/80 p-6 text-center shadow-md">
                <h1 className="text-lg font-semibold">Hệ thống đang bảo trì</h1>
                <p className="text-sm text-muted-foreground">
                    Nền tảng hiện đang trong chế độ bảo trì. Trong thời gian này, học viên tạm thời không
                    thể truy cập khoá học. Vui lòng quay lại sau hoặc liên hệ quản trị viên nếu bạn cần hỗ trợ.
                </p>
            </div>
        </div>
    )
}
