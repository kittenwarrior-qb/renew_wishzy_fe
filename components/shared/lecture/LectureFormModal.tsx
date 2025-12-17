"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Switch from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play } from "lucide-react";
import { useUnsavedChanges } from "@/components/shared/course/CourseForm";
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog";
import UploadProgressOverlay from "@/components/shared/upload/UploadProgressOverlay";
import { uploadVideo } from "@/services/uploads";
import { notify } from "@/components/shared/admin/Notifications";
import { formatDuration } from "@/lib/format-duration";

export type LectureFormValue = {
  name: string;
  description?: string;
  fileUrl: string;
  duration: string;
  isPreview: boolean;
  orderIndex: string;
  thumbnailUrl?: string;
};

export function LectureFormModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
  defaultValue,
  title = "Thêm bài học",
  lectures = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    name: string;
    description?: string;
    fileUrl: string;
    duration: number;
    isPreview?: boolean;
    orderIndex: number;
  }) => void;
  loading?: boolean;
  defaultValue?: Partial<LectureFormValue>;
  title?: string;
  lectures?: Array<{ id: string; name: string; orderIndex: number }>;
}) {
  const [form, setForm] = React.useState<LectureFormValue>({
    name: "",
    description: "",
    fileUrl: "",
    duration: "",
    isPreview: false,
    orderIndex: "",
    thumbnailUrl: "",
    ...(defaultValue || {}),
  });
  const [errors, setErrors] = React.useState<{
    [k in keyof LectureFormValue]?: string;
  }>({});
  const [dirty, setDirty] = React.useState(false);
  const [openDiscard, setOpenDiscard] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedName, setSelectedName] = React.useState<string>("");
  const [selectedSize, setSelectedSize] = React.useState<number>(0);
  useUnsavedChanges(dirty && open);

  const MAX_VIDEO_MB = 500;
  const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-matroska", // mkv
  ];

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleSelectFile = async (file: File) => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, fileUrl: "Định dạng không hỗ trợ" }));
      notify({
        title: "Định dạng không hỗ trợ",
        description: "Vui lòng chọn video MP4, WEBM, OGG, MOV, hoặc MKV",
        variant: "destructive",
      });
      return;
    }
    const maxBytes = MAX_VIDEO_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrors((prev) => ({
        ...prev,
        fileUrl: `Dung lượng tối đa ${MAX_VIDEO_MB}MB`,
      }));
      notify({
        title: "Tệp quá lớn",
        description: `Dung lượng tối đa ${MAX_VIDEO_MB}MB`,
        variant: "destructive",
      });
      return;
    }
    setErrors((prev) => ({ ...prev, fileUrl: undefined }));
    await handleFileUpload(
      file,
      setUploading,
      setUploadProgress,
      setErrors,
      (k, v) => {
        setField(k, v);
        setDirty(true);
      },
      setSelectedName,
      setSelectedSize,
      (v) => {
        setField("duration", v);
        setDirty(true);
      }
    );
  };

  React.useEffect(() => {
    if (open && defaultValue) {
      setForm({
        name: defaultValue?.name ?? "",
        description: defaultValue?.description ?? "",
        fileUrl: defaultValue?.fileUrl ?? "",
        duration: defaultValue?.duration ?? "",
        isPreview: defaultValue?.isPreview ?? false,
        orderIndex: defaultValue?.orderIndex ?? "",
        thumbnailUrl: defaultValue?.thumbnailUrl ?? "",
      });
      setErrors({});
      setDirty(false);
      setSelectedName("");
      setSelectedSize(0);
    } else if (open && !defaultValue) {
      // Reset form for create mode
      setForm({
        name: "",
        description: "",
        fileUrl: "",
        duration: "",
        isPreview: false,
        orderIndex: "",
        thumbnailUrl: "",
      });
      setErrors({});
      setDirty(false);
      setSelectedName("");
      setSelectedSize(0);
    }
  }, [open, defaultValue]);

  const setField = (k: keyof LectureFormValue, v: string | boolean) => {
    console.log(`setField: ${k} =`, v);
    setForm((prev) => ({ ...prev, [k]: v as any }));
    setDirty(true);
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const next: { [k in keyof LectureFormValue]?: string } = {};
    const name = form.name.trim();
    if (!name) next.name = "Tên bài học là bắt buộc";
    else if (name.length > 255) next.name = "Tên tối đa 255 ký tự";

    const fileUrl = form.fileUrl.trim();
    if (!fileUrl) {
      next.fileUrl = "Video là bắt buộc";
    } else if (!fileUrl.startsWith('http')) {
      next.fileUrl = "URL video không hợp lệ";
      console.error("❌ Invalid video URL:", fileUrl);
    }

    // Duration is auto-filled from video, but still validate it exists
    if (!form.duration || form.duration === "") {
      next.fileUrl = "Vui lòng đợi video tải lên hoàn tất";
    } else {
      const d = Number(form.duration);
      if (Number.isNaN(d) || d <= 0)
        next.fileUrl = "Thời lượng video không hợp lệ";
    }

    // orderIndex is optional, if not set, will be added at the end
    if (form.orderIndex !== "" && form.orderIndex !== undefined) {
      const o = Number(form.orderIndex);
      if (!Number.isInteger(o) || o < 0)
        next.orderIndex = "Vị trí không hợp lệ";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    // Determine orderIndex based on mode
    let orderIndex: number;
    if (defaultValue) {
      // Edit mode: keep existing orderIndex
      orderIndex = Number(form.orderIndex);
    } else {
      // Create mode: use selected position or default to end
      orderIndex =
        form.orderIndex !== "" && form.orderIndex !== undefined
          ? Number(form.orderIndex)
          : lectures.length;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      fileUrl: form.fileUrl.trim(),
      duration: Number(form.duration),
      isPreview: !!form.isPreview,
      orderIndex,
    };
    console.log("Submitting lecture payload:", payload);
    onSubmit(payload);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && dirty) {
          setOpenDiscard(true);
          return;
        }
        onOpenChange(o);
        if (!o) {
          setErrors({});
          setDirty(false);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-2">
            <Label htmlFor="l-name">
              Tên bài học<span className="text-destructive">*</span>
            </Label>
            <Input
              id="l-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ví dụ: Bài 1: Giới thiệu"
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-desc">Mô tả</Label>
            <Textarea
              id="l-desc"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Mô tả ngắn cho bài học"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>
              Video<span className="text-destructive">*</span>
            </Label>
            <div
              className={`relative rounded-md border-2 ${
                isDragging
                  ? "border-primary cursor-pointer bg-primary/5"
                  : "border-dashed cursor-pointer border-muted-foreground/40"
              } p-4 text-center transition`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) await handleSelectFile(f);
              }}
              onClick={() => {
                if (!uploading) fileInputRef.current?.click();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (uploading) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div className="text-sm">
                  {form.fileUrl
                    ? "Đã chọn video · Click để chọn lại"
                    : "Kéo thả hoặc click để chọn video"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Hỗ trợ: MP4, WEBM, OGG, MOV, MKV · Tối đa {MAX_VIDEO_MB}MB
                </div>
                {selectedName ? (
                  <div className="mt-1 text-xs">
                    <span className="font-medium">{selectedName}</span>
                    {selectedSize ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {formatBytes(selectedSize)}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {form.fileUrl ? (
                  <div className="mt-3 w-full space-y-2">
                    {form.thumbnailUrl ? (
                      <div className="relative rounded-md overflow-hidden bg-black">
                        <img
                          src={form.thumbnailUrl}
                          alt="Video thumbnail"
                          className="w-full max-h-64 object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-black ml-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <video
                        src={form.fileUrl}
                        controls
                        className="w-full max-h-64 rounded-md bg-black"
                        preload="metadata"
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ Video đã có sẵn
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(form.fileUrl, "_blank");
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Mở video
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
              {uploading ? (
                <UploadProgressOverlay progress={uploadProgress} />
              ) : null}
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept="video/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  await handleSelectFile(f);
                }}
              />
            </div>
            {errors.fileUrl ? (
              <p className="text-sm text-destructive">{errors.fileUrl}</p>
            ) : null}
          </div>
          <div className="space-y-4">
            {!defaultValue && (
              <div className="space-y-2">
                <Label htmlFor="l-position">Vị trí</Label>
                <Select
                  value={form.orderIndex}
                  onValueChange={(value) => setField("orderIndex", value)}
                >
                  <SelectTrigger id="l-position" className="w-full">
                    <SelectValue placeholder="Thêm vào cuối danh sách" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Thêm vào đầu danh sách</span>
                      </div>
                    </SelectItem>
                    {lectures.length > 0 &&
                      lectures.map((lecture, index) => (
                        <SelectItem
                          key={lecture.id}
                          value={(index + 1).toString()}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            <span className="text-muted-foreground text-xs">
                              Sau
                            </span>
                            <span className="font-medium">
                              {index + 1}. {lecture.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.orderIndex ? (
                  <p className="text-sm text-destructive">
                    {errors.orderIndex}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {lectures.length > 0
                    ? "Chọn vị trí để chèn bài học mới vào danh sách"
                    : "Bài học này sẽ là bài học đầu tiên trong chương"}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch
                id="l-preview"
                checked={form.isPreview}
                onCheckedChange={(v: boolean) => setField("isPreview", v)}
              />
              <Label htmlFor="l-preview">Cho phép xem trước miễn phí</Label>
            </div>
          </div>
          {form.duration && (
            <div className="text-sm text-muted-foreground">
              Thời lượng video: {formatDuration(Number(form.duration), "long")}
            </div>
          )}
        </div>
        <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => {
              if (dirty) setOpenDiscard(true);
              else onOpenChange(false);
            }}
          >
            Huỷ
          </Button>
          <Button onClick={submit} disabled={!!loading || uploading}>
            {loading
              ? "Đang lưu..."
              : uploading
              ? `Đang tải lên ${uploadProgress}%`
              : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <ConfirmDialog
        open={openDiscard}
        onOpenChange={setOpenDiscard}
        title="Bỏ thay đổi?"
        description={
          <span>Bạn có thay đổi chưa lưu. Bỏ thay đổi và đóng?</span>
        }
        confirmText="Bỏ thay đổi"
        position="top"
        onConfirm={() => {
          setOpenDiscard(false);
          setErrors({});
          setDirty(false);
          onOpenChange(false);
        }}
      />
    </Dialog>
  );
}

async function handleFileUpload(
  file: File,
  setUploading: (v: boolean) => void,
  setUploadProgress: (p: number) => void,
  setErrors: React.Dispatch<
    React.SetStateAction<{ [k in keyof LectureFormValue]?: string }>
  >,
  setField: (k: keyof LectureFormValue, v: string | boolean) => void,
  setSelectedName: (v: string) => void,
  setSelectedSize: (v: number) => void,
  setFormDuration: (v: string) => void
) {
  setUploading(true);
  setUploadProgress(0);
  try {
    const result = await uploadVideo(file, "/uploads/video", {
      onProgress: (p) => setUploadProgress(p),
    });

    console.log("Upload video result:", result);

    const videoUrl = result.url || (result as any).videoUrl;
    const thumbnailUrl = (result as any).thumbnailUrl || "";
    console.log("Extracted videoUrl:", videoUrl);
    console.log("Extracted thumbnailUrl:", thumbnailUrl);

    if (!videoUrl) {
      console.error("No video URL in response:", result);
      throw new Error("Không nhận được URL video từ server");
    }

    setField("fileUrl", videoUrl);
    if (thumbnailUrl) {
      setField("thumbnailUrl", thumbnailUrl);
    }
    setSelectedName((file as any).name || "video");
    setSelectedSize(file.size || 0);

    if (
      typeof result.durationSeconds === "number" &&
      result.durationSeconds > 0
    ) {
      setFormDuration(String(Math.round(result.durationSeconds)));
    } else {
      try {
        const videoEl = document.createElement("video");
        videoEl.preload = "metadata";
        videoEl.onloadedmetadata = () => {
          const duration = videoEl.duration;
          if (duration && duration > 0) {
            setFormDuration(String(Math.round(duration)));
          }
          URL.revokeObjectURL(videoEl.src);
        };
        videoEl.src = URL.createObjectURL(file);
      } catch (err) {
        console.warn("Could not extract video duration from file:", err);
      }
    }
  } catch (err: any) {
    console.error("❌ Video upload failed:", err);
    const errorMessage = err?.message || "Tải video thất bại";
    setErrors((prev) => ({ ...prev, fileUrl: errorMessage }));
    notify({
      title: "Tải video thất bại",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setUploading(false);
  }
}
