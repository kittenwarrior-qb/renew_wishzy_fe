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
    const salePrice = Math.floor(originalPrice * 0.7)
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
        className="relative text-foreground"
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
          className="absolute right-0 top-full mt-2 w-[380px] bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg z-50 overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg">Giỏ hàng ({cart.length})</h3>
          </div>

          {/* Cart Items - Scrollable with thin scrollbar */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
            {cart.map((course) => {
              const originalPrice = course?.price ? Number(course.price) : 500000
              const salePrice = Math.floor(originalPrice * 0.7)

              return (
                <div
                  key={course.id}
                  className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-14 shrink-0 rounded overflow-hidden">
                      <Image
                        src={course.thumbnail || '/images/course-placeholder.jpg'}
                        alt={course.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold line-clamp-2 leading-tight">
                        {course.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {course.creator?.fullName || 'Giảng viên'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-primary">
                          {formatPrice(salePrice)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveItem(course.id)
                      }}
                      className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Xóa khỏi giỏ"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Tổng cộng:</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button
              onClick={handleGoToCart}
              className="w-full bg-primary hover:bg-primary/90"
              size="sm"
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
