"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
                    <CardContent className="space-y-2 text-xs">
                        {topInstructors.length === 0 ? (
                            <p className="text-muted-foreground">Chưa có dữ liệu giảng viên.</p>
                        ) : (
                            <ol className="space-y-1">
                                {topInstructors.map((ins, index) => (
                                    <li
                                        key={ins.id}
                                        className="flex items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-muted/60"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-medium text-foreground">{ins.name}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {ins.students.toLocaleString()} học viên · {ins.courses} khóa
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Học viên hàng đầu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                        {topStudents.length === 0 ? (
                            <p className="text-muted-foreground">Chưa có dữ liệu học viên.</p>
                        ) : (
                            <ol className="space-y-1">
                                {topStudents.map((s, index) => (
                                    <li
                                        key={s.id}
                                        className="flex items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-muted/60"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-medium text-foreground">{s.name}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {s.totalSpent.toLocaleString()} VNĐ · {s.orderCount} đơn
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ol>
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