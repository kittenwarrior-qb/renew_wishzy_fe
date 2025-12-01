'use client'

import { useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getDateRange } from '@/lib/format';
import { format, subDays } from 'date-fns';
import { RevenueMode } from '@/types/revenue';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RevenueApiResponse, RevenueApiDataPoint } from "@/types/revenue"
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartData,
} from 'chart.js';

import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export type TimeRange = 'day' | 'week' | 'month' | 'year';

export interface RevenueChartProps {
    data: {
        day: RevenueApiResponse | null;
        week: RevenueApiResponse | null;
        month: RevenueApiResponse | null;
        year: RevenueApiResponse | null;
        loading: boolean;
        error: string | null;
    };
}

export interface RevenueData {
    labels: string[]
    datasets: {
        label: string
        data: number[]
        borderColor: string
        backgroundColor: string
        tension: number
        fill: boolean
    }[]
}

// Helper function to get safe chart data
const getSafeChartData = (data: RevenueApiResponse | null, mode: string): ChartData<'bar'> => {
    if (!data || !data.details?.length) {
        return {
            labels: [],
            datasets: []
        };
    }

    // Format labels based on the selected mode
    const formatLabel = (period: string): string => {
        if (!period) return '';

        try {
            if (mode === 'month') {
                // For month view, show as YYYY-MM
                const parts = period.split('-');
                if (parts.length < 2) return period;

                const [year, month] = parts;
                const monthIndex = parseInt(month, 10) - 1;
                const monthNames = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
                return `${monthNames[monthIndex] || month}/${String(year).slice(-2)}`;

            } else if (mode === 'week' || mode === 'day') {
                // For day/week view, show as DD/MM
                const parts = period.split('-');
                if (parts.length < 3) return period;

                const [year, month, day] = parts;
                const paddedDay = String(day || '').padStart(2, '0');
                const paddedMonth = String(month || '').padStart(2, '0');
                return `${paddedDay}/${paddedMonth}`;
            }
        } catch (error) {
            console.error('Error formatting date:', error);
        }

        return period;
    };

    return {
        labels: data.details.map((item: RevenueApiDataPoint) => formatLabel(item.period)),
        datasets: [{
            label: 'Doanh thu',
            data: data.details.map((item: RevenueApiDataPoint) => item.revenue),
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            // @ts-ignore - tension is valid for line charts but not properly typed in Chart.js types
            tension: 0.4,
            fill: true
        }]
    };
};

export function RevenueChart({ data }: RevenueChartProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Get mode from URL or default to 'month'
    const mode = (searchParams?.get('mode') as RevenueMode) || 'month';

    // Get date range or default to current month
    const today = useMemo(() => new Date(), []);
    const startDate = searchParams?.get('startDate') ||
        format(subDays(today, 30), 'yyyy-MM-dd');
    const endDate = searchParams?.get('endDate') ||
        format(today, 'yyyy-MM-dd');

    const { chartData, refetch } = useDashboardData();
    const currentData = chartData[mode as keyof typeof chartData] as RevenueApiResponse | null;
    const { loading, error } = chartData;

    // Memoize the refetch function
    const refetchRevenue = useCallback(() => {
        refetch.revenue(mode);
    }, [refetch, mode]);

    const handleTimeRangeChange = useCallback((value: string) => {
        const newMode = value as RevenueMode;
        const params = new URLSearchParams(searchParams?.toString());

        // Update mode
        params.set('mode', newMode);

        // Update dates based on mode
        const { startDate, endDate } = getDateRange(newMode);
        params.set('startDate', startDate);
        params.set('endDate', endDate);

        router.push(`${pathname}?${params.toString()}`);
        refetch.revenue(newMode);
    }, [refetch, searchParams, router, pathname, startDate, endDate]);

    // Initial data fetch
    useEffect(() => {
        refetchRevenue();
    }, [refetchRevenue]);

    if (loading && !currentData) {
        return (
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-10 w-96" />
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full flex items-center justify-center">
                        <Skeleton className="h-full w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Biểu đồ doanh thu
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full flex items-center justify-center text-red-500">
                        {error}
                    </div>
                </CardContent>
            </Card>
        );
    }
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: number | string) {
                        return new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            maximumFractionDigits: 0
                        }).format(Number(value));
                    }
                }
            },
            x: {
                type: 'category' as const,
                grid: {
                    display: false,
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 45
                }
            },
        },
        barPercentage: 0.8,
        categoryPercentage: 0.8
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Biểu đồ doanh thu
                </CardTitle>
                <Tabs value={mode} onValueChange={handleTimeRangeChange}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="day">Ngày</TabsTrigger>
                        <TabsTrigger value="week">Tuần</TabsTrigger>
                        <TabsTrigger value="month">Tháng</TabsTrigger>
                        <TabsTrigger value="year">Năm</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    {loading ? (
                        <div className="h-full w-full flex items-center justify-center">
                            <Skeleton className="h-full w-full" />
                        </div>
                    ) : (
                        <Bar
                            options={{
                                ...options,
                                plugins: {
                                    ...options.plugins,
                                    title: {
                                        display: true,
                                        text: `Doanh thu ${{ day: 'theo ngày', week: 'theo tuần', month: 'theo tháng', year: 'theo năm' }[mode]}`,
                                        font: {
                                            size: 16
                                        },
                                        padding: {
                                            bottom: 20
                                        }
                                    }
                                }
                            }}
                            data={getSafeChartData(currentData, mode)}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
