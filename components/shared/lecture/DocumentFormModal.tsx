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
import { FileText, Upload, ExternalLink, X } from "lucide-react";
import { useUnsavedChanges } from "@/components/shared/course/CourseForm";
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog";
import UploadProgressOverlay from "@/components/shared/upload/UploadProgressOverlay";
import { uploadImage } from "@/services/uploads";
import { notify } from "@/components/shared/admin/Notifications";

export type DocumentFormValue = {
  name: string;
  notes?: string;
  descriptions?: string;
  fileUrl: string;
};

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/zip",
  "application/x-rar-compressed",
];

const MAX_FILE_MB = 50;

export function DocumentFormModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
  defaultValue,
  title = "Thêm tài liệu",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DocumentFormValue) => void;
  loading?: boolean;
  defaultValue?: Partial<DocumentFormValue>;
  title?: string;
}) {
  const [form, setForm] = React.useState<DocumentFormValue>({
    name: "",
    notes: "",
    descriptions: "",
    fileUrl: "",
    ...(defaultValue || {}),
  });
  const [errors, setErrors] = React.useState<{
    [k in keyof DocumentFormValue]?: string;
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

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileExtension = (url: string) => {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? match[1].toUpperCase() : "FILE";
  };

  const handleSelectFile = async (file: File) => {
    // Skip type check if file type is empty (some browsers don't report type)
    if (file.type && !ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      // Check extension as fallback
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowedExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'];
      if (!ext || !allowedExts.includes(ext)) {
        setErrors((prev) => ({ ...prev, fileUrl: "Định dạng không hỗ trợ" }));
        notify({
          title: "Định dạng không hỗ trợ",
          description: "Vui lòng chọn file PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, hoặc RAR",
          variant: "destructive",
        });
        return;
      }
    }
    const maxBytes = MAX_FILE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrors((prev) => ({ ...prev, fileUrl: `Dung lượng tối đa ${MAX_FILE_MB}MB` }));
      notify({
        title: "Tệp quá lớn",
        description: `Dung lượng tối đa ${MAX_FILE_MB}MB`,
        variant: "destructive",
      });
      return;
    }
    setErrors((prev) => ({ ...prev, fileUrl: undefined }));
    await handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadImage(file, "/uploads/document", {
        onProgress: (p) => setUploadProgress(p),
      });
      
      if (!result.url) {
        throw new Error("Không nhận được URL từ server");
      }

      setField("fileUrl", result.url);
      setSelectedName(file.name);
      setSelectedSize(file.size);
      
      // Auto-fill name if empty
      if (!form.name.trim()) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setField("name", nameWithoutExt);
      }
    } catch (_err) {
      setErrors((prev) => ({ ...prev, fileUrl: "Tải tệp thất bại" }));
      notify({
        title: "Tải tệp thất bại",
        description: "Vui lòng thử lại hoặc chọn tệp khác",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  React.useEffect(() => {
    if (open && defaultValue) {
      setForm({
        name: defaultValue?.name ?? "",
        notes: defaultValue?.notes ?? "",
        descriptions: defaultValue?.descriptions ?? "",
        fileUrl: defaultValue?.fileUrl ?? "",
      });
      setErrors({});
      setDirty(false);
      setSelectedName("");
      setSelectedSize(0);
    } else if (open && !defaultValue) {
      setForm({
        name: "",
        notes: "",
        descriptions: "",
        fileUrl: "",
      });
      setErrors({});
      setDirty(false);
      setSelectedName("");
      setSelectedSize(0);
    }
  }, [open, defaultValue]);

  const setField = (k: keyof DocumentFormValue, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const next: { [k in keyof DocumentFormValue]?: string } = {};
    const name = form.name.trim();
    if (!name) next.name = "Tên tài liệu là bắt buộc";
    else if (name.length > 255) next.name = "Tên tối đa 255 ký tự";

    const fileUrl = form.fileUrl.trim();
    if (!fileUrl) next.fileUrl = "Vui lòng tải lên tệp tài liệu";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    const payload: DocumentFormValue = {
      name: form.name.trim(),
      notes: form.notes?.trim() || undefined,
      descriptions: form.descriptions?.trim() || undefined,
      fileUrl: form.fileUrl.trim(),
    };
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
            <Label htmlFor="d-name">
              Tên tài liệu<span className="text-destructive">*</span>
            </Label>
            <Input
              id="d-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ví dụ: Slide bài giảng chương 1"
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-desc">Mô tả</Label>
            <Textarea
              id="d-desc"
              value={form.descriptions}
              onChange={(e) => setField("descriptions", e.target.value)}
              placeholder="Mô tả ngắn về tài liệu"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-notes">Ghi chú</Label>
            <Textarea
              id="d-notes"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Ghi chú thêm (tuỳ chọn)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Tệp tài liệu<span className="text-destructive">*</span>
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
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm">
                  {form.fileUrl
                    ? "Đã chọn tệp · Click để chọn lại"
                    : "Kéo thả hoặc click để chọn tệp"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR · Tối đa {MAX_FILE_MB}MB
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
                    <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium truncate">
                          {selectedName || form.name || "Tài liệu"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getFileExtension(form.fileUrl)} file
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ Tệp đã tải lên
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
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Xem tệp
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
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
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
