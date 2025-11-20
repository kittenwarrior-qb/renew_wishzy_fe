'use client';

import { useQueryHook } from "@/src/hooks/useQueryHook";
import { enrollmentService } from "@/src/services/enrollment";
import { CourseEnrollmentCard } from "./CourseEnrollmentCard";
import { Loader2 } from "lucide-react";
import { Enrollment } from "@/src/types/enrollment";

export const MyLearningTab = () => {
    const { data: enrollments, isLoading } = useQueryHook(
        ['my-learning'],
        () => enrollmentService.getMyLearning(),
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!enrollments || enrollments.length === 0) {
        return (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
                <div className="text-muted-foreground">
                    <p className="text-lg mb-2">Chưa có khóa học nào</p>
                    <p className="text-sm">Hãy khám phá và đăng ký các khóa học thú vị!</p>
                </div>
            </div>
        );
    }

    // Sắp xếp: ongoing lên đầu, completed xuống cuối, not_started ở giữa
    const sortedEnrollments = [...enrollments].sort((a, b) => {
        const statusOrder: Record<string, number> = { ongoing: 0, not_started: 1, completed: 2 };
        return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                    Tất cả khóa học ({enrollments.length})
                </h2>
            </div>
            
            <div className="flex flex-col gap-5">
                {sortedEnrollments.map((enrollment: Enrollment) => (
                    <CourseEnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
            </div>
        </div>
    );
};
