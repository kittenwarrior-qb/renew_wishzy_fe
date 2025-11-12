"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useApiQuery } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Inbox } from "lucide-react"
import { Pagination } from "@/components/shared/common/Pagination"
import { useAppStore } from "@/stores/useAppStore"

type UserItem = {
  id: string
  email: string
  fullName: string
  gender?: string | null
  verified?: boolean
  address?: string | null
  avatar?: string | null
  phone?: string | null
  loginType?: string
  role?: string
  isInstructorActive?: boolean
  createdAt: string
  updatedAt: string
}

type UsersListResponse = {
  data: {
    items: UserItem[]
    pagination: {
      totalPage: number
      totalItems: number
      currentPage: number
      itemsPerPage: number
    }
  }
}

export default function TeachersPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const { theme } = useAppStore()
  const logoSrc = theme === "dark" ? "/images/white-logo.png" : "/images/black-logo.png"

  // Local pagination (client-side)
  const [page, setPage] = React.useState<number>(1)
  const [pageSize] = React.useState<number>(10)
  const [search, setSearch] = React.useState<string>("")

  // Fetch all users once (use large limit) then filter client-side to follow API schema strictly
  const { data, isPending, isError } = useApiQuery<UsersListResponse>(
    "users",
    {
      params: { page: 1, limit: 1000 },
      select: (res: any): UsersListResponse => {
        const payload = res?.data ?? res
        return payload as UsersListResponse
      },
      staleTime: 5 * 60 * 1000,
    }
  )

  // Filter instructors active and by search (realtime, client-side)
  const allItems: UserItem[] = (data?.data?.items ?? []) as UserItem[]
  const normalizedSearch = search.trim().toLowerCase()
  const filtered = allItems.filter(u => {
    const isActiveInstructor = u.role === "instructor" && u.isInstructorActive === true
    if (!isActiveInstructor) return false
    if (!normalizedSearch) return true
    const target = `${u.fullName || ""} ${u.email || ""}`.toLowerCase()
    return target.includes(normalizedSearch)
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const pagedItems = filtered.slice(start, start + pageSize)

  return (
    <div className="relative">
      {isPending ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
            <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Giảng viên đang hoạt động</h1>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Tìm theo tên..."
            className="h-9 rounded-md border bg-background px-3 text-sm outline-none"
          />
        </div>
      </div>

      {isError ? (
        <div className="py-16 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Inbox className="h-10 w-10 text-muted-foreground/60" />
            <span>Không có giảng viên đang hoạt động</span>
          </div>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">SĐT</th>
                <th className="p-2 text-center">Giới tính</th>
                <th className="p-2 text-center">Xác thực</th>
                <th className="p-2 text-left">Địa chỉ</th>
                <th className="p-2 text-center">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.fullName} className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs">{(u.fullName || u.email || "?").slice(0,1).toUpperCase()}</div>
                      )}
                      <div className="font-medium">{u.fullName || "-"}</div>
                    </div>
                  </td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.phone || "-"}</td>
                  <td className="p-2 text-center">{u.gender === "male" ? "Nam" : u.gender === "female" ? "Nữ" : "-"}</td>
                  <td className="p-2 text-center">{u.verified ? "Đã xác thực" : "Chưa"}</td>
                  <td className="p-2">{u.address || "-"}</td>
                  <td className="p-2 text-center">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3">
            <Pagination
              pagination={{ totalItems: total, totalPages, currentPage, itemsPerPage: pageSize }}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

 
