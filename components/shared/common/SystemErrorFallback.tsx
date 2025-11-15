"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

type SystemErrorFallbackProps = {
    message?: string
    onRetry?: () => void
}

export function SystemErrorFallback({ message, onRetry }: SystemErrorFallbackProps) {
    const showRetry = typeof onRetry === "function"

    return (

        <div className="min-h-screen mx-auto w-full flex items-center justify-center px-4 py-10">
            <div className="mx-auto w-full max-w-4xl overflow-hidden px-6">
                {/* Logo on top */}
                <div className="flex justify-center mb-6 animate-pulse">
                    <Image
                        src="/images/black-logo.png"
                        alt="Logo"
                        width={240}
                        height={80}
                        className="h-auto w-auto max-h-20 object-contain"
                    />
                </div>

                {/* Main two-column content */}
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-center">
                    {/* Left: icon + status */}
                    <div className="flex flex-col items-center gap-4 md:w-2/5">
                        <div className="flex h-28 w-28 md:h-40 md:w-40 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-md text-6xl md:text-7xl">
                            <span aria-hidden="true">🛠️</span>
                        </div>
                        <div className="inline-flex items-center justify-center rounded-full bg-destructive/10 px-5 py-1.5 text-[11px] font-semibold tracking-[0.35em] uppercase text-destructive/80">
                            500 Error
                        </div>
                    </div>

                    {/* Right: error info */}
                    <div className="space-y-4 text-left md:w-3/5">
                        <div className="space-y-3">
                            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                                Đã xảy ra lỗi hệ thống
                            </h1>
                            <p className="text-sm md:text-base text-muted-foreground">
                                Ứng dụng đã gặp sự cố trong quá trình xử lý. Rất xin lỗi vì sự bất tiện này.
                            </p>
                        </div>

                        <div className="rounded-md bg-muted/70 px-4 py-3 text-left text-[11px] md:text-xs text-muted-foreground border border-border/70">
                            <span className="font-medium text-foreground/80">Chi tiết kỹ thuật:&nbsp;</span>
                            <span className="break-words">
                                {message || "Có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau hoặc liên hệ quản trị viên."}
                            </span>
                        </div>

                        {showRetry ? (
                            <div className="pt-2 flex flex-col items-start gap-2">
                                <Button size="sm" onClick={onRetry} className="h-10 px-8 text-sm font-medium">
                                    Thử tải lại trang
                                </Button>
                                <p className="text-[11px] text-muted-foreground">
                                    Nếu lỗi tiếp tục xảy ra, hãy chụp lại màn hình này và gửi cho đội kỹ thuật.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

