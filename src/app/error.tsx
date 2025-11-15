// src/app/error.tsx
"use client"

import * as React from "react"
import { useEffect } from "react"
import { SystemErrorFallback } from "@/components/shared/common/SystemErrorFallback"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error("Global app error:", error)
    }, [error])

    return (
        <SystemErrorFallback
            message={error?.message || "Đã xảy ra lỗi không xác định."}
            onRetry={reset}
        />
    )
}