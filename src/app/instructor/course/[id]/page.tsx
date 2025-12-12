'use client'

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQueryHook } from "@/src/hooks/useQueryHook";
import { courseService } from "@/src/services/course";
import { CourseItemType } from "@/src/types/course/course-item.types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { chapterService } from "@/src/services/chapter";
import { CourseChapter } from "@/components/shared/course/CourseChapter";
import { ChapterType } from "@/src/types/chapter/chapter.types";
import CourseCreator from "@/components/shared/course/CourseCreator";
import { ArrowLeft } from "lucide-react";

const InstructorCourseDetail = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const router = useRouter();

    const { data: course, isLoading: isLoadingCourse, isError: isErrorCourse } = useQueryHook<CourseItemType>(
        ['course', id],
        () => courseService.getCourseById(id)
    );

    const { data: chapters, isLoading: isLoadingChapters } = useQueryHook<{ items: ChapterType[]}>(
        ['chapter', id],
        () => chapterService.getChapterByCourseId(id)
    )

    if (isLoadingCourse) {
        return (
            <div>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 gap-2 -ml-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Đang tải khoá học...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (isErrorCourse || !course) {
        return (
            <div>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 gap-2 -ml-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-lg font-semibold mb-2">Không tìm thấy khoá học</p>
                        <p className="text-muted-foreground mb-4">Khoá học không tồn tại hoặc đã bị xoá</p>
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const totalLessons = chapters?.items?.reduce((total, chapter) => {
        return total + (chapter.lecture?.length || 0);
    }, 0) || 0;

    const totalDurationSeconds = chapters?.items?.reduce((total, chapter) => {
        const chapterDuration = chapter.lecture?.reduce((sum, lecture) => sum + lecture.duration, 0) || 0;
        return total + chapterDuration;
    }, 0) || course.totalDuration || 0;
    
    const formatDurationText = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return minutes > 0 
                ? `${hours} giờ ${minutes} phút` 
                : `${hours} giờ`;
        }
        return `${minutes} phút`;
    };
    
    const durationText = formatDurationText(totalDurationSeconds);
    
    const averageRating = parseFloat(course.averageRating || '0');

    return (
        <div>
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4 gap-2 -ml-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
            </Button>

            <div className="pb-4 mb-6">
                <div>
                    <h2 className="text-2xl font-semibold mb-1">
                        {course.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Chi tiết khoá học
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                        {course.thumbnail ? (
                            <img 
                                src={course.thumbnail} 
                                alt={course.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-muted-foreground text-lg">Chưa có ảnh bìa</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {averageRating > 0 && (
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-500">★</span>
                                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                                    <span>({course.numberOfStudents} đánh giá)</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <span>👥</span>
                                <span>{course.numberOfStudents} học viên</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>📚</span>
                                <span>{totalLessons} bài học</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>⏱️</span>
                                <span>{durationText}</span>
                            </div>
                        </div>
                    </div>

                    {course.description && (
                        <div className="border-b pb-6">
                            <h2 className="py-0 text-lg mb-2 font-semibold">Mô tả khoá học</h2>
                            <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                                {course.description}
                            </p>
                        </div>
                    )}

                    {course.notes && (
                        <div className="border-b pb-6">
                            <h2 className="py-0 text-lg mb-2 font-semibold">Ghi chú</h2>
                            <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                                {course.notes}
                            </p>
                        </div>
                    )}

                    <div>
                        <h1 className="py-0 text-lg font-semibold">Nội dung khoá học</h1>
                        <CourseChapter chapters={chapters?.items ?? []} />
                    </div>

                    {course.creator && (
                        <div className="border-b pb-6">
                            <h2 className="py-0 text-lg font-semibold">Thông tin giảng viên</h2>
                            <CourseCreator creator={course.creator} />
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="border rounded-lg p-6 sticky top-8 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <span className="text-lg font-semibold">Giá khoá học</span>
                            <span className="text-3xl font-bold">
                                {formatPrice(course.price)}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Bạn sẽ nhận được</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium">Thời lượng khoá học</p>
                                        <p className="text-sm text-muted-foreground">{durationText}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium">Độ khó</p>
                                        <p className="text-sm text-muted-foreground capitalize">{course.level || "Chưa xác định"}</p>
                                    </div>
                                </div>

                                {course.category && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Danh mục</p>
                                            <p className="text-sm text-muted-foreground">{course.category.name}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium">Tổng số bài học</p>
                                        <p className="text-sm text-muted-foreground">{totalLessons} bài học</p>
                                    </div>
                                </div>

                                {averageRating > 0 && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Đánh giá</p>
                                            <p className="text-sm text-muted-foreground">{averageRating.toFixed(1)}/5 ({course.numberOfStudents} đánh giá)</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="font-semibold">Khoá học bao gồm</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-sm">Truy cập trọn đời</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-sm">Học trên mọi thiết bị</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-sm">Chứng chỉ hoàn thành</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InstructorCourseDetail
