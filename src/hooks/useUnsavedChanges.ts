"use client"

import * as React from "react"

export function useUnsavedChanges(isDirty: boolean) {
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!isDirty) return
      const target = e.target as Element | null
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute("href")
      if (!href) return
      if (href.startsWith("#")) return
      if (anchor.target === "_blank") return
      const url = new URL(href, location.href)
      if (url.origin !== location.origin) return
      e.preventDefault()
      window.dispatchEvent(
        new CustomEvent("unsaved-changes", {
          detail: {
            proceed: () => {
              location.href = url.pathname + url.search + url.hash
            },
          },
        } as any)
      )
    }
    window.addEventListener("click", onClick, { capture: true })
    return () => window.removeEventListener("click", onClick, { capture: true } as any)
  }, [isDirty])

  // Intercept keyboard-triggered reloads (F5 or Ctrl/Cmd+R) to use custom modal instead of native dialog
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isDirty) return
      const key = e.key.toLowerCase()
      const isReloadKey = key === "f5" || (key === "r" && (e.ctrlKey || e.metaKey))
      if (!isReloadKey) return
      e.preventDefault()
      window.dispatchEvent(
        new CustomEvent("unsaved-changes", {
          detail: {
            proceed: () => location.reload(),
          },
        } as any)
      )
    }
    window.addEventListener("keydown", onKeyDown, { capture: true })
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true } as any)
  }, [isDirty])

  React.useEffect(() => {
    const onPopState = (_e: PopStateEvent) => {
      if (!isDirty) return
      history.pushState(null, "", location.href)
      window.dispatchEvent(
        new CustomEvent("unsaved-changes", {
          detail: {
            proceed: () => history.back(),
          },
        } as any)
      )
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [isDirty])
}
