import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { CourseItemType } from "@/src/types/course/course-item.types";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { formatDuration } from "@/lib/format-duration";
import { useAppStore } from "@/src/stores/useAppStore";
import { enrollmentService } from "@/src/services/enrollment";
import { useQueryHook } from "@/src/hooks/useQueryHook";

interface BestSellerCourseCardProps {
  course: CourseItemType;
}

const BestSellerCourseCard = ({ course }: BestSellerCourseCardProps) => {
  const router = useRouter();
  const { user } = useAppStore();

  // Check if user is enrolled in this course
  const { data: enrollments } = useQueryHook(
    ['my-enrollments'],
    () => enrollmentService.getMyLearning(),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const isEnrolled = enrollments?.some(
    (enrollment: any) => enrollment.courseId === course.id
  );

  const originalPrice = course?.price ? Number(course.price) : 500000;
  
  const now = new Date();
  const saleStartDate = course?.saleInfo?.saleStartDate ? new Date(course.saleInfo.saleStartDate) : null;
  const saleEndDate = course?.saleInfo?.saleEndDate ? new Date(course.saleInfo.saleEndDate) : null;
  const isSaleActive = saleStartDate && saleEndDate && now >= saleStartDate && now <= saleEndDate;
  
  let salePrice = originalPrice;
  if (isSaleActive && course?.saleInfo?.value) {
    if (course.saleInfo.saleType === 'PERCENT') {
      salePrice = originalPrice * (1 - course.saleInfo.value / 100);
    } else if (course.saleInfo.saleType === 'FIXED') {
      salePrice = originalPrice - course.saleInfo.value;
    }
  }
  
  const hasSale = isSaleActive && salePrice < originalPrice;
  const displayPrice = hasSale ? salePrice : originalPrice;

  return (
    <Card 
      onClick={() => router.push(`/course-detail/${course.id}`)} 
      className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer bg-muted/20"
    >
      <div className="flex flex-row gap-0">
        <div className="relative w-[380px] h-[220px] shrink-0 overflow-hidden">
          <Image
            src={course?.thumbnail || '/images/course-placeholder.jpg'} 
            alt={course?.name || 'Khóa học'} 
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <CardContent className="flex-1 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-xl line-clamp-2">
              {course?.name || 'Khóa học'}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course?.description || 'Khóa học SEO giúp bạn nắm vững thuật toán, sử dụng AI tăng tốc SEO, tối ưu hiệu thi và thu hút khách hàng tiềm năng.'}
            </p>

            <p className="text-sm font-medium">
              {course?.creator?.fullName || 'Giảng viên'}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Đã cập nhật tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</span>
              <span>•</span>
              <span>Tổng số {course?.totalDuration ? formatDuration(course.totalDuration, 'long') : '4 giờ'}</span>
              <span>•</span>
              <span>Tất cả các cấp độ</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{course?.averageRating || course?.rating || 4.8}</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({course?.numberOfStudents || 25})</span>
            </div>
          </div>

          <div className="mt-4">
            {isEnrolled ? (
              <p className="text-2xl font-bold text-primary-dark">
                Đã đăng ký
              </p>
            ) : hasSale ? (
              <div className="flex items-center gap-3">
                <p className="text-xl font-medium text-primary-dark">
                  {formatPrice(displayPrice)}
                </p>
                <p className="text-lg text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </p>
              </div>
            ) : (
              <p className="text-xl font-medium text-primary-dark">
                {displayPrice === 0 ? 'Miễn phí' : formatPrice(displayPrice)}
              </p>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default BestSellerCourseCard;
