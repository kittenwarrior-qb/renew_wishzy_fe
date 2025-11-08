import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, Clock, Heart, ShoppingCart, Check } from "lucide-react";
import { CourseItemType } from "@/src/types/course/course-item.types";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/src/stores/useAppStore";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface CourseCardProps {
  course: CourseItemType;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const { cart, addToCart } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [popupPosition, setPopupPosition] = useState<'left' | 'right'>('right');
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check if course is already in cart
  const isInCart = cart.some(c => c.id === course.id);

  // Calculate sale price (placeholder logic)
  const originalPrice = course?.price ? Number(course.price) : 500000;
  const salePrice = Math.floor(originalPrice * 0.7); // 30% discount
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (!isInCart) {
      addToCart(course);
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
        setPopupPosition('left');
      } else {
        setPopupPosition('right');
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      calculatePopupPosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      if (leaveTimeout) clearTimeout(leaveTimeout);
    };
  }, [hoverTimeout, leaveTimeout]);

  const handleMouseEnter = () => {
    // Clear any pending leave timeout
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      setLeaveTimeout(null);
    }

    // If already hovered, don't set another timeout
    if (isHovered) {
      return;
    }

    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    calculatePopupPosition();

    const timeout = setTimeout(() => {
      setIsHovered(true);
    }, 200);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    // Add delay before closing to allow mouse to reach modal
    const timeout = setTimeout(() => {
      setIsHovered(false);
    }, 300);
    setLeaveTimeout(timeout);
  };

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card onClick={() => router.push(`/course-detail/${course.id}`)} className="max-w-[350px] overflow-hidden hover:shadow-lg transition-shadow duration-300 group py-0 gap-2 shadow-none border-none relative">
        {/* Discount Badge */}
        <div className="absolute top-2 right-2 z-20 text-xs bg-red-500 text-white px-2 py-1 rounded font-semibold shadow-lg">
          -30%
        </div>

        <div className="relative h-[200px] w-full overflow-hidden">
          <Image
            src={course?.thumbnail || '/images/course-placeholder.jpg'} 
            alt={course?.name || 'Khóa học'} 
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <CardContent className="px-3 pt-1 pb-2 space-y-2">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {course?.name || 'Khóa học'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {course?.creator?.fullName || 'Giảng viên'}
            </p>
          </div>

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
              <span>{course?.totalDuration ? `${Math.floor(course.totalDuration / 60)}h` : '0h'}</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-primary">
                {formatPrice(salePrice)}
              </p>
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hover Modal */}
      {isHovered && (
        <div 
          className={`absolute top-1/2 -translate-y-1/2 z-50 hidden lg:block w-80 bg-white dark:bg-gray-900 p-4 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${
            popupPosition === 'right' ? 'left-full ml-2' : 'right-full mr-2'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="space-y-3">
            {/* Course Image */}
            <div className="relative h-[120px] w-full overflow-hidden rounded">
              <Image
                src={course?.thumbnail || '/images/course-placeholder.jpg'} 
                alt={course?.name || 'Khóa học'} 
                fill
                className="object-cover"
              />
            </div>

            {/* Full Course Name */}
            <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-gray-100">
              {course?.name || 'Khóa học'}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course?.description || 'Mô tả khóa học sẽ được cập nhật sau'}
            </p>

            {/* Creator */}
            <p className="text-xs text-muted-foreground">
              Giảng viên: <span className="font-medium">{course?.creator?.fullName || 'Chưa cập nhật'}</span>
            </p>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{course?.averageRating || course?.rating || 5.0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{course?.numberOfStudents || '0'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{course?.totalDuration ? `${Math.floor(course.totalDuration / 60)}h` : '0h'}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-primary">
                {formatPrice(salePrice)}
              </p>
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                onClick={handleAddToCart}
                className={`w-full ${isInCart ? 'bg-green-600 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}
                size="sm"
                disabled={isInCart}
              >
                {isInCart ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Đã thêm vào giỏ
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Thêm vào giỏ
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  variant="outline"
                  size="sm"
                >
                  Mua ngay
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;