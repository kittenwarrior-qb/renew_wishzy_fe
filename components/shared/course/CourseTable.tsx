"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import type { Course } from "@/types/course/course.types"

export type CourseTableProps = {
    items: Course[]
    currentPage: number
    pageSize: number
    total: number
    totalPages: number
    onEdit: (c: Course) => void
    onDelete: (id: string, name: string) => void
    deleting?: boolean
}

export function CourseTable({ items, currentPage, pageSize, total, totalPages, onEdit, onDelete, deleting }: CourseTableProps) {
    const formatPrice = (price: string | number) => {
        const num = typeof price === 'string' ? parseFloat(price) : price
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
    }

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }

    return (
        <Card>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="p-3 w-16 text-center">STT</th>
                            <th className="p-3 text-left">Tên</th>
                            <th className="p-3 text-center">Danh mục</th>
                            <th className="p-3 text-center">Giá</th>
                            <th className="p-3 text-center">Cấp độ</th>
                            <th className="p-3 text-center">Trạng thái</th>
                            <th className="p-3 text-center">Ngày tạo</th>
                            <th className="p-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: Course, idx: number) => {
                            const stt = (currentPage - 1) * pageSize + idx + 1
                            return (
                                <tr key={String(item.id)} className="border-t hover:bg-muted/30">
                                    <td className="p-3 w-16 text-muted-foreground text-center">{stt}</td>
                                    <td className="p-3 font-medium text-left">
                                        <div className="flex items-center gap-2">
                                            {item.thumbnail && (
                                                <img src={item.thumbnail} alt={item.name} className="h-10 w-10 rounded object-cover" />
                                            )}
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                {item.description && (
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        {item.category?.name || '-'}
                                    </td>
                                    <td className="p-3 text-center font-medium">
                                        {formatPrice(item.price)}
                                    </td>
                                    <td className="p-3 text-center">
                                        {item.level ? (
                                            <Badge variant="outline">
                                                {item.level === 'beginner' ? 'Cơ bản' : item.level === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                                            </Badge>
                                        ) : '-'}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Badge variant={item.status ? "default" : "secondary"}>
                                            {item.status ? "Kích hoạt" : "Tắt"}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-center">{new Date(item.createdAt).toLocaleDateString()}</td>
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
                            )
                        })}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    )
}

