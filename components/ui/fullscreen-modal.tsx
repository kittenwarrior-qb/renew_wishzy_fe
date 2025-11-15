"use client"

import * as React from "react"
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"

interface FullScreenModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  showCloseButton?: boolean
}

export function FullScreenModal({
  open,
  onOpenChange,
  children,
  showCloseButton = true,
}: FullScreenModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-50" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-[5%] left-[5%] z-50 w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] p-0 overflow-hidden rounded-lg",
            "bg-background shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              className="ring-offset-background focus:ring-ring absolute top-4 right-4 z-50 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

