"use client"

import { Card, CardContent } from "@/components/ui/card"

interface AdminDashboardHeroProps {
    fullName?: string | null
    email?: string | null
    totalUsers: number
    totalCourses: number
    totalInstructors: number
}

export function AdminDashboardHero({
    fullName,
    email,
    totalUsers,
    totalCourses,
    totalInstructors,
}: AdminDashboardHeroProps) {
    const displayName = fullName || "Admin"
    const displayEmail = email || "admin@wishzy.com"
    const hour = new Date().getHours()
    const greeting =
        hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi trưa" : "Chào buổi tối"

    return (
        <Card className="overflow-hidden border bg-card shadow-sm">
            <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            {greeting}, {displayName} 👋
                        </p>
                        <h2 className="text-2xl font-semibold leading-tight text-foreground">
                            Bảng điều khiển quản trị Wishzy
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Đăng nhập dưới tài khoản&nbsp;
                            <span className="font-medium text-foreground">{displayEmail}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Tổng người dùng
                            </p>
                            <p className="text-xl font-semibold text-foreground">
                                {totalUsers.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Khoá học đang hoạt động
                            </p>
                            <p className="text-xl font-semibold text-foreground">
                                {totalCourses.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Giảng viên
                            </p>
                            <p className="text-xl font-semibold text-foreground">
                                {totalInstructors.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-xs rounded-xl border bg-muted/40 p-4">
                    <p className="text-xs font-medium text-muted-foreground">Thông tin hệ thống</p>

                    <div className="mt-3 space-y-3 text-xs text-muted-foreground">
                        <div className="rounded-lg bg-background/80 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                                Tổng quan
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                                Theo dõi hoạt động nền tảng
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Kiểm tra nhanh doanh thu, khoá học và người dùng trong ngày hôm nay.
                            </p>
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                            Hiện tại chưa có thông báo mới. Các cập nhật quan trọng của hệ thống sẽ hiển thị tại đây.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
