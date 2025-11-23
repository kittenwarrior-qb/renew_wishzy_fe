"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star } from "lucide-react"
import Image from "next/image"
import type { TopSellingCourse } from "@/types/revenue"

interface TopSellingCoursesProps {
  courses: TopSellingCourse[]
}

export function TopSellingCourses({ courses }: TopSellingCoursesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-yellow-900"
    if (rank === 2) return "bg-gray-400 text-gray-900"
    if (rank === 3) return "bg-orange-500 text-orange-900"
    return "bg-muted text-muted-foreground"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Khóa học bán chạy nhất
        </CardTitle>
        <CardDescription>
          Top {courses.length} khóa học có doanh thu cao nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.courseId}
              className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="relative flex-shrink-0">
                <Badge
                  className={`absolute -top-2 -left-2 z-10 ${getRankColor(course.rank)}`}
                >
                  #{course.rank}
                </Badge>
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.courseName}
                    width={120}
                    height={80}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="w-[120px] h-[80px] bg-muted rounded-md flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                  {course.courseName}
                </h4>
                {course.categoryName && (
                  <Badge variant="outline" className="text-xs mb-2">
                    {course.categoryName}
                  </Badge>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  {course.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{course.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                  <span>{course.totalStudents} học viên</span>
                  <span>{course.totalSales} đơn hàng</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(course.totalRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(course.price)}/khóa
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

