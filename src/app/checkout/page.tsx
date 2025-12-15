'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/src/stores/useAppStore"
import Image, { StaticImageData } from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { CourseItemType } from "@/src/types/course/course-item.types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useApiPost } from "@/src/hooks/useApi"
import { CreateOrderRequest, CreateOrderResponse } from "@/src/types/order.types"
import { toast } from "sonner"
import momoLogo from '@/public/images/momo.png'
import vnpayLogo from '@/public/images/vnpay.jpg'
import zalopayLogo from '@/public/images/zalopay.png'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { voucherService, Voucher } from "@/src/services/voucher"
import { TicketPercent, X, Loader2 } from "lucide-react"

const CheckoutPage = () => {
  const { user, orderListCourse } = useAppStore()
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'zalopay' | 'momo' | 'banking'>('vnpay')
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null)
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiếp tục')
      router.push('/auth/login')
    }
  }, [user, router])

  const createOrderMutation = useApiPost<any, CreateOrderRequest>('/orders', {
    onSuccess: (response: any) => {
      console.log('=== ORDER RESPONSE ===', response)
      
      if (response.data?.paymentUrl) {
        // Paid course - redirect to payment gateway
        window.location.href = response.data.paymentUrl
      } else {
        // Free course - redirect to success page with orderId
        toast.success(response.message || 'Đăng ký khóa học thành công!')
        
        // Extract orderId from response - check multiple possible locations
        const orderId = response.data?.order?.id || response.data?.orderId || response.data?.id
        
        console.log('=== EXTRACTED ORDER ID ===', orderId)
        
        if (orderId) {
          // Use router.push for client-side navigation (faster and preserves state)
          router.push(`/checkout/success?orderId=${orderId}`)
        } else {
          console.error('No orderId found in response:', response)
          toast.error('Không tìm thấy mã đơn hàng')
          router.push('/checkout/success')
        }
      }
    },
    onError: (error: any) => {
      console.error('=== ORDER ERROR ===', error)
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thanh toán')
    },
  })

  // Calculate totals with sale info
  const calculateFinalPrice = (course: CourseItemType) => {
    const originalPrice = course?.price !== undefined && course?.price !== null 
      ? Number(course.price) 
      : 0
    
    if (!course.saleInfo) return originalPrice
    
    const now = new Date()
    const saleStart = course.saleInfo.saleStartDate ? new Date(course.saleInfo.saleStartDate) : null
    const saleEnd = course.saleInfo.saleEndDate ? new Date(course.saleInfo.saleEndDate) : null
    
    const isWithinSalePeriod = (!saleStart || now >= saleStart) && (!saleEnd || now <= saleEnd)
    
    if (!isWithinSalePeriod || !course.saleInfo.value) return originalPrice
    
    if (course.saleInfo.saleType === 'percent') {
      return originalPrice * (1 - course.saleInfo.value / 100)
    } else if (course.saleInfo.saleType === 'fixed') {
      return Math.max(0, originalPrice - course.saleInfo.value)
    }
    
    return originalPrice
  }
  
  const totalOriginal = orderListCourse.reduce((sum, course) => {
    const originalPrice = course?.price !== undefined && course?.price !== null
      ? Number(course.price)
      : 0
    return sum + originalPrice
  }, 0)
  
  const totalSale = orderListCourse.reduce((sum, course) => {
    return sum + calculateFinalPrice(course)
  }, 0)

  const courseDiscount = totalOriginal - totalSale
  const finalTotal = Math.max(0, totalSale - voucherDiscount)

  // Handle voucher validation
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }

    setIsValidatingVoucher(true)
    try {
      const courseIds = orderListCourse.map(c => c.id)
      const result = await voucherService.validate(voucherCode.trim(), totalSale, courseIds)
      
      if (result.valid && result.voucher && result.discount !== undefined) {
        setAppliedVoucher(result.voucher)
        setVoucherDiscount(result.discount)
        toast.success(result.message || 'Áp dụng mã giảm giá thành công!')
      } else {
        toast.error(result.message || 'Mã giảm giá không hợp lệ')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra mã giảm giá')
    } finally {
      setIsValidatingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherDiscount(0)
    setVoucherCode('')
    toast.success('Đã xóa mã giảm giá')
  }

  const handlePayment = () => {
    if (orderListCourse.length === 0) {
      toast.error('Vui lòng chọn ít nhất một khóa học')
      return
    }

    // Check authentication
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiếp tục')
      router.push('/auth/login')
      return
    }

    const orderItems = orderListCourse.map(course => ({
      courseId: course.id,
      price: calculateFinalPrice(course)
    }))

    const orderData: CreateOrderRequest = {
      totalPrice: finalTotal,
      paymentMethod,
      orderItems,
      voucherId: appliedVoucher?.id,
    }

    // Debug logging
    console.log('=== ORDER DEBUG ===')
    console.log('Courses:', orderListCourse.map(c => ({ 
      id: c.id, 
      name: c.name, 
      price: c.price,
      finalPrice: calculateFinalPrice(c)
    })))
    console.log('Total Sale:', totalSale)
    console.log('Order Data:', orderData)
    console.log('==================')

    // Call API for both free and paid courses
    // Backend will auto-complete free courses and create enrollments
    createOrderMutation.mutate(orderData)
  }

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-5">
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
                  orderListCourse.map((course) => (
                    <CheckoutCourseItem key={course.id} course={course} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right item */}
        <div className="w-1/3 space-y-4">
          <h1 className="text-2xl font-bold mb-4">Tổng hợp đơn hàng</h1>
          
          {/* Voucher Section */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TicketPercent className="w-5 h-5 text-primary" />
              <span className="font-semibold">Mã giảm giá</span>
            </div>
            
            {appliedVoucher ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-semibold text-green-700">{appliedVoucher.code}</p>
                  <p className="text-sm text-green-600">
                    Giảm {appliedVoucher.discountType === 'percent' 
                      ? `${appliedVoucher.discountValue}%` 
                      : formatPrice(appliedVoucher.discountValue)}
                    {appliedVoucher.maxDiscountAmount && appliedVoucher.discountType === 'percent' && (
                      <span> (tối đa {formatPrice(appliedVoucher.maxDiscountAmount)})</span>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveVoucher}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleApplyVoucher}
                  disabled={isValidatingVoucher || !voucherCode.trim()}
                >
                  {isValidatingVoucher ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Áp dụng'
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Giá gốc:</span>
              <span>{formatPrice(totalOriginal)}</span>
            </div>
            {courseDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span>Giảm giá khóa học:</span>
                <span className="text-red-500">-{formatPrice(courseDiscount)}</span>
              </div>
            )}
            {voucherDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span>Giảm giá voucher:</span>
                <span className="text-red-500">-{formatPrice(voucherDiscount)}</span>
              </div>
            )}
            <hr className="my-2"/>
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Tổng cộng:</span>
              <span className="text-primary">{formatPrice(finalTotal)}</span>
            </div>
          </div>
          
          <Button 
            className="w-full mt-3 py-5"
            disabled={orderListCourse.length === 0 || createOrderMutation.isPending}
            onClick={handlePayment}
          >
            {createOrderMutation.isPending ? 'Đang xử lý...' : `Thanh toán ngay ${formatPrice(finalTotal)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}

const CheckoutCourseItem = ({course}: {course: CourseItemType}) => {
  const originalPrice = course?.price !== undefined && course?.price !== null
    ? Number(course.price)
    : 0
  
  // Calculate final price with sale info
  let finalPrice = originalPrice
  
  if (course.saleInfo) {
    const now = new Date()
    const saleStart = course.saleInfo.saleStartDate ? new Date(course.saleInfo.saleStartDate) : null
    const saleEnd = course.saleInfo.saleEndDate ? new Date(course.saleInfo.saleEndDate) : null
    
    const isWithinSalePeriod = (!saleStart || now >= saleStart) && (!saleEnd || now <= saleEnd)
    
    if (isWithinSalePeriod && course.saleInfo.value) {
      if (course.saleInfo.saleType === 'percent') {
        finalPrice = originalPrice * (1 - course.saleInfo.value / 100)
      } else if (course.saleInfo.saleType === 'fixed') {
        finalPrice = originalPrice - course.saleInfo.value
      }
    }
  }
  
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
            {formatPrice(finalPrice)}
          </span>
          {finalPrice < originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
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