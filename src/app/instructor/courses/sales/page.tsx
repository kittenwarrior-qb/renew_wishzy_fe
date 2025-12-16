"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SaleBadge } from "../components"
import type { CourseSale, SaleStatus } from "@/types/sale"
import { getSaleStatus, getDiscountPercentage, calculateSalePrice } from "@/types/sale"
import { Pencil, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useCourseList } from "@/components/shared/course/useCourse"
import { useAppStore } from "@/src/stores/useAppStore"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"

export default function SalesManagementPage() {
  const { user } = useAppStore()

  const [statusFilter, setStatusFilter] = useState<SaleStatus | "all">("all")
  const [search, setSearch] = useState("")

  // Lấy danh sách courses của instructor
  const { data: coursesData, isPending, isFetching } = useCourseList({
    page: 1,
    limit: 100,
    createdBy: user?.id,
  })

  const courses = (coursesData?.data || []) as any[]

  // Transform courses thành CourseSale format
  const courseSales: CourseSale[] = courses.map((course) => {
    const saleInfo = course.saleInfo
    const saleStatus: SaleStatus = getSaleStatus(saleInfo)
    const salePrice = calculateSalePrice(Number(course.price), saleInfo)
    const discount = getDiscountPercentage(Number(course.price), saleInfo)

    return {
      courseId: course.id,
      courseName: course.name,
      price: Number(course.price),
      saleInfo: saleInfo || null,
      salePrice,
      saleStatus, // getSaleStatus luôn trả về SaleStatus, không bao giờ undefined
    }
  })

  // Filter courses
  const filteredCourses = courseSales.filter((course) => {
    if (statusFilter !== "all" && course.saleStatus !== statusFilter) return false
    if (search && !course.courseName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Stats
  const stats = {
    total: courseSales.length,
    active: courseSales.filter((c) => c.saleStatus === "active").length,
    upcoming: courseSales.filter((c) => c.saleStatus === "upcoming").length,
    expired: courseSales.filter((c) => c.saleStatus === "expired").length,
    none: courseSales.filter((c) => c.saleStatus === "none").length,
  }

  return (
    <div className="relative space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý giá sale</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý giá giảm cho tất cả khóa học của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đang sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sắp sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hết sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Không sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.none}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm khóa học
            </label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập tên khóa học để tìm kiếm..."
              className="h-9 w-64"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo trạng thái sale
            </label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SaleStatus | "all")}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue placeholder="Chọn trạng thái sale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🏷️ Tất cả trạng thái</SelectItem>
                <SelectItem value="active">🔥 Đang sale</SelectItem>
                <SelectItem value="upcoming">⏰ Sắp sale</SelectItem>
                <SelectItem value="expired">⏹️ Hết sale</SelectItem>
                <SelectItem value="none">💰 Không sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />

        {filteredCourses.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <p>Không có khóa học nào</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.courseId} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2 flex-1">
                      {course.courseName}
                    </CardTitle>
                    <SaleBadge
                      status={course.saleStatus || 'none'}
                      discount={getDiscountPercentage(course.price, course.saleInfo)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Info */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={
                          course.saleStatus !== "none"
                            ? "text-sm text-muted-foreground line-through"
                            : "text-lg font-bold"
                        }
                      >
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(course.price)}
                      </span>
                      {course.saleStatus !== "none" && (
                        <span className="text-xs text-red-500 font-semibold">
                          -{getDiscountPercentage(course.price, course.saleInfo)}%
                        </span>
                      )}
                    </div>
                    {course.saleStatus !== "none" && course.salePrice !== undefined && (
                      <div className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(course.salePrice)}
                      </div>
                    )}
                  </div>

                  {/* Sale Info */}
                  {course.saleInfo && (
                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                      <div>
                        Loại:{" "}
                        <span className="font-medium">
                          {course.saleInfo.saleType === "percent" ? "Giảm %" : "Giảm số tiền"}
                        </span>
                      </div>
                      <div>
                        Giá trị:{" "}
                        <span className="font-medium">
                          {course.saleInfo.saleType === "percent"
                            ? `${course.saleInfo.value}%`
                            : `${course.saleInfo.value.toLocaleString("vi-VN")} VNĐ`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/instructor/courses/edit/${course.courseId}`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Chỉnh sửa sale
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/instructor/courses/${course.courseId}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

