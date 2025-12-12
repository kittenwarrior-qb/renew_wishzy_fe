'use client'

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Đang xử lý thanh toán...</p>
    </div>
  </div>
);

const PaymentCallbackContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode')
    const txnRef = searchParams.get('vnp_TxnRef')
    
    // VNPay response codes
    // 00: Success
    // Other codes: Failed
    
    const pathSegments = window.location.pathname.split('/')
    const locale = pathSegments[1] || 'vi' 
    
    if (responseCode === '00') {
      const queryString = searchParams.toString()
      router.replace(`/${locale}/checkout/success?${queryString}`)
    } else {
      toast.error('Thanh toán thất bại. Vui lòng thử lại.')
      router.replace(`/${locale}/checkout`)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang xử lý thanh toán...</p>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}

// Prevent static prerendering of this page
export const dynamic = 'force-dynamic'
export const dynamicParams = true
