'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/src/stores/useAppStore"
import Image, { StaticImageData } from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { CourseItemType } from "@/src/types/course/course-item.types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useApiPost } from "@/src/hooks/useApi"
import { CreateOrderRequest, CreateOrderResponse } from "@/src/types/order.types"
import { toast } from "sonner"
import momoLogo from '@/public/images/momo.png'
import vnpayLogo from '@/public/images/vnpay.jpg'
import zalopayLogo from '@/public/images/zalopay.png'
import { formatPrice } from '@/lib/utils'

const CheckoutPage = () => {
  const { user, orderListCourse } = useAppStore()
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'zalopay' | 'momo' | 'banking'>('vnpay')

  // Payment mutation
  const createOrderMutation = useApiPost<CreateOrderResponse, CreateOrderRequest>('/orders', {
    onSuccess: (response) => {
      if (response.data?.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = response.data.paymentUrl
      } else {
        toast.success(response.message || 'Đặt hàng thành công!')
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thanh toán')
    },
  })

  // Calculate totals
  const totalOriginal = orderListCourse.reduce((sum, course) => {
    const originalPrice = course?.price ? Number(course.price) : 500000
    return sum + originalPrice
  }, 0)
  
  const totalSale = orderListCourse.reduce((sum, course) => {
    const originalPrice = course?.price ? Number(course.price) : 500000
    const salePrice = Math.floor(originalPrice * 0.7)
    return sum + salePrice
  }, 0)

  const discount = totalOriginal - totalSale

  const handlePayment = () => {
    if (orderListCourse.length === 0) {
      toast.error('Vui lòng chọn ít nhất một khóa học')
      return
    }

    const orderItems = orderListCourse.map(course => ({
      courseId: course.id,
      price: course?.price ? Math.floor(Number(course.price) * 0.7) : 350000
    }))

    const orderData: CreateOrderRequest = {
      totalPrice: totalSale,
      paymentMethod,
      orderItems,
    }

    createOrderMutation.mutate(orderData)
  }

  return (
    <div className="max-w-[1000px] mx-auto  py-5">
      <h1 className="text-3xl font-bold mb-5">Thanh toán</h1>
      <div className="flex gap-20">
        {/* Left item */}
        <div className="w-2/3 space-y-5">
          {/* Phương thức thanh toán */}
          <Card className="p-0 border-0 border-b border-b-gray-200 shadow-none rounded-none bg-transparent pb-8">
            <CardContent className="px-0">
              <h2 className="text-2xl font-bold mb-4">Phương thức thanh toán</h2>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'vnpay' | 'zalopay' | 'momo' | 'banking')} className="space-y-0">
                <PaymentMethodItem 
                  value="vnpay"
                  id="vnpay"
                  label="VNPay"
                  description="Thanh toán qua VNPay"
                  logo={vnpayLogo}
                />
                
                <PaymentMethodItem 
                  value="zalopay"
                  id="zalopay"
                  label="ZaloPay"
                  description="Thanh toán qua ZaloPay"
                  logo={zalopayLogo}
                />

                <PaymentMethodItem 
                  value="momo"
                  id="momo"
                  label="MoMo"
                  description="Thanh toán qua ví MoMo"
                  logo={momoLogo}
                />

                <PaymentMethodItem 
                  value="banking"
                  id="banking"
                  label="Chuyển khoản ngân hàng"
                  description="Chuyển khoản qua Internet Banking"
                  emoji="🏦"
                />
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Các khóa học đã chọn */}
          <Card className="p-0 border-none shadow-none bg-transparent">
            <CardContent className="px-0">
              <h2 className="text-xl font-bold mb-4">Khóa học đã chọn ({orderListCourse.length})</h2>
              <div className="space-y-3">
                {orderListCourse.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Chưa có khóa học nào được chọn</p>
                ) : (
                  orderListCourse.map((course) => {
                    const originalPrice = course?.price ? Number(course.price) : 500000
                    const salePrice = Math.floor(originalPrice * 0.7)
                    
                    return (
                      <CheckoutCourseItem key={course.id} course={course} />
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right item */}
        <div className="w-1/3 space-y-2">
          <h1 className="text-2xl font-bold mb-4">Tổng hợp đơn hàng</h1>
          <div className="flex items-center justify-between">
            <span>Giá gốc:</span>
            <span>{formatPrice(totalOriginal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Giảm giá (30%):</span>
            <span className="text-red-500">-{formatPrice(discount)}</span>
          </div>
          <hr className="my-2"/>
          <div className="flex items-center justify-between font-bold text-lg">
            <span>Tổng cộng:</span>
            <span className="text-primary">{formatPrice(totalSale)}</span>
          </div>
          <Button 
            className="w-full mt-3 py-5"
            disabled={orderListCourse.length === 0 || createOrderMutation.isPending}
            onClick={handlePayment}
          >
            {createOrderMutation.isPending ? 'Đang xử lý...' : `Thanh toán ngay ${formatPrice(totalSale)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}

const CheckoutCourseItem = ({course}: {course: CourseItemType}) => {
  const originalPrice = course?.price ? Number(course.price) : 500000
  const salePrice = Math.floor(originalPrice * 0.7)
  
  return (
    <div key={course.id} className="flex gap-3 pb-3 border-b last:border-b-0">
      <div className="relative w-24 h-16 shrink-0 rounded overflow-hidden">
        <Image
          src={course.thumbnail || '/images/course-placeholder.jpg'}
          alt={course.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm line-clamp-2">{course.name}</h3>
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
    </div>
  )
}

interface PaymentMethodItemProps {
  value: string
  id: string
  label: string
  description: string
  logo?: string | StaticImageData
  emoji?: string
}

const PaymentMethodItem = ({ value, id, label, description, logo, emoji }: PaymentMethodItemProps) => {
  return (
    <div className="flex items-center space-x-3 px-3 py-5 border rounded-lg hover:bg-accent cursor-pointer">
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id} className="flex items-center gap-3 cursor-pointer flex-1">
        <div className="w-12 h-8 relative flex items-center justify-center">
          {logo ? (
            <Image src={logo} alt={label} fill className="object-contain" />
          ) : emoji ? (
            <span className="text-2xl">{emoji}</span>
          ) : null}
        </div>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </Label>
    </div>
  )
}

export default CheckoutPage