'use client'

import { Button } from '@/components/ui/button'
import CartItem from '@/components/shared/cart/CartItem'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/src/stores/useAppStore'
import { CourseItemType } from '@/src/types/course/course-item.types'
import { useEffect, useRef } from 'react'
import { formatPrice } from '@/lib/utils'
import { formatDuration } from '@/lib/format-duration'

const convertToCartItem = (course: CourseItemType) => {
  const originalPrice = course?.price ? Number(course.price) : 500000;
  const salePrice = course?.saleInfo?.salePrice ? Number(course.saleInfo.salePrice) : originalPrice;
  const hasDiscount = course?.saleInfo?.salePrice && salePrice < originalPrice;
  
  const numericId = parseInt(course.id.replace(/\D/g, '').slice(0, 10)) || Math.abs(hashCode(course.id));
  
  return {
    id: numericId,
    courseId: course.id,
    title: course.name || 'Khóa học',
    author: `By ${course.creator?.fullName || 'Giảng viên'}`,
    image: course.thumbnail || '/images/course-placeholder.jpg',
    rating: Number(course.averageRating) || course.rating || 5.0,
    ratingCount: course.numberOfStudents?.toString() || '0',
    badge: 'Khóa học',
    badgeColor: 'bg-[#eceb98] text-[#3d3c0a]',
    hours: course.totalDuration ? formatDuration(course.totalDuration, 'short') : '0h',
    lectures: `${course.chapters?.length || 0} chương`,
    level: course.level || 'Tất cả',
    price: salePrice,
    originalPrice: originalPrice,
    hasDiscount: !!hasDiscount,
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
  const { cart, removeCart, orderListCourse, addToOrderList, removeFromOrderList, setOrderList } = useAppStore()
  const hasUserInteracted = useRef(false)

  useEffect(() => {
    if (!hasUserInteracted.current && orderListCourse.length === 0 && cart.length > 0) {
      setOrderList(cart)
    }
    
    const validOrderList = orderListCourse.filter(orderItem => 
      cart.some(cartItem => cartItem.id === orderItem.id)
    )
    
    if (validOrderList.length !== orderListCourse.length) {
      setOrderList(validOrderList)
    }
  }, [cart.length])

  const handleDeleteAll = () => {
    removeCart()
    setOrderList([]) // Clear order list when cart is cleared
  }

  // Toggle selection for checkout
  const handleToggleSelect = (courseId: string) => {
    hasUserInteracted.current = true // Mark that user has interacted
    const course = cart.find(c => c.id === courseId)
    if (!course) return

    const isSelected = orderListCourse.some(c => c.id === courseId)
    if (isSelected) {
      removeFromOrderList(course)
    } else {
      addToOrderList(course)
    }
  }

  // Select all items
  const handleSelectAll = () => {
    hasUserInteracted.current = true
    setOrderList(cart)
  }

  // Deselect all items
  const handleDeselectAll = () => {
    hasUserInteracted.current = true
    setOrderList([])
  }

  // Check if course is selected
  const isSelected = (courseId: string) => {
    return orderListCourse.some(c => c.id === courseId)
  }

  // Handle checkout
  const handleCheckout = () => {
    if (orderListCourse.length === 0) {
      alert('Vui lòng chọn ít nhất một khóa học để thanh toán')
      return
    }
    router.push('/checkout')
  }

  // Calculate totals based on selected items
  const totalOriginal = orderListCourse.reduce((sum, course) => {
    const originalPrice = course?.price ? Number(course.price) : 500000;
    return sum + originalPrice;
  }, 0);
  
  const totalSale = orderListCourse.reduce((sum, course) => {
    const originalPrice = course?.price ? Number(course.price) : 500000;
    const salePrice = course?.saleInfo?.salePrice ? Number(course.saleInfo.salePrice) : originalPrice;
    return sum + salePrice;
  }, 0);

  return (
    <div className='max-w-[1300px] mx-auto px-4 py-10 min-h-[calc(100vh-200px)]'>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Giỏ hàng</h1>
        
      </div>
      
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
               <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-muted-foreground">
                  Có {cart.length} sản phẩm trong giỏ ({orderListCourse.length} đã chọn)
                </p>
                <div className="flex gap-2">
                  {cart.length > 0 && (
                    <>
                      {orderListCourse.length === cart.length ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleDeselectAll}
                        >
                          Bỏ chọn tất cả
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          Chọn tất cả
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteAll}
                      >
                        Xóa tất cả
                      </Button>
                    </>
                  )}
                </div>
              </div>
            {cart.map((course) => (
              <CartItem 
                key={course.id} 
                course={convertToCartItem(course)} 
                isSelected={isSelected(course.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
          <div className='w-1/4'>
            <h3 className='text-lg font-bold'>Tổng cộng:</h3>
            <h1 className='text-3xl font-bold'>{formatPrice(totalSale)}</h1>
            {totalSale < totalOriginal && (
              <p className='line-through text-muted-foreground'>{formatPrice(totalOriginal)}</p>
            )}
            <p className='text-xs text-muted-foreground mt-2'>({orderListCourse.length} khóa học đã chọn)</p>
            <Button 
              className='w-full mt-4' 
              onClick={handleCheckout}
              disabled={orderListCourse.length === 0}
            >
              Thanh toán ngay
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage