"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/shared/common/Pagination"
import { Pencil, Trash2, ChevronDown } from "lucide-react"
import type { Category } from "@/types/category"
import { InlineChildrenRow } from "@/components/shared/category/InlineChildrenRow"
import { ChildCount } from "@/components/shared/category/ChildCount"

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
}

export function CategoryTable({ items, currentPage, pageSize, total, totalPages, expanded, toggleExpanded, onEdit, onDelete, onAddChild, onPageChange, deleting }: CategoryTableProps) {
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
                                            <button className="inline-flex items-center cursor-pointer gap-1 hover:underline cursor-default" onClick={() => toggleExpanded(String(item.id))}>
                                                <span>{item.name}</span>
                                                <span className="text-muted-foreground">(<ChildCount parentId={String(item.id)} />)</span>
                                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded.has(String(item.id)) ? "rotate-180" : ""}`} />
                                            </button>
                                        </td>
                                        <td className="p-3 text-center">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 text-center">{new Date(item.updatedAt).toLocaleDateString()}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-1">
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
        </Card>
    )
}
