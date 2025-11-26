"use client"

import { useMemo, useState } from "react"
import { RevenueStatsCards } from "./components/RevenueStatsCards"
import { TopSellingCourses } from "./components/TopSellingCourses"
import { CoursesWithMostStudents } from "./components/CoursesWithMostStudents"
import { RevenueChart } from "./components/RevenueChart"
import type {
  RevenueFilter,
  RevenueStatistics,
  CourseRevenue,
  TopSellingCourse,
  RevenueByPeriod,
  RevenueMode,
} from "@/types/revenue"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useInstructorStats, useRevenueStats } from "@/hooks/useInstructorStats"
import { useCourseDetails } from "@/hooks/useCourseDetails"
import { cn } from "@/lib/utils"

export default function RevenuePage() {
  const [filter, setFilter] = useState<RevenueFilter>({
    period: "month",
    limit: 5,
  })

  const revenueMode: RevenueMode = filter.period ?? "month"

  const {
    data: instructorStats,
    isLoading: loadingInstructor,
    isError: instructorError,
  } = useInstructorStats()
  const {
    data: revenueStats,
    isLoading: loadingRevenue,
    isError: revenueError,
  } = useRevenueStats({ mode: revenueMode })

  // Lấy courseIds để fetch thêm thumbnail và categoryName
  const courseIds = useMemo(() => {
    if (!instructorStats?.courses?.length) return []
    return instructorStats.courses.map((c) => c.courseId)
  }, [instructorStats])

  const { courseDetailsMap, isLoading: loadingCourseDetails } = useCourseDetails(courseIds)

  const defaultStats: RevenueStatistics = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    averageRevenuePerCourse: 0,
    growthRate: 0,
  }

  const statistics: RevenueStatistics = useMemo(() => {
    if (!instructorStats) return defaultStats

    const totalCourses = instructorStats.totalCourses
    const averageRevenuePerCourse =
      totalCourses > 0 ? Math.round(instructorStats.totalRevenue / totalCourses) : 0

    return {
      totalRevenue: instructorStats.totalRevenue,
      monthlyRevenue: revenueStats?.monthlyRevenue ?? instructorStats.totalRevenue,
      totalStudents: instructorStats.totalStudents,
      totalCourses,
      averageRevenuePerCourse,
      growthRate: revenueStats?.growthRate ?? 0,
    }
  }, [defaultStats, instructorStats, revenueStats])

  const topSellingCourses: TopSellingCourse[] = useMemo(() => {
    if (!instructorStats?.courses?.length) return []
    return [...instructorStats.courses]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, filter.limit ?? 5)
      .map((course, index) => {
        const courseDetail = courseDetailsMap.get(course.courseId)
        const averagePrice =
          course.studentCount > 0 ? Math.round(course.revenue / course.studentCount) : course.revenue
        return {
          rank: index + 1,
          courseId: course.courseId,
          courseName: course.courseName,
          thumbnail: courseDetail?.thumbnail,
          categoryName: courseDetail?.categoryName,
          price: courseDetail?.price || averagePrice,
          totalRevenue: course.revenue,
          totalSales: course.studentCount,
          totalStudents: course.studentCount,
          enrollmentCount: course.studentCount,
          averageRating: course.averageRating,
          createdAt: new Date().toISOString(),
        }
      })
  }, [filter.limit, instructorStats, courseDetailsMap])

  const coursesWithMostStudents: CourseRevenue[] = useMemo(() => {
    if (!instructorStats?.courses?.length) return []
    return [...instructorStats.courses]
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, filter.limit ?? 5)
      .map((course) => {
        const courseDetail = courseDetailsMap.get(course.courseId)
        const averagePrice =
          course.studentCount > 0 ? Math.round(course.revenue / course.studentCount) : course.revenue
        return {
          courseId: course.courseId,
          courseName: course.courseName,
          thumbnail: courseDetail?.thumbnail,
          categoryName: courseDetail?.categoryName,
          price: courseDetail?.price || averagePrice,
          totalRevenue: course.revenue,
          totalSales: course.studentCount,
          totalStudents: course.studentCount,
          enrollmentCount: course.studentCount,
          averageRating: course.averageRating,
          createdAt: new Date().toISOString(),
        }
      })
  }, [filter.limit, instructorStats, courseDetailsMap])

  const chartData: RevenueByPeriod[] = useMemo(() => {
    if (!revenueStats?.details?.length) return []
    return revenueStats.details.map((detail) => ({
      period: detail.period,
      revenue: detail.revenue,
      sales: detail.orderCount,
      students: detail.courseSoldCount || detail.orderCount,
    }))
  }, [revenueStats])

  const handleExport = () => {
    if (!instructorStats) return
    const payload = {
      statistics,
      courses: instructorStats.courses,
    }
    console.log("Export revenue data", payload)
  }

  const isLoading = loadingInstructor || loadingRevenue || loadingCourseDetails
  const hasError = instructorError || revenueError

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lỗi</CardTitle>
          <CardDescription>Không thể tải dữ liệu doanh thu. Vui lòng thử lại sau.</CardDescription>
        </CardHeader>
      </Card>
    )
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
            onValueChange={(value: RevenueMode) => setFilter({ ...filter, period: value })}
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
      <RevenueStatsCards statistics={statistics} />

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart data={chartData} />
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
            <CardDescription>Thống kê tổng quan về doanh thu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tổng số đơn hàng</span>
              <span className="font-semibold">
                {topSellingCourses.reduce((sum, c) => sum + c.totalSales, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tổng số học viên</span>
              <span className="font-semibold">{statistics.totalStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tỷ lệ chuyển đổi</span>
              <span className="font-semibold">
                {statistics.totalCourses > 0
                  ? ((statistics.totalStudents / statistics.totalCourses) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Doanh thu trung bình/đơn</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('vi-VN', {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(
                  topSellingCourses.reduce((sum, c) => sum + c.totalSales, 0) > 0
                    ? statistics.totalRevenue /
                        topSellingCourses.reduce((sum, c) => sum + c.totalSales, 0)
                    : 0,
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Courses */}
      {topSellingCourses.length > 0 ? (
        <TopSellingCourses courses={topSellingCourses} />
      ) : (
        <Card className={cn(isLoading && "opacity-70")}>
          <CardHeader>
            <CardTitle>Chưa có dữ liệu doanh thu</CardTitle>
            <CardDescription>
              Khi có học viên đăng ký, danh sách khóa học bán chạy sẽ hiển thị ở đây.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Courses with Most Students */}
      {coursesWithMostStudents.length > 0 ? (
        <CoursesWithMostStudents courses={coursesWithMostStudents} />
      ) : (
        <Card className={cn(isLoading && "opacity-70")}>
          <CardHeader>
            <CardTitle>Chưa có học viên</CardTitle>
            <CardDescription>
              Khi có học viên mới, danh sách khóa học nhiều học viên sẽ hiển thị tại đây.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

