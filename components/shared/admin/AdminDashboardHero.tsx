"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useWeather } from "@/hooks/useWeather"

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
    const { condition } = useWeather()

    const bgClassFromTime =
        hour < 12
            ? "from-orange-400 via-amber-300 to-sky-400" // sáng: bình minh
            : hour < 18
                ? "from-sky-500 via-indigo-500 to-violet-500" // trưa/chiều: trời xanh
                : "from-slate-900 via-indigo-900 to-slate-800" // tối: đêm

    const bgClass = (() => {
        switch (condition) {
            case "clear":
                return "from-sky-400 via-sky-500 to-indigo-500" // trời nắng đẹp
            case "cloudy":
                return "from-slate-400 via-slate-500 to-slate-700" // nhiều mây
            case "rain":
                return "from-slate-700 via-sky-700 to-slate-900" // mưa
            case "storm":
                return "from-slate-900 via-purple-900 to-slate-900" // giông bão
            case "snow":
                return "from-slate-100 via-sky-200 to-slate-300" // tuyết (hiếm)
            default:
                return bgClassFromTime
        }
    })()

    return (
        <Card className={`overflow-hidden border-0 bg-gradient-to-r ${bgClass} text-white shadow-lg`}>
            <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-violet-100">{greeting}, {displayName} 👋</p>
                        <h2 className="mt-1 text-2xl font-semibold leading-tight">
                            Bảng điều khiển quản trị
                            <br />
                            nền tảng học tập Wishzy
                        </h2>
                        <p className="mt-2 text-xs text-violet-100/80">
                            Đăng nhập dưới tài khoản&nbsp;
                            <span className="font-medium text-white">{displayEmail}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-violet-100/80">
                                Tổng người dùng
                            </p>
                            <p className="text-xl font-semibold">
                                {totalUsers.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-violet-100/80">
                                Khoá học đang hoạt động
                            </p>
                            <p className="text-xl font-semibold">
                                {totalCourses.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-violet-100/80">
                                Giảng viên
                            </p>
                            <p className="text-xl font-semibold">
                                {totalInstructors.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-xs rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs font-medium text-violet-100">Thông báo</p>

                    <div className="mt-3 space-y-3 text-xs text-violet-100/90">
                        <div className="rounded-xl bg-white/10 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-200">
                                Hệ thống
                            </p>
                            <p className="mt-1 text-sm font-semibold text-white">
                                Chào mừng bạn đến trang quản trị Wishzy
                            </p>
                            <p className="mt-1 text-[11px] text-violet-100/80">
                                Theo dõi doanh thu, khoá học và người dùng trong thời gian thực tại đây.
                            </p>
                        </div>

                        <p className="text-[11px] text-violet-100/80">
                            Hiện tại chưa có thông báo mới. Bạn sẽ thấy các cập nhật quan trọng của hệ thống hiển thị tại đây.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
