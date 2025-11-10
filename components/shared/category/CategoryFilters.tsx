"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"

export type CategoryFiltersProps = {
    nameFilter: string
    setNameFilter: (v: string) => void
    parentIdFilter: string
    setParentIdFilter: (v: string) => void
    isSubCategory: boolean | undefined
    setIsSubCategory: (v: boolean | undefined) => void
    setPage: (p: number) => void
    filtersActive: boolean
    parents: any[]
    onSearchSubmit?: (value?: string) => void
}

export function CategoryFilters({ nameFilter, setNameFilter, parentIdFilter, setParentIdFilter, isSubCategory, setIsSubCategory, setPage, filtersActive, parents, onSearchSubmit }: CategoryFiltersProps) {
    return (
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Tìm danh mục..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault()
                            onSearchSubmit?.(e.currentTarget.value)
                        }
                    }}
                    className="h-9 pl-9 pr-10 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {nameFilter ? (
                    <button
                        type="button"
                        onClick={() => { setNameFilter(""); setPage(1); onSearchSubmit?.("") }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent"
                        aria-label="Xoá tìm kiếm"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                ) : null}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 md:ml-3 gap-2 relative cursor-pointer">
                        <Filter className="h-4 w-4" />
                        <span>Bộ lọc</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 p-3 space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Loại</label>
                        <Select
                            value={isSubCategory === undefined ? "__all" : isSubCategory ? "sub" : "parent"}
                            onValueChange={(v) => { setIsSubCategory(v === "__all" ? undefined : v === "sub"); setPage(1) }}
                        >
                            <SelectTrigger className="h-9"><SelectValue placeholder="Loại" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all">Tất cả</SelectItem>
                                <SelectItem value="parent">Danh mục cha</SelectItem>
                                <SelectItem value="sub">Danh mục con</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Danh mục cha</label>
                        <Select
                            value={parentIdFilter || "__any"}
                            onValueChange={(v) => { setParentIdFilter(v === "__any" ? "" : v); setPage(1) }}
                        >
                            <SelectTrigger className="h-9"><SelectValue placeholder="Parent" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__any">Tất cả danh mục cha</SelectItem>
                                {parents.map((p: any) => (
                                    <SelectItem key={String(p.id)} value={String(p.id)}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => { setNameFilter(""); setParentIdFilter(""); setIsSubCategory(undefined); setPage(1); onSearchSubmit?.(""); }}>
                            Đặt lại
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {filtersActive ? (
                <Button
                    variant="outline"
                    className="h-9 md:ml-2 gap-2"
                    onClick={() => { setNameFilter(""); setParentIdFilter(""); setIsSubCategory(undefined); setPage(1); onSearchSubmit?.(""); }}
                    title="Xoá tất cả điều kiện lọc"
                >
                    <X className="h-4 w-4" />
                </Button>
            ) : null}
        </div>
    )
}
