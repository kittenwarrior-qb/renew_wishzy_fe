"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SaleInfo } from "@/types/sale"
import { calculateSalePrice, getDiscountPercentage } from "@/types/sale"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface SalePreviewProps {
  price: number
  saleInfo: SaleInfo | null | undefined
}

export function SalePreview({ price, saleInfo }: SalePreviewProps) {
  if (!saleInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Giá khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            }).format(price)}
          </div>
        </CardContent>
      </Card>
    )
  }

  const salePrice = calculateSalePrice(price, saleInfo)
  const discount = getDiscountPercentage(price, saleInfo)
  const savings = price - salePrice

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Giá sau sale</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground line-through">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            }).format(price)}
          </span>
          <span className="text-xs text-red-500 font-semibold">-{discount}%</span>
        </div>
        <div className="text-2xl font-bold text-primary">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
          }).format(salePrice)}
        </div>
        <div className="text-sm text-green-600 font-medium">
          Tiết kiệm: {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
          }).format(savings)}
        </div>
        {saleInfo.saleStartDate && saleInfo.saleEndDate && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <div>Bắt đầu: {format(new Date(saleInfo.saleStartDate), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
            <div>Kết thúc: {format(new Date(saleInfo.saleEndDate), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

