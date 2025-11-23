"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { OrderListItem } from "@/components/shared/order/useOrder"

interface AdminDashboardRevenueProps {
    orders: OrderListItem[]
}

interface RevenuePoint {
    label: string
    value: number
}

function parseAmount(raw: number | string | undefined): number {
    const n = typeof raw === "string" ? Number(raw) : Number(raw ?? 0)
    return Number.isFinite(n) && n > 0 ? n : 0
}

function isCompleted(order: any): boolean {
    const status = (order as any).status as string | undefined
    return !status || status === "completed"
}

function getDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}`
}

function getYearKey(date: Date): string {
    return String(date.getFullYear())
}

function buildDailyRevenue(orders: OrderListItem[]): RevenuePoint[] {
    const now = new Date()
    const map = new Map<string, number>()

    orders.forEach((order) => {
        if (!isCompleted(order)) return
        const rawCreated = (order as any).createdAt
        if (!rawCreated) return
        const created = new Date(rawCreated)
        if (Number.isNaN(created.getTime())) return

        const amount = parseAmount((order as any).totalPrice)
        if (!amount) return

        const key = getDateKey(created)
        map.set(key, (map.get(key) ?? 0) + amount)
    })

    const result: RevenuePoint[] = []
    const year = now.getFullYear()
    const month = now.getMonth()
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= lastDayOfMonth; day++) {
        const d = new Date(year, month, day)
        const key = getDateKey(d)
        const value = map.get(key) ?? 0
        result.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, value })
    }
    return result
}

function buildMonthlyRevenue(orders: OrderListItem[]): RevenuePoint[] {
    const now = new Date()
    const map = new Map<string, number>()

    orders.forEach((order) => {
        if (!isCompleted(order)) return
        const rawCreated = (order as any).createdAt
        if (!rawCreated) return
        const created = new Date(rawCreated)
        if (Number.isNaN(created.getTime())) return

        const amount = parseAmount((order as any).totalPrice)
        if (!amount) return

        const monthsDiff = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth())
        if (monthsDiff < 0 || monthsDiff > 11) return

        const key = getMonthKey(created)
        map.set(key, (map.get(key) ?? 0) + amount)
    })

    const result: RevenuePoint[] = []
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = getMonthKey(d)
        const value = map.get(key) ?? 0
        result.push({ label: `${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`, value })
    }
    return result
}

function buildYearlyRevenue(orders: OrderListItem[]): RevenuePoint[] {
    const now = new Date()
    const map = new Map<string, number>()

    orders.forEach((order) => {
        if (!isCompleted(order)) return
        const rawCreated = (order as any).createdAt
        if (!rawCreated) return
        const created = new Date(rawCreated)
        if (Number.isNaN(created.getTime())) return

        const amount = parseAmount((order as any).totalPrice)
        if (!amount) return

        const yearsDiff = now.getFullYear() - created.getFullYear()
        if (yearsDiff < 0 || yearsDiff > 4) return

        const key = getYearKey(created)
        map.set(key, (map.get(key) ?? 0) + amount)
    })

    const result: RevenuePoint[] = []
    for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i
        const key = String(year)
        const value = map.get(key) ?? 0
        result.push({ label: String(year), value })
    }
    return result
}

export function AdminDashboardRevenue({ orders }: AdminDashboardRevenueProps) {
    const daily = React.useMemo(() => buildDailyRevenue(orders), [orders])
    const monthly = React.useMemo(() => buildMonthlyRevenue(orders), [orders])
    const yearly = React.useMemo(() => buildYearlyRevenue(orders), [orders])

    const now = new Date()
    const todayLabel = `${now.getDate()}/${now.getMonth() + 1}`

    const revenueToday = daily.find((d) => d.label === todayLabel)?.value ?? 0
    const revenueThisMonth = monthly.length ? monthly[monthly.length - 1].value : 0
    const revenueThisYear = yearly.length ? yearly[yearly.length - 1].value : 0

    const hasAny = daily.some((d) => d.value > 0) || monthly.some((m) => m.value > 0) || yearly.some((y) => y.value > 0)

    const dailyScrollRef = React.useRef<HTMLDivElement>(null!)
    const monthlyScrollRef = React.useRef<HTMLDivElement>(null!)
    const yearlyScrollRef = React.useRef<HTMLDivElement>(null!)

    React.useEffect(() => {
        if (!daily.length || !dailyScrollRef.current) return

        const now = new Date()
        const labelToday = `${now.getDate()}/${now.getMonth() + 1}`
        const index = daily.findIndex((d) => d.label === labelToday)
        if (index === -1) return

        const container = dailyScrollRef.current
        const barWidth = 28
        const target = Math.max(0, index * barWidth - container.clientWidth / 2)
        container.scrollLeft = target
    }, [daily])

    const isDraggingRef = React.useRef(false)
    const startXRef = React.useRef(0)
    const scrollLeftRef = React.useRef(0)

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        isDraggingRef.current = true
        startXRef.current = event.clientX
        scrollLeftRef.current = event.currentTarget.scrollLeft
    }

    const endDrag = () => {
        isDraggingRef.current = false
    }

    const handleMouseLeave = () => {
        endDrag()
    }

    const handleMouseUp = () => {
        endDrag()
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return
        event.preventDefault()
        const deltaX = event.clientX - startXRef.current
        event.currentTarget.scrollLeft = scrollLeftRef.current - deltaX
    }

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        const touch = event.touches[0]
        if (!touch) return
        isDraggingRef.current = true
        startXRef.current = touch.clientX
        scrollLeftRef.current = event.currentTarget.scrollLeft
    }

    const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return
        const touch = event.touches[0]
        if (!touch) return
        const deltaX = touch.clientX - startXRef.current
        event.currentTarget.scrollLeft = scrollLeftRef.current - deltaX
    }

    const handleTouchEnd = () => {
        endDrag()
    }

    if (!hasAny) {
        return null
    }

    const renderChart = (data: RevenuePoint[], color: string, scrollRef?: React.RefObject<HTMLDivElement>) => {
        const max = Math.max(...data.map((d) => d.value), 1)
        return (
            <div className="w-full flex justify-center">
                <div
                    ref={scrollRef}
                    className="w-full max-w-[700px] overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing select-none"
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="flex h-40 items-end gap-1 min-w-max pr-2">
                        {data.map((item) => {
                            const heightPercent = ((item.value || 0) / max) * 100 || 4
                            return (
                                <div key={item.label} className="flex h-full flex-col items-center gap-0.5 min-w-[1.8rem]">
                                    <div className="flex h-full w-full items-end justify-center rounded-2xl bg-muted/60 px-0.5 pb-1">
                                        <div
                                            className={`w-4 rounded-xl bg-gradient-to-t ${color}`}
                                            style={{ height: `${heightPercent || 4}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-medium text-muted-foreground text-center truncate max-w-[4rem]">
                                        {item.label}
                                    </span>
                                    <span className="text-[10px] text-foreground font-semibold">
                                        {(item.value || 0).toLocaleString()} VNĐ
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card>
            <CardContent className="space-y-4 text-xs">
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-muted/60 px-3 py-2">
                        <p className="text-[11px] font-medium text-muted-foreground">Hôm nay</p>
                        <p className="mt-1 text-sm font-semibold">
                            {revenueToday.toLocaleString()} VNĐ
                        </p>
                    </div>
                    <div className="rounded-xl bg-muted/60 px-3 py-2">
                        <p className="text-[11px] font-medium text-muted-foreground">Tháng này</p>
                        <p className="mt-1 text-sm font-semibold">
                            {revenueThisMonth.toLocaleString()} VNĐ
                        </p>
                    </div>
                    <div className="rounded-xl bg-muted/60 px-3 py-2">
                        <p className="text-[11px] font-medium text-muted-foreground">Năm nay</p>
                        <p className="mt-1 text-sm font-semibold">
                            {revenueThisYear.toLocaleString()} VNĐ
                        </p>
                    </div>
                </div>
                <Tabs defaultValue="day" className="w-full">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <CardTitle className="text-sm font-semibold">Doanh thu</CardTitle>
                        <TabsList className="h-8 text-[11px]">
                            <TabsTrigger value="day">Ngày</TabsTrigger>
                            <TabsTrigger value="month">Tháng</TabsTrigger>
                            <TabsTrigger value="year">Năm</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="day">
                        {renderChart(daily, "from-emerald-400 to-emerald-600", dailyScrollRef)}
                    </TabsContent>
                    <TabsContent value="month">
                        {renderChart(monthly, "from-sky-400 to-sky-600", monthlyScrollRef)}
                    </TabsContent>
                    <TabsContent value="year">
                        {renderChart(yearly, "from-amber-400 to-amber-600", yearlyScrollRef)}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
