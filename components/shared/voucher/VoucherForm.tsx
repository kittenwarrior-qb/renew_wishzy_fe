"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Switch from "@/components/ui/switch"
import type { VoucherType, VoucherApplyScope } from "@/types/voucher"
import { useCategoryList } from "@/components/shared/category/useCategory"
import { useCourseList } from "@/components/shared/course/useCourse"
import TextForm, { TextFieldConfig } from "@/components/shared/common/TextForm"
import { toUpperNoSpaces, onlyDigits, required, minLength, percentRange, datesOrder, greaterThan } from "@/lib/validators"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { maskDDMMYYYY, parseDDMMYYYY, fmtDDMMYYYY, validateDateRange, toVndGrouped, formatVndText, toNumberFromGrouped, validateDiscountValue } from "@/components/shared/voucher/validate"

export type VoucherFormValue = {
  code: string
  name: string
  discountType: VoucherType
  discountValue: number | ''
  maxDiscountAmount?: number | ''
  minOrderAmount?: number | ''
  perUserLimit?: number | ''
  totalLimit?: number | ''
  applyScope: VoucherApplyScope
  categoryId?: string
  courseId?: string
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
}

export function VoucherForm({ value, onChange, error }: {
  value: VoucherFormValue
  onChange: (v: VoucherFormValue) => void
  error?: Partial<Record<keyof VoucherFormValue, string>>
}) {
  const showCategory = value.applyScope === 'category'
  const showCourse = value.applyScope === 'course'

  const { data: catData } = useCategoryList({ page: 1, limit: 1000 })
  const { data: courseData } = useCourseList({ page: 1, limit: 1000 })
  const [catCombOpen, setCatCombOpen] = React.useState(false)
  const [courseCombOpen, setCourseCombOpen] = React.useState(false)
  const [catSearch, setCatSearch] = React.useState("")
  const [courseSearch, setCourseSearch] = React.useState("")
  const catOptions = React.useMemo(() => {
    const list = (catData?.data ?? []) as any[]
    const q = catSearch.trim().toLowerCase()
    return q ? list.filter(x => String(x.name || "").toLowerCase().includes(q)) : list
  }, [catData, catSearch])
  const courseOptions = React.useMemo(() => {
    const list = (courseData?.data ?? []) as any[]
    const q = courseSearch.trim().toLowerCase()
    return q ? list.filter(x => String(x.name || "").toLowerCase().includes(q)) : list
  }, [courseData, courseSearch])

  const startInputRef = React.useRef<HTMLInputElement | null>(null)
  const endInputRef = React.useRef<HTMLInputElement | null>(null)

  // helpers are imported from validate.ts

  const textFields = React.useMemo<TextFieldConfig[]>(() => [
    {
      name: 'code',
      label: 'Mã voucher',
      placeholder: 'VD: WISH10',
      format: toUpperNoSpaces,
      validate: (v) => required('Vui lòng nhập mã voucher')(v) || minLength(3, 'Phải ít nhất 3 ký tự')(v),
      colSpanMd: 6,
      inputProps: { className: 'h-9' },
    },
    {
      name: 'name',
      label: 'Tên chương trình',
      placeholder: 'Summer Sale 2025',
      validate: (v) => required('Bắt buộc')(v),
      colSpanMd: 6,
    },
    {
      name: 'maxDiscountAmount',
      label: 'Giảm tối đa (₫)',
      placeholder: 'Ví dụ: 50000',
      format: formatVndText,
      validate: (v) => v === '' ? undefined : greaterThan(0, 'Phải lớn hơn 0')(v),
      colSpanMd: 6,
      inputProps: { className: 'h-9' },
    },
    {
      name: 'minOrderAmount',
      label: 'Đơn tối thiểu (₫)',
      placeholder: 'Ví dụ: 200000',
      format: formatVndText,
      validate: (v) => v === '' ? undefined : greaterThan(0, 'Phải lớn hơn 0')(v),
      colSpanMd: 6,
      inputProps: { className: 'h-9' },
    },
    {
      name: 'perUserLimit',
      label: 'Giới hạn/người',
      placeholder: '>= 1',
      format: onlyDigits,
      validate: (v) => v === '' ? 'Bắt buộc' : greaterThan(0, 'Phải >= 1')(v),
      colSpanMd: 6,
      inputProps: { className: 'h-9' },
    },
    {
      name: 'totalLimit',
      label: 'Tổng lượt dùng',
      placeholder: '>= 1',
      format: onlyDigits,
      validate: (v) => v === '' ? undefined : greaterThan(0, 'Phải >= 1')(v),
      colSpanMd: 6,
      inputProps: { className: 'h-9' },
    },
  ], [value.discountType])

  return (
    <div className="space-y-3">
      <TextForm
        fields={textFields}
        initialValues={{
          code: value.code ?? '',
          name: value.name ?? '',
          maxDiscountAmount: value.maxDiscountAmount === '' || value.maxDiscountAmount == null ? '' : toVndGrouped(Number(value.maxDiscountAmount)),
          minOrderAmount: value.minOrderAmount === '' || value.minOrderAmount == null ? '' : toVndGrouped(Number(value.minOrderAmount)),
          perUserLimit: value.perUserLimit === '' || value.perUserLimit == null ? '' : onlyDigits(String(value.perUserLimit)),
          totalLimit: value.totalLimit === '' || value.totalLimit == null ? '' : onlyDigits(String(value.totalLimit)),
        }}
        onChange={(vals) =>
          onChange({
            ...value,
            code: (vals.code ?? '').toUpperCase(),
            name: vals.name ?? '',
            maxDiscountAmount: vals.maxDiscountAmount === '' ? '' : toNumberFromGrouped(vals.maxDiscountAmount),
            minOrderAmount: vals.minOrderAmount === '' ? '' : toNumberFromGrouped(vals.minOrderAmount),
            perUserLimit: vals.perUserLimit === '' ? '' : toNumberFromGrouped(vals.perUserLimit),
            totalLimit: vals.totalLimit === '' ? '' : toNumberFromGrouped(vals.totalLimit),
          })
        }
      />

      {(() => {
        const rawDV = value.discountValue
        const numDV = rawDV === '' || rawDV == null ? '' : Number(rawDV)
        const dvStr = value.discountType === 'fixed'
          ? toVndGrouped(numDV === '' ? '' : numDV)
          : (numDV === '' ? '' : String(numDV))
        const dvErr = validateDiscountValue(value.discountType, dvStr)
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Loại giảm</Label>
              <Select value={value.discountType} onValueChange={(v: VoucherType) => onChange({ ...value, discountType: v })}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Phần trăm</SelectItem>
                  <SelectItem value="fixed">Số tiền</SelectItem>
                </SelectContent>
              </Select>
              {error?.discountType ? (
                <p className="text-xs text-destructive mt-1">{error.discountType}</p>
              ) : (
                <p className="text-xs min-h-4 leading-4 text-transparent">\u00A0</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{`Giá trị ${value.discountType === 'percent' ? '(%)' : '(₫)'}`}</Label>
              <Input
                value={dvStr}
                onChange={(e) => {
                  const digits = (e.target.value || '').replace(/[^0-9]/g, '')
                  onChange({ ...value, discountValue: digits === '' ? '' : Number(digits) })
                }}
                placeholder={value.discountType === 'percent' ? '1 - 100' : 'Ví dụ: 10000'}
                className="h-9 w-full"
                inputMode="numeric"
              />
              <p className={`text-xs min-h-4 leading-4 ${dvErr ? 'text-destructive' : 'text-transparent'}`}>{dvErr || '\u00A0'}</p>
            </div>
          </div>
        )
      })()}

      {(() => {
        const startRaw = value.startDate ?? ''
        const endRaw = value.endDate ?? ''
        const start = startRaw && startRaw.includes('-') ? fmtDDMMYYYY(new Date(startRaw)) : startRaw
        const end = endRaw && endRaw.includes('-') ? fmtDDMMYYYY(new Date(endRaw)) : endRaw
        const sd = parseDDMMYYYY(start)
        const ed = parseDDMMYYYY(end)
        const dateErr = validateDateRange(start, end)

        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Bắt đầu</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Input
                        ref={startInputRef}
                        value={start}
                        onChange={(e) => onChange({ ...value, startDate: maskDDMMYYYY(e.target.value) || null })}
                        onFocus={(e) => e.currentTarget.select()}
                        placeholder="dd/mm/yyyy"
                        className="h-9 w-full pr-9"
                        inputMode="numeric"
                        pattern="\\d{1,2}/\\d{1,2}/\\d{4}"
                        aria-describedby={dateErr ? 'date-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => startInputRef.current?.focus()}
                        className="absolute inset-y-0 right-2 my-auto h-5 w-5 text-muted-foreground hover:text-foreground"
                        aria-label="Chọn ngày bắt đầu"
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0" sideOffset={4}>
                    <Calendar
                      mode="single"
                      selected={sd ?? undefined}
                      onSelect={(d) => onChange({ ...value, startDate: d ? fmtDDMMYYYY(d) : null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Kết thúc</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Input
                        ref={endInputRef}
                        value={end}
                        onChange={(e) => onChange({ ...value, endDate: maskDDMMYYYY(e.target.value) || null })}
                        onFocus={(e) => e.currentTarget.select()}
                        placeholder="dd/mm/yyyy"
                        className="h-9 w-full pr-9"
                        inputMode="numeric"
                        pattern="\\d{1,2}/\\d{1,2}/\\d{4}"
                        aria-describedby={dateErr ? 'date-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => endInputRef.current?.focus()}
                        className="absolute inset-y-0 right-2 my-auto h-5 w-5 text-muted-foreground hover:text-foreground"
                        aria-label="Chọn ngày kết thúc"
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0" sideOffset={4}>
                    <Calendar
                      mode="single"
                      selected={ed ?? undefined}
                      onSelect={(d) => onChange({ ...value, endDate: d ? fmtDDMMYYYY(d) : null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {dateErr ? (
              <p id="date-error" className="text-xs min-h-4 leading-4 text-destructive">{dateErr}</p>
            ) : (
              <p className="text-xs min-h-4 leading-4 text-transparent">&nbsp;</p>
            )}
          </div>
        )
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Phạm vi áp dụng</Label>
          <Select value={value.applyScope} onValueChange={(v: VoucherApplyScope) => {
            onChange({ ...value, applyScope: v, categoryId: v === 'category' ? value.categoryId : '', courseId: v === 'course' ? value.courseId : '' })
          }}>
            <SelectTrigger className="h-9 w-full max-w-[200px]">
              <SelectValue placeholder="Chọn phạm vi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="category">Theo danh mục</SelectItem>
              <SelectItem value="course">Theo khoá học</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {showCategory ? (
          <div className="space-y-2 w-full">
            <Label>Danh mục</Label>
            <Popover open={catCombOpen} onOpenChange={setCatCombOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 w-full max-w-[200px] justify-between">
                  <span className="truncate text-left">
                    {String((catOptions.find(c => String(c.id) === String(value.categoryId))?.name) || 'Chọn danh mục')}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[300px] p-2">
                <Input
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Tìm danh mục..."
                  className="h-9 mb-2"
                />
                <div className="max-h-56 overflow-auto">
                  {(catOptions ?? []).map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-accent rounded ${String(value.categoryId) === String(c.id) ? 'bg-accent' : ''}`}
                      onClick={() => { onChange({ ...value, categoryId: String(c.id) }); setCatCombOpen(false) }}
                    >{c.name}</button>
                  ))}
                  {catOptions.length === 0 ? (
                    <div className="px-3 py-2 text-muted-foreground text-sm">Không có kết quả</div>
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : showCourse ? (
          <div className="space-y-2 w-full">
            <Label>Khoá học</Label>
            <Popover open={courseCombOpen} onOpenChange={setCourseCombOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 w-full max-w-[200px] justify-between">
                  <span className="truncate text-left">
                    {String((courseOptions.find(c => String(c.id) === String(value.courseId))?.name) || 'Chọn khoá học')}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[300px] p-2">
                <Input
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Tìm khoá học..."
                  className="h-9 mb-2"
                />
                <div className="max-h-56 overflow-auto">
                  {(courseOptions ?? []).map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-accent rounded ${String(value.courseId) === String(c.id) ? 'bg-accent' : ''}`}
                      onClick={() => { onChange({ ...value, courseId: String(c.id) }); setCourseCombOpen(false) }}
                    >{c.name}</button>
                  ))}
                  {courseOptions.length === 0 ? (
                    <div className="px-3 py-2 text-muted-foreground text-sm">Không có kết quả</div>
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : <div />}
        <div className="flex items-center gap-2 pt-2">
          <p className="text-sm">Kích hoạt</p>
          <Switch checked={!!value.isActive} onCheckedChange={(c: boolean) => onChange({ ...value, isActive: c })} />
        </div>
      </div>
    </div>
  )
}
