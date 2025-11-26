'use client'

import { ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/src/stores/useAppStore"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { formatPrice } from "@/lib/utils"

const CartPopover = () => {
  const { cart, removeFromCart } = useAppStore()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Calculate total
  const totalPrice = cart.reduce((sum, course) => {
    const originalPrice = course?.price ? Number(course.price) : 500000
    const salePrice = course?.saleInfo?.salePrice 
      ? Number(course.saleInfo.salePrice) 
      : originalPrice
    return sum + salePrice
  }, 0)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout)
      if (leaveTimeout) clearTimeout(leaveTimeout)
    }
  }, [hoverTimeout, leaveTimeout])

  const handleMouseEnter = () => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout)
      setLeaveTimeout(null)
    }

    if (isOpen) return

    if (hoverTimeout) clearTimeout(hoverTimeout)

    const timeout = setTimeout(() => {
      setIsOpen(true)
    }, 200)
    setHoverTimeout(timeout)
  }

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }

    const timeout = setTimeout(() => {
      setIsOpen(false)
    }, 300)
    setLeaveTimeout(timeout)
  }

  const handleGoToCart = () => {
    setIsOpen(false)
    router.push('/cart')
  }

  const handleRemoveItem = (courseId: string) => {
    const courseToRemove = cart.find(c => c.id === courseId)
    if (courseToRemove) {
      removeFromCart(courseToRemove)
    }
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Cart Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-foreground hover:bg-accent hover:text-accent-foreground"
        onClick={handleGoToCart}
      >
        <ShoppingCart className="h-5 w-5" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </Button>

      {/* Hover Popover */}
      {isOpen && cart.length > 0 && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-[420px] bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg z-50 overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-bold text-lg text-foreground">Giỏ hàng của bạn</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{cart.length} khóa học</p>
          </div>

          {/* Cart Items - No scroll, show all items */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {cart.slice(0, 5).map((course) => {
              const originalPrice = course?.price ? Number(course.price) : 500000
              const salePrice = course?.saleInfo?.salePrice 
                ? Number(course.saleInfo.salePrice) 
                : originalPrice
              const hasSale = salePrice < originalPrice

              return (
                <div
                  key={course.id}
                  className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    setIsOpen(false)
                    router.push(`/course-detail/${course.id}`)
                  }}
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-16 shrink-0 rounded-md overflow-hidden shadow-sm">
                      <Image
                        src={course.thumbnail || '/images/course-placeholder.jpg'}
                        alt={course.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold line-clamp-2 leading-tight mb-1.5 group-hover:text-primary transition-colors">
                        {course.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {course.creator?.fullName || 'Giảng viên'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-primary">
                          {formatPrice(salePrice)}
                        </span>
                        {hasSale && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveItem(course.id)
                      }}
                      className="shrink-0 self-start text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full p-1.5 transition-all"
                      title="Xóa khỏi giỏ"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Show more indicator if there are more than 5 items */}
          {cart.length > 5 && (
            <div className="px-5 py-3 text-center text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
              Và {cart.length - 5} khóa học khác...
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-foreground">Tổng cộng:</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button
              onClick={handleGoToCart}
              className="w-full bg-primary hover:bg-primary/90 font-semibold"
              size="default"
            >
              Xem giỏ hàng
            </Button>
          </div>
        </div>
      )}

      {/* Empty cart message on hover */}
      {isOpen && cart.length === 0 && (
        <div
          className="absolute right-0 top-full mt-2 w-[280px] bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg z-50 p-6 text-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mb-3">
            Giỏ hàng của bạn đang trống
          </p>
          <Button
            onClick={() => {
              setIsOpen(false)
              router.push('/courses')
            }}
            variant="outline"
            size="sm"
          >
            Khám phá khóa học
          </Button>
        </div>
      )}
    </div>
  )
}

export default CartPopover
