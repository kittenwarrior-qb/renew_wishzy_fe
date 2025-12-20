import React from 'react';
import { formatVND } from '@/lib/format';
import { TrendingUp, Users, BookOpen } from 'lucide-react';

export interface CourseByRevenue {
    courseId: string;
    courseName: string;
    thumbnail: string | null;
    instructorName: string;
    totalStudents: number;
    totalRevenue: number;
}

interface TopCoursesByRevenueProps {
    courses: CourseByRevenue[];
    isLoading?: boolean;
    isError?: boolean;
}

const rankColors = [
    'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-yellow-200',
    'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-gray-200',
    'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-200',
];

export function TopCoursesByRevenue({ courses = [], isLoading = false, isError = false }: TopCoursesByRevenueProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Khóa học theo doanh thu</h3>
                </div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 animate-pulse rounded-xl bg-gray-50">
                            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                            <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                            <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Khóa học theo doanh thu</h3>
                </div>
                <div className="text-center py-8 text-sm text-red-500">
                    Đã xảy ra lỗi khi tải dữ liệu
                </div>
            </div>
        );
    }

    if (!courses.length) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Khóa học theo doanh thu</h3>
                </div>
                <div className="text-center py-8 text-sm text-gray-500">
                    Chưa có dữ liệu doanh thu khóa học
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Khóa học theo doanh thu</h3>
            </div>
            <div className="space-y-3">
                {courses.map((course, index) => (
                    <div 
                        key={course.courseId} 
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                        {/* Rank Badge */}
                        <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                            ${index < 3 ? rankColors[index] : 'bg-gray-100 text-gray-600'}
                            ${index < 3 ? 'shadow-md' : ''}
                        `}>
                            {index + 1}
                        </div>
                        
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {course.thumbnail ? (
                                <img 
                                    src={course.thumbnail} 
                                    alt={course.courseName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                </div>
                            )}
                        </div>
                        
                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate" title={course.courseName}>
                                {course.courseName}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="truncate">{course.instructorName}</span>
                                <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {course.totalStudents} học viên
                                </span>
                            </div>
                        </div>
                        
                        {/* Revenue */}
                        <div className="text-right shrink-0">
                            <div className="text-green-600 font-semibold">
                                {formatVND(course.totalRevenue)}
                            </div>
                            <span className="text-xs text-gray-400">Doanh thu</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
