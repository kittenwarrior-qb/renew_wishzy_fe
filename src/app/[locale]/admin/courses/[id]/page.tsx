"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCourseDetail, useDeleteCourse, useUpdateCourseStatus } from "@/components/shared/course/useCourse"
import { ChevronLeft, Pencil, Trash2, Loader2 } from "lucide-react"
import { notify } from "@/components/shared/admin/Notifications"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import { useAppStore } from "@/stores/useAppStore"

export default function CourseDetailPage() {
    const params = useParams<{ locale: string; id: string }>()
    const locale = params?.locale || "vi"
    const id = params?.id as string
    const router = useRouter()
    const { theme } = useAppStore()
    const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

    const { data: course, isPending, isError } = useCourseDetail(id)
    const { mutate: deleteCourse, isPending: deleting } = useDeleteCourse()
    const { mutate: updateStatus, isPending: updatingStatus } = useUpdateCourseStatus()
    const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)

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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('vi-VN')
    }

    const handleDelete = () => {
        if (!course) return
        deleteCourse({ id: String(course.id) }, {
            onSuccess: () => {
                setOpenDeleteConfirm(false)
                notify({ title: "Đã xoá", variant: "success" })
                router.push(`/${locale}/admin/courses`)
            },
            onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể xoá"), variant: "destructive" })
        })
    }

    const handleToggleStatus = () => {
        if (!course) return
        updateStatus({ id: String(course.id), status: !course.status }, {
            onSuccess: () => {
                notify({ title: "Đã cập nhật trạng thái", variant: "success" })
            },
            onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể cập nhật"), variant: "destructive" })
        })
    }

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                    <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
                    <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Đang tải dữ liệu...</span>
                </div>
            </div>
        )
    }

    if (isError || !course) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Chi tiết khóa học</h1>
                    <Link href={`/${locale}/admin/courses`} className="inline-flex">
                        <Button variant="outline" className="gap-2 cursor-pointer">
                            <ChevronLeft className="h-4 w-4" />
                            Quay lại danh sách
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardContent className="p-8 text-center text-destructive">
                        Không tìm thấy khóa học hoặc có lỗi xảy ra
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">Chi tiết khóa học</h1>
                    <p className="text-sm text-muted-foreground">Thông tin chi tiết và quản lý khóa học</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleStatus}
                        disabled={updatingStatus}
                        className="gap-2"
                    >
                        {updatingStatus ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {course.status ? "Tắt" : "Bật"}
                    </Button>
                    <Link href={`/${locale}/admin/courses`} className="inline-flex">
                        <Button variant="outline" className="gap-2 cursor-pointer">
                            <ChevronLeft className="h-4 w-4" />
                            Quay lại
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Tên khóa học</label>
                                <p className="text-base font-medium mt-1">{course.name}</p>
                            </div>
                            {course.description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Mô tả</label>
                                    <p className="text-sm mt-1 whitespace-pre-wrap">{course.description}</p>
                                </div>
                            )}
                            {course.notes && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Ghi chú</label>
                                    <p className="text-sm mt-1 whitespace-pre-wrap">{course.notes}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Danh mục</label>
                                    <p className="text-sm mt-1">{course.category?.name || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Cấp độ</label>
                                    <p className="text-sm mt-1">
                                        {course.level ? (
                                            <Badge variant="outline">
                                                {course.level === 'beginner' ? 'Cơ bản' : course.level === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                                            </Badge>
                                        ) : '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Giá</label>
                                    <p className="text-base font-semibold mt-1">{formatPrice(course.price)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                                    <p className="text-sm mt-1">
                                        <Badge variant={course.status ? "default" : "secondary"}>
                                            {course.status ? "Kích hoạt" : "Tắt"}
                                        </Badge>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {course.thumbnail && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Hình ảnh</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <img src={course.thumbnail} alt={course.name} className="w-full h-auto rounded-md object-cover" />
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin bổ sung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Đánh giá trung bình</label>
                                <p className="text-base font-semibold mt-1">{course.averageRating || '0'} ⭐</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Số học viên</label>
                                <p className="text-base font-semibold mt-1">{course.numberOfStudents || 0}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Tổng thời lượng</label>
                                <p className="text-sm mt-1">{formatDuration(course.totalDuration || 0)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Số chương</label>
                                <p className="text-sm mt-1">{course.chapters?.length || 0}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin hệ thống</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Người tạo</label>
                                <p className="text-sm mt-1">{course.creator?.fullName || course.creator?.email || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                                <p className="text-sm mt-1">{formatDate(course.createdAt)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Ngày cập nhật</label>
                                <p className="text-sm mt-1">{formatDate(course.updatedAt)}</p>
                            </div>
                            {course.deletedAt && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Ngày xoá</label>
                                    <p className="text-sm mt-1 text-destructive">{formatDate(course.deletedAt)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Hành động</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href={`/${locale}/admin/courses?edit=${course.id}`} className="block">
                                <Button variant="outline" className="w-full gap-2 cursor-pointer">
                                    <Pencil className="h-4 w-4" />
                                    Chỉnh sửa
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                className="w-full gap-2 cursor-pointer"
                                onClick={() => setOpenDeleteConfirm(true)}
                                disabled={deleting}
                            >
                                <Trash2 className="h-4 w-4" />
                                {deleting ? "Đang xoá..." : "Xoá khóa học"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AdminActionDialog
                open={openDeleteConfirm}
                onOpenChange={setOpenDeleteConfirm}
                title="Xác nhận xoá"
                description={<span>Bạn có chắc muốn xoá khóa học "<b>{course.name}</b>"? Hành động này không thể hoàn tác.</span>}
                confirmText={deleting ? "Đang xoá..." : "Xoá"}
                confirmVariant="destructive"
                loading={deleting}
                onConfirm={handleDelete}
            />
        </div>
    )
}

