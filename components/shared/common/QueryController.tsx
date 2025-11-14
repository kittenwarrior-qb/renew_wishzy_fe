"use client"

import * as React from "react"

export type QueryState = Record<string, any>

export type QueryControllerProps<T extends QueryState = QueryState> = {
    initial?: T
    debounceMs?: number
    onChange?: (q: T) => void
    persistToUrl?: boolean
    children: (ctx: {
        query: T
        setQuery: (patch: Partial<T> | ((prev: T) => Partial<T>)) => void
        reset: () => void
    }) => React.ReactNode
}

const useDebouncedEffect = (effect: () => void, deps: any[], ms: number) => {
    React.useEffect(() => {
        const id = setTimeout(effect, ms)
        return () => clearTimeout(id)
    }, deps)
}

export default function QueryController<T extends QueryState = QueryState>({
    initial,
    debounceMs = 300,
    onChange,
    persistToUrl = false,
    children,
}: QueryControllerProps<T>) {
    const initialState = React.useMemo<T>(() => ({ ...((initial as any) || {}) }), [initial])
    const [query, setQueryState] = React.useState<T>(initialState)

    const setQuery = React.useCallback((patch: Partial<T> | ((prev: T) => Partial<T>)) => {
        setQueryState((prev) => ({ ...prev, ...(typeof patch === 'function' ? (patch as any)(prev) : patch) }))
    }, [])

    const reset = React.useCallback(() => setQueryState(initialState), [initialState])

    useDebouncedEffect(() => {
        onChange?.(query)
        if (persistToUrl && typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            Object.entries(query || {}).forEach(([k, v]) => {
                if (v === undefined || v === null || v === '') url.searchParams.delete(k)
                else url.searchParams.set(k, String(v))
            })
            window.history.replaceState({}, '', url.toString())
        }
    }, [query, onChange, persistToUrl], debounceMs)

    return <>{children({ query, setQuery, reset })}</>
}
