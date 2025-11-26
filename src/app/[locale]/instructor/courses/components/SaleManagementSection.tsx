"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Switch from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { SaleInfo } from "@/types/sale"
import { SaleType } from "@/types/sale"
import { SalePreview } from "./SalePreview"
import { notify } from "@/components/shared/admin/Notifications"

interface SaleManagementSectionProps {
  price: number
  saleInfo?: SaleInfo | null
  onSave: (saleInfo: SaleInfo | null) => void
  loading?: boolean
}

export function SaleManagementSection({
  price,
  saleInfo: initialSaleInfo,
  onSave,
  loading = false,
}: SaleManagementSectionProps) {
  const [enabled, setEnabled] = useState(!!initialSaleInfo)
  const [saleType, setSaleType] = useState<SaleType>(
    initialSaleInfo?.saleType || SaleType.PERCENT
  )
  const [value, setValue] = useState<number>(initialSaleInfo?.value || 0)
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialSaleInfo?.saleStartDate ? new Date(initialSaleInfo.saleStartDate) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialSaleInfo?.saleEndDate ? new Date(initialSaleInfo.saleEndDate) : undefined
  )

  useEffect(() => {
    if (initialSaleInfo) {
      setEnabled(true)
      setSaleType(initialSaleInfo.saleType)
      setValue(initialSaleInfo.value)
      setStartDate(initialSaleInfo.saleStartDate ? new Date(initialSaleInfo.saleStartDate) : undefined)
      setEndDate(initialSaleInfo.saleEndDate ? new Date(initialSaleInfo.saleEndDate) : undefined)
    }
  }, [initialSaleInfo])

  const handleSave = () => {
    // Validation
    if (enabled) {
      if (saleType === SaleType.PERCENT && (value < 0 || value > 50)) {
        notify({
          title: "Lỗi",
          description: "Phần trăm giảm giá phải từ 0 đến 50%",
          variant: "destructive",
        })
        return
      }
      if (saleType === SaleType.FIXED && (value < 0 || value >= price)) {
        notify({
          title: "Lỗi",
          description: `Số tiền giảm phải từ 0 đến ${price.toLocaleString('vi-VN')} VNĐ`,
          variant: "destructive",
        })
        return
      }
      if (endDate && startDate && endDate <= startDate) {
        notify({
          title: "Lỗi",
          description: "Ngày kết thúc phải sau ngày bắt đầu",
          variant: "destructive",
        })
        return
      }
    }

    const saleInfo: SaleInfo | null = enabled
      ? {
          saleType,
          value,
          saleStartDate: startDate?.toISOString(),
          saleEndDate: endDate?.toISOString(),
        }
      : null

    onSave(saleInfo)
  }

  const handleCancel = () => {
    setEnabled(!!initialSaleInfo)
    setSaleType(initialSaleInfo?.saleType || SaleType.PERCENT)
    setValue(initialSaleInfo?.value || 0)
    setStartDate(initialSaleInfo?.saleStartDate ? new Date(initialSaleInfo.saleStartDate) : undefined)
    setEndDate(initialSaleInfo?.saleEndDate ? new Date(initialSaleInfo.saleEndDate) : undefined)
  }

  const currentSaleInfo: SaleInfo | null = enabled
    ? {
        saleType,
        value,
        saleStartDate: startDate?.toISOString(),
        saleEndDate: endDate?.toISOString(),
      }
    : null

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý giá sale</CardTitle>
          <CardDescription>
            Thiết lập giá giảm cho khóa học này. Tối đa 50% khi giảm theo phần trăm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Sale */}
          <div className="flex items-center justify-between">
            <Label htmlFor="sale-enabled" className="text-base font-medium">
              Bật sale
            </Label>
            <Switch
              id="sale-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <>
              {/* Sale Type */}
              <div className="space-y-3">
                <Label>Loại giảm giá</Label>
                <RadioGroup value={saleType} onValueChange={(v) => setSaleType(v as SaleType)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={SaleType.PERCENT} id="percent" />
                    <Label htmlFor="percent" className="font-normal cursor-pointer">
                      Giảm theo phần trăm (0-50%)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={SaleType.FIXED} id="fixed" />
                    <Label htmlFor="fixed" className="font-normal cursor-pointer">
                      Giảm số tiền cố định
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Sale Value */}
              <div className="space-y-2">
                <Label htmlFor="sale-value">
                  {saleType === SaleType.PERCENT ? "Phần trăm giảm (%)" : "Số tiền giảm (VNĐ)"}
                </Label>
                <Input
                  id="sale-value"
                  type="number"
                  min={0}
                  max={saleType === SaleType.PERCENT ? 50 : price}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  placeholder={saleType === SaleType.PERCENT ? "0-50" : `0-${price.toLocaleString('vi-VN')}`}
                />
                {saleType === SaleType.PERCENT && (
                  <p className="text-xs text-muted-foreground">
                    Tối đa 50%
                  </p>
                )}
                {saleType === SaleType.FIXED && (
                  <p className="text-xs text-muted-foreground">
                    Tối đa {price.toLocaleString('vi-VN')} VNĐ
                  </p>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Ngày bắt đầu (tùy chọn)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                    {startDate && (
                      <div className="p-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setStartDate(undefined)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Xóa
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>Ngày kết thúc (tùy chọn)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                    />
                    {endDate && (
                      <div className="p-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setEndDate(undefined)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Xóa
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  {loading ? "Đang lưu..." : "Lưu sale"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  Hủy
                </Button>
              </div>
            </>
          )}

          {!enabled && (
            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? "Đang lưu..." : "Hủy sale"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <SalePreview price={price} saleInfo={currentSaleInfo} />
    </div>
  )
}

