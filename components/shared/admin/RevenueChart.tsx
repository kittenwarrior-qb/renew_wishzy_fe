'use client'

import { useState } from 'react';
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
    onModeChange?: (mode: RevenueMode) => void;
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
    const formatLabel = (item: RevenueApiDataPoint): string => {
        const period = item.period;
        if (!period) return '';

        try {
            if (mode === 'month') {
                // For month view, show as Th1/25
                const parts = period.split('-');
                if (parts.length < 2) return period;

                const [year, month] = parts;
                const monthIndex = parseInt(month, 10) - 1;
                const monthNames = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
                return `${monthNames[monthIndex] || month}/${String(year).slice(-2)}`;

            } else if (mode === 'week') {
                // For week view, show date range like "08/09-14/09"
                // Use startDate and endDate from API response
                if (item.startDate && item.endDate) {
                    const formatDateShort = (dateStr: string) => {
                        const parts = dateStr.split('-');
                        if (parts.length < 3) return dateStr;
                        const [, month, day] = parts;
                        return `${day}/${month}`;
                    };
                    return `${formatDateShort(item.startDate)}-${formatDateShort(item.endDate)}`;
                }
                // Fallback to period if startDate/endDate not available
                return `Tuần ${period.split('-')[1] || period}`;

            } else if (mode === 'day') {
                // For day view, show as DD/MM
                const parts = period.split('-');
                if (parts.length < 3) return period;

                const [, month, day] = parts;
                const paddedDay = String(day || '').padStart(2, '0');
                const paddedMonth = String(month || '').padStart(2, '0');
                return `${paddedDay}/${paddedMonth}`;

            } else if (mode === 'year') {
                return period;
            }
        } catch (error) {
            console.error('Error formatting date:', error);
        }

        return period;
    };

    return {
        labels: data.details.map((item: RevenueApiDataPoint) => formatLabel(item)),
        datasets: [{
            label: 'Doanh thu',
            data: data.details.map((item: RevenueApiDataPoint) => item.revenue),
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderRadius: 6,
            borderSkipped: false,
        } as any]
    };
};

export function RevenueChart({ data: propsData, onModeChange }: RevenueChartProps) {
    // Use local state for mode instead of URL - prevents page reload
    const [mode, setMode] = useState<RevenueMode>('month');
    
    // Use data from props - no duplicate hook call needed
    const currentData = propsData[mode] as RevenueApiResponse | null;
    const { loading, error } = propsData;

    // Handle time range change - trigger lazy load if data doesn't exist
    const handleTimeRangeChange = (value: string) => {
        const newMode = value as RevenueMode;
        setMode(newMode);
        
        // If data for this mode doesn't exist, trigger lazy fetch
        if (!propsData[newMode] && onModeChange) {
            onModeChange(newMode);
        }
    };

    if (loading && !currentData) {
        return (
            <Card className="w-full border-0 shadow-none bg-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-10 w-80" />
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full flex items-center justify-center">
                        <Skeleton className="h-full w-full rounded-xl" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full border-0 shadow-none bg-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-semibold">
                        Biểu đồ doanh thu
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full flex items-center justify-center text-red-500">
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
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context: any) {
                        return ` ${new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            maximumFractionDigits: 0
                        }).format(context.raw)}`;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        size: 11,
                    },
                    callback: function (value: number | string) {
                        const num = Number(value);
                        if (num >= 1000000) {
                            return `${(num / 1000000).toFixed(1)}M`;
                        } else if (num >= 1000) {
                            return `${(num / 1000).toFixed(0)}K`;
                        }
                        return num.toLocaleString('vi-VN');
                    }
                },
                border: {
                    display: false,
                }
            },
            x: {
                type: 'category' as const,
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        size: 11,
                    },
                    autoSkip: true,
                    maxRotation: 0,
                    minRotation: 0
                },
                border: {
                    display: false,
                }
            },
        },
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        // Limit bar width when there are few data points
        datasets: {
            bar: {
                maxBarThickness: 80,
            }
        }
    };

    const modeLabels: Record<RevenueMode, string> = {
        day: 'theo ngày',
        week: 'theo tuần', 
        month: 'theo tháng',
        year: 'theo năm'
    };

    return (
        <Card className="w-full border-0 shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-0">
                <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        Biểu đồ doanh thu
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Thống kê doanh thu {modeLabels[mode]}
                    </p>
                </div>
                <Tabs value={mode} onValueChange={handleTimeRangeChange}>
                    <TabsList className="bg-muted/50 p-1 h-10">
                        <TabsTrigger value="day" className="text-sm px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Ngày
                        </TabsTrigger>
                        <TabsTrigger value="week" className="text-sm px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Tuần
                        </TabsTrigger>
                        <TabsTrigger value="month" className="text-sm px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Tháng
                        </TabsTrigger>
                        <TabsTrigger value="year" className="text-sm px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Năm
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="px-0">
                <div className="h-[350px] w-full">
                    {loading ? (
                        <div className="h-full w-full flex items-center justify-center">
                            <Skeleton className="h-full w-full rounded-xl" />
                        </div>
                    ) : (
                        <Bar
                            options={options}
                            data={getSafeChartData(currentData, mode)}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
