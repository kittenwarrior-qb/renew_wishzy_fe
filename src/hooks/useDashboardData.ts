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

    // Initial fetch for all time ranges
    useEffect(() => {
        const fetchAllRevenueData = async () => {
            try {
                await Promise.all([
                    fetchRevenueData('day'),
                    fetchRevenueData('week'),
                    fetchRevenueData('month'),
                    fetchRevenueData('year'),
                ]);
            } catch (error) {
                console.error('Error fetching revenue data:', error);
            }
        };

        fetchAllRevenueData();
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

    const {
        data: totalCourses = 0,
        isLoading: isLoadingTotalCourses,
        isError: isTotalCoursesError
    } = useQuery<number>({
        queryKey: ['courses', 'count'],
        queryFn: async () => {
            const response = await courseService.getCourses();
            // Get total items from pagination
            return response?.pagination?.totalItems || 0;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2
    });

    const isLoadingCourses = isLoadingHotCourses || isLoadingTotalCourses;
    const isCoursesError = isHotCoursesError || isTotalCoursesError;

    // Fetch top students
    const {
        data: topStudentsData,
        isLoading: isLoadingTopStudents,
        isError: isTopStudentsError
    } = useQuery({
        queryKey: ['dashboard', 'top-students'],
        queryFn: () => statService.getTopStudents({ limit: 5, sortBy: 'totalSpent' }),
        staleTime: 10 * 60 * 1000,
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
        retry: 2
    });

    // Fetch total number of students with error handling
    const {
        data: studentsCount = 0,
        isLoading: isLoadingStudentsCount,
        isError: isStudentsCountError
    } = useQuery<number>({
        queryKey: ['dashboard', 'students', 'count'],
        queryFn: async () => {
            try {
                const response = await userService.getUsersByRole('user', { page: 1, limit: 1 });
                return response?.data?.data?.pagination?.totalItems || 0;
            } catch (error) {
                console.error('Error fetching students count:', error);
                return 0;
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: 2
    });

    // Fetch total number of instructors with error handling
    const {
        data: instructorsCount = 0,
        isLoading: isLoadingInstructorsCount,
        isError: isInstructorsCountError
    } = useQuery<number>({
        queryKey: ['dashboard', 'instructors', 'count'],
        queryFn: async () => {
            try {
                const response = await userService.getUsersByRole('instructor', { page: 1, limit: 1 });
                return response?.data?.data?.pagination?.totalItems || 0;
            } catch (error) {
                console.error('Error fetching instructors count:', error);
                return 0;
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: 2
    });

    // Memoize refetch functions to prevent unnecessary re-renders
    const refetchFns = useMemo(() => ({
        revenue: refetchRevenue,
        hotCourses: () => {
            return queryClient.invalidateQueries({ queryKey: ['hot-courses'] });
        },
        courses: () => {
            queryClient.invalidateQueries({ queryKey: ['hot-courses'] });
            queryClient.invalidateQueries({ queryKey: ['courses', 'count'] });
        },
        users: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'students', 'count'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'instructors', 'count'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'top-students'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'top-instructors'] });
        }
    }), [queryClient, refetchRevenue]);

    // Calculate total revenue from the latest data (using month as default)
    const totalRevenue = revenueData.month?.totalRevenue || 0;
    const growthRate = revenueData.month?.growthRate || 0;

    return {
        // Total statistics with default values
        totalStats: {
            totalStudents: studentsCount,
            totalInstructors: instructorsCount,
            totalCourses: totalCourses,
            totalRevenue: totalRevenue || 0,
            growthRate: growthRate || 0,
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
        totalCourses,
        topStudents: topStudentsData?.data || [],
        topInstructors: topInstructorsData?.data || [],
        totalStudents: studentsCount,
        totalInstructors: instructorsCount,
        totalRevenue: totalRevenue,
        totalEnrollments: 0,
        isLoading: isLoadingHotCourses || isLoadingTotalCourses || revenueData.loading || isLoadingStudentsCount || isLoadingInstructorsCount || isLoadingTopStudents || isLoadingTopInstructors,
        isError: isHotCoursesError || isTotalCoursesError || !!revenueData.error || isStudentsCountError || isInstructorsCountError || isTopStudentsError || isTopInstructorsError,
        refetch: refetchFns,
    };
}