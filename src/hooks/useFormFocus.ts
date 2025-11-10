"use client"

import * as React from "react"

type Errors = Record<string, string | undefined>

export function useFormFocus(names: string[], errors?: Errors, enabled: boolean = true) {
  const refs = React.useRef<Record<string, HTMLElement | null>>({})
  const focusedOnce = React.useRef(false)
  const attempts = React.useRef(0)

  const register = React.useCallback((name: string) => (el: HTMLElement | null) => {
    refs.current[name] = el
  }, [])

  const focusByName = React.useCallback((name?: string) => {
    if (!name) return false
    const el = refs.current[name]
    if (el && typeof (el as any).focus === "function") {
      ;(el as any).focus()
      return true
    }
    return false
  }, [])

  React.useEffect(() => {
    if (!enabled) return
    let timer: any
    const hasErrors = !!errors && Object.values(errors).some(Boolean)
    if (hasErrors) {
      const firstErr = names.find((n) => !!errors?.[n])
      if (firstErr) {
        const ok = focusByName(firstErr)
        if (ok) {
          focusedOnce.current = true
          attempts.current = 0
        } else if (attempts.current < 10) {
          timer = setTimeout(() => {
            attempts.current += 1
            if (focusByName(firstErr)) {
              focusedOnce.current = true
              attempts.current = 0
            }
          }, 60)
        }
        return
      }
    }
    if (!focusedOnce.current) {
      const ok = focusByName(names[0])
      if (ok) {
        focusedOnce.current = true
        attempts.current = 0
      } else if (attempts.current < 10) {
        timer = setTimeout(() => {
          attempts.current += 1
          if (focusByName(names[0])) {
            focusedOnce.current = true
            attempts.current = 0
          }
        }, 60)
      }
    }
    return () => timer && clearTimeout(timer)
  }, [enabled, focusByName, names, errors ? JSON.stringify(errors) : "noerr"])

  const focusFirstError = React.useCallback(() => {
    const firstErr = names.find((n) => !!errors?.[n])
    focusByName(firstErr)
  }, [errors, focusByName, names])

  return { register, focusFirstError }
}
