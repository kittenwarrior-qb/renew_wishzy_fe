import React from 'react';

interface Instructor {
    id: string;
    fullName: string;
    email: string;
    avatar: string;
    role: string;
    rating: number;
    courses: number;
    students: number;
    specialties: string[];
}

interface TopInstructorsProps {
    instructors: Instructor[];
    isLoading?: boolean;
    isError?: boolean;
}

export function TopInstructors({ instructors, isLoading, isError }: TopInstructorsProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-lg mb-4">Lớp học đang hoạt động</h3>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-2 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-lg mb-4">Lớp học đang hoạt động</h3>
                <div className="text-center py-4 text-sm text-red-500">
                    Đã xảy ra lỗi khi tải dữ liệu giảng viên
                </div>
            </div>
        );
    }

    if (!instructors.length) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-lg mb-4">Lớp học đang hoạt động</h3>
                <div className="text-center py-4 text-sm text-gray-500">
                    Chưa có dữ liệu giảng viên
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-4">Lớp học đang hoạt động</h3>
            <div className="space-y-4">
                {instructors.map((instructor, index) => (
                    <div key={instructor.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                            {instructor.fullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium">{instructor.fullName}</h4>
                            <p className="text-sm text-gray-500">{instructor.courses} khóa học</p>
                        </div>
                        <span className="text-sm font-medium">{instructor.students} học viên</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
