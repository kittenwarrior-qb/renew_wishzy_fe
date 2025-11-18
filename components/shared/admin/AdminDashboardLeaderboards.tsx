"use client"

import * as React from "react"

import { Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { CourseItemType } from "@/types/course/course-item.types"
import type { OrderListItem } from "@/components/shared/order/useOrder"
import type { OrderListRow } from "@/types/order.types"

interface AdminDashboardLeaderboardsProps {
    bestSellerCourses: CourseItemType[]
    orders: OrderListItem[]
}

interface TopCourseItem {
    id: string
    name: string
    students: number
    revenue: number
}

interface TopInstructorItem {
    id: string
    name: string
    students: number
    courses: number
}

interface TopStudentItem {
    id: string
    name: string
    email: string
    totalSpent: number
    orderCount: number
}

export function AdminDashboardLeaderboards({ bestSellerCourses, orders }: AdminDashboardLeaderboardsProps) {
    const topCourses: TopCourseItem[] = React.useMemo(() => {
        if (!bestSellerCourses?.length) return []
        return bestSellerCourses
            .map((c) => {
                const students = Number(c.numberOfStudents ?? 0)
                const price = typeof c.price === "string" ? Number(c.price) : Number(c.price ?? 0)
                const revenue = Number.isFinite(students * price) ? students * price : 0
                return {
                    id: c.id,
                    name: c.name,
                    students,
                    revenue,
                }
            })
            .sort((a, b) => b.students - a.students)
            .slice(0, 5)
    }, [bestSellerCourses])

    const topInstructors: TopInstructorItem[] = React.useMemo(() => {
        if (!bestSellerCourses?.length) return []
        const map = new Map<string, TopInstructorItem>()

        bestSellerCourses.forEach((c) => {
            const creator = c.creator
            if (!creator?.id) return
            const id = creator.id
            const name = creator.fullName || creator.email || "Giảng viên"
            const students = Number(c.numberOfStudents ?? 0)

            const current = map.get(id) ?? {
                id,
                name,
                students: 0,
                courses: 0,
            }

            current.students += Number.isFinite(students) ? students : 0
            current.courses += 1

            map.set(id, current)
        })

        return Array.from(map.values())
            .sort((a, b) => b.students - a.students)
            .slice(0, 5)
    }, [bestSellerCourses])

    const {
        topStudents,
        revenueToday,
        revenueThisMonth,
        revenueThisYear,
        revenueMax,
    } = React.useMemo(() => {
        const map = new Map<string, TopStudentItem>()
        let revenueToday = 0
        let revenueThisMonth = 0
        let revenueThisYear = 0

        const now = new Date()
        const nowDay = now.getDate()
        const nowMonth = now.getMonth()
        const nowYear = now.getFullYear()

            ; (orders as OrderListRow[]).forEach((order) => {
                const status = (order as any).status as string | undefined
                if (status && status !== "completed") return

                const rawCreated = order.createdAt
                if (!rawCreated) return
                const created = new Date(rawCreated)
                if (Number.isNaN(created.getTime())) return

                const priceRaw = order.totalPrice as number | string | undefined
                const amount = typeof priceRaw === "string" ? Number(priceRaw) : Number(priceRaw ?? 0)
                if (!Number.isFinite(amount) || amount <= 0) return

                const userInfo = (order as any).user as { id?: string; fullName?: string; email?: string } | null
                const userId = order.userId || userInfo?.id || userInfo?.email
                if (!userId) return

                const name = userInfo?.fullName || userInfo?.email || String(userId)
                const email = userInfo?.email || ""

                const existing = map.get(String(userId)) ?? {
                    id: String(userId),
                    name,
                    email,
                    totalSpent: 0,
                    orderCount: 0,
                }

                existing.totalSpent += amount
                existing.orderCount += 1
                map.set(String(userId), existing)

                if (created.getFullYear() === nowYear) {
                    revenueThisYear += amount
                    if (created.getMonth() === nowMonth) {
                        revenueThisMonth += amount
                        if (created.getDate() === nowDay) {
                            revenueToday += amount
                        }
                    }
                }
            })

        const topStudents = Array.from(map.values())
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5)

        const revenueMax = Math.max(revenueToday, revenueThisMonth, revenueThisYear) || 1

        return {
            topStudents,
            revenueToday,
            revenueThisMonth,
            revenueThisYear,
            revenueMax,
        }
    }, [orders])

    const hasAnyData = topCourses.length || topInstructors.length || topStudents.length

    if (!hasAnyData) {
        return null
    }

    return (
        <section className="grid gap-4 lg:grid-cols-[1.5fr,1.2fr]">
            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Giảng viên hàng đầu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                        {topInstructors.length === 0 ? (
                            <p className="text-muted-foreground">Chưa có dữ liệu giảng viên.</p>
                        ) : (
                            <>
                                {/* Top 1-3 */}
                                <div className="flex items-end justify-center gap-3">
                                    {topInstructors.slice(0, 3).map((ins, index) => {
                                        const initials = ins.name
                                            .split(" ")
                                            .filter(Boolean)
                                            .slice(-2)
                                            .map((p) => p[0]?.toUpperCase())
                                            .join("")

                                        const medalColors = [
                                            "bg-amber-400 text-amber-950", // vàng
                                            "bg-slate-300 text-slate-900", // bạc
                                            "bg-orange-400 text-orange-950", // đồng
                                        ] as const

                                        const isFirst = index === 0
                                        const sizeClass = isFirst ? "h-12 w-12" : "h-10 w-10"
                                        const cardScale = isFirst ? "scale-105" : "scale-95"
                                        const orderClass = index === 0 ? "order-2" : index === 1 ? "order-1" : "order-3"

                                        return (
                                            <div
                                                key={ins.id}
                                                className={`flex flex-col items-center rounded-xl bg-muted/60 px-3 py-3 text-center ${cardScale} ${orderClass}`}
                                            >
                                                <div className="relative mb-2">
                                                    <div
                                                        className={`flex items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ${sizeClass}`}
                                                    >
                                                        {initials || ins.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div
                                                        className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-background text-[10px] font-bold ${medalColors[index] ?? medalColors[2]}`}
                                                    >
                                                        <Award className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <p className="line-clamp-2 text-xs font-semibold leading-snug">{ins.name}</p>
                                                <p className="mt-1 text-[11px] text-muted-foreground">
                                                    {ins.students.toLocaleString()} học viên · {ins.courses} khóa
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Các vị trí tiếp theo */}
                                {topInstructors.length > 3 && (
                                    <ol className="space-y-1 pt-1 border-t text-xs text-muted-foreground">
                                        {topInstructors.slice(3).map((ins, idx) => (
                                            <li
                                                key={ins.id}
                                                className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-muted/60"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                                                        {idx + 4}
                                                    </span>
                                                    <p className="truncate text-xs font-medium text-foreground">{ins.name}</p>
                                                </div>
                                                <span className="text-[10px]">
                                                    {ins.students.toLocaleString()} HV
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Học viên hàng đầu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                        {topStudents.length === 0 ? (
                            <p className="text-muted-foreground">Chưa có dữ liệu học viên.</p>
                        ) : (
                            <>
                                {/* Top 1-3 */}
                                <div className="flex items-end justify-center gap-3">
                                    {topStudents.slice(0, 3).map((s, index) => {
                                        const initials = s.name
                                            .split(" ")
                                            .filter(Boolean)
                                            .slice(-2)
                                            .map((p) => p[0]?.toUpperCase())
                                            .join("")

                                        const medalColors = [
                                            "bg-amber-400 text-amber-950",
                                            "bg-slate-300 text-slate-900",
                                            "bg-orange-400 text-orange-950",
                                        ] as const

                                        const isFirst = index === 0
                                        const sizeClass = isFirst ? "h-12 w-12" : "h-10 w-10"
                                        const cardScale = isFirst ? "scale-105" : "scale-95"
                                        const orderClass = index === 0 ? "order-2" : index === 1 ? "order-1" : "order-3"

                                        return (
                                            <Tooltip key={s.id}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={`flex flex-col items-center rounded-xl bg-muted/60 px-3 py-3 text-center ${cardScale} ${orderClass}`}
                                                    >
                                                        <div className="relative mb-2">
                                                            <div
                                                                className={`flex items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-700 ${sizeClass}`}
                                                            >
                                                                {initials || s.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div
                                                                className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-background text-[10px] font-bold ${medalColors[index] ?? medalColors[2]}`}
                                                            >
                                                                <Award className="h-4 w-4" />
                                                            </div>
                                                        </div>
                                                        <p className="line-clamp-2 text-xs font-semibold leading-snug">{s.name}</p>
                                                        <p className="text-[11px] text-foreground font-semibold">
                                                            {s.totalSpent.toLocaleString()} VNĐ
                                                        </p>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" align="center" className="max-w-xs space-y-1 text-left">
                                                    <p className="text-xs font-semibold">{s.name}</p>
                                                    {s.email && (
                                                        <p className="text-[11px] text-muted-foreground break-all">{s.email}</p>
                                                    )}
                                                    <p className="text-[11px]">
                                                        Tổng chi tiêu:{" "}
                                                        <span className="font-semibold">
                                                            {s.totalSpent.toLocaleString()} VNĐ
                                                        </span>
                                                    </p>
                                                    <p className="text-[11px]">
                                                        Số đơn hàng:{" "}
                                                        <span className="font-semibold">{s.orderCount}</span>
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    })}
                                </div>

                                {/* Các vị trí tiếp theo */}
                                {topStudents.length > 3 && (
                                    <ol className="space-y-1 pt-1 border-t text-xs text-muted-foreground">
                                        {topStudents.slice(3).map((s, idx) => (
                                            <li
                                                key={s.id}
                                                className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-muted/60"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                                                        {idx + 4}
                                                    </span>
                                                    <p className="truncate text-xs font-medium text-foreground">{s.name}</p>
                                                </div>
                                                <span className="text-[10px]">
                                                    {s.totalSpent.toLocaleString()} VNĐ
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Khoá học bán chạy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                        {topCourses.length === 0 ? (
                            <p className="text-muted-foreground">Chưa có dữ liệu khoá học.</p>
                        ) : (
                            <ol className="space-y-1">
                                {topCourses.map((c, index) => (
                                    <li key={c.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/60 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 text-left">
                                                <p className="truncate text-xs font-medium">{c.name}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {c.students.toLocaleString()} học viên
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right text-[11px] text-muted-foreground">
                                            {c.revenue > 0 ? `${c.revenue.toLocaleString()} VNĐ` : ""}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
