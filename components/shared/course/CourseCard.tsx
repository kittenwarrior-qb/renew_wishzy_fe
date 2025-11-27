import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, Clock, Heart, ShoppingCart, Check } from "lucide-react";
import { CourseItemType } from "@/src/types/course/course-item.types";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/src/stores/useAppStore";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { formatDuration } from "@/lib/format-duration";
import { wishlistService } from "@/src/services/wishlist";
import { toast } from "sonner";

interface CourseCardProps {
  course: CourseItemType;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const { cart, addToCart, wishlist, addToWishlist, removeFromWishlist, addToOrderList, clearOrderList, isAuthenticated } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [popupPosition, setPopupPosition] = useState<'left' | 'right'>('right');
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isInCart = cart.some(c => c.id === course.id);
  
  const isInWishlist = wishlist.some(c => c.id === course.id);

  // Tính toán giá và giảm giá dựa trên sale_info
  const originalPrice = course?.price ? Number(course.price) : 500000;
  
  // Kiểm tra sale_info có hợp lệ và còn trong thời gian giảm giá không
  const getSaleInfo = () => {
    if (!course.saleInfo || typeof course.saleInfo !== 'object') return null;
    
    const saleInfo = course.saleInfo as any;
    if (!saleInfo.saleStartDate || !saleInfo.saleEndDate) return null;
    
    const now = new Date();
    const startDate = new Date(saleInfo.saleStartDate);
    const endDate = new Date(saleInfo.saleEndDate);
    
    // Kiểm tra xem có trong thời gian giảm giá không
    if (now < startDate || now > endDate) return null;
    
    return saleInfo;
  };

  const activeSaleInfo = getSaleInfo();
  
  // Tính giá sau giảm
  const calculateSalePrice = () => {
    if (!activeSaleInfo) return null;
    
    if (activeSaleInfo.saleType === 'percent' && activeSaleInfo.value) {
      const discount = originalPrice * (activeSaleInfo.value / 100);
      return originalPrice - discount;
    } else if (activeSaleInfo.saleType === 'fixed' && activeSaleInfo.value) {
      return Math.max(0, originalPrice - activeSaleInfo.value);
    }
    
    return null;
  };

  const salePrice = calculateSalePrice();
  const hasSale = salePrice !== null && salePrice < originalPrice;
  const displayPrice = hasSale ? salePrice : originalPrice;
  const discountPercent = activeSaleInfo?.saleType === 'percent' ? activeSaleInfo.value : 
    (hasSale && salePrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0);
  
  const handleAddToCart = () => {
    if (!isInCart) {
      addToCart(course);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearOrderList();
    addToOrderList(course);
    router.push('/checkout');
  };
  
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Kiểm tra authentication trước khi thêm vào wishlist
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm khóa học vào danh sách yêu thích');
      router.push('/login');
      return;
    }
    
    try {
      if (isInWishlist) {
        removeFromWishlist(course);
        await wishlistService.removeFromWishlist(course.id);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        addToWishlist(course);
        await wishlistService.addToWishlist(course.id);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
      // Rollback state nếu có lỗi
      if (isInWishlist) {
        addToWishlist(course);
      } else {
        removeFromWishlist(course);
      }
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
      <Card onClick={() => router.push(`/course-detail/${course.id}`)} className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300 group py-0 gap-2 shadow-none border-none relative cursor-pointer">
        {hasSale && (
          <div className="absolute top-2 right-2 z-20 text-xs bg-red-500 text-white px-2 py-1 rounded font-semibold shadow-lg">
            -{discountPercent}%
          </div>
        )}

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
              <span>{course?.totalDuration ? formatDuration(course.totalDuration, 'short') : '0h'}</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <p className={` ${displayPrice === 0 ? 'text-[18px] font-medium' : 'text-xl font-bold'} text-primary`}>
                {formatPrice(displayPrice)}
              </p>
              {hasSale && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isHovered && (
        <div 
          className={`absolute top-1/2 -translate-y-1/2 z-50 hidden lg:block w-80 bg-white dark:bg-gray-900 p-4 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 ${
            popupPosition === 'right' ? 'left-full ml-2' : 'right-full mr-2'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="space-y-3">
            <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-gray-100">
              {course?.name || 'Khóa học'}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {course?.description || 'Mô tả khóa học sẽ được cập nhật sau'}
            </p>

            {/* Category */}
            {course?.category?.name && (
              <p className="text-xs text-muted-foreground">
                Danh mục: <span className="font-medium">{course.category.name}</span>
              </p>
            )}

            {/* Creator */}
            <p className="text-xs text-muted-foreground">
              Giảng viên: <span className="font-medium">{course?.creator?.fullName || 'Chưa cập nhật'}</span>
            </p>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{course?.averageRating || course?.rating || 5.0}</span>
                {course?.reviewCount !== undefined && (
                  <span className="text-muted-foreground">({course.reviewCount})</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{course?.numberOfStudents || '0'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{course?.totalDuration ? formatDuration(course.totalDuration, 'short') : '0h'}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <p className={`${displayPrice === 0 ? 'font-medium text-[18px] ' : 'font-bold text-xl '} text-primary`}>
                {formatPrice(displayPrice)}
              </p>
              {hasSale && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </p>
              )}
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
                  onClick={handleBuyNow}
                  className="flex-1"
                  variant="outline"
                  size="sm"
                >
                  Mua ngay
                </Button>
                <Button 
                  onClick={handleToggleWishlist}
                  variant="outline"
                  size="sm"
                  className={`px-3 ${
                    isInWishlist 
                      ? 'bg-red-50 border-red-500 hover:bg-red-100 dark:bg-red-950 dark:border-red-500' 
                      : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${
                    isInWishlist 
                      ? 'fill-red-500 text-red-500' 
                      : ''
                  }`} />
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