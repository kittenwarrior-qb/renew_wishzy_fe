// src/hooks/useDashboardData.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { statService } from "@/services/stat";
import { userService } from "@/services/user";
import { courseService } from "@/services/course";
import type { HotCourse, RevenueApiResponse, RevenueMode, TopStudent, TopInstructor } from "@/types/revenue";



export type TimeRange = "day" | "week" | "month" | "year";

interface RevenueData {
    day: RevenueApiResponse | null;
    week: RevenueApiResponse | null;
    month: RevenueApiResponse | null;
    year: RevenueApiResponse | null;
    loading: boolean;
    error: string | null;
}

export function useDashboardData() {
    // Fetch revenue statistics for all time ranges
    const [revenueData, setRevenueData] = useState<RevenueData>({
        day: null,
        week: null,
        month: null,
        year: null,
        loading: true,
        error: null,
    });

    const queryClient = useQueryClient();

    const fetchRevenueData = useCallback(async (mode: RevenueMode) => {
        try {
            setRevenueData(prev => ({ ...prev, loading: true, error: null }));
            const response = await statService.getRevenue({ mode });
            setRevenueData(prev => ({
                ...prev,
                [mode]: response,
                loading: false,
            }));
            return response;
        } catch (error) {
            console.error(`Error fetching ${mode} revenue data:`, error);
            setRevenueData(prev => ({
                ...prev,
                loading: false,
                error: `Failed to load ${mode} data`,
            }));
            throw error;
        }
    }, []);

    // Initial fetch for default mode only (lazy load others on demand)
    useEffect(() => {
        // Only fetch 'month' initially - other modes will be fetched when user switches
        fetchRevenueData('month');
    }, [fetchRevenueData]);

    const refetchRevenue = useCallback((mode: RevenueMode) => {
        return fetchRevenueData(mode);
    }, [fetchRevenueData]);

    // Fetch hot courses
    const {
        data: hotCoursesData = { data: [], total: 0 },
        isLoading: isLoadingHotCourses,
        isError: isHotCoursesError,
    } = useQuery({
        queryKey: ['hot-courses'],
        queryFn: () => statService.getHotCourses({ limit: 100 }),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2
    });

    const hotCoursesTotal = hotCoursesData.total;

    // Fetch dashboard summary (students, instructors, courses, today's orders)
    const {
        data: summaryData,
        isLoading: isLoadingSummary,
        isError: isSummaryError
    } = useQuery({
        queryKey: ['dashboard', 'summary'],
        queryFn: () => statService.getDashboardSummary(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2
    });

    // Fetch top students
    const {
        data: topStudentsData,
        isLoading: isLoadingTopStudents,
        isError: isTopStudentsError
    } = useQuery({
        queryKey: ['dashboard', 'top-students'],
        queryFn: () => statService.getTopStudents({ limit: 5, sortBy: 'totalSpent' }),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2
    });

    // Fetch top instructors
    const {
        data: topInstructorsData,
        isLoading: isLoadingTopInstructors,
        isError: isTopInstructorsError
    } = useQuery({
        queryKey: ['dashboard', 'top-instructors'],
        queryFn: () => statService.getTopInstructors({ limit: 5, sortBy: 'rating' }),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2
    });

    // Fetch top courses by revenue
    const {
        data: topCoursesByRevenueData,
        isLoading: isLoadingTopCoursesByRevenue,
        isError: isTopCoursesByRevenueError
    } = useQuery({
        queryKey: ['dashboard', 'top-courses-by-revenue'],
        queryFn: () => statService.getTopCoursesByRevenue(5),
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2
    });



    // Memoize refetch functions to prevent unnecessary re-renders
    const refetchFns = useMemo(() => ({
        revenue: refetchRevenue,
        hotCourses: () => {
            return queryClient.invalidateQueries({ queryKey: ['hot-courses'] });
        },
        summary: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
        },
        users: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'top-students'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'top-instructors'] });
        }
    }), [queryClient, refetchRevenue]);

    return {
        // Total statistics from summary API
        totalStats: {
            totalStudents: summaryData?.totalStudents || 0,
            totalInstructors: summaryData?.totalInstructors || 0,
            totalCourses: summaryData?.totalCourses || 0,
            todayOrders: summaryData?.todayOrders || 0,
            todayRevenue: summaryData?.todayRevenue || 0,
        },

        // Chart data
        chartData: {
            day: revenueData.day,
            week: revenueData.week,
            month: revenueData.month,
            year: revenueData.year,
            loading: revenueData.loading,
            error: revenueData.error,
        },

        // Other data
        hotCourses: hotCoursesData,
        hotCoursesTotal,
        topStudents: topStudentsData?.data || [],
        topInstructors: topInstructorsData?.data || [],
        topCoursesByRevenue: topCoursesByRevenueData?.data || [],
        isLoading: isLoadingHotCourses || isLoadingSummary || revenueData.loading || isLoadingTopStudents || isLoadingTopInstructors || isLoadingTopCoursesByRevenue,
        isError: isHotCoursesError || isSummaryError || !!revenueData.error || isTopStudentsError || isTopInstructorsError || isTopCoursesByRevenueError,
        refetch: refetchFns,
    };
}