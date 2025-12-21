"use client"

import * as React from "react"
import { Users, GraduationCap, BookOpen, ShoppingCart } from "lucide-react"
import { useDashboardData } from "@/hooks/useDashboardData"
import { StatsCard } from "@/components/shared/admin/StatsCard"
import { RevenueChart, type RevenueData, type TimeRange } from "@/components/shared/admin/RevenueChart"
import { TopStudents } from "@/components/shared/admin/TopStudents"
import { TopCoursesByRevenue } from "@/components/shared/admin/TopCoursesByRevenue"
import { TopCourses } from "@/components/shared/admin/TopCourses"
import { formatVND } from "@/lib/format"

type TimeRangeData = Record<TimeRange, RevenueData>

export default function AdminDashboard() {
  const {
    hotCourses: apiHotCourses,
    topStudents,
    topCoursesByRevenue,
    isLoading,
    isError,
    totalStats,
    chartData,
    refetch,
  } = useDashboardData()

  const stats = [
    {
      title: "Học viên",
      value: totalStats.totalStudents,
      icon: <Users />,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      format: (val: number) => val.toLocaleString(),
      loading: isLoading
    },
    {
      title: "Giáo viên",
      value: totalStats.totalInstructors,
      icon: <GraduationCap />,
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      format: (val: number) => val.toLocaleString(),
      loading: isLoading
    },
    {
      title: "Khóa học",
      value: totalStats.totalCourses,
      icon: <BookOpen />,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      format: (val: number) => val.toLocaleString(),
      loading: isLoading
    },
    {
      title: "Đơn hàng hôm nay",
      value: totalStats.todayOrders,
      icon: <ShoppingCart />,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      format: (val: number) => val.toLocaleString(),
      loading: isLoading
    }
  ]


  return (
    <div className="space-y-6 px-4 py-2">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            format={stat.format}
            icon={stat.icon}
            iconBgColor={stat.iconBgColor}
            iconColor={stat.iconColor}
            isLoading={stat.loading}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <RevenueChart
          data={{
            day: chartData?.day || null,
            week: chartData?.week || null,
            month: chartData?.month || null,
            year: chartData?.year || null,
            loading: isLoading,
            error: isError ? 'Có lỗi khi tải dữ liệu biểu đồ' : null
          }}
          onModeChange={refetch.revenue}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <TopCourses
              hotCourses={apiHotCourses?.data}
              total={apiHotCourses?.total}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopCoursesByRevenue
            courses={topCoursesByRevenue}
            isLoading={isLoading}
            isError={isError}
          />

          <TopStudents
            students={topStudents}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
      </div >
    </div >
  );
}