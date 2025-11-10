"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type NotifyPayload = {
  title?: string
  description?: string
  variant?: "default" | "success" | "destructive" | "warning" | "info"
  durationMs?: number
}

export function notify(detail: NotifyPayload) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent<NotifyPayload>("admin:notify", { detail }))
}

type Item = NotifyPayload & { id: string; createdAt: number }

export function Notifications() {
  const [items, setItems] = React.useState<Item[]>([])

  React.useEffect(() => {
    const onNotify = (e: Event) => {
      const ce = e as CustomEvent<NotifyPayload>
      const id = Math.random().toString(36).slice(2)
      const item: Item = {
        id,
        createdAt: Date.now(),
        variant: "default",
        durationMs: 3500,
        ...ce.detail,
      }
      setItems((prev) => [...prev, item])
      const timeout = setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id))
      }, item.durationMs)
      return () => clearTimeout(timeout)
    }
    window.addEventListener("admin:notify", onNotify as any)
    return () => window.removeEventListener("admin:notify", onNotify as any)
  }, [])

  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id))

  const variantStyles = (v: Item["variant"]) => {
    switch (v) {
      case "success":
        return {
          wrap: "border-green-500/40 bg-green-500/10 text-green-700",
          iconWrap: "bg-green-500/20 text-green-600",
          bar: "bg-green-500/70",
        }
      case "destructive":
        return {
          wrap: "border-red-500/40 bg-red-500/10 text-red-700",
          iconWrap: "bg-red-500/20 text-red-600",
          bar: "bg-red-500/70",
        }
      case "warning":
        return {
          wrap: "border-amber-400/40 bg-amber-400/10 text-amber-700",
          iconWrap: "bg-amber-400/20 text-amber-600",
          bar: "bg-amber-400/70",
        }
      default:
        return {
          wrap: "border-gray-400/30 bg-gray-500/5 text-gray-700",
          iconWrap: "bg-gray-400/15 text-gray-600",
          bar: "bg-gray-400/60",
        }
    }
  }


  const Icon = ({ variant }: { variant?: Item["variant"] }) => {
    const c = cn("h-4 w-4");
    switch (variant) {
      case "success":
        return (
          <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )
      case "destructive":
        return (
          <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        )
      case "warning":
        return (
          <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        )
      case "info":
        return (
          <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        )
      default:
        return (
          <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )
    }
  }

  return (
    <div className="pointer-events-none fixed top-3 right-3 z-[100] flex flex-col items-end gap-3 px-2">
      {items.map((n) => {
        const vs = variantStyles(n.variant)
        return (
          <div
            key={n.id}
            role="status"
            aria-live="polite"
            className={cn(
              "pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-none border bg-background/95 shadow-lg ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-background/60",
              vs.wrap,
              "transition-all duration-200 animate-in fade-in slide-in-from-right-2"
            )}
          >
            <div className={cn("absolute left-0 top-0 h-full w-1", vs.bar)} />
            <div className="flex items-start gap-3 px-4 py-3">
              <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", vs.iconWrap)}>
                <Icon variant={n.variant} />
              </div>
              <div className="min-w-0 flex-1">
                {n.title ? <div className="truncate text-sm font-semibold leading-5">{n.title}</div> : null}
                {n.description ? <div className="mt-0.5 line-clamp-3 text-xs text-muted-foreground">{n.description}</div> : null}
              </div>
              <button
                aria-label="Dismiss notification"
                className="-m-1 rounded-md p-1 text-foreground/60 transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={() => remove(n.id)}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
