"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  loading?: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  position?: "center" | "top"
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  confirmVariant = "default",
  loading,
  onConfirm,
  onOpenChange,
  position = "center",
}: ConfirmDialogProps) {
  const contentClass =
    position === "top"
      ? "sm:max-w-lg top-6 left-1/2 -translate-x-1/2 translate-y-0 data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-top-2 fixed"
      : undefined
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClass} {...(!description ? { ['aria-describedby']: undefined } : {})}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description ? <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{cancelText}</Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={!!loading} className="cursor-pointer">
            {loading ? "Đang xử lý..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
