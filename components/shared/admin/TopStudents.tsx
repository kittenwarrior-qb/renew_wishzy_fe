import React from 'react';
import { formatVND } from '@/lib/format';
import { TrendingUp, BookOpen, Award } from 'lucide-react';

export interface Student {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    coursesEnrolled: number;
    totalSpent: number;
    lastActive?: string;
}

interface TopStudentsProps {
    students: Student[];
    isLoading?: boolean;
    isError?: boolean;
}

const rankColors = [
    'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-yellow-200',
    'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-gray-200',
    'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-200',
];

export function TopStudents({ students = [], isLoading = false, isError = false }: TopStudentsProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Học viên nổi bật</h3>
                </div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 animate-pulse rounded-xl bg-gray-50">
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Học viên nổi bật</h3>
                </div>
                <div className="text-center py-8 text-sm text-red-500">
                    Đã xảy ra lỗi khi tải dữ liệu học viên
                </div>
            </div>
        );
    }

    if (!students.length) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Học viên nổi bật</h3>
                </div>
                <div className="text-center py-8 text-sm text-gray-500">
                    Chưa có dữ liệu học viên
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Học viên nổi bật</h3>
            </div>
            <div className="space-y-3">
                {students.map((student, index) => (
                    <div 
                        key={student.id} 
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                        {/* Rank Badge */}
                        <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                            ${index < 3 ? rankColors[index] : 'bg-gray-100 text-gray-600'}
                            ${index < 3 ? 'shadow-md' : ''}
                        `}>
                            {index + 1}
                        </div>
                        
                        {/* Avatar */}
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                            ${index % 4 === 0 ? 'bg-purple-100 text-purple-600' : 
                              index % 4 === 1 ? 'bg-blue-100 text-blue-600' : 
                              index % 4 === 2 ? 'bg-green-100 text-green-600' : 
                              'bg-orange-100 text-orange-600'}
                        `}>
                            {student.name.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Name & Courses */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{student.name}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>{student.coursesEnrolled} khóa học đã mua</span>
                            </div>
                        </div>
                        
                        {/* Total Spent */}
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-green-600 font-semibold">
                                <TrendingUp className="h-4 w-4" />
                                <span>{formatVND(student.totalSpent)}</span>
                            </div>
                            <span className="text-xs text-gray-400">Tổng chi tiêu</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
