"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "../../../../../components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  CreditCard,
  Users,
  ShoppingCart,
  Calendar
} from "lucide-react"

interface PerformanceMetricsProps {
  statistics: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
  };
  transactions: any[];
}

export function PerformanceMetrics({ statistics, transactions }: PerformanceMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate additional metrics
  const completionRate = statistics.totalOrders > 0 
    ? (statistics.completedOrders / statistics.totalOrders) * 100 
    : 0;

  const refundRate = transactions.length > 0 
    ? (transactions.filter(t => t.status === 'refunded').length / transactions.length) * 100 
    : 0;

  const averageTransactionValue = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + (Number(t.instructorEarning) || 0), 0) / transactions.length
    : 0;

  // Calculate monthly growth (mock calculation)
  const monthlyGrowth = statistics.revenueGrowth || 0;

  const metrics = [
    {
      title: "Tỷ lệ hoàn thành",
      value: `${completionRate.toFixed(1)}%`,
      description: `${statistics.completedOrders}/${statistics.totalOrders} đơn hàng`,
      icon: CheckCircle,
      color: completionRate >= 90 ? "text-green-600" : completionRate >= 70 ? "text-yellow-600" : "text-red-600",
      progress: completionRate,
      trend: completionRate >= 90 ? "up" : "down"
    },
    {
      title: "Tỷ lệ hoàn tiền",
      value: `${refundRate.toFixed(1)}%`,
      description: "Tỷ lệ khách hàng yêu cầu hoàn tiền",
      icon: CreditCard,
      color: refundRate <= 5 ? "text-green-600" : refundRate <= 10 ? "text-yellow-600" : "text-red-600",
      progress: Math.min(refundRate * 2, 100), // Scale for display
      trend: refundRate <= 5 ? "up" : "down"
    },
    {
      title: "Giá trị TB/giao dịch",
      value: formatCurrency(averageTransactionValue),
      description: "Doanh thu trung bình mỗi giao dịch",
      icon: ShoppingCart,
      color: "text-blue-600",
      progress: Math.min((averageTransactionValue / 1000000) * 100, 100), // Scale based on 1M VND
      trend: "neutral"
    },
    {
      title: "Tăng trưởng tháng",
      value: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`,
      description: "So với tháng trước",
      icon: Calendar,
      color: monthlyGrowth >= 0 ? "text-green-600" : "text-red-600",
      progress: Math.min(Math.abs(monthlyGrowth) * 2, 100), // Scale for display
      trend: monthlyGrowth >= 0 ? "up" : "down"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Chỉ số hiệu suất
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-sm font-medium">{metric.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                  <Badge 
                    variant={metric.trend === "up" ? "default" : metric.trend === "down" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {metric.value}
                  </Badge>
                </div>
              </div>
              <Progress value={metric.progress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Insights */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Thông tin chi tiết
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Đơn hàng đang xử lý:</span>
              <div className="font-semibold">{statistics.pendingOrders} đơn</div>
            </div>
            <div>
              <span className="text-muted-foreground">Doanh thu tháng này:</span>
              <div className="font-semibold">{formatCurrency(statistics.monthlyRevenue)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Giá trị đơn hàng TB:</span>
              <div className="font-semibold">{formatCurrency(statistics.averageOrderValue)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}