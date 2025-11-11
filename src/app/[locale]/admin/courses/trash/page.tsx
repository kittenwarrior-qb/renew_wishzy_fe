"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import type { Course } from "@/types/course/course.types"
import { useCourseList, useRestoreCourse } from "@/components/shared/course/useCourse"
import { Button } from "@/components/ui/button"
import { notify } from "@/components/shared/admin/Notifications"
import { Inbox, Undo2 } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"

export default function CourseTrashPage() {
    const params = useParams<{ locale: string }>()
    const locale = params?.locale || "vi"
    const router = useRouter()
    const searchParams = useSearchParams()
    const { theme } = useAppStore()
    const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

    const page = 1
    const limit = 1000
    const [name, setName] = React.useState<string>(searchParams.get("name") || "")

    const prevRef = React.useRef<{ name?: string } | null>(null)
    React.useEffect(() => {
        const qs = new URLSearchParams()
        if (name) qs.append("name", name)
        const href = `/${locale}/admin/courses/trash${qs.toString() ? `?${qs.toString()}` : ""}`

        const prev = prevRef.current
        if (!prev || prev.name !== (name || undefined)) router.replace(href)
        prevRef.current = { name: name || undefined }
    }, [name, locale, router])

    const filter = React.useMemo(() => ({ page, limit, name: name || undefined, deleted: true }), [page, limit, name])
    const { data, isPending, isError } = useCourseList(filter)
    const { mutate: restore, isPending: restoring } = useRestoreCourse()

    const allItems = (data?.data ?? []) as Course[]
    const getDeletedAt = (c: any) => (c?.deletedAt ?? c?.deleted_at ?? null) as string | null
    const items = allItems.filter((c) => !!getDeletedAt(c))
    const total = items.length
    const currentPage = 1
    const pageSize = total
    const totalPages = 1

    const formatPrice = (price: string | number) => {
        const num = typeof price === 'string' ? parseFloat(price) : price
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
    }

    return (
        <div className="relative">
            {isPending ? (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                        <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
                        <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Đang tải dữ liệu...</span>
                    </div>
                </div>
            ) : null}
            <div className="mb-4 flex items-center justify-between gap-2">
                <h1 className="text-lg font-semibold">Thùng rác khóa học</h1>
                <div className="ml-auto flex items-center gap-2">
                    <input
                        value={name}
                        onChange={(e) => { setName(e.target.value) }}
                        placeholder="Tìm theo tên..."
                        className="h-9 rounded-md border bg-background px-3 text-sm outline-none"
                    />
                </div>
            </div>

            {isError ? (
                <div className="py-16 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
            ) : items.length === 0 ? (
                <div className="py-16 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                        <Inbox className="h-10 w-10 text-muted-foreground/60" />
                        <span>Không có khóa học đã xoá</span>
                    </div>
                </div>
            ) : (
                <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                            <tr>
                                <th className="p-2 text-left">Tên</th>
                                <th className="p-2 text-left">Danh mục</th>
                                <th className="p-2 text-center">Giá</th>
                                <th className="p-2 text-center">Ngày xoá</th>
                                <th className="p-2 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((c) => (
                                <tr key={String(c.id)} className="border-t">
                                    <td className="p-2">
                                        <div className="flex items-center gap-2">
                                            {c.thumbnail && (
                                                <img src={c.thumbnail} alt={c.name} className="h-8 w-8 rounded object-cover" />
                                            )}
                                            <span className="font-medium">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-2">{c.category?.name || '-'}</td>
                                    <td className="p-2 text-center">{formatPrice(c.price)}</td>
                                    <td className="p-2 text-center">{getDeletedAt(c) ? new Date(getDeletedAt(c) as string).toLocaleString() : "-"}</td>
                                    <td className="p-2 text-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 cursor-pointer"
                                            disabled={restoring}
                                            onClick={() =>
                                                restore({ id: String(c.id) }, {
                                                    onSuccess: () => notify({ title: "Khôi phục thành công", variant: "success" }),
                                                    onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể khôi phục"), variant: "destructive" }),
                                                })
                                            }
                                            title="Khôi phục"
                                        >
                                            <Undo2 className="h-4 w-4" />
                                            Khôi phục
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

