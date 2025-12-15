"use client";

import { useState, useMemo } from "react";
import { useInstructorStats, useRevenueStats } from "@/hooks/useInstructorStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, Star, MessageSquare, BarChart3, Trophy, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EngagementOverview } from "./components/EngagementOverview";
import { QuickActions } from "./components/QuickActions";
import { useInstructorComments, useInstructorFeedbacks } from "@/hooks/useInstructorApi";

const InstructorDashboard = () => {
  const { data: stats, isLoading, isError, error } = useInstructorStats();
  const [revenueMode, setRevenueMode] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const { data: revenueStats, isLoading: loadingRevenue } = useRevenueStats({ mode: revenueMode });

  // Get engagement data
  const { data: commentsData } = useInstructorComments({ page: 1, limit: 1 });
  const { data: feedbacksData } = useInstructorFeedbacks({ page: 1, limit: 1 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)} tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} tr`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Top 5 courses by revenue
  const topCoursesByRevenue = useMemo(() => {
    if (!stats?.courses) return [];
    return [...stats.courses]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5);
  }, [stats]);

  // Prepare chart data for revenue
  const chartData = useMemo(() => {
    if (!revenueStats?.details) return [];

    const maxRevenue = Math.max(...revenueStats.details.map(d => d.revenue), 0);

    return revenueStats.details.map(item => ({
      ...item,
      percentage: maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0,
    }));
  }, [revenueStats]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-semibold text-muted-foreground">#{index + 1}</span>;
    }
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

      {/* Engagement Overview */}
      <EngagementOverview 
        commentsStats={commentsData?.data?.statistics}
        feedbacksStats={feedbacksData?.data?.statistics}
        isLoading={isLoading}
      />

      {/* Quick Actions */}
      <QuickActions 
        pendingComments={commentsData?.data?.statistics?.pendingComments}
        needReplyFeedbacks={feedbacksData?.data?.statistics?.needReply}
        isLoading={isLoading}
      />

      {/* Revenue Chart and Top Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle>Biểu đồ doanh thu</CardTitle>
              </div>
              <Select value={revenueMode} onValueChange={(v: any) => setRevenueMode(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="year">Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loadingRevenue ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : chartData.length > 0 ? (
              <div className="space-y-3">
                {chartData.slice(-10).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.period}</span>
                      <span className="font-medium">{formatCompactNumber(item.revenue)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <CardTitle>Top 5 khoá học</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Xếp hạng theo doanh thu</p>
          </CardHeader>
          <CardContent>
            {topCoursesByRevenue.length > 0 ? (
              <div className="space-y-4">
                {topCoursesByRevenue.map((course, idx) => {
                  const maxRevenue = topCoursesByRevenue[0]?.revenue || 1;
                  const percentage = (course.revenue || 0) / maxRevenue * 100;

                  return (
                    <div key={course.courseId} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 w-8 flex justify-center">
                          {getRankIcon(idx)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/instructor/courses/${course.courseId}`}
                            className="font-medium text-sm hover:text-primary hover:underline truncate block"
                          >
                            {course.courseName}
                          </Link>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {course.studentCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {course.averageRating?.toFixed(1) || "0.0"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold">
                            {formatCompactNumber(course.revenue || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 ml-11">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Chưa có khoá học nào</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Courses Table */}
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
