"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type AdminActionDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: React.ReactNode
    children?: React.ReactNode
    confirmText?: string
    cancelText?: string
    confirmVariant?: "primary" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    loading?: boolean
    onConfirm?: () => void
    showCancel?: boolean
    position?: "top"
}

export function AdminActionDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    confirmText = "Xác nhận",
    cancelText = "Huỷ",
    confirmVariant = "primary",
    loading,
    onConfirm,
    showCancel = true,
    position = "top",
}: AdminActionDialogProps) {
    const contentClass =
        position === "top"
            ? "sm:max-w-lg top-6 left-1/2 -translate-x-1/2 translate-y-0 data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-top-2 fixed"
            : "sm:max-w-lg"
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={contentClass}>
                <DialogHeader className="border-b pb-3">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
                {children}
                <DialogFooter>
                    {showCancel ? (
                        <Button variant="outline" onClick={() => onOpenChange(false)}>{cancelText}</Button>
                    ) : null}
                    {onConfirm ? (
                        <Button variant={confirmVariant as any} onClick={onConfirm} disabled={!!loading} className="cursor-pointer">
                            {loading ? "Đang xử lý..." : confirmText}
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
