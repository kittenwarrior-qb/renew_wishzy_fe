"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/shared/common/Pagination"
import { Plus, Pencil, Inbox } from "lucide-react"
import type { Category } from "@/types/category"
import { useSubCategories, useCategoryDetail } from "@/components/shared/category/useCategory"
import { useAppStore } from "@/stores/useAppStore"

export function InlineChildrenRow({ parentId, onAddChild, onEditChild }: { parentId: string; onAddChild: () => void; onEditChild: (c: Category) => void }) {
    const params = useParams<{ locale: string }>()
    const locale = params?.locale || "vi"
    const { theme } = useAppStore()
    const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"
    const [childPage, setChildPage] = React.useState<number>(1)
    const [childLimit] = React.useState<number>(5)
    const { data, isPending, isError } = useSubCategories(parentId, childPage, childLimit)
    const { data: parent } = useCategoryDetail(parentId)
    const items = (data?.data ?? []) as Category[]
    const total = data?.total ?? 0
    const totalPages = data?.totalPages ?? Math.ceil(total / (data?.limit || childLimit || 1))

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Ghi chú: <span className="text-foreground/80">{parent?.notes ?? "-"}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Link href={`/${locale}/admin/categories/${parentId}`} className="inline-flex">
                        <Button variant="secondary" size="sm" className="gap-1 rounded-full cursor-pointer h-8 px-3 text-sm" title="Xem tất cả">
                            Xem tất cả
                        </Button>
                    </Link>
                    <Button variant="secondary" size="sm" className="gap-1 rounded-full cursor-pointer h-8 px-3 text-sm" onClick={onAddChild} title="Thêm danh mục con">
                        <Plus className="h-4 w-4" />
                        <span>Thêm</span>
                    </Button>
                </div>
            </div>
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
                <div className="rounded-md border overflow-x-auto w-fit mx-auto">
                    <table className="min-w-[720px] text-sm">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="p-2 text-center whitespace-nowrap">Tên</th>
                                <th className="p-2 text-center whitespace-nowrap">Ngày tạo</th>
                                <th className="p-2 text-center whitespace-nowrap">Ngày cập nhật</th>
                                <th className="p-2 text-center whitespace-nowrap">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((c: Category) => (
                                <tr key={String(c.id)} className="border-t">
                                    <td className="p-2 text-left whitespace-nowrap">{c.name}</td>
                                    <td className="p-2 text-center whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="p-2 text-center whitespace-nowrap">{new Date(c.updatedAt).toLocaleDateString()}</td>
                                    <td className="p-2 text-center whitespace-nowrap">
                                        <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8" onClick={() => onEditChild(c)} title="Sửa">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-2">
                        <Pagination
                            pagination={{ totalItems: total, totalPages, currentPage: data?.page ?? childPage, itemsPerPage: data?.limit ?? childLimit }}
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
