"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay";
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable";
import { 
  TrendingUp, 
  CreditCard, 
  ShoppingCart, 
  Calendar,
  Download,
  Inbox,
  BarChart3,
  Users,
  Trophy
} from "lucide-react";
import { useInstructorRevenue, useExportRevenueReport } from "@/hooks/useInstructorApi";
import type { RevenueQuery } from "@/types/instructor";
import { RevenueChart, TopSellingCourses, CoursesWithMostStudents, PerformanceMetrics } from "./components";
import { exportToCSV, exportToJSON, generateRevenueReport } from "./utils/exportUtils";

export default function RevenuePage() {
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [timeRange, setTimeRange] = React.useState("thisMonth");



  // API query parameters - only send supported parameters
  const queryParams: RevenueQuery = React.useMemo(() => {
    // Backend only supports: page, limit, courseId, voucherId
    // Remove unsupported parameters: startDate, endDate, currency, groupBy
    return {
      page,
      limit,
      // courseId: undefined, // Can be added later for filtering
    };
  }, [page, limit]);

  // API hooks
  const { data: revenueData, isPending, isFetching } = useInstructorRevenue(queryParams);
  const exportReportMutation = useExportRevenueReport();

  // Extract data from API response
  const statistics = revenueData?.data?.statistics;
  const transactions = revenueData?.data?.items || [];
  const pagination = revenueData?.data?.pagination;

  // Calculate additional statistics from current transactions for more accurate display
  const enhancedStatistics = React.useMemo(() => {
    if (!statistics) return null;

    // Calculate from current transaction data for more accurate numbers
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const currentPageRevenue = completedTransactions.reduce((sum, t) => sum + (t.instructorEarning || 0), 0);
    
    // Calculate monthly revenue from current data
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTransactions = completedTransactions.filter(t => {
      const transactionDate = new Date(t.transactionDate);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
    const currentMonthRevenue = monthlyTransactions.reduce((sum, t) => sum + (t.instructorEarning || 0), 0);

    // Use API statistics as base, but enhance with current data if available
    const enhanced = {
      totalRevenue: statistics.totalRevenue || currentPageRevenue,
      totalOrders: statistics.totalOrders || transactions.length,
      completedOrders: statistics.completedOrders || completedTransactions.length,
      pendingOrders: statistics.pendingOrders || transactions.filter(t => t.status === 'pending').length,
      averageOrderValue: statistics.averageOrderValue || (completedTransactions.length > 0 ? currentPageRevenue / completedTransactions.length : 0),
      monthlyRevenue: statistics.monthlyRevenue || currentMonthRevenue,
      revenueGrowth: statistics.revenueGrowth || 0
    };

    console.log('📊 Enhanced Statistics:', enhanced);
    console.log('📊 Original API Statistics:', statistics);
    console.log('📊 Current Page Revenue:', currentPageRevenue);
    console.log('📊 Monthly Revenue:', currentMonthRevenue);
    console.log('📊 Completed Transactions:', completedTransactions.length);

    return enhanced;
  }, [statistics, transactions]);

  // Process analytics data from transactions
  const analyticsData = React.useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        topSellingCourses: [],
        coursesWithMostStudents: [],
        paymentMethodStats: [],
        recentActivity: []
      };
    }

    // Group by course for analytics
    const courseStats = new Map();
    const paymentMethods = new Map();
    
    transactions.forEach(transaction => {
      const courseId = transaction.courseId;
      
      // Course statistics
      if (!courseStats.has(courseId)) {
        courseStats.set(courseId, {
          courseId,
          courseName: transaction.courseName,
          totalRevenue: 0,
          totalSales: 0,
          totalStudents: new Set(),
          price: transaction.instructorEarning, // Use instructor earning as base price
          thumbnail: null, // Would need to fetch from course data
          categoryName: null, // Would need to fetch from course data
          averageRating: null, // Would need to fetch from course data
        });
      }
      
      const courseData = courseStats.get(courseId);
      if (transaction.status === 'completed') {
        courseData.totalRevenue += transaction.instructorEarning;
        courseData.totalSales += 1;
        courseData.totalStudents.add(transaction.studentEmail);
      }
      
      // Payment method statistics
      const method = transaction.paymentProvider;
      if (!paymentMethods.has(method)) {
        paymentMethods.set(method, { method, count: 0, revenue: 0 });
      }
      if (transaction.status === 'completed') {
        paymentMethods.get(method).count += 1;
        paymentMethods.get(method).revenue += transaction.instructorEarning;
      }
    });

    // Convert course stats to arrays
    const courseArray = Array.from(courseStats.values()).map(course => ({
      ...course,
      totalStudents: course.totalStudents.size
    }));

    // Top selling courses (by revenue)
    const topSellingCourses = courseArray
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map((course, index) => ({
        ...course,
        rank: index + 1
      }));

    // Courses with most students
    const coursesWithMostStudents = courseArray
      .sort((a, b) => b.totalStudents - a.totalStudents)
      .slice(0, 5);

    // Payment method stats
    const paymentMethodStats = Array.from(paymentMethods.values())
      .sort((a, b) => b.revenue - a.revenue);

    // Recent activity (last 10 transactions)
    const recentActivity = transactions
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, 10);

    return {
      topSellingCourses,
      coursesWithMostStudents,
      paymentMethodStats,
      recentActivity
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case "pending":
        return <Badge variant="secondary">Đang xử lý</Badge>;
      case "failed":
        return <Badge variant="destructive">Thất bại</Badge>;
      case "refunded":
        return <Badge variant="outline">Đã hoàn tiền</Badge>;
      case "disputed":
        return <Badge variant="destructive">Tranh chấp</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleExportReport = (format: 'csv' | 'json' | 'xlsx' = 'csv') => {
    if (format === 'xlsx') {
      // Use API export for Excel format
      exportReportMutation.mutate({ 
        params: queryParams, 
        format: 'xlsx' 
      });
    } else {
      // Use client-side export for CSV and JSON
      const exportData = transactions.map(t => ({
        id: t.id,
        studentName: t.studentName,
        studentEmail: t.studentEmail,
        courseName: t.courseName,
        amount: t.amount,
        instructorEarning: t.instructorEarning,
        status: t.status,
        paymentProvider: t.paymentProvider,
        transactionDate: t.transactionDate
      }));

      if (format === 'csv') {
        exportToCSV(exportData, 'revenue-report');
      } else if (format === 'json') {
        const fullReport = generateRevenueReport(exportData, enhancedStatistics);
        exportToJSON(fullReport, 'revenue-report');
      }
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'courseName',
      label: 'Khóa học',
      type: 'text',
      render: (row: any) => (
        <span className="font-medium">{row.courseName}</span>
      ),
    },
    {
      key: 'studentName',
      label: 'Học viên',
      type: 'text',
      render: (row: any) => (
        <div>
          <div className="font-medium">{row.studentName}</div>
          <div className="text-sm text-muted-foreground">{row.studentEmail}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Số tiền',
      type: 'number',
      render: (row: any) => (
        <div>
          <div className="font-semibold text-green-600">
            {formatCurrency(row.instructorEarning)}
          </div>
          <div className="text-xs text-muted-foreground">
            Tổng: {formatCurrency(row.amount)}
          </div>
        </div>
      ),
    },
    {
      key: 'transactionDate',
      label: 'Ngày',
      type: 'short',
      render: (row: any) => formatDate(row.transactionDate),
    },
    {
      key: 'paymentMethod',
      label: 'Phương thức',
      type: 'short',
      render: (row: any) => (
        <Badge variant="outline">{row.paymentProvider}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'short',
      render: (row: any) => getStatusBadge(row.status),
    },
  ];

  return (
    <div className="relative py-4 px-4 md:px-6">
      {/* Debug Stats (Development Only) */}
      {/* <DebugStats 
        statistics={statistics}
        enhancedStatistics={enhancedStatistics}
        transactions={transactions}
        pagination={pagination}
      /> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng doanh thu</p>
              <p className="text-2xl font-bold">{formatCurrency(enhancedStatistics?.totalRevenue || 0)}</p>
              <p className="text-xs text-muted-foreground">Tất cả thời gian</p>
            </div>
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Doanh thu tháng</p>
              <p className="text-2xl font-bold">{formatCurrency(enhancedStatistics?.monthlyRevenue || 0)}</p>
              <p className="text-xs text-muted-foreground">Tháng hiện tại</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng đơn hàng</p>
              <p className="text-2xl font-bold">{enhancedStatistics?.totalOrders || 0}</p>
              <p className="text-xs text-muted-foreground">{enhancedStatistics?.completedOrders || 0} hoàn thành</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Giá trị TB/đơn</p>
              <p className="text-2xl font-bold">{formatCurrency(enhancedStatistics?.averageOrderValue || 0)}</p>
              <p className="text-xs text-muted-foreground">Trung bình mỗi giao dịch</p>
            </div>
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Biểu đồ doanh thu
          </h3>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">7 ngày</SelectItem>
              <SelectItem value="thisMonth">30 ngày</SelectItem>
              <SelectItem value="thisQuarter">90 ngày</SelectItem>
              <SelectItem value="thisYear">1 năm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-[300px] relative">
          {transactions.length > 0 ? (
            <RevenueChart transactions={transactions} timeRange={timeRange} />
          ) : (
            <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chưa có dữ liệu để hiển thị biểu đồ</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Selling Courses */}
        <div className="bg-card rounded-lg border">
          {analyticsData.topSellingCourses.length > 0 ? (
            <TopSellingCourses courses={analyticsData.topSellingCourses} />
          ) : (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Khóa học bán chạy nhất</h3>
              </div>
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chưa có dữ liệu khóa học</p>
              </div>
            </div>
          )}
        </div>

        {/* Courses with Most Students */}
        <div className="bg-card rounded-lg border">
          {analyticsData.coursesWithMostStudents.length > 0 ? (
            <CoursesWithMostStudents courses={analyticsData.coursesWithMostStudents} />
          ) : (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Khóa học có nhiều học viên nhất</h3>
              </div>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chưa có dữ liệu học viên</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-6">
        <PerformanceMetrics statistics={enhancedStatistics || {
          totalRevenue: 0,
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          averageOrderValue: 0,
          monthlyRevenue: 0,
          revenueGrowth: 0
        }} transactions={transactions} />
      </div>

      {/* Payment Methods & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payment Methods Statistics */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Phương thức thanh toán
          </h3>
          {analyticsData.paymentMethodStats.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.paymentMethodStats.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{method.method}</Badge>
                    <span className="text-sm text-muted-foreground">{method.count} giao dịch</span>
                  </div>
                  <div className="font-semibold">{formatCurrency(method.revenue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có dữ liệu thanh toán</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Hoạt động gần đây
          </h3>
          {analyticsData.recentActivity.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {analyticsData.recentActivity.map((activity, index) => (
                <div key={`${activity.id}-${index}`} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{activity.courseName}</p>
                    <p className="text-xs text-muted-foreground">{activity.studentName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(activity.transactionDate)}</p>
                  </div>
                  <div className="text-sm font-semibold text-green-600 flex-shrink-0">
                    +{formatCurrency(activity.instructorEarning)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có hoạt động gần đây</p>
            </div>
          )}
        </div>
      </div>

      {/* Export & Summary Section */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Báo cáo chi tiết</h3>
            <p className="text-sm text-muted-foreground">
              Xuất báo cáo doanh thu chi tiết theo các định dạng khác nhau
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportReport('csv')}
              disabled={transactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportReport('json')}
              disabled={transactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportReport('xlsx')}
              disabled={exportReportMutation.isPending || transactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportReportMutation.isPending ? 'Đang xuất...' : 'Xuất Excel'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4 mr-2" />
              In báo cáo
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Filters */}
      <div className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <h3 className="text-lg font-semibold">Lịch sử giao dịch</h3>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">Tuần này</SelectItem>
                <SelectItem value="thisMonth">Tháng này</SelectItem>
                <SelectItem value="thisQuarter">Quý này</SelectItem>
                <SelectItem value="thisYear">Năm này</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />

        {transactions.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/60" />
              <span>Không có dữ liệu</span>
            </div>
          </div>
        ) : (
          <DynamicTable
            columns={columns}
            data={transactions}
            loading={isPending || isFetching}
            pagination={{
              totalItems: pagination?.total || 0,
              currentPage: page,
              itemsPerPage: limit,
              onPageChange: (p) => setPage(p),
              pageSizeOptions: [10, 20, 50],
              onPageSizeChange: (sz) => {
                setLimit(sz);
                setPage(1);
              },
            }}
          />
        )}
      </div>
    </div>
  );
}