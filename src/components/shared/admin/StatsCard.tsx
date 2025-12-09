"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: number
  format?: (value: number) => string
  icon: React.ReactNode
  iconBgColor?: string
  iconColor?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  isLoading?: boolean
}

export function StatsCard({
  title,
  value,
  format,
  icon,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  trend,
  isLoading = false,
}: StatsCardProps) {
  const formattedValue = format ? format(value) : value.toLocaleString()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formattedValue}</p>
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.value}
              </p>
            )}
          </div>
          <div className={cn("rounded-lg p-3", iconBgColor)}>
            <div className={cn("h-6 w-6", iconColor)}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
