"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/shared/common/Pagination"
import { Pencil, Trash2, ChevronDown, Eye, Folder } from "lucide-react"
import type { Category } from "@/types/category"
import { InlineChildrenRow } from "@/components/shared/category/InlineChildrenRow"
import { ChildCount } from "@/components/shared/category/ChildCount"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCategoryDetail, useParentCategories, useSubCategories } from "@/components/shared/category/useCategory"
import { useAppStore } from "@/stores/useAppStore"

function ChildrenBranch({ parentId, depth = 0, maxDepth = 2 }: { parentId: string; depth?: number; maxDepth?: number }) {
    const { theme } = useAppStore()
    const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"
    const { data, isPending, isError } = useSubCategories(parentId, 1, 100)
    const items = (data?.data ?? []) as Category[]
    if (isPending) return (
        <div className="py-4 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <img src={logoSrc} alt="Wishzy" className="h-6 w-auto opacity-90" />
                <div aria-label="loading" className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Đang tải...</span>
            </div>
        </div>
    )
    if (isError || items.length === 0) return <div className="text-xs text-muted-foreground">Không có danh mục con</div>
    return (
        <ul className="space-y-1" style={{ paddingLeft: depth ? 12 : 0 }}>
            {items.map((c) => (
                <li key={String(c.id)}>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground" />
                        <span className="truncate">{c.name}</span>
                    </div>
                    {depth + 1 <= maxDepth ? (
                        <ChildrenBranch parentId={String(c.id)} depth={depth + 1} maxDepth={maxDepth} />
                    ) : null}
                </li>
            ))}
        </ul>
    )
}

export type CategoryTableProps = {
    items: Category[]
    currentPage: number
    pageSize: number
    total: number
    totalPages: number
    expanded: Set<string>
    toggleExpanded: (id: string) => void
    onEdit: (c: Category) => void
    onDelete: (id: string, name: string) => void
    onAddChild: (parentId: string) => void
    onPageChange: (p: number) => void
    deleting?: boolean
    locale?: string
}

export function CategoryTable({ items, currentPage, pageSize, total, totalPages, expanded, toggleExpanded, onEdit, onDelete, onAddChild, onPageChange, deleting, locale }: CategoryTableProps) {
    const [openView, setOpenView] = React.useState(false)
    const [viewingId, setViewingId] = React.useState<string | null>(null)
    const { data: viewing } = useCategoryDetail(viewingId || "")
    const { data: parentsData } = useParentCategories()
    const { theme } = useAppStore()
    const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"
    const parentNameById = React.useMemo(() => {
        const map = new Map<string, string>()
        const arr = (parentsData?.data ?? []) as any[]
        for (const p of arr) map.set(String(p.id), p.name)
        return map
    }, [parentsData])

    return (
        <Card>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="p-3 w-16 text-center">STT</th>
                            <th className="p-3 text-center">Tên</th>
                            <th className="p-3 text-center">Ngày tạo</th>
                            <th className="p-3 text-center">Ngày cập nhật</th>
                            <th className="p-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: Category, idx: number) => {
                            const stt = (currentPage - 1) * pageSize + idx + 1
                            return (
                                <React.Fragment key={String(item.id)}>
                                    <tr className="border-t hover:bg-muted/30">
                                        <td className="p-3 w-16 text-muted-foreground text-center">{stt}</td>
                                        <td className="p-3 font-medium text-left">
                                            <button className="inline-flex items-center gap-1 hover:underline cursor-pointer" onClick={() => toggleExpanded(String(item.id))}>
                                                <span>{item.name}</span>
                                                <span className="text-muted-foreground">(<ChildCount parentId={String(item.id)} />)</span>
                                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded.has(String(item.id)) ? "rotate-180" : ""}`} />
                                            </button>
                                        </td>
                                        <td className="p-3 text-center">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 text-center">{new Date(item.updatedAt).toLocaleDateString()}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-1">
                                                <Button variant="ghost" size="icon" className="cursor-pointer" title="Xem chi tiết" onClick={() => { setViewingId(String(item.id)); setOpenView(true) }}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => onEdit(item)} title="Sửa">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => onDelete(String(item.id), item.name)} title="Xoá" disabled={deleting}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expanded.has(String(item.id)) ? (
                                        <tr className="border-t bg-muted/20">
                                            <td colSpan={5} className="p-3">
                                                <InlineChildrenRow
                                                    parentId={String(item.id)}
                                                    onAddChild={() => onAddChild(String(item.id))}
                                                    onEditChild={(cat) => onEdit(cat)}
                                                    onDeleteChild={(cat) => onDelete(String(cat.id), cat.name)}
                                                    onViewChild={(cat: Category) => { setViewingId(String(cat.id)); setOpenView(true) }}
                                                />
                                            </td>
                                        </tr>
                                    ) : null}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </CardContent>

            <Dialog open={openView} onOpenChange={setOpenView}>
                <DialogContent className="sm:max-w-xl md:max-w-2xl top-10 sm:top-16 translate-y-0">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent"><Folder className="h-4 w-4 text-accent-foreground" /></span>
                            <span>Chi tiết danh mục</span>
                        </DialogTitle>
                    </DialogHeader>
                    {viewing ? (
                        <div className="space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="text-xl font-semibold leading-tight truncate" title={viewing.name || "Danh mục"}>
                                        {viewing.name || "Danh mục"}
                                    </div>
                                    {(viewing as any)?.parentId ? (
                                        <div className="mt-2 inline-flex items-center gap-2">
                                            <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">Danh mục cha: {parentNameById.get(String((viewing as any).parentId)) || `(ID: ${String((viewing as any).parentId)})`}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {(viewing as any)?.slug ? (
                                    <div className="rounded-md border p-3">
                                        <dt className="text-xs text-muted-foreground mb-1">Slug</dt>
                                        <dd className="font-medium truncate">{String((viewing as any).slug)}</dd>
                                    </div>
                                ) : null}
                                <div className="rounded-md border p-3">
                                    <dt className="text-xs text-muted-foreground mb-1">Ngày tạo</dt>
                                    <dd className="font-medium">{viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : "-"}</dd>
                                </div>
                                <div className="rounded-md border p-3">
                                    <dt className="text-xs text-muted-foreground mb-1">Ngày cập nhật</dt>
                                    <dd className="font-medium">{viewing.updatedAt ? new Date(viewing.updatedAt).toLocaleString() : "-"}</dd>
                                </div>
                            </dl>

                            <div>
                                <div className="text-xs text-muted-foreground mb-2">Danh mục con</div>
                                <div className="rounded-md border p-3">
                                    <ChildrenBranch parentId={String((viewing as any)?.id || viewingId || "")} />
                                </div>
                            </div>

                            {viewing.notes ? (
                                <div className="rounded-md border p-3">
                                    <div className="text-xs text-muted-foreground mb-1">Ghi chú</div>
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{viewing.notes}</div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="py-6 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                <img src={logoSrc} alt="Wishzy" className="h-8 w-auto opacity-90" />
                                <div aria-label="loading" className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                <span>Đang tải...</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}
