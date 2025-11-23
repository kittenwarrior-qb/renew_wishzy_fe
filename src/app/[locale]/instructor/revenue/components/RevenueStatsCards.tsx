"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, BookOpen, Coins, BarChart3 } from "lucide-react"
import type { RevenueStatistics } from "@/types/revenue"

interface RevenueStatsCardsProps {
  statistics: RevenueStatistics
}

export function RevenueStatsCards({ statistics }: RevenueStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const cards = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(statistics.totalRevenue),
      icon: Coins,
      description: "Tổng doanh thu từ tất cả khóa học",
      trend: null,
    },
    {
      title: "Doanh thu tháng này",
      value: formatCurrency(statistics.monthlyRevenue),
      icon: BarChart3,
      description: "Doanh thu trong tháng hiện tại",
      trend: statistics.growthRate,
    },
    {
      title: "Tổng số học viên",
      value: formatNumber(statistics.totalStudents),
      icon: Users,
      description: "Tổng số học viên đã đăng ký",
      trend: null,
    },
    {
      title: "Số khóa học",
      value: formatNumber(statistics.totalCourses),
      icon: BookOpen,
      description: "Tổng số khóa học đã tạo",
      trend: null,
    },
    {
      title: "Doanh thu trung bình",
      value: formatCurrency(statistics.averageRevenuePerCourse),
      icon: TrendingUp,
      description: "Doanh thu trung bình mỗi khóa học",
      trend: null,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon
        const isPositive = card.trend !== null && card.trend > 0
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.trend !== null && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {isPositive ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={isPositive ? "text-green-500" : "text-red-500"}>
                    {Math.abs(card.trend)}%
                  </span>
                  <span className="ml-1">so với tháng trước</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

