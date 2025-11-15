"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

type AdminDataErrorStateProps = {
    title?: string
    description?: string
    onRetry?: () => void
}

export function AdminDataErrorState({ title, description, onRetry }: AdminDataErrorStateProps) {
    const showRetry = typeof onRetry === "function"

    return (
        <div className="flex min-h-[80vh] w-full flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <span className="text-lg font-semibold">!</span>
            </div>
            <div className="space-y-1">
                <h2 className="text-sm font-semibold tracking-tight">
                    {title || "Không thể tải dữ liệu"}
                </h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {description || "Đã xảy ra lỗi khi tải dữ liệu từ máy chủ. Bạn có thể thử tải lại hoặc kiểm tra kết nối mạng."}
                </p>
            </div>
            {showRetry ? (
                <div className="mt-1 flex items-center justify-center gap-2">
                    <Button size="sm" variant="outline" onClick={onRetry}>
                        Thử tải lại
                    </Button>
                </div>
            ) : null}
        </div>
    )
}
