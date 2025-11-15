"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { notify } from "@/components/shared/admin/Notifications"
import { Upload } from "lucide-react"
import api from "@/services/api"
import { uploadImage } from "@/services/uploads"
import UploadProgressOverlay from "@/components/shared/upload/UploadProgressOverlay"
import Switch from "@/components/ui/switch"
export { useUnsavedChanges } from "@/hooks/useUnsavedChanges"

export type CourseFormValue = {
    name: string
    categoryId: string
    level: 'beginner' | 'intermediate' | 'advanced'
    price: number
    totalDuration: number
    status: boolean
    thumbnail?: string
    description?: string
    notes?: string
}

export type Course = CourseFormValue & { id: string }

export function CourseForm({
    value,
    onChange,
    categories,
    loading,
    onSubmit,
    onDirtyChange,
}: {
    value: CourseFormValue
    onChange: (v: CourseFormValue) => void
    categories: Array<{ id: string; name: string }>
    loading?: boolean
    onSubmit: () => void
    onDirtyChange?: (dirty: boolean) => void
}) {
    const [touched, setTouched] = React.useState<Record<string, boolean>>({})
    const [uploading, setUploading] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)
    const [uploadProgress, setUploadProgress] = React.useState(0)

    const setField = <K extends keyof CourseFormValue>(k: K, val: CourseFormValue[K]) => {
        onChange({ ...value, [k]: val })
        onDirtyChange?.(true)
    }

    const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

    const errors = React.useMemo(() => {
        const errs: Record<string, string> = {}
        if (!value.name?.trim()) errs.name = 'Bắt buộc'
        if (!value.categoryId) errs.categoryId = 'Bắt buộc'
        if (!value.level) errs.level = 'Bắt buộc'
        if (value.price == null || value.price < 0) errs.price = 'Giá không hợp lệ'
        if (value.totalDuration == null || value.totalDuration < 0) errs.totalDuration = 'Thời lượng không hợp lệ'
        return errs
    }, [value])

    const MAX_IMAGE_MB = 5
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

    const tryUpload = async (file: File) => {
        try {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                const readable = ['JPG', 'PNG', 'WEBP']
                notify({ title: 'Định dạng không hỗ trợ', description: `Vui lòng chọn ${readable.join(', ')}`, variant: 'destructive' })
                return
            }
            if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
                notify({ title: 'Tệp quá lớn', description: `Dung lượng tối đa ${MAX_IMAGE_MB}MB`, variant: 'destructive' })
                return
            }
            setUploading(true)
            setUploadProgress(0)
            const { url } = await uploadImage(file, '/uploads/avatar', { fieldName: 'file', onProgress: (p) => setUploadProgress(p) })
            if (!url) throw new Error('Upload không trả về URL')
            setField('thumbnail', url)
            notify({ title: 'Tải ảnh thành công', variant: 'success' })
        } catch (e: any) {
            notify({ title: 'Lỗi upload', description: String(e?.message || 'Không thể tải ảnh'), variant: 'destructive' })
        } finally {
            setUploading(false)
        }
    }

    const PriceInput: React.FC<{
        value: number
        onChange: (n: number) => void
        loading?: boolean
        error?: string
        touched?: boolean
    }> = ({ value: priceVal, onChange, loading: priceLoading, error, touched }) => {
        return (
            <div>
                <label className="mb-1 block text-sm font-medium">Giá (VND)</label>
                <div className="relative">
                    <Input
                        className="pr-7"
                        inputMode="numeric"
                        value={formatVND(priceVal || 0)}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, '')
                            const num = raw ? parseInt(raw, 10) : 0
                            onChange(num)
                        }}
                        placeholder="0"
                        disabled={priceLoading}
                        aria-invalid={!!error}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₫</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {([0, 99000, 149000, 199000, 299000, 499000, 999000, 1999000] as number[]).map((amt) => (
                        <Button
                            key={amt}
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={priceLoading}
                            onClick={() => onChange(amt)}
                            className="h-7 cursor-pointer px-2 text-xs"
                        >
                            {formatVND(amt)}₫
                        </Button>
                    ))}
                </div>
                {touched && error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4 rounded-lg border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Tên</label>
                            <Input
                                value={value.name || ''}
                                onChange={(e) => setField('name', e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                                placeholder="Tên khoá học"
                                disabled={loading}
                                aria-invalid={!!errors.name}
                            />
                            {touched.name && errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name}</p> : null}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Danh mục</label>
                            <Select value={value.categoryId || undefined} onValueChange={(v) => setField('categoryId', v as any)}>
                                <SelectTrigger disabled={loading}><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={String((c as any).id)} value={String((c as any).id)}>{(c as any).name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {touched.categoryId && errors.categoryId ? <p className="mt-1 text-xs text-destructive">{errors.categoryId}</p> : null}
                        </div>
                        <div>
                            <PriceInput
                                value={value.price || 0}
                                onChange={(n) => {
                                    setField('price', n)
                                    setTouched((t) => ({ ...t, price: true }))
                                }}
                                loading={loading}
                                error={errors.price}
                                touched={!!touched.price}
                            />
                        </div>
                        <div className="d-flex flex-column gap-2">
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium">Cấp độ</label>
                                <Select value={value.level} onValueChange={(v) => setField('level', v as any)}>
                                    <SelectTrigger disabled={loading}>
                                        <SelectValue placeholder="Chọn cấp độ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                                {touched.level && errors.level ? (
                                    <p className="mt-1 text-xs text-destructive">{errors.level}</p>
                                ) : null}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Tổng thời lượng (phút)</label>
                                <Input
                                    type="number"
                                    value={value.totalDuration as any}
                                    onChange={(e) => setField('totalDuration', Number(e.target.value || 0))}
                                    onBlur={() => setTouched((t) => ({ ...t, totalDuration: true }))}
                                    placeholder="0"
                                    disabled={loading}
                                    aria-invalid={!!errors.totalDuration}
                                />
                                {touched.totalDuration && errors.totalDuration ? (
                                    <p className="mt-1 text-xs text-destructive">{errors.totalDuration}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Mô tả</label>
                            {typeof window !== 'undefined' && (window as any).__CKE__?.CKEditor && (window as any).__CKE__?.ClassicEditor ? (
                                React.createElement((window as any).__CKE__.CKEditor, {
                                    editor: (window as any).__CKE__.ClassicEditor,
                                    data: value.description || '',
                                    disabled: loading,
                                    onReady: (editor: any) => {
                                        const root = editor?.editing?.view?.document?.getRoot?.()
                                        if (root) editor.editing.view.change((writer: any) => {
                                            writer.setStyle('min-height', '500px', root)
                                            writer.setStyle('height', '500px', root)
                                        })
                                    },
                                    onChange: (_e: any, editor: any) => setField('description', editor.getData()),
                                })
                            ) : (
                                <Textarea className="h-[500px]" value={value.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="Mô tả ngắn" disabled={loading} />
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Ghi chú</label>
                            {typeof window !== 'undefined' && (window as any).__CKE__?.CKEditor && (window as any).__CKE__?.ClassicEditor ? (
                                React.createElement((window as any).__CKE__.CKEditor, {
                                    editor: (window as any).__CKE__.ClassicEditor,
                                    data: value.notes || '',
                                    disabled: loading,
                                    onReady: (editor: any) => {
                                        const root = editor?.editing?.view?.document?.getRoot?.()
                                        if (root) editor.editing.view.change((writer: any) => writer.setStyle('min-height', '500px', root))
                                    },
                                    onChange: (_e: any, editor: any) => setField('notes', editor.getData()),
                                })
                            ) : (
                                <Textarea className="h-[500px]" value={value.notes || ''} onChange={(e) => setField('notes', e.target.value)} placeholder="Ghi chú..." disabled={loading} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border p-4 h-fit">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Trạng thái</label>
                            <div className="text-[12px] text-muted-foreground">{value.status ? 'Xuất bản' : 'Nháp'}</div>
                        </div>
                        <Switch checked={!!value.status} onCheckedChange={(v) => setField('status', v)} disabled={loading || uploading} aria-label="Trạng thái" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Ảnh đại diện</label>
                        <div className="space-y-2">
                            <button
                                type="button"
                                aria-label="Tải ảnh"
                                className="group relative cursor-pointer w-full aspect-video min-h-64 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex items-center justify-center overflow-hidden hover:bg-muted/20 hover:ring-2 hover:ring-primary/20 transition"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                            >
                                {value.thumbnail ? (
                                    <img src={value.thumbnail} alt="thumbnail" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Upload className="h-8 w-8" />
                                        <span className="text-sm font-medium">Tải ảnh</span>
                                        <span className="text-[11px] text-muted-foreground/80">JPG, PNG, WEBP · ≤ 5MB</span>
                                    </div>
                                )}
                                {uploading ? (
                                    <UploadProgressOverlay progress={uploadProgress} />
                                ) : (
                                    <div className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-2 bg-black/30 text-white group-hover:flex">
                                        <Upload className="h-5 w-5" />
                                        <span className="text-xs font-medium">Đổi ảnh</span>
                                    </div>
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                className="hidden"
                                type="file"
                                accept="image/*"
                                disabled={loading || uploading}
                                onChange={(e) => {
                                    const f = e.target.files?.[0]
                                    if (f) void tryUpload(f)
                                }}
                            />
                            {value.thumbnail ? (
                                <a href={value.thumbnail} className="block text-xs underline" target="_blank" rel="noreferrer">Mở ảnh trong tab mới</a>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}
