'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"
import { useAppStore } from "@/src/stores/useAppStore"

interface CartItemProps {
  course: {
    id: number
    courseId: string // Original string ID from CourseItemType
    title: string
    author: string
    image: string
    rating: number
    ratingCount: string
    badge: string
    badgeColor: string
    hours: string
    lectures: string
    level: string
    price: number
    originalPrice: number
  }
}

const CartItem = ({ course }: CartItemProps) => {
  const { cart, removeFromCart } = useAppStore()
  
  const formatPrice = (price: number) => {
    return `₫${price.toLocaleString('vi-VN')}`
  }
  
  const handleRemoveFromCart = () => {
    // Find the course in cart by the original string courseId
    const courseToRemove = cart.find(c => c.id === course.courseId)
    if (courseToRemove) {
      removeFromCart(courseToRemove)
    }
  }

  return (
    <Card className="max-w-[950px] p-0 border-0 border-t-[0.5px] border-t-[#e5e7eb] shadow-none rounded-none">
      <CardContent className="py-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Left - Image & Course Info */}
          <div className="flex flex-1 gap-4">
            {/* Course Image */}
            <div className="h-[90px] w-[160px] shrink-0 overflow-hidden rounded-md">
              <Image 
                src={course.image} 
                alt={course.title} 
                width={240} 
                height={135}
                className="size-full object-cover"
              />
            </div>
            
            {/* Course Information */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {/* Title */}
              <h3 className="line-clamp-2 text-base font-semibold leading-tight">
                {course.title}
              </h3>
              
              {/* Author */}
              <p className="text-xs text-muted-foreground">
                {course.author}
              </p>
              
              {/* Badge & Rating */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded px-2 py-0.5 font-bold ${course.badgeColor}`}>
                  {course.badge}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-orange-700">{course.rating}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className="size-3 fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    ({course.ratingCount} ratings)
                  </span>
                </div>
              </div>
              
              {/* Course Meta */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{course.hours}</span>
                <span>•</span>
                <span>{course.lectures}</span>
                <span>•</span>
                <span>{course.level}</span>
              </div>
              
              {/* Actions */}
              <div className="mt-auto flex flex-wrap items-center gap-3 text-sm">
                <button 
                  onClick={handleRemoveFromCart}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  Xoá khỏi giỏ hàng
                </button>
                <button className="font-semibold text-foreground hover:text-primary">
                  Đưa vào danh sách yêu thích
                </button>
              </div>
            </div>
          </div>
          
          {/* Right - Price */}
          <div className="flex shrink-0 flex-col items-end justify-between gap-2 sm:w-auto">
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">
                {formatPrice(course.price)}
              </div>
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(course.originalPrice)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CartItem