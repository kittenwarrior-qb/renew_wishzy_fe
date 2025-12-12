"use client";

import { useInstructorStats } from "@/hooks/useInstructorStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, Star, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const InstructorDashboard = () => {
  const { data: stats, isLoading, isError, error } = useInstructorStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tổng quan</h1>
          <p className="text-muted-foreground">Thống kê hoạt động giảng dạy</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h3 className="text-lg font-semibold">Không thể tải dữ liệu</h3>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Đã xảy ra lỗi"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground">Thống kê hoạt động giảng dạy</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Từ các khoá học</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng học viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">Đã đăng ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng khoá học</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
            <p className="text-xs text-muted-foreground">Đã tạo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá TB</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.overallRating || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Từ {stats?.totalFeedbacks || 0} đánh giá
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Khoá học của bạn
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!stats?.courses || stats.courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Chưa có khoá học nào</p>
              <Link
                href="/instructor/courses/create"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Tạo khoá học đầu tiên
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Tên khoá học</th>
                    <th className="px-4 py-3 text-center">Đánh giá</th>
                    <th className="px-4 py-3 text-center">Học viên</th>
                    <th className="px-4 py-3 text-center">Bình luận</th>
                    <th className="px-4 py-3 text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.courses.map((course) => (
                    <tr key={course.courseId} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/instructor/courses/${course.courseId}`}
                          className="hover:text-primary hover:underline"
                        >
                          {course.courseName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.averageRating?.toFixed(1) || "0.0"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{course.studentCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{course.commentCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(course.revenue || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
