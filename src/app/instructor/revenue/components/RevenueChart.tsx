"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import type { RevenueByPeriod } from "@/types/revenue"

interface RevenueChartProps {
  data: RevenueByPeriod[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount)
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Biểu đồ doanh thu theo thời gian
        </CardTitle>
        <CardDescription>
          Doanh thu và số lượng đơn hàng theo từng tháng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.period}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {item.sales} đơn • {item.students} học viên
                    </span>
                    <span className="font-semibold">{formatCurrency(item.revenue)}</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

