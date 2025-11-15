"use client"
import React from "react"
import { usePathname } from "next/navigation"
import { Search, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/stores/useAppStore"

export default function HeaderAdmin() {
  const pathname = usePathname() || ""
  const { user, logout } = useAppStore()
  const { primaryAction } = useAdminHeaderStore()
  const initials = React.useMemo(() => {
    if (user?.fullName) return user.fullName.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
    if (user?.email) return user.email[0]?.toUpperCase() ?? "U"
    return "U"
  }, [user])
  return (
    <header className="sticky top-0 z-20 h-14 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center gap-3 px-3 md:px-6">
      <SidebarTrigger className="mr-2 md:hidden" />
      <div className="hidden md:block text-base font-semibold text-foreground">
        <HeaderTitle pathname={pathname} />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {primaryAction ? (
          <Button
            variant={primaryAction.variant ?? "default"}
            size="sm"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
          >
            {primaryAction.label}
          </Button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar ?? ""} alt={user?.fullName ?? user?.email ?? "User"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="text-base">Tài khoản</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 pb-2">
              <div className="text-sm font-medium">{user?.fullName ?? "Người dùng"}</div>
              <div className="text-xs text-muted-foreground">{user?.email ?? "user@example.com"}</div>
            </div>
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              <span>Hồ sơ</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 size-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function mapAdminPathToLabel(subpath: string): string {
  const map: Record<string, string> = {
    "categories/create": "Tạo danh mục",
    "categories": "Danh mục",
    "categories/trash": "Danh mục / Thùng rác",
    "users/students": "Học sinh",
    "users/teachers": "Giảng viên",
    "users/admins": "Quản trị viên",
    "courses": "Khoá học",
    "courses/create": "Tạo khoá học",
    "courses/:id": "Khoá học",
    "exams": "Bài kiểm tra",
    "communication/reviews": "Đánh giá",
    "communication/comments": "Bình luận",
    "posts": "Danh sách bài viết",
    "posts/categories": "Danh mục bài viết",
    "posts/comments": "Bình luận bài viết",
    "orders": "Lịch sử thanh toán",
    "banners": "Banner",
    "vouchers": "Voucher",
    "settings": "Thiết lập",
  }
  const keys = Object.keys(map).sort((a, b) => b.length - a.length)
  for (const k of keys) if (subpath.startsWith(k)) return map[k]
  return subpath
}

function HeaderTitle({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean)
  const adminIndex = parts.indexOf("admin")
  if (adminIndex === -1) return <span>Admin</span>
  const rest = parts.slice(adminIndex + 1)
  if (rest.length === 0) return <span>Tổng quan</span>
  const label = mapAdminPathToLabel(rest.join("/"))
  return <span>{label}</span>
}
