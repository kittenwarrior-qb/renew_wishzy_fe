'use client'

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryHook } from "@/src/hooks/useQueryHook";
import { courseService } from "@/src/services/course";
import { CourseItemType } from "@/src/types/course/course-item.types";
import { formatPrice } from "@/lib/utils";
import { formatDuration } from "@/lib/format-duration";
import { Button } from "@/components/ui/button";
import { chapterService } from "@/src/services/chapter";
import { CourseChapter } from "@/components/shared/course/CourseChapter";
import { ChapterType } from "@/src/types/chapter/chapter.types";
import CourseCreator from "@/components/shared/course/CourseCreator";
import CourseComment from "@/components/shared/course/CourseComment";
import CourseCard from "@/components/shared/course/CourseCard";
import { useAppStore } from "@/src/stores/useAppStore";
import { enrollmentService } from "@/src/services/enrollment";
import { wishlistService } from "@/src/services/wishlist";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { CourseDetailBreadcrumb } from "@/components/shared/course/CourseDetailBreadcrumb";

const CourseDetail = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const { 
        addToCart, 
        cart, 
        addToOrderList, 
        clearOrderList, 
        user,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isAuthenticated
    } = useAppStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    const { data: course } = useQueryHook<CourseItemType>(
        ['course', id],
        () => courseService.getCourseById(id)
    );

    const { data: chapters } = useQueryHook<{ items: ChapterType[]}>(
        ['chapter', id],
        () => chapterService.getChapterByCourseId(id)
    );

    const { data: enrollments } = useQueryHook(
        ['my-enrollments'],
        () => enrollmentService.getMyLearning(true),
        {
            enabled: !!user,
            staleTime: 0,
            cacheTime: 0,
        }
    );

    // Fetch related courses by category
    const { data: relatedCoursesData } = useQueryHook<{ data: { items: CourseItemType[] } }>(
        ['related-courses', course?.categoryId ?? ''],
        () => courseService.list({ 
            categoryId: course?.categoryId, 
            limit: 7, // Get 7 to exclude current course and have 6 remaining
            status: true
        }),
        {
            enabled: !!course?.categoryId,
        }
    );

    // Filter out current course from related courses
    const relatedCourses = (relatedCoursesData?.data?.items || [])
        .filter((c: CourseItemType) => c.id !== id)
        .slice(0, 6);

    // Check wishlist from Zustand store (same as CourseCard)
    const isInWishlist = wishlist.some((c) => c.id === id);

    const currentEnrollment = enrollments?.find(
        (enrollment: any) => enrollment.courseId === id
    );
    
    const isEnrolled = !!currentEnrollment;
    const progress = currentEnrollment ? Number(currentEnrollment.progress) || 0 : 0;

    const handleToggleWishlist = async () => {
        if (!isAuthenticated || !user) {
            toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
            router.push('/auth/login');
            return;
        }

        if (!course) return;

        setIsWishlistLoading(true);
        try {
            if (isInWishlist) {
                await wishlistService.removeFromWishlist(id);
                removeFromWishlist(course);
                toast.success('Đã xóa khỏi danh sách yêu thích');
            } else {
                await wishlistService.addToWishlist(id);
                addToWishlist(course);
                toast.success('Đã thêm vào danh sách yêu thích ❤️');
            }
        } catch (error: any) {
            console.error('Failed to toggle wishlist:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    useEffect(() => {
        if (searchParams.get('scrollTo') === 'feedback') {
            setTimeout(() => {
                const feedbackElement = document.getElementById('feedback');
                if (feedbackElement) {
                    feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        }
    }, [searchParams]);

    console.log(course);

    if (!course) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>
    }

    const totalLessons = course.chapters?.length || 0;
    const durationText = formatDuration(course.totalDuration, 'long');
    
    const originalPrice = course?.price ? Number(course.price) : 0;
    
    // Calculate sale price from saleInfo
    let salePrice = null;
    let discountPercent = 0;
    
    if (course.saleInfo) {
        const now = new Date();
        const saleStart = course.saleInfo.saleStartDate ? new Date(course.saleInfo.saleStartDate) : null;
        const saleEnd = course.saleInfo.saleEndDate ? new Date(course.saleInfo.saleEndDate) : null;
        
        const isWithinSalePeriod = (!saleStart || now >= saleStart) && (!saleEnd || now <= saleEnd);
        
        if (isWithinSalePeriod && course.saleInfo.value) {
            if (course.saleInfo.saleType === 'percent') {
                discountPercent = course.saleInfo.value;
                salePrice = originalPrice * (1 - course.saleInfo.value / 100);
            } else if (course.saleInfo.saleType === 'fixed') {
                salePrice = originalPrice - course.saleInfo.value;
                discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
            }
        }
    }
    
    const hasSale = salePrice !== null && salePrice > 0 && salePrice < originalPrice;
    const displayPrice = hasSale ? salePrice : originalPrice;
    
    const isInCart = cart.some(c => c.id === course.id);
    const isFree = displayPrice === 0;

    const handleBuyCourse = async () => {
        if (isEnrolled) {
            router.push(`/learning/${id}`);
        } else if (isFree) {
            // Khóa học miễn phí - enroll trực tiếp
            if (!user) {
                router.push('/auth/login');
                return;
            }
            
            setIsEnrolling(true);
            try {
                await enrollmentService.enrollFreeCourse(id);
                toast.success('Đăng ký khóa học thành công! Chúc bạn học tập vui vẻ 🎉');
                // Redirect to profile page
                setTimeout(() => {
                    router.push('/profile');
                }, 1000);
            } catch (error: any) {
                console.error('Failed to enroll:', error);
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký khóa học');
                setIsEnrolling(false);
            }
        } else {
            // Khóa học có phí - qua checkout
            clearOrderList();
            addToOrderList(course);
            router.push('/checkout');
        }
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-[1300px] mx-auto px-4 py-8">
                <CourseDetailBreadcrumb 
                    category={course.category}
                    courseName={course.name}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="w-full aspect-video rounded-lg overflow-hidden">
                            <img 
                                src={course.thumbnail} 
                                alt={course.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Course Title */}
                        <h1 className="text-xl md:text-2xl font-bold">
                            {course.name}
                        </h1>

                        {/* Course Description */}
                        <div className="border-b pb-6">
                            <h1 className="py-0 text-lg mb-2 font-semibold">Mô tả khoá học</h1>
                            <p className="leading-relaxed">
                                {course.description}
                            </p>
                        </div>

                        {/* Chapter */}
                        <div>
                            <h1 className="py-0 text-lg font-semibold">Nội dung khoá học</h1>
                            <CourseChapter chapters={chapters?.items ?? []} />
                        </div>

                        {/* Creator */}
                        <div className="border-b pb-6">
                            <h1 className="py-0 text-lg font-semibold">Thông tin giảng viên</h1>
                            <CourseCreator creator={course.creator} />
                        </div>

                        {/* Course Feedback */}
                        <div id="feedback" className="border-b pb-6">
                            <CourseComment courseId={id} isEnrolled={isEnrolled} progress={progress} />
                        </div>

                        {/* Course related */}
                        {relatedCourses.length > 0 && (
                            <div>
                                <h1 className="py-0 text-lg font-semibold mb-4">Khoá học liên quan</h1>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {relatedCourses.map((relatedCourse: CourseItemType) => (
                                        <CourseCard key={relatedCourse.id} course={relatedCourse} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right - Pricing Card */}
                    <div className="lg:col-span-1">
                        <div className="border rounded-lg p-6 sticky top-8 space-y-6">
                            {/* Price */}
                            <div className="border-b pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-lg font-semibold">
                                        {hasSale ? 'Giá ưu đãi' : 'Giá khóa học'}
                                    </span>
                                    {hasSale && (
                                        <span className="text-sm bg-red-500 text-white px-2 py-1 rounded font-semibold">
                                            -{discountPercent}%
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-primary">
                                        {formatPrice(displayPrice || '')}
                                    </span>
                                    {hasSale && (
                                        <span className="text-xl text-muted-foreground line-through">
                                            {formatPrice(originalPrice)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* What you'll get */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Những gì bạn sẽ nhận được:</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Thời lượng khoá học</p>
                                            <p className="text-sm">{durationText}</p>
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
                                            <p className="text-sm">{course.level}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Danh mục khoá học</p>
                                            <p className="text-sm">{course.category?.name || 'Development'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Tổng bài học</p>
                                            <p className="text-sm">{totalLessons} bài học</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* This course includes */}
                            <div className="space-y-3 pt-4 border-t">
                                <h3 className="font-semibold">Khoá học bao gồm:</h3>
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
                                        <span className="text-sm">Có thể học trên mọi thiết bị</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm">Cấp chứng chỉ cuối khóa</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!isEnrolled && !isFree && (
                                <div className="flex gap-2 mb-3">
                                    <Button
                                        variant={isInCart ? 'secondary' : 'outline'}
                                        className="flex-1"
                                        onClick={() => addToCart(course)}
                                        disabled={isInCart}
                                    >
                                        {isInCart ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleToggleWishlist}
                                        disabled={isWishlistLoading}
                                        className={isInWishlist ? 'text-red-500 border-red-500' : ''}
                                    >
                                        <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                                    </Button>
                                </div>
                            )}
                            <Button 
                                className={`w-full transition-all hover:bg-primary/90 hover:scale-105 `}
                                onClick={handleBuyCourse}
                                disabled={isEnrolling}
                            >
                                {isEnrolling 
                                    ? 'Đang đăng ký...'
                                    : isEnrolled 
                                        ? progress > 0 
                                            ? `Tiếp tục học (${progress.toFixed(0)}%)` 
                                            : 'Bắt đầu học'
                                        : isFree
                                            ? 'Đăng ký học miễn phí'
                                            : 'Mua khóa học ngay'
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CourseDetail