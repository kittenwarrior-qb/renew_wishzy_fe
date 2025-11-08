"use client"

import * as React from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useCategoryList, useDeleteCategory, useParentCategories } from "@/components/shared/category/useCategory"
import type { CategoryFilter, Category } from "@/types/category"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Search, Filter } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

export default function CategoryListPage() {
    const router = useRouter()
    const params = useParams<{ locale: string }>()
    const locale = params?.locale || "vi"

    const searchParams = useSearchParams()
    const [page, setPage] = React.useState<number>(Number(searchParams.get("page") || 1))
    const [limit, setLimit] = React.useState<number>(Number(searchParams.get("limit") || 10))
    const [nameFilter, setNameFilter] = React.useState<string>(searchParams.get("search") || "")
    const [parentIdFilter, setParentIdFilter] = React.useState<string>(searchParams.get("parentId") || "")
    const [isSubCategory, setIsSubCategory] = React.useState<boolean | undefined>(() => {
        const v = searchParams.get("isSubCategory")
        return v === null ? undefined : v === "true" ? true : v === "false" ? false : undefined
    })

    const { data: parentsData } = useParentCategories()

    React.useEffect(() => {
        const qs = new URLSearchParams()
        if (nameFilter) qs.append("search", nameFilter)
        qs.append("page", String(page || 1))
        qs.append("limit", String(limit || 10))
        if (parentIdFilter) qs.append("parentId", parentIdFilter)
        if (isSubCategory !== undefined) qs.append("isSubCategory", String(!!isSubCategory))
        const query = qs.toString()
        const href = `/${locale}/admin/categories${query ? `?${query}` : ""}`
        router.replace(href)
    }, [page, limit, nameFilter, parentIdFilter, isSubCategory, locale, router])

    React.useEffect(() => {
        const t = setTimeout(() => setPage(1), 400)
        return () => clearTimeout(t)
    }, [nameFilter])

    const filter = React.useMemo<CategoryFilter>(() => ({ page, limit, search: nameFilter || undefined, parentId: parentIdFilter || undefined, isSubCategory }), [page, limit, nameFilter, parentIdFilter, isSubCategory])
    const { data, isPending, isError } = useCategoryList(filter)
    const { mutate: deleteCategory, isPending: deleting } = useDeleteCategory()
    const [openDelete, setOpenDelete] = React.useState(false)
    const [target, setTarget] = React.useState<{ id: string; name: string } | null>(null)

    const handleDelete = (id: string, name: string) => {
        setTarget({ id, name })
        setOpenDelete(true)
    }

    const total = data?.total ?? 0
    const currentPage = data?.page ?? page
    const pageSize = data?.limit ?? limit
    const totalPages = data?.totalPages ?? Math.ceil(total / pageSize || 1)

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
                        <div className="relative md:w-80">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm danh mục..."
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="h-9 pl-9 pr-10"
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 md:ml-3 gap-2">
                                    <Filter className="h-4 w-4" />
                                    <span>+ Thêm điều kiện lọc</span>
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
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Parent</label>
                                    <Select
                                        value={parentIdFilter || "__any"}
                                        onValueChange={(v) => { setParentIdFilter(v === "__any" ? "" : v); setPage(1) }}
                                    >
                                        <SelectTrigger className="h-9"><SelectValue placeholder="Parent" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__any">Tất cả parent</SelectItem>
                                            {(parentsData?.data ?? []).map((p: any) => (
                                                <SelectItem key={String(p.id)} value={String(p.id)}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="outline" size="sm" onClick={() => { setNameFilter(""); setParentIdFilter(""); setIsSubCategory(undefined); setPage(1); }}>
                                        Đặt lại
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {isPending ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Đang tải...</div>
            ) : isError ? (
                <div className="py-10 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
            ) : (
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr className="text-left">
                                    <th className="p-3 w-16">STT</th>
                                    <th className="p-3">Tên</th>
                                    <th className="p-3">Parent ID</th>
                                    <th className="p-3">Ngày tạo</th>
                                    <th className="p-3">Ghi chú</th>
                                    <th className="p-3 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.data ?? [])?.map((item: Category, idx: number) => {
                                    const stt = (currentPage - 1) * pageSize + idx + 1
                                    return (
                                        <tr key={item.id} className="border-t hover:bg-muted/30">
                                            <td className="p-3 w-16 text-muted-foreground">{stt}</td>
                                            <td className="p-3 font-medium">{item.name}</td>
                                            <td className="p-3">{item.parentId ?? "-"}</td>
                                            <td className="p-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3 text-muted-foreground">{item.notes ?? "-"}</td>
                                            <td className="p-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => router.push(`/${locale}/admin/categories/edit/${item.id}`)} title="Sửa">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => handleDelete(item.id, item.name)} title="Xoá" disabled={deleting}>
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
            )}

            <div className="mt-4 flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                    Trang {currentPage} / {totalPages} · Tổng {total}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        Trang trước
                    </Button>
                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
                        Trang sau
                    </Button>
                </div>
            </div>
        </div>
    )
}
