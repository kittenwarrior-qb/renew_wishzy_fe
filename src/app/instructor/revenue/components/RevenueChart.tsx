"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, TrendingUp } from "lucide-react"
import { useMemo } from "react"

interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  amount: number;
  currency: string;
  grossAmount: number;
  platformFee: number;
  instructorEarning: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'disputed';
  paymentMethod: string;
  paymentProvider: string;
  transactionDate: string;
  completedAt?: string;
  refundedAt?: string;
  refundReason?: string;
  transactionFee: number;
  exchangeRate?: number;
}

interface RevenueChartProps {
  transactions: Transaction[];
  timeRange: string;
}

export function RevenueChart({ transactions, timeRange }: RevenueChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount)
  }

  // Process transactions into chart data based on time range
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Filter completed transactions only
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    
    // Group transactions by time period
    const groupedData = new Map<string, { revenue: number; sales: number; students: Set<string> }>();

    completedTransactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      let periodKey: string;
      let periodLabel: string;

      switch (timeRange) {
        case 'thisWeek':
          // Group by day for last 7 days
          periodKey = date.toISOString().split('T')[0];
          periodLabel = date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' });
          break;
        case 'thisMonth':
          // Group by day for last 30 days
          periodKey = date.toISOString().split('T')[0];
          periodLabel = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
          break;
        case 'thisQuarter':
          // Group by week for last 90 days
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          periodLabel = `Tuần ${weekStart.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}`;
          break;
        case 'thisYear':
          // Group by month for last 12 months
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          periodLabel = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
          periodLabel = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
      }

      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, {
          revenue: 0,
          sales: 0,
          students: new Set()
        });
      }

      const group = groupedData.get(periodKey)!;
      group.revenue += transaction.instructorEarning;
      group.sales += 1;
      group.students.add(transaction.studentEmail);
    });

    // Convert to array and sort by period
    const result = Array.from(groupedData.entries())
      .map(([key, data]) => ({
        period: key,
        periodLabel: key, // Will be updated below
        revenue: data.revenue,
        sales: data.sales,
        students: data.students.size
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Update period labels
    result.forEach(item => {
      const date = new Date(item.period);
      switch (timeRange) {
        case 'thisWeek':
          item.periodLabel = date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' });
          break;
        case 'thisMonth':
          item.periodLabel = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
          break;
        case 'thisQuarter':
          item.periodLabel = `Tuần ${date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}`;
          break;
        case 'thisYear':
          const [year, month] = item.period.split('-');
          const monthDate = new Date(parseInt(year), parseInt(month) - 1);
          item.periodLabel = monthDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
          break;
      }
    });

    return result.slice(-10); // Show last 10 periods
  }, [transactions, timeRange]);

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 0);
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSales = chartData.reduce((sum, d) => sum + d.sales, 0);

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Chưa có dữ liệu để hiển thị biểu đồ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <span className="font-medium">Biểu đồ doanh thu theo thời gian</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Tổng: {formatCurrency(totalRevenue)} • {totalSales} đơn hàng
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {chartData.map((item, index) => {
          const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium min-w-[100px]">{item.periodLabel}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-xs">
                    {item.sales} đơn • {item.students} học viên
                  </span>
                  <span className="font-semibold min-w-[80px] text-right">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Legend */}
      <div className="text-xs text-muted-foreground pt-2 border-t">
        Hiển thị {chartData.length} khoảng thời gian gần nhất với doanh thu từ các đơn hàng đã hoàn thành
      </div>
    </div>
  );
}

