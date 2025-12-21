"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp } from "lucide-react"
import type { RevenueApiResponse } from "@/types/revenue"
import { formatVND } from "@/lib/format"

export type TimeRange = "day" | "week" | "month" | "year"

export interface RevenueData {
  day: RevenueApiResponse | null
  week: RevenueApiResponse | null
  month: RevenueApiResponse | null
  year: RevenueApiResponse | null
  loading: boolean
  error: string | null
}

interface RevenueChartProps {
  data: RevenueData
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  day: "Ngày",
  week: "Tuần",
  month: "Tháng",
  year: "Năm",
}

export function RevenueChart({ data }: RevenueChartProps) {
  // CRITICAL: Use React state for time range switching to prevent page reload
  const [selectedRange, setSelectedRange] = React.useState<TimeRange>("month")

  const currentData = data[selectedRange]

  if (data.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Biểu đồ doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["day", "week", "month", "year"] as TimeRange[]).map((range) => (
                <div key={range} className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Biểu đồ doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{data.error}</p>
        </CardContent>
      </Card>
    )
  }

  const maxRevenue = currentData
    ? Math.max(...currentData.details.map((d) => d.revenue), 0)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Biểu đồ doanh thu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time range buttons - MUST use onClick with setState, NOT navigation */}
        <div className="flex gap-2">
          {(["day", "week", "month", "year"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={selectedRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRange(range)}
              className="min-w-[80px]"
            >
              {TIME_RANGE_LABELS[range]}
            </Button>
          ))}
        </div>

        {/* Summary stats */}
        {currentData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Doanh thu hệ thống</p>
              <p className="text-lg font-bold">{formatVND(currentData.grossRevenue || currentData.totalRevenue)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Tổng doanh thu</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Doanh thu thực nhận</p>
              <p className="text-lg font-bold text-primary">{formatVND(currentData.totalRevenue)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {currentData.instructorPercentage ? `${100 - currentData.instructorPercentage}% từ GV + 100% từ Admin` : 'Sau chia'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Đơn hàng</p>
              <p className="text-lg font-bold">{currentData.totalOrders.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Tổng số đơn</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tăng trưởng</p>
              <p
                className={`text-lg font-bold ${
                  currentData.growthRate >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {currentData.growthRate >= 0 ? "+" : ""}
                {currentData.growthRate.toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">So với kỳ trước</p>
            </div>
          </div>
        )}

        {/* Chart bars */}
        {currentData && currentData.details.length > 0 ? (
          <div className="space-y-3">
            {currentData.details.map((item, index) => {
              const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.period}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground text-xs">
                        {item.orderCount} đơn • {item.courseSoldCount} khóa học
                      </span>
                      <span className="font-semibold">{formatVND(item.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa có dữ liệu cho khoảng thời gian này
          </p>
        )}
      </CardContent>
    </Card>
  )
}
