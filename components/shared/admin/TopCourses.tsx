"use client"

import React, { useMemo, useState } from "react"
import { BookOpen, Star } from "lucide-react"
import Link from "next/link"
import { formatVND } from "@/lib/format"
import { DynamicTable } from "@/components/shared/common/DynamicTable"
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper"
import type { HotCourse } from "@/types/revenue"
import type { Column } from "@/src/types/table.type"

export interface HotCoursesResponse {
    data: {
        data: HotCourse[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    success: boolean;
    message: string;
    url: string;
}

interface TopCoursesProps {
    hotCourses: HotCourse[] | HotCoursesResponse | { data: HotCourse[]; total: number } | null | undefined;
    isLoading?: boolean;
    isError?: boolean;
    initialVisibleCount?: number;
    total?: number;
}

const DEFAULT_VISIBLE_COUNT = 10;

export function TopCourses({
    hotCourses: raw,
    isLoading = false,
    isError = false,
    initialVisibleCount = DEFAULT_VISIBLE_COUNT,
    total: propTotal
}: TopCoursesProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

    const { hotCourses, total } = useMemo(() => {
        if (!raw) return { hotCourses: [], total: 0 };

        let courses: HotCourse[] = [];
        let count = 0;

        if (Array.isArray(raw)) {
            courses = raw;
            count = raw.length;
        } else if ('data' in raw && Array.isArray(raw.data)) {
            // Handle case when raw is { data: HotCourse[], total: number }
            courses = raw.data;
            count = ('total' in raw && typeof raw.total === 'number')
                ? raw.total
                : raw.data.length;
        } else if ('success' in raw && 'data' in raw && raw.data && Array.isArray(raw.data.data)) {
            // Handle HotCoursesResponse type
            courses = raw.data.data;
            count = typeof raw.data.total === 'number'
                ? raw.data.total
                : raw.data.data.length;
        }

        // Use propTotal if provided, otherwise use calculated count
        return {
            hotCourses: courses,
            total: typeof propTotal === 'number' ? propTotal : count
        };
    }, [raw, propTotal]);

    const toggleExpand = () => {
        if (isExpanded) {
            setVisibleCount(5); // Always show 5 items when collapsed
        } else {
            setVisibleCount(hotCourses.length);
        }
        setIsExpanded(prev => !prev);
    };

    const initialCount = 5; // Show only 5 items initially
    const displayedCourses = hotCourses.slice(0, visibleCount);
    const hasMore = hotCourses.length > initialCount; // Show button if there are more than 5 courses

    /** Table Columns */
    const columns: Column<HotCourse>[] = [
        {
            key: "rank",
            label: "#",
            cellStyle: {
                width: 80,
                textAlign: "center",
                position: 'sticky',
                left: 0,
                zIndex: 20,
                backgroundColor: 'white'
            },
            headerStyle: {
                position: 'sticky',
                left: 0,
                zIndex: 30,
                backgroundColor: '#f9fafb' // bg-gray-50
            },
            render: (record, rowIndex) => (
                <div className="flex items-center justify-center">
                    <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold
              ${record.rank === 1 ? "bg-amber-100 text-amber-800"
                                : record.rank === 2 ? "bg-slate-100 text-slate-600"
                                    : record.rank === 3 ? "bg-amber-50 text-amber-600"
                                        : "bg-gray-50 text-gray-600"}`}
                    >
                        {record.rank || rowIndex + 1}
                    </span>
                </div>
            )
        },
        {
            key: "course",
            label: "Khóa học",
            render: (record) => (
                <div className="flex items-center space-x-3 group">
                    <div className="w-16 h-16 bg-gray-50 border rounded-lg overflow-hidden flex-shrink-0">
                        {record.thumbnail ? (
                            <img src={record.thumbnail} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-gray-300" />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <Link href={`/admin/courses/${record.courseId}`} className="group-hover:text-primary">
                            <TruncateTooltipWrapper className="font-medium text-gray-900" lineClamp={1}>
                                {record.courseName}
                            </TruncateTooltipWrapper>
                        </Link>
                        <div className="text-sm text-gray-500">
                            Danh mục: {record.categoryName || "Chưa phân loại"}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "rating",
            label: "Đánh giá",
            cellStyle: { width: 140 },
            render: (record) => (
                <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium text-gray-800 mr-1">
                        {record.averageRating?.toFixed(1) ?? "0.0"}
                    </span>
                    <span className="text-gray-400 text-sm">
                        ({record.totalStudents?.toLocaleString() ?? 0})
                    </span>
                </div>
            )
        },
        {
            key: "price",
            label: "Giá",
            cellStyle: { width: 120, textAlign: "right" },
            render: (record) => <span className="font-medium text-gray-900">{formatVND(record.price ?? 0)}</span>
        },
        {
            key: "revenue",
            label: "Doanh thu",
            cellStyle: { width: 160, textAlign: "right" },
            render: (record) => (
                <span className="font-medium text-green-600">{formatVND(record.totalRevenue ?? 0)}</span>
            )
        },
        {
            key: "sales",
            label: "Đơn hàng",
            cellStyle: { width: 120, textAlign: "center" },
            render: (record) => (
                <span className="font-medium text-gray-800">{record.totalSales?.toLocaleString() ?? 0}</span>
            )
        }
    ];

    /** Loading UI */
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded-lg w-1/4 animate-pulse" />
                <div className="border rounded-lg">
                    <div className="h-12 bg-gray-50" />
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-16 border-t px-4 flex items-center">
                            <div className="h-4 bg-gray-100 w-3/4 animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    /** Error UI */
    if (isError) {
        return (
            <div className="text-center py-12 text-red-500">
                Không thể tải dữ liệu khoá học bán chạy.
            </div>
        )
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Top Khóa Học Bán Chạy</h3>
                {total > 0 && (
                    <span className="text-sm text-gray-500">Tổng: {total.toLocaleString()}</span>
                )}
            </div>

            <div className="space-y-3">
                <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[500px] overflow-auto">
                        <div className="min-w-max">
                            <DynamicTable
                                columns={columns}
                                data={displayedCourses}
                                emptyText="Chưa có dữ liệu"
                                headerClassName="bg-gray-50 [&>tr>th]:h-12 [&>tr>th]:bg-gray-50 [&>tr>th]:sticky [&>tr>th]:top-0 [&>tr>th]:z-10"
                                rowClassName="hover:bg-gray-50 border-b last:border-b-0 [&>td]:bg-white [&>td]:dark:bg-gray-900"
                                stickyHeader={false}
                                className="w-full border-collapse"
                            />
                        </div>
                    </div>
                </div>

                {hotCourses.length > initialCount && (
                    <div className="flex justify-center pt-2">
                        <button
                            onClick={toggleExpand}
                            className="px-4 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-500 hover:bg-primary-50 rounded-md transition-colors border border-gray-200"
                        >
                            {isExpanded ? 'Ẩn bớt' : `Xem thêm ${hotCourses.length - initialCount} khóa học`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
