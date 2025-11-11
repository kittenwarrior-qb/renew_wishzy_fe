"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/shared/common/Pagination"
import { Pencil, Trash2, Inbox, Eye } from "lucide-react"
import type { Category } from "@/types/category"
import { useSubCategories } from "@/components/shared/category/useCategory"
import { useAppStore } from "@/stores/useAppStore"

export function InlineChildrenRow({ parentId, onAddChild, onEditChild, onDeleteChild, onViewChild }: { parentId: string; onAddChild: () => void; onEditChild: (c: Category) => void; onDeleteChild: (c: Category) => void; onViewChild?: (c: Category) => void }) {
    const { theme } = useAppStore()
    const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"
    const [childPage, setChildPage] = React.useState<number>(1)
    const [childLimit] = React.useState<number>(5)
    const { data, isPending, isError } = useSubCategories(parentId, childPage, childLimit)
    const items = (data?.data ?? []) as Category[]
    const total = data?.total ?? 0
    const currentPage = data?.page ?? childPage
    const pageSize = data?.limit ?? childLimit
    const totalPages = data?.totalPages ?? Math.ceil(total / (pageSize || 1))

    return (
        <div className="space-y-2">
            {isPending ? (
                <div className="py-6 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                        <img src={logoSrc} alt="Wishzy" className="h-8 w-auto opacity-90" />
                        <div aria-label="loading" className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Đang tải danh mục con...</span>
                    </div>
                </div>
            ) : isError ? (
                <div className="text-sm text-destructive">Không tải được danh mục con</div>
            ) : items.length > 0 ? (
                <div className="space-y-2 max-w-[1000px] m-auto">
                    <div className="divide-y rounded-md border w-full mx-auto">
                        {items.map((c: Category, idx: number) => {
                            const stt = (currentPage - 1) * pageSize + idx + 1
                            return (
                                <div key={String(c.id)} className="flex items-center gap-2 justify-between py-1.5 px-2 hover:bg-muted/20">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-8 text-center text-xs text-muted-foreground">{stt}</span>
                                        <div className="min-w-0">
                                            <div className="font-medium truncate text-sm">{c.name}</div>
                                            <div className="text-[11px] text-muted-foreground truncate">Tạo: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"} • Cập nhật: {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "-"}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {onViewChild ? (
                                            <Button variant="ghost" size="icon" className="cursor-pointer h-7 w-7" onClick={() => onViewChild(c)} title="Xem chi tiết">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        ) : null}
                                        <Button variant="ghost" size="icon" className="cursor-pointer h-7 w-7" onClick={() => onEditChild(c)} title="Sửa">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="cursor-pointer h-7 w-7" onClick={() => onDeleteChild(c)} title="Xoá">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="pt-2">
                        <Pagination
                            pagination={{ totalItems: total, totalPages, currentPage, itemsPerPage: pageSize }}
                            onPageChange={(p) => setChildPage(p)}
                        />
                    </div>
                </div>
            ) : (
                <div className="py-6 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                        <Inbox className="h-8 w-8 text-muted-foreground/60" />
                        <span>Không có danh mục con</span>
                    </div>
                </div>
            )}
        </div>
    )
}
