'use client'

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useParams } from "next/navigation"

const PaymentResultPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string

  useEffect(() => {
    const status = searchParams.get('status')
    const orderId = searchParams.get('orderId')
    const code = searchParams.get('code')
    
    console.log('🔔 Payment Result:', { status, orderId, code, locale })
    
    if (status === 'success' && orderId) {
      toast.success('Thanh toán thành công!')
      router.replace(`/${locale}/checkout/success?orderId=${orderId}`)
    } else if (status === 'failed') {
      toast.error(`Thanh toán thất bại. Mã lỗi: ${code || 'Unknown'}`)
      setTimeout(() => {
        router.replace(`/${locale}/checkout`)
      }, 2000)
    } else if (status === 'invalid') {
      toast.error('Giao dịch không hợp lệ. Vui lòng liên hệ hỗ trợ.')
      setTimeout(() => {
        router.replace(`/${locale}/checkout`)
      }, 2000)
    } else {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
      setTimeout(() => {
        router.replace(`/${locale}/checkout`)
      }, 2000)
    }
  }, [searchParams, router, locale])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang xử lý kết quả thanh toán...</p>
        <p className="text-xs text-muted-foreground mt-2">Vui lòng không đóng trang...</p>
      </div>
    </div>
  )
}

export default PaymentResultPage
