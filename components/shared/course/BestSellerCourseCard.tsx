import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, Clock, Heart, ShoppingCart, Check, Play } from "lucide-react";
import { CourseItemType } from "@/src/types/course/course-item.types";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { formatDuration } from "@/lib/format-duration";
import { useAppStore } from "@/src/stores/useAppStore";
import { enrollmentService } from "@/src/services/enrollment";
import { wishlistService } from "@/src/services/wishlist";
import { useQueryHook } from "@/src/hooks/useQueryHook";
import { toast } from "sonner";

interface BestSellerCourseCardProps {
  course: CourseItemType;
}

const BestSellerCourseCard = ({ course }: BestSellerCourseCardProps) => {
  const router = useRouter();
  const {
    cart,
    addToCart,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    addToOrderList,
    clearOrderList,
    isAuthenticated,
    user,
  } = useAppStore();

  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [popupPosition, setPopupPosition] = useState<"left" | "right">("right");
  const cardRef = useRef<HTMLDivElement>(null);

  // Check if user is enrolled in this course
  const { data: enrollments } = useQueryHook(
    ['my-enrollments'],
    () => enrollmentService.getMyLearning(),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000,
    }
  );

  const currentEnrollment = enrollments?.find(
    (enrollment: any) => enrollment.courseId === course.id
  );
  const isEnrolled = !!currentEnrollment;
  const progress = currentEnrollment ? Number(currentEnrollment.progress) || 0 : 0;

  const isInCart = cart.some((c) => c.id === course.id);
  const isInWishlist = wishlist.some((c) => c.id === course.id);

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInCart) {
      addToCart(course);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isEnrolled) {
      router.push(`/learning/${course.id}`);
      return;
    }
    
    const isFree = displayPrice === 0;
    
    if (isFree) {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để đăng ký khóa học");
        router.push("/login");
        return;
      }
      
      try {
        await enrollmentService.enrollFreeCourse(course.id);
        toast.success("Đăng ký khóa học thành công!");
        router.push('/profile');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      }
    } else {
      clearOrderList();
      addToOrderList(course);
      router.push("/checkout");
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      router.push("/login");
      return;
    }

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(course.id);
        removeFromWishlist(course);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await wishlistService.addToWishlist(course.id);
        addToWishlist(course);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const calculatePopupPosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const popupWidth = 320;
      const viewportPadding = 16;
      const spaceRight = window.innerWidth - rect.right - viewportPadding;
      const spaceLeft = rect.left - viewportPadding;

      if (spaceRight < popupWidth && spaceLeft >= popupWidth) {
        setPopupPosition("left");
      } else {
        setPopupPosition("right");
      }
    }
  };

  useEffect(() => {
    const handleResize = () => calculatePopupPosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      if (leaveTimeout) clearTimeout(leaveTimeout);
    };
  }, [hoverTimeout, leaveTimeout]);

  const handleMouseEnter = () => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      setLeaveTimeout(null);
    }
    if (isHovered) return;
    if (hoverTimeout) clearTimeout(hoverTimeout);

    calculatePopupPosition();
    const timeout = setTimeout(() => setIsHovered(true), 200);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    const timeout = setTimeout(() => setIsHovered(false), 300);
    setLeaveTimeout(timeout);
  };

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
                {course?.description || 'Mô tả khóa học'}
              </p>

              <p className="text-sm font-medium">
                {course?.creator?.fullName || 'Giảng viên'}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                <p className="text-2xl font-bold text-primary-dark">Đã đăng ký</p>
              ) : hasSale ? (
                <div className="flex items-center gap-3">
                  <p className="text-xl font-medium text-primary-dark">{formatPrice(displayPrice)}</p>
                  <p className="text-lg text-muted-foreground line-through">{formatPrice(originalPrice)}</p>
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

      {/* Hover Popup */}
      {isHovered && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-50 hidden lg:block w-80 bg-white dark:bg-gray-900 p-4 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 ${
            popupPosition === "right" ? "left-full ml-2" : "right-full mr-2"
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="space-y-3">
            <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-gray-100">
              {course?.name || "Khóa học"}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {course?.description || "Mô tả khóa học"}
            </p>

            {course?.category?.name && (
              <p className="text-xs text-muted-foreground">
                Danh mục: <span className="font-medium">{course.category.name}</span>
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Giảng viên: <span className="font-medium">{course?.creator?.fullName || "Chưa cập nhật"}</span>
            </p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{course?.averageRating || course?.rating || 5.0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{course?.numberOfStudents || "0"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{course?.totalDuration ? formatDuration(course.totalDuration, "short") : "0h"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEnrolled ? (
                <p className="font-medium text-[18px] text-primary-dark">Đã đăng ký</p>
              ) : (
                <>
                  <p className={`${displayPrice === 0 ? "font-medium text-[18px]" : "font-bold text-xl"} text-primary-dark`}>
                    {displayPrice === 0 ? 'Miễn phí' : formatPrice(displayPrice)}
                  </p>
                  {hasSale && (
                    <p className="text-xs text-muted-foreground line-through">{formatPrice(originalPrice)}</p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              {isEnrolled ? (
                <Button onClick={handleBuyNow} className="w-full bg-primary hover:bg-primary/90" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  {progress > 0 ? `Tiếp tục học (${progress.toFixed(0)}%)` : 'Học ngay'}
                </Button>
              ) : displayPrice === 0 ? (
                <Button onClick={handleBuyNow} className="w-full bg-primary hover:bg-primary/90" size="sm">
                  Đăng ký học miễn phí
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleAddToCart}
                    className={`w-full ${isInCart ? "bg-green-600 hover:bg-green-600" : "bg-primary hover:bg-primary/90"}`}
                    size="sm"
                    disabled={isInCart}
                  >
                    {isInCart ? (
                      <><Check className="w-4 h-4 mr-2" />Đã thêm vào giỏ</>
                    ) : (
                      <><ShoppingCart className="w-4 h-4 mr-2" />Thêm vào giỏ</>
                    )}
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={handleBuyNow} className="flex-1" variant="outline" size="sm">
                      Mua ngay
                    </Button>
                    <Button
                      onClick={handleToggleWishlist}
                      variant="outline"
                      size="sm"
                      className={`px-3 ${isInWishlist ? "bg-red-50 border-red-500 hover:bg-red-100 dark:bg-red-950 dark:border-red-500" : ""}`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BestSellerCourseCard;
