"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import Switch from "@/components/ui/switch"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import Link from "next/link"
import { notify } from "@/components/shared/admin/Notifications"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/stores/useAppStore"
import { useCourseList, useToggleCourseStatus, useDeleteCourse, type Course } from "@/components/shared/course/useCourse"
import { useParentCategories } from "@/components/shared/category/useCategory"
import { Plus, Pencil, Trash2, Inbox, ExternalLink, Image as ImageIcon } from "lucide-react"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import { SaleBadge } from "./components/SaleBadge"
import { getSaleStatus, getDiscountPercentage } from "@/types/sale"

// Remove unused type

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAppStore()
  const { setPrimaryAction } = useAdminHeaderStore()

  const [page, setPage] = React.useState<number>(Number(searchParams.get("page") || 1))
  const [limit, setLimit] = React.useState<number>(Number(searchParams.get("limit") || 10))
  const [name, setName] = React.useState<string>(searchParams.get("name") || "")
  const [status, setStatus] = React.useState<string>(searchParams.get("status") || "__all")
  const [level, setLevel] = React.useState<string>(searchParams.get("level") || "__all")
  const [categoryId, setCategoryId] = React.useState<string>(searchParams.get("categoryId") || "__all")

  const prevRef = React.useRef<{ page: number; limit: number; name?: string; status?: string; level?: string; categoryId?: string } | null>(null)
  React.useEffect(() => {
    const qs = new URLSearchParams()
    if (name) qs.append("name", name)
    if (status && status !== "__all") qs.append("status", status)
    if (level && level !== "__all") qs.append("level", level)
    if (categoryId && categoryId !== "__all") qs.append("categoryId", categoryId)
    qs.append("page", String(page))
    qs.append("limit", String(limit))
    const href = `/instructor/courses${qs.toString() ? `?${qs.toString()}` : ""}`
    const prev = prevRef.current
    const normStatus = status === "__all" ? undefined : status
    const normLevel = level === "__all" ? undefined : level
    const normCategoryId = categoryId === "__all" ? undefined : categoryId
    const onlyPaging = !!prev && prev.name === (name || undefined) && prev.status === normStatus && prev.level === normLevel && prev.categoryId === normCategoryId && (prev.page !== page || prev.limit !== limit)
    if (onlyPaging) router.push(href); else router.replace(href)
    prevRef.current = { page, limit, name: name || undefined, status: normStatus, level: normLevel, categoryId: normCategoryId }
  }, [page, limit, name, status, level, categoryId, router])

  const filter = React.useMemo(() => ({
    page,
    limit,
    name: name || undefined,
    status: status !== '__all' ? (status === 'true') : undefined,
    courseLevel: level !== '__all' ? (level as 'beginner' | 'intermediate' | 'advanced') : undefined,
    categoryId: categoryId !== '__all' ? categoryId : undefined,
    createdBy: user?.id, // Chỉ hiển thị khóa học của instructor hiện tại
  }), [page, limit, name, status, level, categoryId, user?.id])
  const { data, isPending, isFetching, isError } = useCourseList(filter)
  const { data: parentsData } = useParentCategories()
  const categories = (parentsData?.data ?? []) as Array<{ id: string; name: string }>
  const items = (data?.data ?? []) as Course[]
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit
  // Remove unused variable

  const { mutate: toggleStatus, isPending: toggling } = useToggleCourseStatus()
  const { mutate: deleteCourse, isPending: deleting } = useDeleteCourse()

  const [openDelete, setOpenDelete] = React.useState(false)
  const [deletingTarget, setDeletingTarget] = React.useState<Course | null>(null)
  const onConfirmDelete = (c: Course) => { setDeletingTarget(c); setOpenDelete(true) }

  // Sale management states
  const [openSale, setOpenSale] = React.useState(false)
  const [saleTarget, setSaleTarget] = React.useState<Course | null>(null)
  const [saleForm, setSaleForm] = React.useState({
    saleType: 'percent' as 'percent' | 'fixed',
    value: '',
    startDate: '',
    endDate: '',
  })

  const openSaleDialog = (course: Course) => {
    setSaleTarget(course)
    const saleInfo = (course as any).saleInfo
    if (saleInfo) {
      // Edit existing sale
      setSaleForm({
        saleType: saleInfo.saleType || 'percent',
        value: String(saleInfo.value || ''),
        startDate: saleInfo.startDate ? new Date(saleInfo.startDate).toISOString().split('T')[0] : '',
        endDate: saleInfo.endDate ? new Date(saleInfo.endDate).toISOString().split('T')[0] : '',
      })
    } else {
      // Create new sale
      setSaleForm({
        saleType: 'percent',
        value: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      })
    }
    setOpenSale(true)
  }

  // Remove primary action since we have inline button now
  React.useEffect(() => {
    setPrimaryAction(null)
    return () => setPrimaryAction(null)
  }, [setPrimaryAction])

  return (
    <div className="relative mx-auto max-w-[1600px] overflow-hidden px-4 py-4 md:px-6">
      
      <div className="mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          {/* Left side - Search and Filters */}
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-end md:space-x-4">
            {/* Search */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
              <Input 
                value={name} 
                onChange={(e) => { setName(e.target.value); setPage(1) }} 
                placeholder="Nhập tên khóa học..." 
                className="h-9 w-52" 
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
                <SelectTrigger className="h-9 w-40">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tất cả</SelectItem>
                  <SelectItem value="true">Đã xuất bản</SelectItem>
                  <SelectItem value="false">Nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Level Filter */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Cấp độ</label>
              <Select value={level} onValueChange={(v) => { setLevel(v); setPage(1) }}>
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Chọn cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tất cả</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Danh mục</label>
              <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1) }}>
                <SelectTrigger className="h-9 w-56">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tất cả</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={String((c as any).id)} value={String((c as any).id)}>{(c as any).name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Right side - Add Course Button */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 invisible">Action</label>
            <Button 
              onClick={() => router.push('/instructor/courses/create')} 
              className="whitespace-nowrap h-9"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm khóa học
            </Button>
          </div>
        </div>
      </div>

      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />

        {isError ? (
          <div className="py-16 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
        ) : items.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/60" />
              <span>Không có dữ liệu</span>
            </div>
          </div>
        ) : (
          (() => {
            const columns: Column<Course & any>[] = [
              {
                key: 'thumbnail',
                label: 'Ảnh',
                type: 'short',
                render: (row: Course) => (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="group inline-flex h-12 w-16 items-center justify-center overflow-hidden rounded-md bg-muted/40 hover:bg-muted"
                      >
                        {row.thumbnail ? (
                          <img
                            src={row.thumbnail as any}
                            alt={row.name || "Thumbnail"}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <span className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                            <span>Không có</span>
                          </span>
                        )}
                      </button>
                    </DialogTrigger>
                    {row.thumbnail ? (
                      <DialogContent className="sm:max-w-xl md:max-w-2xl border-none p-3 sm:p-4 bg-background/95">
                        <div className="mb-2 text-xs text-muted-foreground line-clamp-2">
                          {row.name || "Ảnh khoá học"}
                        </div>
                        <div className="rounded-md bg-muted flex items-center justify-center">
                          <img
                            src={row.thumbnail as any}
                            alt={row.name || "Thumbnail"}
                            className="max-h-[70vh] w-full object-contain rounded-md"
                          />
                        </div>
                      </DialogContent>
                    ) : null}
                  </Dialog>
                ),
              },
              {
                key: 'name',
                label: 'Tên',
                type: 'text',
                render: (row: Course) => (
                  <Link
                    href={`/instructor/courses/${row.id}`}
                    className="flex items-center gap-2 text-foreground hover:text-primary hover:underline focus:outline-none focus:text-primary focus:underline transition-colors duration-200"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />

                    <TruncateTooltipWrapper lineClamp={1} maxWidth={260}>
                      <span>{row.name}</span>
                    </TruncateTooltipWrapper>
                  </Link>
                ),
              },
              {
                key: 'category',
                label: 'Danh mục',
                type: 'short',
                render: (row: Course) => row.category?.name || '-',
              },
              {
                key: 'price',
                label: 'Giá',
                type: 'number',
                render: (row: Course) => {
                  const saleInfo = (row as any).saleInfo
                  const saleStatus = getSaleStatus(saleInfo)
                  const discount = getDiscountPercentage(Number(row.price), saleInfo)
                  const hasSale = saleStatus !== 'none'
                  
                  return (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={hasSale ? "line-through text-muted-foreground text-sm" : ""}>
                          {Number(row.price).toLocaleString()} VNĐ
                        </span>
                        {hasSale && (
                          <SaleBadge status={saleStatus} discount={discount} />
                        )}
                      </div>
                      {hasSale && saleInfo && (
                        <span className="text-xs text-primary font-medium">
                          {(() => {
                            const salePrice = saleInfo.saleType === 'percent'
                              ? Number(row.price) * (1 - saleInfo.value / 100)
                              : Number(row.price) - saleInfo.value
                            return Math.max(0, salePrice).toLocaleString()
                          })()} VNĐ
                        </span>
                      )}
                    </div>
                  )
                },
              },
              {
                key: 'level',
                label: 'Cấp độ',
                type: 'short',
                render: (row: Course) => {
                  const level = String(row.level || '').toLowerCase()
                  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
                  const color = level === 'beginner'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : level === 'intermediate'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : level === 'advanced'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-muted text-muted-foreground border-transparent'

                  return (
                    <span className={`${base} ${color}`}>
                      {level || '-'}
                    </span>
                  )
                },
              },
              {
                key: 'sale',
                label: 'Sale',
                type: 'short',
                render: (row: Course) => {
                  const saleInfo = (row as any).saleInfo
                  const saleStatus = getSaleStatus(saleInfo)
                  const hasSale = saleStatus !== 'none'
                  
                  return (
                    <div className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          hasSale 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => openSaleDialog(row)}
                        title={hasSale ? 'Đang có sale - Click để chỉnh sửa' : 'Không có sale - Click để tạo'}
                      >
                        {hasSale ? (
                          <div className="flex items-center gap-1">
                            <span>🏷️</span>
                            <span>
                              {saleInfo?.saleType === 'percent' 
                                ? `-${saleInfo.value}%`
                                : `-${saleInfo.value.toLocaleString()}đ`
                              }
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span>➕</span>
                            <span>Tạo sale</span>
                          </div>
                        )}
                      </button>
                      {hasSale && saleInfo && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(saleInfo.endDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  )
                },
              },
              {
                key: 'status',
                label: 'Trạng thái',
                type: 'short',
                render: (row: Course) => (
                  <div className="flex flex-col items-center gap-1">
                    <Switch
                      checked={!!row.status}
                      disabled={toggling}
                      onCheckedChange={() =>
                        toggleStatus(
                          { id: String(row.id) },
                          {
                            onError: (e: any) => {
                              const backendMessage = e?.response?.data?.message as string | undefined
                              const statusCode = e?.response?.status as number | undefined

                              const isUnauthorizedToggle =
                                statusCode === 403 ||
                                backendMessage === "You are not authorized to perform this action on this course"

                              const description = isUnauthorizedToggle
                                ? "Bạn không có quyền thay đổi trạng thái của khoá học này."
                                : "Không thể cập nhật trạng thái khoá học. Vui lòng thử lại sau."

                              notify({
                                title: "Lỗi",
                                description,
                                variant: "destructive",
                              })
                            },
                          },
                        )
                      }
                      aria-label={row.status ? "Đang xuất bản" : "Đang nháp"}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {row.status ? "Mở" : "Nháp"}
                    </span>
                  </div>
                ),
              },
              {
                key: 'createdAt',
                label: 'Ngày tạo',
                type: 'short',
                render: (row: Course) => new Date(row.createdAt).toLocaleDateString(),
              },
              {
                key: 'actions',
                label: 'Hành động',
                type: 'action',
                render: (row: Course) => (
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      href={`/instructor/courses/edit/${row.id}`}
                      className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground transition-colors duration-200"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onConfirmDelete(row)}
                      disabled={deleting}
                      className="inline-flex text-destructive hover:text-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ),
              },
            ]
            return (
              <DynamicTable
                columns={columns}
                data={items as any}
                loading={isPending || isFetching}
                pagination={{
                  totalItems: total,
                  currentPage,
                  itemsPerPage: pageSize,
                  onPageChange: (p) => setPage(p),
                  pageSizeOptions: [10, 20, 50],
                  onPageSizeChange: (sz) => {
                    setLimit(sz)
                    setPage(1)
                  },
                }}
              />
            )
          })()
        )}
      </div>

      {/* Delete confirm */}
      <AdminActionDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xác nhận xoá"
        description={<span>Bạn có chắc muốn xoá khoá học "<b>{deletingTarget?.name}</b>"?</span>}
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deleting}
        position="top"
        onConfirm={() => {
          if (!deletingTarget) return
          deleteCourse({ id: String(deletingTarget.id) }, {
            onSuccess: () => { setOpenDelete(false); notify({ title: "Đã xoá", variant: "success" }) },
            onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể xoá"), variant: "destructive" })
          })
        }}
      />

      {/* Sale Management Dialog */}
      <Dialog open={openSale} onOpenChange={setOpenSale}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {(saleTarget as any)?.saleInfo ? 'Chỉnh sửa sale' : 'Tạo sale mới'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Khóa học</Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {saleTarget?.name}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Loại giảm giá</Label>
              <Select 
                value={saleForm.saleType} 
                onValueChange={(value: 'percent' | 'fixed') => 
                  setSaleForm(prev => ({ ...prev, saleType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Giảm theo phần trăm (%)</SelectItem>
                  <SelectItem value="fixed">Giảm số tiền cố định (VNĐ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Giá trị giảm {saleForm.saleType === 'percent' ? '(%)' : '(VNĐ)'}
              </Label>
              <Input
                type="number"
                placeholder={saleForm.saleType === 'percent' ? 'Ví dụ: 20' : 'Ví dụ: 100000'}
                value={saleForm.value}
                onChange={(e) => setSaleForm(prev => ({ ...prev, value: e.target.value }))}
                min="1"
                max={saleForm.saleType === 'percent' ? '99' : undefined}
              />
              {saleForm.saleType === 'percent' && (
                <p className="text-xs text-muted-foreground">
                  Giảm tối đa 99%
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={saleForm.startDate}
                  onChange={(e) => setSaleForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={saleForm.endDate}
                  onChange={(e) => setSaleForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {saleTarget && saleForm.value && (
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="text-sm font-medium text-blue-900">Xem trước:</div>
                <div className="text-xs text-blue-700 mt-1">
                  Giá gốc: {Number(saleTarget.price).toLocaleString()} VNĐ
                </div>
                <div className="text-xs text-blue-700">
                  Giá sau giảm: {(() => {
                    const originalPrice = Number(saleTarget.price)
                    const discountValue = Number(saleForm.value)
                    const salePrice = saleForm.saleType === 'percent'
                      ? originalPrice * (1 - discountValue / 100)
                      : originalPrice - discountValue
                    return Math.max(0, salePrice).toLocaleString()
                  })()} VNĐ
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {(saleTarget as any)?.saleInfo && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={async () => {
                    if (!saleTarget) return;
                    
                    try {
                      const { instructorApi } = await import('@/services/instructorApi');
                      
                      await instructorApi.sales.deleteSale(saleTarget.id);
                      
                      notify({ 
                        title: "Thành công", 
                        description: "Sale đã được xóa thành công",
                        variant: "success" 
                      });
                      setOpenSale(false);
                      
                    } catch (error) {
                      console.error('Error deleting sale:', error);
                      notify({ 
                        title: "Lỗi", 
                        description: "Không thể xóa sale. Vui lòng thử lại.",
                        variant: "destructive" 
                      });
                    }
                  }}
                >
                  Xóa sale
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenSale(false)}>
                Hủy
              </Button>
              <Button 
                onClick={async () => {
                  if (!saleTarget) return;
                  
                  try {
                    const { instructorApi } = await import('@/services/instructorApi');
                    
                    await instructorApi.sales.createOrUpdateSale(saleTarget.id, {
                      saleType: saleForm.saleType,
                      value: Number(saleForm.value),
                      startDate: saleForm.startDate,
                      endDate: saleForm.endDate,
                    });
                    
                    notify({ 
                      title: "Thành công", 
                      description: "Sale đã được lưu thành công",
                      variant: "success" 
                    });
                    setOpenSale(false);
                    
                    // Refresh the courses list to show updated sale info
                    // The useCourseList hook should automatically refetch
                    
                  } catch (error) {
                    console.error('Error saving sale:', error);
                    notify({ 
                      title: "Lỗi", 
                      description: "Không thể lưu sale. Vui lòng thử lại.",
                      variant: "destructive" 
                    });
                  }
                }}
                disabled={!saleForm.value || !saleForm.startDate || !saleForm.endDate}
              >
                Lưu sale
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

