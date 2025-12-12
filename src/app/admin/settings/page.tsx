"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Switch from "@/components/ui/switch"
import { useAppStore } from "@/stores/useAppStore"

export default function Page() {
  const [displayName, setDisplayName] = React.useState("")
  const [supportEmail, setSupportEmail] = React.useState("support@wishzy.com")
  const [platformName, setPlatformName] = React.useState("Wishzy Academy")
  const [platformTagline, setPlatformTagline] = React.useState("Nền tảng học tập trực tuyến cho mọi người")
  const [announcement, setAnnouncement] = React.useState("")

  const [compactMode, setCompactMode] = React.useState(false)

  const [emailNotifications, setEmailNotifications] = React.useState(true)
  const [systemNotifications, setSystemNotifications] = React.useState(true)
  const [reportsNotifications, setReportsNotifications] = React.useState(false)

  const maintenanceMode = useAppStore((state) => state.maintenanceMode)
  const setMaintenanceMode = useAppStore((state) => state.setMaintenanceMode)
  const [allowTeacherSignup, setAllowTeacherSignup] = React.useState(true)

  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const isDarkMode = theme === "dark"

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Thiết lập hệ thống</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Tuỳ chỉnh thông tin nền tảng, giao diện, thông báo và một số tuỳ chọn hệ thống cho trang quản trị.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4 h-9 text-[12px]">
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="appearance">Giao diện</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="system">Hệ thống</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-sm font-semibold">Thông tin nền tảng</CardTitle>
                <CardDescription>
                  Các thông tin này sẽ hiển thị ở nhiều nơi trên hệ thống (tiêu đề trang, email hệ thống, v.v.).
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="platform-name">Tên nền tảng</Label>
                  <Input
                    id="platform-name"
                    placeholder="VD: Wishzy Academy"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="platform-tagline">Mô tả ngắn</Label>
                  <Input
                    id="platform-tagline"
                    placeholder="VD: Nền tảng học tập trực tuyến cho mọi người"
                    value={platformTagline}
                    onChange={(e) => setPlatformTagline(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name">Tên hiển thị quản trị viên</Label>
                  <Input
                    id="display-name"
                    placeholder="VD: Nguyễn Văn A"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="support-email">Email hỗ trợ</Label>
                  <Input
                    id="support-email"
                    type="email"
                    placeholder="support@wishzy.com"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-1.5">
                <Label htmlFor="announcement">Thông báo nổi bật</Label>
                <Textarea
                  id="announcement"
                  placeholder="Nhập thông báo chung cho toàn hệ thống (tuỳ chọn)."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  rows={3}
                />
                <p className="text-[11px] text-muted-foreground">
                  Thông báo này có thể được hiển thị ở trang dashboard hoặc các khu vực quan trọng khác.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm">
                  Huỷ
                </Button>
                <Button size="sm">
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Giao diện dashboard</CardTitle>
              <CardDescription>
                Tuỳ chỉnh cảm giác sử dụng trang quản trị cho phù hợp với bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Chế độ tối (dark mode)</p>
                  <p className="text-[11px] text-muted-foreground">
                    Sử dụng giao diện tối giúp giảm mỏi mắt khi làm việc lâu trên dashboard.
                  </p>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={(value) => {
                    if (value && theme === "light") toggleTheme()
                    if (!value && theme === "dark") toggleTheme()
                  }}
                  aria-label="Bật/tắt dark mode"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Giao diện cô đọng (compact)</p>
                  <p className="text-[11px] text-muted-foreground">
                    Giảm khoảng cách giữa các phần tử để hiển thị được nhiều nội dung hơn trên màn hình.
                  </p>
                </div>
                <Switch
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                  aria-label="Bật/tắt compact mode"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Thông báo</CardTitle>
              <CardDescription>
                Quản lý cách hệ thống gửi thông báo cho bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email thông báo</p>
                  <p className="text-[11px] text-muted-foreground">
                    Nhận email khi có sự kiện quan trọng (đơn hàng mới, báo cáo lỗi, v.v.).
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  aria-label="Bật/tắt email thông báo"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Thông báo trong hệ thống</p>
                  <p className="text-[11px] text-muted-foreground">
                    Hiển thị banner/thông báo trong dashboard khi có cập nhật mới.
                  </p>
                </div>
                <Switch
                  checked={systemNotifications}
                  onCheckedChange={setSystemNotifications}
                  aria-label="Bật/tắt thông báo trong hệ thống"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Báo cáo định kỳ qua email</p>
                  <p className="text-[11px] text-muted-foreground">
                    Gửi báo cáo tổng quan doanh thu và người dùng theo chu kỳ (tuần/tháng).
                  </p>
                </div>
                <Switch
                  checked={reportsNotifications}
                  onCheckedChange={setReportsNotifications}
                  aria-label="Bật/tắt báo cáo định kỳ"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Tuỳ chọn hệ thống</CardTitle>
              <CardDescription>
                Một số tuỳ chọn ảnh hưởng đến cách hệ thống vận hành.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Chế độ bảo trì</p>
                  <p className="text-[11px] text-muted-foreground">
                    Khi bật, học viên không thể truy cập khoá học. Chỉ admin mới truy cập được.
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                  aria-label="Bật/tắt chế độ bảo trì"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Cho phép giảng viên tự đăng ký</p>
                  <p className="text-[11px] text-muted-foreground">
                    Nếu tắt, chỉ admin mới có thể tạo tài khoản giảng viên mới.
                  </p>
                </div>
                <Switch
                  checked={allowTeacherSignup}
                  onCheckedChange={setAllowTeacherSignup}
                  aria-label="Bật/tắt giảng viên tự đăng ký"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm">
                  Khôi phục mặc định
                </Button>
                <Button size="sm">
                  Lưu cấu hình hệ thống
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
