import { Card, CardContent } from "@/components/ui/card"
import type * as React from "react"

export interface AdminQuickStatCard {
    title: string
    value: number
    icon: React.ReactNode
    hint?: string
}

interface AdminDashboardQuickStatsProps {
    cards: AdminQuickStatCard[]
}

export function AdminDashboardQuickStats({ cards }: AdminDashboardQuickStatsProps) {
    if (!cards.length) return null

    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {cards.map((c) => (
                <Card key={c.title} className="border bg-card text-card-foreground shadow-sm">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">{c.title}</div>
                            <div className="text-2xl font-semibold tabular-nums">{c.value}</div>
                            {c.hint ? (
                                <div className="text-[11px] text-muted-foreground">{c.hint}</div>
                            ) : null}
                        </div>
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                            {c.icon}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
