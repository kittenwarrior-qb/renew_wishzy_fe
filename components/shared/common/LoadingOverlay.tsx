"use client"

import * as React from "react"
import { useAppStore } from "@/stores/useAppStore"

type Props = {
  show: boolean
  className?: string
}

export function LoadingOverlay({ show, className }: Props) {
  const { theme } = useAppStore()
  const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"
  if (!show) return null
  return (
    <div className={`absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm ${className || ''}`}>
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
        <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Đang tải dữ liệu...</span>
      </div>
    </div>
  )
}
