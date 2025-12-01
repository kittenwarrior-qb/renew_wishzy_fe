"use client"

import * as React from 'react';
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardProps {
    title: string
    value: number
    format?: (val: number) => string
    icon: React.ReactNode
    trend?: {
        value: string
        isPositive: boolean
    }
    className?: string
    iconBgColor?: string
    iconColor?: string
    isLoading?: boolean
}

export function StatsCard({
    title,
    value,
    format = (val) => val.toString(),
    icon,
    trend,
    className,
    iconBgColor = 'bg-blue-100',
    iconColor = 'text-blue-600',
    isLoading = false
}: StatsCardProps) {
    const displayValue = format ? format(value) : value.toString();

    if (isLoading) {
        return (
            <Card className={cn("relative bg-white rounded-2xl border-0 shadow-sm overflow-hidden", className)}>
                <div className="p-6">
                    <div className="relative">
                        <div className={`absolute top-0 right-0 w-12 h-12 rounded-xl ${iconBgColor} ${iconColor} opacity-20`} />
                        <div className="pr-16">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-32 mb-3" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className={cn("relative bg-white rounded-2xl border-0 shadow-sm overflow-hidden", className)}>
            <div className="p-6">
                <div className="relative">
                    {/* Icon in top-right corner */}
                    <div className={`absolute top-0 right-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor} ${iconColor}`}>
                        {React.isValidElement(icon) ? (
                            React.cloneElement(icon, {
                                className: "h-6 w-6"
                            } as React.HTMLProps<HTMLElement>)
                        ) : (
                            <span className="h-6 w-6">{icon}</span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="pr-16">
                        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-gray-800 mb-2">{displayValue}</p>
                        {trend && (
                            <p className={cn("text-xs font-medium", trend.isPositive ? 'text-green-600' : 'text-red-600')}>
                                {trend.isPositive ? '↑' : '↓'} {trend.value}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}
