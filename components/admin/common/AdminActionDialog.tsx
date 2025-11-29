"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type AdminActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  loading?: boolean;
  onConfirm?: () => void;
  showCancel?: boolean;
  position?: "top";
};

export function AdminActionDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  confirmVariant = "default",
  loading,
  onConfirm,
  showCancel = true,
  position = "top",
}: AdminActionDialogProps) {
  const contentClass =
    position === "top"
      ? "sm:max-w-lg top-6 left-1/2 -translate-x-1/2 translate-y-0 data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-top-2 fixed max-h-[90vh] flex flex-col"
      : "sm:max-w-lg max-h-[90vh] flex flex-col";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={contentClass}
        {...(!description ? { ["aria-describedby"]: undefined } : {})}
      >
        <DialogHeader className="border-b pb-3 flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description ? (
          <DialogDescription className="text-sm text-muted-foreground flex-shrink-0">
            {description}
          </DialogDescription>
        ) : null}
        <div className="overflow-y-auto flex-1 py-4 -mx-6 px-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/80 scrollbar-thin">
          {children}
        </div>
        <DialogFooter className="flex-shrink-0 border-t pt-3">
          {showCancel ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {cancelText}
            </Button>
          ) : null}
          {onConfirm ? (
            <Button
              variant={confirmVariant as any}
              onClick={onConfirm}
              disabled={!!loading}
              className="cursor-pointer"
            >
              {loading ? "Đang xử lý..." : confirmText}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
