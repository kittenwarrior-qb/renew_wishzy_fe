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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            <CardTitle className="text-sm font-medium">TB/Khoá học</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((stats?.totalCourses || 0) > 0 ? (stats?.totalRevenue || 0) / (stats?.totalCourses || 1) : 0)}
            </div>
            <p className="text-xs text-muted-foreground">Doanh thu trung bình</p>
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
            <CardTitle className="text-sm font-medium">TB/Học viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((stats?.totalStudents || 0) > 0 ? (stats?.totalRevenue || 0) / (stats?.totalStudents || 1) : 0)}
            </div>
            <p className="text-xs text-muted-foreground">Doanh thu/học viên</p>
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

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá TB</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.overallRating || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Trung bình từ {stats?.totalFeedbacks || 0} đánh giá của học viên
            </p>
          </CardContent>
        </Card> */}
      </div>

      {/* Engagement Overview */}
      <EngagementOverview 
        commentsStats={commentsData?.data?.statistics}
        feedbacksStats={feedbacksData?.data?.statistics}
        isLoading={isLoading}
      />

      {/* Quick Actions - Commented out as not needed */}
      {/* <QuickActions 
        pendingComments={commentsData?.data?.statistics?.pendingComments}
        needReplyFeedbacks={feedbacksData?.data?.statistics?.needReply}
        isLoading={isLoading}
      /> */}

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
              <div className="relative">
                {/* Chart Container */}
                <div className="flex items-end justify-between gap-1 h-64 px-4 py-2 bg-gradient-to-t from-muted/20 to-transparent rounded-lg overflow-x-auto">
                  {chartData.slice(-12).map((item, idx) => {
                    const isHighest = item.percentage === 100;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 flex-1 group">
                        {/* Value on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          {formatCurrency(item.revenue)}
                        </div>
                        
                        {/* Bar */}
                        <div className="relative w-full min-w-[32px] max-w-12 flex flex-col items-center">
                          <div 
                            className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                              isHighest 
                                ? 'bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg' 
                                : 'bg-gradient-to-t from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                            }`}
                            style={{ 
                              height: `${Math.max(item.percentage * 0.85, 12)}%`,
                              minHeight: '12px'
                            }}
                          />
                          {/* Base line */}
                          <div className="w-full h-0.5 bg-border rounded-full" />
                        </div>
                        
                        {/* Period label */}
                        <div className="text-xs text-muted-foreground text-center mt-1 font-medium">
                          {item.period}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-muted-foreground py-2">
                  <span>{formatCompactNumber(Math.max(...chartData.map(d => d.revenue)))}</span>
                  <span className="opacity-60">{formatCompactNumber(Math.max(...chartData.map(d => d.revenue)) / 2)}</span>
                  <span>0</span>
                </div>
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
              <div className="space-y-6">
                {/* Chart Style Display */}
                <div className="relative bg-gradient-to-t from-muted/20 to-transparent rounded-lg p-4">
                  <div className="flex items-end justify-between gap-2 h-48 overflow-x-auto">
                    {topCoursesByRevenue.map((course, idx) => {
                      const maxRevenue = topCoursesByRevenue[0]?.revenue || 1;
                      const percentage = (course.revenue || 0) / maxRevenue * 100;
                      const isTop3 = idx < 3;

                      return (
                        <div key={course.courseId} className="flex flex-col items-center gap-1 flex-1 group">
                          {/* Revenue on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            {formatCurrency(course.revenue || 0)}
                          </div>
                          
                          {/* Bar with rank icon */}
                          <div className="relative w-full min-w-[48px] max-w-16 flex flex-col items-center">
                            {/* Rank icon on top of bar */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
                              {getRankIcon(idx)}
                            </div>
                            
                            <div 
                              className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                                idx === 0 
                                  ? 'bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg' 
                                  : idx === 1
                                  ? 'bg-gradient-to-t from-gray-400 to-gray-300 shadow-md'
                                  : idx === 2
                                  ? 'bg-gradient-to-t from-amber-600 to-amber-500 shadow-md'
                                  : 'bg-gradient-to-t from-primary to-primary/80'
                              }`}
                              style={{ 
                                height: `${Math.max(percentage * 0.85, 16)}%`,
                                minHeight: '16px'
                              }}
                            />
                            {/* Base line */}
                            <div className="w-full h-0.5 bg-border rounded-full" />
                          </div>
                          
                          {/* Course info */}
                          <div className="text-center mt-2 space-y-1">
                            <Link
                              href={`/instructor/courses/${course.courseId}`}
                              className="text-xs font-medium hover:text-primary hover:underline block truncate max-w-20"
                              title={course.courseName}
                            >
                              {course.courseName}
                            </Link>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
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
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Y-axis label */}
                  <div className="absolute left-0 top-4 text-xs text-muted-foreground">
                    {formatCompactNumber(topCoursesByRevenue[0]?.revenue || 0)}
                  </div>
                  <div className="absolute left-0 bottom-12 text-xs text-muted-foreground opacity-60">
                    0
                  </div>
                </div>
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
