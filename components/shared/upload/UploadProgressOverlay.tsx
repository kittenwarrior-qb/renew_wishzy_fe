"use client"

import * as React from "react"

export default function UploadProgressOverlay({ progress, logoSrc = "/images/white-logo.png", className = "" }: { progress: number; logoSrc?: string; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-white p-4 ${className}`}>
      <img src={logoSrc} alt="logo" className="h-10 w-auto" />
      <div className="w-1/2 max-w-xs">
        <div className="h-2 w-full rounded bg-white/20 overflow-hidden">
          <div className="h-full bg-white" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1 text-center text-xs font-medium">{progress}%</div>
      </div>
    </div>
  )
}
