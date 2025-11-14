"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { uploadImage } from "@/services/uploads"
import UploadProgressOverlay from "@/components/shared/upload/UploadProgressOverlay"
import { notify } from "@/components/shared/admin/Notifications"

export type BannerFormValue = {
    title: string
    imageUrl: string
    link: string
    position: number | ''
}

export function BannerForm({ value, onChange, error }: {
    value: BannerFormValue
    onChange: (v: BannerFormValue) => void
    error?: Partial<Record<keyof BannerFormValue, string>>
}) {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)
    const [uploading, setUploading] = React.useState(false)
    const [uploadProgress, setUploadProgress] = React.useState(0)
    const [localPreview, setLocalPreview] = React.useState<string | null>(null)

    const MAX_IMAGE_MB = 5
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

    const tryUpload = async (file: File) => {
        try {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                notify({ title: 'Định dạng không hỗ trợ', description: 'Vui lòng chọn JPG, PNG, WEBP', variant: 'destructive' })
                return
            }
            if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
                notify({ title: 'Tệp quá lớn', description: `Dung lượng tối đa ${MAX_IMAGE_MB}MB`, variant: 'destructive' })
                return
            }
            try {
                const objUrl = URL.createObjectURL(file)
                setLocalPreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev)
                    return objUrl
                })
            } catch { }
            setUploading(true)
            setUploadProgress(0)
            const { url } = await uploadImage(file, '/uploads/image', { fieldName: 'file', onProgress: (p) => setUploadProgress(p) })
            if (!url) throw new Error('Upload không trả về URL')
            onChange({ ...value, imageUrl: url })
            notify({ title: 'Tải ảnh thành công', variant: 'success' })
        } catch (e: any) {
            notify({ title: 'Lỗi upload', description: String(e?.message || 'Không thể tải ảnh'), variant: 'destructive' })
        } finally {
            setUploading(false)
        }
    }

    React.useEffect(() => {
        if (value.imageUrl && localPreview) {
            URL.revokeObjectURL(localPreview)
            setLocalPreview(null)
        }
        return () => {
            if (localPreview) URL.revokeObjectURL(localPreview)
        }
    }, [value.imageUrl])

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="banner-title">Tiêu đề</Label>
                <Input
                    id="banner-title"
                    value={value.title}
                    onChange={(e) => onChange({ ...value, title: e.target.value })}
                    placeholder="Tiêu đề banner"
                />
                {error?.title ? <p className="text-xs text-destructive mt-1">{error.title}</p> : null}
            </div>
            <div className="space-y-2">
                <Label>Ảnh</Label>
                <button
                    type="button"
                    aria-label="Tải ảnh"
                    className="group relative cursor-pointer w-full aspect-[21/9] min-h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex items-center justify-center overflow-hidden hover:bg-muted/20 hover:ring-2 hover:ring-primary/20 transition"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {localPreview || value.imageUrl ? (
                        <img src={localPreview || value.imageUrl} alt="banner" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Upload className="h-8 w-8" />
                            <span className="text-sm font-medium">Tải ảnh</span>
                            <span className="text-[11px] text-muted-foreground/80">JPG, PNG, WEBP · ≤ {MAX_IMAGE_MB}MB</span>
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
                    onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) void tryUpload(f)
                    }}
                />
                {value.imageUrl ? (
                    <a href={value.imageUrl} className="block text-xs underline" target="_blank" rel="noreferrer">Mở ảnh trong tab mới</a>
                ) : null}
                {error?.imageUrl ? <p className="text-xs text-destructive mt-1">{error.imageUrl}</p> : null}
            </div>
            <div className="space-y-2">
                <Label htmlFor="banner-link">Liên kết</Label>
                <Input
                    id="banner-link"
                    value={value.link}
                    onChange={(e) => onChange({ ...value, link: e.target.value })}
                    placeholder="https://..."
                />
                {error?.link ? <p className="text-xs text-destructive mt-1">{error.link}</p> : null}
            </div>
            <div className="space-y-2">
                <Label htmlFor="banner-position">Vị trí</Label>
                <Input
                    id="banner-position"
                    type="number"
                    value={value.position}
                    onChange={(e) => onChange({ ...value, position: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="Thứ tự hiển thị"
                />
                {error?.position ? <p className="text-xs text-destructive mt-1">{error.position}</p> : null}
            </div>
        </div>
    )
}
