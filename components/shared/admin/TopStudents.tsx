import React from 'react';
import { formatVND } from '@/lib/format';

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

export function TopStudents({ students = [], isLoading = false, isError = false }: TopStudentsProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-lg mb-4">Học viên nổi bật</h3>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-2 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                            <div className="h-8 w-20 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-lg mb-4">Học viên nổi bật</h3>
                <div className="text-center py-4 text-sm text-red-500">
                    Đã xảy ra lỗi khi tải dữ liệu học viên
                </div>
            </div>
        );
    }

    if (!students.length) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-lg mb-4">Học viên nổi bật</h3>
                <div className="text-center py-4 text-sm text-gray-500">
                    Chưa có dữ liệu học viên
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-4">Học viên nổi bật</h3>
            <div className="space-y-4">
                {students.map((student, index) => (
                    <div key={student.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'
                            }`}>
                            {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium">{student.name}</h4>
                            <p className="text-sm text-gray-500">{student.coursesEnrolled} khóa học</p>
                        </div>
                        <span className="text-sm font-medium">{formatVND(student.totalSpent)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
