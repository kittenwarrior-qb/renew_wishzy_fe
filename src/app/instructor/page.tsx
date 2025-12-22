"use client";

import { useState, useMemo } from "react";
import { useInstructorStats, useRevenueStats } from "@/hooks/useInstructorStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, Star, BarChart3, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EngagementOverview } from "./components/EngagementOverview";
import { useInstructorComments, useInstructorFeedbacks } from "@/hooks/useInstructorApi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const InstructorDashboard = () => {
  const { data: stats, isLoading, isError, error } = useInstructorStats();
  const [revenueMode, setRevenueMode] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const { data: revenueStats, isLoading: loadingRevenue } = useRevenueStats({ mode: revenueMode });

  const { data: commentsData } = useInstructorComments({ page: 1, limit: 1 });
  const { data: feedbacksData } = useInstructorFeedbacks({ page: 1, limit: 1 });

  // --- HELPER FUNCTIONS ---
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

  // --- DATA PROCESSING ---
  const topCoursesByRevenue = useMemo(() => {
    if (!stats?.courses) return [];
    return [...stats.courses]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0) || (b.studentCount || 0) - (a.studentCount || 0))
      .slice(0, 5);
  }, [stats]);

  const topCoursesChartData = useMemo(() => {
    return topCoursesByRevenue.map((course, idx) => ({
      name: course.courseName.length > 15 ? course.courseName.substring(0, 15) + '...' : course.courseName,
      fullName: course.courseName,
      revenue: course.revenue || 0,
      students: course.studentCount || 0,
      rating: course.averageRating || 0,
      rank: idx + 1,
    }));
  }, [topCoursesByRevenue]);

  const chartData = useMemo(() => {
    if (!revenueStats?.details) return [];
    return revenueStats.details.map(item => ({
      period: item.period,
      revenue: item.revenue || 0,
      orderCount: item.orderCount || 0,
    }));
  }, [revenueStats]);

  // --- SCALING LOGIC (Fix cột ngắn) ---
  const maxRevenueValue = useMemo(() => {
    const vals = chartData.map(d => d.revenue);
    const max = vals.length > 0 ? Math.max(...vals) : 1000000;
    return max === 0 ? 1000000 : max * 1.15; // Cao hơn 15% để đẹp layout
  }, [chartData]);

  const maxTopCourseValue = useMemo(() => {
    const hasRevenue = topCoursesChartData.some(c => c.revenue > 0);
    const vals = topCoursesChartData.map(d => hasRevenue ? d.revenue : d.students);
    const max = vals.length > 0 ? Math.max(...vals) : 100;
    return max === 0 ? 100 : max * 1.15;
  }, [topCoursesChartData]);

  if (isLoading) return <div className="p-6 space-y-6"><Skeleton className="h-10 w-48" /><div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-32 w-full" /></div></div>;
  if (isError) return <div className="p-20 text-center">Lỗi: {error instanceof Error ? error.message : "Đã có lỗi xảy ra"}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground">Thống kê hoạt động giảng dạy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Tổng doanh thu", val: formatCurrency(revenueStats?.totalRevenue || 0), sub: `Theo ${revenueMode}`, icon: BarChart3 },
          { label: "TB/Khoá học", val: formatCurrency((stats?.totalRevenue || 0) / (stats?.totalCourses || 1)), sub: "Doanh thu TB", icon: BarChart3 },
          { label: "Tổng học viên", val: stats?.totalStudents || 0, sub: "Đã đăng ký", icon: Users },
          { label: "Tổng đơn hàng", val: revenueStats?.totalOrders?.toLocaleString() || 0, sub: "Đã hoàn thành", icon: TrendingUp },
          { label: "Tổng khoá học", val: stats?.totalCourses || 0, sub: "Đã tạo", icon: BookOpen },
        ].map((item, i) => (
          <Card key={i} className="hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{item.label}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{item.val}</div>
              <p className="text-[10px] text-muted-foreground mt-1">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <EngagementOverview 
        commentsStats={commentsData?.data?.statistics}
        feedbacksStats={feedbacksData?.data?.statistics}
        isLoading={isLoading}
      />

      {/* Main Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 items-stretch">
        {/* REVENUE CHART */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Biểu đồ doanh thu</CardTitle>
            <Select value={revenueMode} onValueChange={(v: any) => setRevenueMode(v)}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['day', 'week', 'month', 'year'].map(m => <SelectItem key={m} value={m}>{m === 'day' ? 'Ngày' : m === 'week' ? 'Tuần' : m === 'month' ? 'Tháng' : 'Năm'}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-4">
            {/* Summary Stats */}
            {revenueStats && !loadingRevenue && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
                  <p className="text-lg font-bold">{formatCurrency(revenueStats.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Đơn hàng</p>
                  <p className="text-lg font-bold">{revenueStats.totalOrders.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Khóa học bán</p>
                  <p className="text-lg font-bold">{revenueStats.totalCourses.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tăng trưởng</p>
                  <p className={`text-lg font-bold ${revenueStats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueStats.growthRate >= 0 ? '+' : ''}{revenueStats.growthRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {!loadingRevenue && chartData.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(-12)} margin={{ top: 20, right: 10, left: 10, bottom: 65 }}>
                    <defs>
                      <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} angle={-45} textAnchor="end" interval={0} height={60} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={formatCompactNumber} domain={[0, maxRevenueValue]} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => active && payload && (
                      <div className="bg-white p-3 border rounded-lg shadow-xl text-xs">
                        <p className="font-bold mb-1">{payload[0].payload.period}</p>
                        <p className="text-primary">Doanh thu: {formatCurrency(payload[0].value as number)}</p>
                        <p className="text-muted-foreground">{payload[0].payload.orderCount} đơn hàng</p>
                      </div>
                    )} />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {chartData.slice(-12).map((entry, index) => {
                        const isMax = entry.revenue === Math.max(...chartData.map(d => d.revenue));
                        return <Cell key={index} fill={isMax ? "url(#gradGold)" : "url(#gradPrimary)"} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-[350px] flex items-center justify-center text-muted-foreground">Đang tải dữ liệu...</div>}
          </CardContent>
        </Card>

        {/* TOP 5 COURSES CHART */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Top 5 khoá học</CardTitle>
            <p className="text-sm text-muted-foreground">
              Xếp hạng theo doanh thu, sau đó theo số học viên (bao gồm khóa học miễn phí)
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-4">
            {/* Summary Stats for Top 5 */}
            {topCoursesByRevenue.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Tổng doanh thu NET</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(topCoursesByRevenue.reduce((sum, course) => sum + (course.revenue || 0), 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Khóa học</p>
                  <p className="text-lg font-bold">
                    {topCoursesByRevenue.length}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({topCoursesByRevenue.filter(c => c.revenue && c.revenue > 0).length} có phí)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Đánh giá TB</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {(() => {
                      const coursesWithRating = topCoursesByRevenue.filter(c => c.averageRating && c.averageRating > 0);
                      if (coursesWithRating.length === 0) return '0.0';
                      const avgRating = coursesWithRating.reduce((sum, course) => sum + (course.averageRating || 0), 0) / coursesWithRating.length;
                      return avgRating.toFixed(1);
                    })()}
                    <span className="text-xs text-muted-foreground ml-1">/ 5.0</span>
                  </p>
                </div>
              </div>
            )}

            {topCoursesChartData.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCoursesChartData} margin={{ top: 20, right: 10, left: 10, bottom: 65 }}>
                    <defs>
                      <linearGradient id="gradSilver" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e5e7eb" /><stop offset="100%" stopColor="#9ca3af" /></linearGradient>
                      <linearGradient id="gradBronze" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#d97706" /></linearGradient>
                      <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={0} height={60} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={val => topCoursesChartData.some(c => c.revenue > 0) ? formatCompactNumber(val) : val} domain={[0, maxTopCourseValue]} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => active && payload && (
                      <div className="bg-white p-3 border rounded-lg shadow-xl text-xs">
                        <p className="font-bold mb-1">{payload[0].payload.fullName}</p>
                        <p className="text-primary">Doanh thu: {formatCurrency(payload[0].payload.revenue)}</p>
                        <p className="text-muted-foreground">{payload[0].payload.students} học viên</p>
                        <p className="text-yellow-600 font-medium">⭐ {payload[0].payload.rating.toFixed(1)}/5.0</p>
                      </div>
                    )} />
                    <Bar dataKey={topCoursesChartData.some(c => c.revenue > 0) ? "revenue" : "students"} radius={[4, 4, 0, 0]}>
                      {topCoursesChartData.map((_, index) => (
                        <Cell key={index} fill={index === 0 ? "url(#gradGold)" : index === 1 ? "url(#gradSilver)" : index === 2 ? "url(#gradBronze)" : index === 3 ? "url(#gradPrimary)" : "url(#gradGreen)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-[350px] flex items-center justify-center text-muted-foreground">Chưa có dữ liệu</div>}
          </CardContent>
        </Card>
      </div>

      {/* Course Table */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-5 w-5" /> Danh sách khoá học</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Tên khoá học</th>
                  <th className="px-4 py-3 text-center">Đánh giá</th>
                  <th className="px-4 py-3 text-center">Học viên</th>
                  <th className="px-4 py-3 text-right">Giá gốc</th>
                  <th className="px-4 py-3 text-right">Doanh thu NET</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats?.courses?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Chưa có khóa học nào
                    </td>
                  </tr>
                ) : (
                  stats?.courses?.map((course) => (
                    <tr key={course.courseId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/instructor/courses/${course.courseId}`} className="hover:text-primary transition-colors">
                          {course.courseName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> 
                          {course.averageRating?.toFixed(1) || "0.0"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{course.studentCount}</td>
                      <td className="px-4 py-3 text-right font-medium text-muted-foreground">
                        {course?.grossRevenue && course?.grossRevenue > 0 ? formatCurrency(course?.grossRevenue) : 'Miễn phí'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary">
                        {formatCurrency(course.revenue || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;