'use client'

import { Button } from '@/components/ui/button'
import CartItem from '@/components/shared/cart/CartItem'
import { useRouter } from 'next/navigation'

// Sample cart data - you can replace with real data from your store/API
const cartItems = [
  {
    id: 1,
    title: 'The Complete Full-Stack Web Development Bootcamp',
    author: 'By Dr. Angela Yu, Developer and Lead Instructor',
    image: 'https://cdn.tokyotechlab.com/Blog/Blog%202024/Blog%20T11/training_course_la_gi_467fe41815.png',
    rating: 4.7,
    ratingCount: '450,657',
    badge: 'Bestseller',
    badgeColor: 'bg-[#eceb98] text-[#3d3c0a]',
    hours: '61.5 total hours',
    lectures: '374 lectures',
    level: 'All Levels',
    price: 309000,
    originalPrice: 1709000,
  },
]

const wishlistItems = [
  {
    id: 2,
    title: 'React & TypeScript - The Practical Guide',
    author: 'By Academind by Maximilian Schwarzmüller and 1 other',
    image: 'https://picsum.photos/seed/course2/240/135',
    rating: 4.7,
    ratingCount: '3,059',
    badge: 'Highest Rated',
    badgeColor: 'bg-[#eceb98] text-[#3d3c0a]',
    hours: '7.5 total hours',
    lectures: '102 lectures',
    level: 'Intermediate',
    price: 319000,
    originalPrice: 1609000,
  },
]

const recommendedCourses = [
  { id: 3, image: 'https://picsum.photos/seed/rec1/300/170' },
  { id: 4, image: 'https://picsum.photos/seed/rec2/300/170' },
  { id: 5, image: 'https://picsum.photos/seed/rec3/300/170' },
  { id: 6, image: 'https://picsum.photos/seed/rec4/300/170' },
  { id: 7, image: 'https://picsum.photos/seed/rec5/300/170' },
]

const CartPage = () => {
  const router = useRouter()

  return (
    <div className='container mx-auto py-10'>
      <h1 className="text-3xl font-bold mb-4">Giỏ hàng</h1>
      <p className="text-sm text-muted-foreground mb-3">Có 2 sản phẩm trong giỏ</p>
      
      <div className='flex gap-10'>
        <div className='w-3/4'>
          <CartItem course={cartItems[0]} />
          <CartItem course={cartItems[0]} />
          <CartItem course={cartItems[0]} />
          <CartItem course={cartItems[0]} />
          <CartItem course={cartItems[0]} />
        </div>
        <div className='w-1/4'>
          <h3 className='text-lg font-bold'>Tổng cộng:</h3>
          <h1 className='text-3xl font-bold'>500.000 ₫</h1>
          <p className='line-through text-muted-foreground'>1.700.000 ₫</p>
          <Button className='w-full mt-4' onClick={() => router.push('/checkout')}>Thanh toán ngay</Button>
          <hr className='mt-4' />
          <Button variant={'outline'} className='w-full mt-4'>Voucher giảm giá</Button>
        </div>
      </div>
    </div>
  )


}

export default CartPage