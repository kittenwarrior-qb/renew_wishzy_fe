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
import vnpayLogo from '@/public/images/vnpay.jpg'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { voucherService, Voucher } from "@/src/services/voucher"
import { TicketPercent, X, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const CheckoutPage = () => {
  const { user, orderListCourse } = useAppStore()
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'zalopay' | 'momo' | 'banking'>('vnpay')
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVouchers, setAppliedVouchers] = useState<Voucher[]>([])
  const [voucherDiscounts, setVoucherDiscounts] = useState<Record<string, number>>({})
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([])
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiếp tục')
      router.push('/auth/login')
    }
  }, [user, router])

  // Load available vouchers when courses change
  useEffect(() => {
    const loadAvailableVouchers = async () => {
      if (orderListCourse.length === 0) {
        setAvailableVouchers([])
        return
      }

      setIsLoadingVouchers(true)
      try {
        const courseIds = orderListCourse.map(c => c.id)
        const vouchers = await voucherService.getAvailable(courseIds)
        setAvailableVouchers(vouchers)
      } catch (error) {
        console.error('Failed to load vouchers:', error)
      } finally {
        setIsLoadingVouchers(false)
      }
    }

    loadAvailableVouchers()
  }, [orderListCourse])

  const createOrderMutation = useApiPost<any, CreateOrderRequest>('/orders', {
    onSuccess: (response: any) => {
      console.log('=== ORDER RESPONSE ===', response)
      
      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl
      } else {
        toast.success(response.message || 'Đăng ký khóa học thành công!')
        const orderId = response.data?.order?.id || response.data?.orderId || response.data?.id
        
        if (orderId) {
          router.push(`/checkout/success?orderId=${orderId}`)
        } else {
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
  const totalVoucherDiscount = Object.values(voucherDiscounts).reduce((sum, d) => sum + d, 0)
  const finalTotal = Math.max(0, totalSale - totalVoucherDiscount)

  // Handle voucher validation
  const handleApplyVoucher = async (voucher?: Voucher) => {
    const codeToValidate = voucher?.code || voucherCode.trim()
    
    if (!codeToValidate) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }

    // Check if already applied
    if (appliedVouchers.some(v => v.code.toUpperCase() === codeToValidate.toUpperCase())) {
      toast.error('Mã giảm giá này đã được áp dụng')
      return
    }

    setIsValidatingVoucher(true)
    try {
      const courseIds = orderListCourse.map(c => c.id)
      const result = await voucherService.validate(codeToValidate, totalSale, courseIds)
      
      if (result.valid && result.voucher && result.discount !== undefined) {
        setAppliedVouchers(prev => [...prev, result.voucher!])
        setVoucherDiscounts(prev => ({ ...prev, [result.voucher!.id]: result.discount! }))
        setVoucherCode('')
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

  const handleRemoveVoucher = (voucherId: string) => {
    setAppliedVouchers(prev => prev.filter(v => v.id !== voucherId))
    setVoucherDiscounts(prev => {
      const newDiscounts = { ...prev }
      delete newDiscounts[voucherId]
      return newDiscounts
    })
    toast.success('Đã xóa mã giảm giá')
  }

  const handlePayment = () => {
    if (orderListCourse.length === 0) {
      toast.error('Vui lòng chọn ít nhất một khóa học')
      return
    }

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
      voucherId: appliedVouchers.length > 0 ? appliedVouchers[0].id : undefined,
    }

    createOrderMutation.mutate(orderData)
  }

  const isVoucherApplied = (voucher: Voucher) => {
    return appliedVouchers.some(v => v.id === voucher.id)
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
            
            {/* Applied Vouchers */}
            {appliedVouchers.length > 0 && (
              <div className="space-y-2 mb-3">
                {appliedVouchers.map(voucher => (
                  <div key={voucher.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-700">{voucher.code}</p>
                      <p className="text-sm text-green-600">
                        Giảm {voucher.discountType === 'percent' 
                          ? `${voucher.discountValue}%` 
                          : formatPrice(voucher.discountValue)}
                        {voucher.maxDiscountAmount && voucher.discountType === 'percent' && (
                          <span> (tối đa {formatPrice(voucher.maxDiscountAmount)})</span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveVoucher(voucher.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Available Vouchers List - Always visible */}
            {isLoadingVouchers ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Đang tải voucher...</span>
              </div>
            ) : availableVouchers.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-2">
                  Chọn mã giảm giá ({availableVouchers.length} mã có thể áp dụng)
                </p>
                {availableVouchers.map(voucher => {
                  const isApplied = isVoucherApplied(voucher)
                  return (
                    <div
                      key={voucher.id}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all",
                        isApplied
                          ? "bg-green-50 border-green-300 cursor-default"
                          : "hover:border-primary hover:bg-primary/5"
                      )}
                      onClick={() => !isApplied && !isValidatingVoucher && handleApplyVoucher(voucher)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{voucher.code}</span>
                            {isApplied && (
                              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" />
                                Đã chọn
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{voucher.name}</p>
                          <p className="text-xs text-primary font-medium mt-1">
                            Giảm {voucher.discountType === 'percent' 
                              ? `${voucher.discountValue}%` 
                              : formatPrice(voucher.discountValue)}
                            {voucher.maxDiscountAmount && voucher.discountType === 'percent' && (
                              <span className="text-muted-foreground"> (tối đa {formatPrice(voucher.maxDiscountAmount)})</span>
                            )}
                          </p>
                          {voucher.minOrderAmount && Number(voucher.minOrderAmount) > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Đơn tối thiểu: {formatPrice(Number(voucher.minOrderAmount))}
                            </p>
                          )}
                        </div>
                        {!isApplied && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                            disabled={isValidatingVoucher}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApplyVoucher(voucher)
                            }}
                          >
                            {isValidatingVoucher ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Chọn'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Không có mã giảm giá nào khả dụng
              </div>
            )}

            {/* Manual input voucher code */}
            <div className="border-t mt-3 pt-3">
              <p className="text-sm text-muted-foreground mb-2">Hoặc nhập mã giảm giá</p>
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
                  onClick={() => handleApplyVoucher()}
                  disabled={isValidatingVoucher || !voucherCode.trim()}
                >
                  {isValidatingVoucher ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Áp dụng'
                  )}
                </Button>
              </div>
            </div>
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
            {voucherDiscounts && totalVoucherDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span>Giảm giá voucher:</span>
                <span className="text-red-500">-{formatPrice(totalVoucherDiscount)}</span>
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