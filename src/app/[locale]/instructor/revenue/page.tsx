"use client"

import { useState } from "react"
import { RevenueStatsCards } from "./components/RevenueStatsCards"
import { TopSellingCourses } from "./components/TopSellingCourses"
import { CoursesWithMostStudents } from "./components/CoursesWithMostStudents"
import { RevenueChart } from "./components/RevenueChart"
import { mockRevenueResponse } from "@/src/mocks/revenue"
import type { RevenueResponse, RevenueFilter } from "@/types/revenue"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function RevenuePage() {
  const [filter, setFilter] = useState<RevenueFilter>({
    period: 'month',
    limit: 5,
  })
  
  // TODO: Replace with actual API call when backend is ready
  const data: RevenueResponse = mockRevenueResponse

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export revenue data", data)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý doanh thu</h1>
          <p className="text-muted-foreground">
            Theo dõi doanh thu và hiệu suất các khóa học của bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filter.period}
            onValueChange={(value: 'day' | 'week' | 'month' | 'year') =>
              setFilter({ ...filter, period: value })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Theo ngày</SelectItem>
              <SelectItem value="week">Theo tuần</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
              <SelectItem value="year">Theo năm</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <RevenueStatsCards statistics={data.statistics} />

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart data={data.revenueByPeriod} />
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
            <CardDescription>Thống kê tổng quan về doanh thu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tổng số đơn hàng</span>
              <span className="font-semibold">
                {data.topSellingCourses.reduce((sum, c) => sum + c.totalSales, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tổng số học viên</span>
              <span className="font-semibold">{data.statistics.totalStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tỷ lệ chuyển đổi</span>
              <span className="font-semibold">
                {data.statistics.totalCourses > 0
                  ? ((data.statistics.totalStudents / data.statistics.totalCourses) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Doanh thu trung bình/đơn</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  maximumFractionDigits: 0,
                }).format(
                  data.topSellingCourses.reduce((sum, c) => sum + c.totalSales, 0) > 0
                    ? data.statistics.totalRevenue /
                        data.topSellingCourses.reduce((sum, c) => sum + c.totalSales, 0)
                    : 0
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Courses */}
      <TopSellingCourses courses={data.topSellingCourses} />

      {/* Courses with Most Students */}
      <CoursesWithMostStudents courses={data.coursesWithMostStudents} />
    </div>
  )
}

