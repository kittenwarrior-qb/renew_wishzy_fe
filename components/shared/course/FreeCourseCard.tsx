import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, Clock } from "lucide-react";
import { CourseItemType } from "@/src/types/course/course-item.types";
import { useRouter } from "next/navigation";
import { formatDuration } from "@/lib/format-duration";
import { useAppStore } from "@/src/stores/useAppStore";
import { enrollmentService } from "@/src/services/enrollment";
import { useQueryHook } from "@/src/hooks/useQueryHook";

interface FreeCourseCardProps {
  course: CourseItemType;
}

const FreeCourseCard = ({ course }: FreeCourseCardProps) => {
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

  return (
    <Card 
      onClick={() => router.push(`/course-detail/${course.id}`)} 
      className="w-full h-full overflow-hidden hover:shadow-sm transition-shadow duration-300 group py-0 gap-2 shadow-none border relative cursor-pointer flex flex-col"
    >
      <div className="relative h-[200px] w-full overflow-hidden flex-shrink-0">
        <Image
          src={course?.thumbnail || '/images/course-placeholder.jpg'} 
          alt={course?.name || 'Khóa học'} 
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardContent className="px-3 pt-1 pb-2 space-y-2 flex-1 flex flex-col">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">
            {course?.name || 'Khóa học'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {course?.creator?.fullName || 'Giảng viên'}
          </p>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] flex-1">
          {course?.description || 'Khóa học chất lượng cao, hoàn toàn miễn phí'}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{course?.averageRating || course?.rating || 5.0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course?.numberOfStudents || '0'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course?.totalDuration ? formatDuration(course.totalDuration, 'short') : '0h'}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          {isEnrolled ? (
            <p className="text-[18px] font-medium text-primary-dark">
              Đã đăng ký
            </p>
          ) : (
            <p className="text-[18px] font-medium text-primary-dark">
              Miễn phí
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FreeCourseCard;
