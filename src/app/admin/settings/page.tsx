"use client"

import * as React from "react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useInstructorRevenuePercentage,
  useUpdateSystemSetting,
} from "@/hooks/useSystemSettings"
import { SETTING_KEYS } from "@/services/system-settings"

export default function Page() {
  const { data: revenueData, isLoading, isError } = useInstructorRevenuePercentage()
  const { mutate: updateSetting, isPending: isSaving } = useUpdateSystemSetting()

  // Local state for editing - default to 70% if setting doesn't exist
  const [instructorShare, setInstructorShare] = React.useState<string>("70")
  const [hasChanges, setHasChanges] = React.useState(false)

  // Sync with server data, or keep default if not found
  React.useEffect(() => {
    if (revenueData?.value) {
      setInstructorShare(revenueData.value)
      setHasChanges(false)
    }
    // If error (404 - not found), keep default value of 70%
  }, [revenueData?.value])

  const platformShare = 100 - parseInt(instructorShare || "70")

  const handleValueChange = (value: string) => {
    setInstructorShare(value)
    setHasChanges(value !== revenueData?.value)
  }

  const handleSave = () => {
    updateSetting(
      {
        key: SETTING_KEYS.INSTRUCTOR_REVENUE_PERCENTAGE,
        payload: {
          value: instructorShare,
          description: "Tỉ lệ phần trăm doanh thu instructor nhận được",
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã lưu cài đặt", {
            description: `Tỷ lệ chia sẻ: Giảng viên ${instructorShare}% - Nền tảng ${platformShare}%`,
          })
          setHasChanges(false)
        },
        onError: (error) => {
          toast.error("Lưu thất bại", {
            description: "Đã có lỗi xảy ra. Vui lòng thử lại.",
          })
          console.error("Failed to update setting:", error)
        },
      }
    )
  }

  const handleReset = () => {
    setInstructorShare("70")
    setHasChanges("70" !== revenueData?.value)
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Thiết lập hệ thống</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Cấu hình phân chia doanh thu giữa nền tảng và giảng viên.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Chia sẻ doanh thu</CardTitle>
              {!revenueData && !isError && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                  Chưa cấu hình
                </span>
              )}
            </div>
            <CardDescription>
              Thiết lập tỷ lệ phần trăm chia sẻ doanh thu giữa nền tảng và giảng viên cho mỗi khóa học được bán.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Revenue Split Visualization */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="instructor-share" className="mb-2 block">Tỷ lệ giảng viên nhận</Label>
                <Select value={instructorShare} onValueChange={handleValueChange}>
                  <SelectTrigger id="instructor-share" className="w-full">
                    <SelectValue placeholder="Chọn tỷ lệ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">Giảng viên 50% - Nền tảng 50%</SelectItem>
                    <SelectItem value="60">Giảng viên 60% - Nền tảng 40%</SelectItem>
                    <SelectItem value="65">Giảng viên 65% - Nền tảng 35%</SelectItem>
                    <SelectItem value="70">Giảng viên 70% - Nền tảng 30% (Mặc định)</SelectItem>
                    <SelectItem value="75">Giảng viên 75% - Nền tảng 25%</SelectItem>
                    <SelectItem value="80">Giảng viên 80% - Nền tảng 20%</SelectItem>
                    <SelectItem value="85">Giảng viên 85% - Nền tảng 15%</SelectItem>
                    <SelectItem value="90">Giảng viên 90% - Nền tảng 10%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="space-y-2">
              <div className="flex h-8 rounded-lg overflow-hidden border">
                <div 
                  className="bg-green-500 flex items-center justify-center text-xs font-medium text-white transition-all duration-300"
                  style={{ width: `${instructorShare}%` }}
                >
                  {parseInt(instructorShare) >= 15 && `${instructorShare}%`}
                </div>
                <div 
                  className="bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground transition-all duration-300"
                  style={{ width: `${platformShare}%` }}
                >
                  {platformShare >= 15 && `${platformShare}%`}
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span>Giảng viên: {instructorShare}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary"></div>
                  <span>Nền tảng: {platformShare}%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Example Calculation */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Ví dụ tính toán</h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Giá khóa học:</span>
                <span className="font-medium">500.000 ₫</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Giảng viên nhận ({instructorShare}%):</span>
                <span className="font-medium text-green-600">{(500000 * parseInt(instructorShare) / 100).toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nền tảng nhận ({platformShare}%):</span>
                <span className="font-medium text-primary">{(500000 * platformShare / 100).toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tỷ lệ này áp dụng cho tất cả khóa học mới. Các khóa học đã tồn tại sẽ giữ nguyên tỷ lệ cũ.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              disabled={isSaving}
            >
              Khôi phục mặc định
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
