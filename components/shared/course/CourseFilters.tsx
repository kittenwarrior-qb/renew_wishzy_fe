"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Trash2 } from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"

export type CourseFiltersProps = {
    nameFilter: string
    setNameFilter: (v: string) => void
    categoryIdFilter: string
    setCategoryIdFilter: (v: string) => void
    statusFilter: boolean | undefined
    setStatusFilter: (v: boolean | undefined) => void
    setPage: (p: number) => void
    filtersActive: boolean
    categories: any[]
}

export function CourseFilters({ nameFilter, setNameFilter, categoryIdFilter, setCategoryIdFilter, statusFilter, setStatusFilter, setPage, filtersActive, categories }: CourseFiltersProps) {
    return (
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Tìm khóa học..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="h-9 pl-9 pr-10"
                />
                {nameFilter ? (
                    <button
                        type="button"
                        onClick={() => { setNameFilter(""); setPage(1) }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent"
                        aria-label="Xoá tìm kiếm"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
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
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Danh mục</label>
                        <Select
                            value={categoryIdFilter || "__any"}
                            onValueChange={(v) => { setCategoryIdFilter(v === "__any" ? "" : v); setPage(1) }}
                        >
                            <SelectTrigger className="h-9"><SelectValue placeholder="Danh mục" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__any">Tất cả danh mục</SelectItem>
                                {categories.map((c: any) => (
                                    <SelectItem key={String(c.id)} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Trạng thái</label>
                        <Select
                            value={statusFilter === undefined ? "__all" : statusFilter ? "active" : "inactive"}
                            onValueChange={(v) => { setStatusFilter(v === "__all" ? undefined : v === "active"); setPage(1) }}
                        >
                            <SelectTrigger className="h-9"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all">Tất cả</SelectItem>
                                <SelectItem value="active">Kích hoạt</SelectItem>
                                <SelectItem value="inactive">Tắt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => { setNameFilter(""); setCategoryIdFilter(""); setStatusFilter(undefined); setPage(1); }}>
                            Đặt lại
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {filtersActive ? (
                <Button
                    variant="outline"
                    className="h-9 md:ml-2 gap-2"
                    onClick={() => { setNameFilter(""); setCategoryIdFilter(""); setStatusFilter(undefined); setPage(1); }}
                    title="Xoá tất cả điều kiện lọc"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            ) : null}
        </div>
    )
}

