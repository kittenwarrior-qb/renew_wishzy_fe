'use client'

import { Button } from '@/components/ui/button'
import CartItem from '@/components/shared/cart/CartItem'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/src/stores/useAppStore'
import { CourseItemType } from '@/src/types/course/course-item.types'

const convertToCartItem = (course: CourseItemType) => {
  const originalPrice = course?.price ? Number(course.price) : 500000;
  const salePrice = Math.floor(originalPrice * 0.7); // 30% discount
  
  const numericId = parseInt(course.id.replace(/\D/g, '').slice(0, 10)) || Math.abs(hashCode(course.id));
  
  return {
    id: numericId,
    courseId: course.id,
    title: course.name || 'Khóa học',
    author: `By ${course.creator?.fullName || 'Giảng viên'}`,
    image: course.thumbnail || '/images/course-placeholder.jpg',
    rating: Number(course.averageRating) || course.rating || 5.0,
    ratingCount: course.numberOfStudents?.toLocaleString() || '0',
    badge: 'Khóa học',
    badgeColor: 'bg-[#eceb98] text-[#3d3c0a]',
    hours: course.totalDuration ? `${Math.floor(course.totalDuration / 60)}h` : '0h',
    lectures: `${course.chapters?.length || 0} chương`,
    level: course.level || 'Tất cả',
    price: salePrice,
    originalPrice: originalPrice,
  };
};

// Simple hash function for string IDs
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const CartPage = () => {
  const router = useRouter()
  const { cart } = useAppStore()

  // Calculate totals
  const totalOriginal = cart.reduce((sum, course) => {
    const originalPrice = course?.price ? Number(course.price) : 500000;
    return sum + originalPrice;
  }, 0);
  
  const totalSale = cart.reduce((sum, course) => {
    const originalPrice = course?.price ? Number(course.price) : 500000;
    const salePrice = Math.floor(originalPrice * 0.7);
    return sum + salePrice;
  }, 0);

  return (
    <div className='container mx-auto py-10'>
      <h1 className="text-3xl font-bold mb-4">Giỏ hàng</h1>
      <p className="text-sm text-muted-foreground mb-3">
        Có {cart.length} sản phẩm trong giỏ
      </p>
      
      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">Giỏ hàng của bạn đang trống</p>
          <Button className="mt-4" onClick={() => router.push('/courses')}>
            Tiếp tục mua sắm
          </Button>
        </div>
      ) : (
        <div className='flex gap-10'>
          <div className='w-3/4'>
            {cart.map((course) => (
              <CartItem key={course.id} course={convertToCartItem(course)} />
            ))}
          </div>
          <div className='w-1/4'>
            <h3 className='text-lg font-bold'>Tổng cộng:</h3>
            <h1 className='text-3xl font-bold'>{totalSale.toLocaleString()} ₫</h1>
            <p className='line-through text-muted-foreground'>{totalOriginal.toLocaleString()} ₫</p>
            <Button className='w-full mt-4' onClick={() => router.push('/checkout')}>
              Thanh toán ngay
            </Button>
            <hr className='mt-4' />
            <Button variant={'outline'} className='w-full mt-4'>Voucher giảm giá</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage