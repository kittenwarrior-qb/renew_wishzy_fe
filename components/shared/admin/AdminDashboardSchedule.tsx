"use client"

import * as React from "react"
import Link from "next/link"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/services/users"

interface AdminDashboardScheduleProps {
    users: User[]
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

export function AdminDashboardSchedule({ users }: AdminDashboardScheduleProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())

    const latestUsers = React.useMemo(
        () => users
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 20),
        [users],
    )

    return (
        <Card className="h-full">
            <CardContent className="space-y-4">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                />

                <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">20 tài khoản mới nhất</span>
                        <span className="text-muted-foreground">{latestUsers.length} tài khoản</span>
                    </div>

                    {latestUsers.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            Chưa có tài khoản nào được tạo.
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {latestUsers.map((user) => {
                                const created = new Date(user.createdAt)
                                return (
                                    <Link
                                        key={user.id}
                                        href={`/admin/user/${user.id}`}
                                        className="block rounded-lg bg-muted/60 p-3 transition hover:bg-muted"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="text-[11px] font-medium text-muted-foreground">
                                                    {created.toLocaleDateString("vi-VN", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })}{" "}
                                                    {created.toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                                <p className="text-xs font-semibold text-foreground truncate">
                                                    {user.fullName || user.email}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                                                New user
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
