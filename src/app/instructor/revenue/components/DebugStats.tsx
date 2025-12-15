"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

interface DebugStatsProps {
  statistics: any;
  enhancedStatistics: any;
  transactions: any[];
  pagination: any;
}

export function DebugStats({ statistics, enhancedStatistics, transactions, pagination }: DebugStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          Debug Statistics (Development Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Statistics */}
        <div>
          <h4 className="font-semibold text-sm mb-2">API Statistics:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Total Revenue:</span>
              <div className="font-mono">{formatCurrency(statistics?.totalRevenue || 0)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Orders:</span>
              <div className="font-mono">{statistics?.totalOrders || 0}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Completed:</span>
              <div className="font-mono">{statistics?.completedOrders || 0}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Monthly:</span>
              <div className="font-mono">{formatCurrency(statistics?.monthlyRevenue || 0)}</div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Enhanced Statistics:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Total Revenue:</span>
              <div className="font-mono">{formatCurrency(enhancedStatistics?.totalRevenue || 0)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Orders:</span>
              <div className="font-mono">{enhancedStatistics?.totalOrders || 0}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Completed:</span>
              <div className="font-mono">{enhancedStatistics?.completedOrders || 0}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Monthly:</span>
              <div className="font-mono">{formatCurrency(enhancedStatistics?.monthlyRevenue || 0)}</div>
            </div>
          </div>
        </div>

        {/* Transaction Data */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Current Page Data:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Transactions:</span>
              <div className="font-mono">{transactions.length}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Completed:</span>
              <div className="font-mono">{transactions.filter(t => t.status === 'completed').length}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Page Revenue:</span>
              <div className="font-mono">
                {formatCurrency(transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.instructorEarning || 0), 0))}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Pagination Total:</span>
              <div className="font-mono">{pagination?.total || 0}</div>
            </div>
          </div>
        </div>

        {/* Sample Transactions */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Sample Transactions (First 3):</h4>
          <div className="space-y-1 text-xs">
            {transactions.slice(0, 3).map((t, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                <Badge variant={t.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                  {t.status}
                </Badge>
                <span className="font-mono">{formatCurrency(t.instructorEarning || 0)}</span>
                <span className="text-muted-foreground truncate">{t.courseName}</span>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-muted-foreground italic">No transactions found</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}