"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/shared/admin/Notifications";
import { Upload, ChevronDown } from "lucide-react";
import api from "@/services/api";
import { uploadImage } from "@/services/uploads";
import UploadProgressOverlay from "@/components/shared/upload/UploadProgressOverlay";
import Switch from "@/components/ui/switch";
import type { Category } from "@/types/category";
import { formatDuration } from "@/lib/format-duration";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

export type CourseFormValue = {
  name: string;
  categoryId: string;
  level: "beginner" | "intermediate" | "advanced";
  price: number;
  totalDuration: number;
  status: boolean;
  thumbnail?: string;
  description?: string;
  notes?: string;
};

export type Course = CourseFormValue & { id: string };

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const PriceInput: React.FC<{
  value: number;
  onChange: (n: number) => void;
  loading?: boolean;
  error?: string;
  touched?: boolean;
}> = ({ value: priceVal, onChange, loading: priceLoading, error, touched }) => {
  const [displayValue, setDisplayValue] = React.useState(
    formatVND(priceVal || 0)
  );
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    // Only update display value when not focused
    if (!isFocused) {
      setDisplayValue(formatVND(priceVal || 0));
    }
  }, [priceVal, isFocused]);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Giá (VND)</label>
      <div className="relative">
        <Input
          className="pr-7"
          inputMode="numeric"
          value={displayValue}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            const num = raw ? parseInt(raw, 10) : 0;
            setDisplayValue(e.target.value);
            onChange(num);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setDisplayValue(formatVND(priceVal || 0));
          }}
          placeholder="0"
          disabled={priceLoading}
          aria-invalid={!!error}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₫
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(
          [
            0, 99000, 149000, 199000, 299000, 499000, 999000, 1999000,
          ] as number[]
        ).map((amt) => (
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
      {touched && error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
};

export function CourseForm({
  value,
  onChange,
  categories,
  loading,
  onSubmit,
  onDirtyChange,
  submitLabel,
  title,
  description,
}: {
  value: CourseFormValue;
  onChange: (v: CourseFormValue) => void;
  categories: Category[];
  loading?: boolean;
  onSubmit: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  submitLabel?: string;
  title?: string;
  description?: string;
}) {
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const setField = <K extends keyof CourseFormValue>(
    k: K,
    val: CourseFormValue[K]
  ) => {
    onChange({ ...value, [k]: val });
    onDirtyChange?.(true);
  };

  const errors = React.useMemo(() => {
    const errs: Record<string, string> = {};
    if (!value.name?.trim()) errs.name = "Bắt buộc";
    if (!value.categoryId) errs.categoryId = "Bắt buộc";
    if (!value.level) errs.level = "Bắt buộc";
    if (value.price == null || value.price < 0) errs.price = "Giá không hợp lệ";
    // totalDuration is auto-calculated from chapters/lectures, no validation needed
    return errs;
  }, [value]);

  const MAX_IMAGE_MB = 5;
  const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  const { parentCategories, categoriesByParent } = React.useMemo(() => {
    const result: {
      parentCategories: Category[];
      categoriesByParent: Record<string, Category[]>;
    } = {
      parentCategories: [],
      categoriesByParent: {},
    };

    if (!categories || !categories.length) return result;

    const all = categories;

    all.forEach((cat) => {
      if (!cat.parentId) {
        result.parentCategories.push(cat);
      } else {
        if (!result.categoriesByParent[cat.parentId]) {
          result.categoriesByParent[cat.parentId] = [];
        }
        result.categoriesByParent[cat.parentId].push(cat);
      }
    });

    result.parentCategories.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [categories]);

  const selectedCategoryLabel = React.useMemo(() => {
    if (!value.categoryId) return "";
    const found = categories.find(
      (c) => String(c.id) === String(value.categoryId)
    );
    return found?.name ?? "";
  }, [categories, value.categoryId]);

  const tryUpload = async (file: File) => {
    try {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        const readable = ["JPG", "PNG", "WEBP"];
        notify({
          title: "Định dạng không hỗ trợ",
          description: `Vui lòng chọn ${readable.join(", ")}`,
          variant: "destructive",
        });
        return;
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        notify({
          title: "Tệp quá lớn",
          description: `Dung lượng tối đa ${MAX_IMAGE_MB}MB`,
          variant: "destructive",
        });
        return;
      }
      setUploading(true);
      setUploadProgress(0);
      const { url } = await uploadImage(file, undefined, {
        fieldName: "file",
        onProgress: (p) => setUploadProgress(p),
      });
      if (!url) throw new Error("Upload không trả về URL");
      setField("thumbnail", url);
      notify({ title: "Tải ảnh thành công", variant: "success" });
    } catch (e: any) {
      notify({
        title: "Lỗi upload",
        description: String(e?.message || "Không thể tải ảnh"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        .ckeditor-wrapper .ck.ck-editor {
          border: none !important;
        }

        .ckeditor-wrapper .ck-editor__editable {
          background-color: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          border: none !important;
        }

        .ckeditor-wrapper .ck.ck-editor__main > .ck-editor__editable {
          background-color: hsl(var(--background)) !important;
        }

        .ckeditor-wrapper .ck.ck-toolbar {
          background-color: hsl(var(--muted)) !important;
          border: none !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }

        .ckeditor-wrapper .ck.ck-button,
        .ckeditor-wrapper .ck.ck-dropdown__button {
          color: hsl(var(--foreground)) !important;
        }

        .ckeditor-wrapper .ck.ck-button:hover,
        .ckeditor-wrapper .ck.ck-dropdown__button:hover {
          background-color: hsl(var(--accent)) !important;
        }

        .ckeditor-wrapper .ck.ck-button.ck-on,
        .ckeditor-wrapper .ck.ck-button.ck-on:hover {
          background-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }

        .ckeditor-wrapper .ck.ck-dropdown__panel {
          background-color: hsl(var(--popover)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }

        .ckeditor-wrapper .ck.ck-list__item .ck-button:hover {
          background-color: hsl(var(--accent)) !important;
        }

        .ckeditor-wrapper
          .ck-editor__editable:not(.ck-editor__nested-editable).ck-focused {
          border: none !important;
          box-shadow: none !important;
        }

        .ckeditor-wrapper .ck.ck-editor__editable > .ck-placeholder::before {
          color: hsl(var(--muted-foreground)) !important;
        }
      `}</style>
      <div className="space-y-6">
        {(title || submitLabel) && (
          <div className="flex items-start justify-between gap-4 pb-4 border-b">
            {title && (
              <div>
                <h1 className="text-2xl font-semibold">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
            )}
            {submitLabel && (
              <Button
                type="button"
                variant="default"
                onClick={onSubmit}
                disabled={loading}
                className="min-w-32 shrink-0"
              >
                {submitLabel}
              </Button>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 rounded-lg border p-6 bg-card">
            <div>
              <h3 className="text-base font-semibold mb-4">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Tên</label>
                  <Input
                    value={value.name || ""}
                    onChange={(e) => setField("name", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    placeholder="Tên khoá học"
                    disabled={loading}
                    aria-invalid={!!errors.name}
                  />
                  {touched.name && errors.name ? (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.name}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Danh mục
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        disabled={loading}
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span
                          className={
                            selectedCategoryLabel
                              ? "truncate"
                              : "text-muted-foreground"
                          }
                        >
                          {selectedCategoryLabel || "Chọn danh mục"}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="relative w-64 max-h-80 overflow-y-auto scrollbar-none scrollbar-left">
                      <DropdownMenuGroup>
                        {parentCategories.length === 0 ? (
                          <DropdownMenuItem disabled>
                            Không có danh mục
                          </DropdownMenuItem>
                        ) : (
                          parentCategories.map((parent) => {
                            const children =
                              categoriesByParent[parent.id] || [];
                            if (children.length > 0) {
                              return (
                                <DropdownMenuSub key={parent.id}>
                                  <DropdownMenuSubTrigger
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setField(
                                        "categoryId",
                                        String(parent.id) as any
                                      );
                                      setTouched((t) => ({
                                        ...t,
                                        categoryId: true,
                                      }));
                                    }}
                                  >
                                    <span className="flex-1 truncate">
                                      {parent.name}
                                    </span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="relative max-h-80 overflow-y-auto scrollbar-none scrollbar-left">
                                    {children.map((child) => (
                                      <DropdownMenuItem
                                        key={child.id}
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setField(
                                            "categoryId",
                                            String(child.id) as any
                                          );
                                          setTouched((t) => ({
                                            ...t,
                                            categoryId: true,
                                          }));
                                        }}
                                      >
                                        <span className="truncate">
                                          {child.name}
                                        </span>
                                      </DropdownMenuItem>
                                    ))}
                                    {children.length > 6 && (
                                      <div className="pointer-events-none sticky bottom-1 flex justify-center py-1">
                                        <ChevronDown className="h-8 w-8 text-muted-foreground scroll-hint-bounce" />
                                      </div>
                                    )}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              );
                            }
                            return (
                              <DropdownMenuItem
                                key={parent.id}
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setField(
                                    "categoryId",
                                    String(parent.id) as any
                                  );
                                  setTouched((t) => ({
                                    ...t,
                                    categoryId: true,
                                  }));
                                }}
                              >
                                <span className="truncate">{parent.name}</span>
                              </DropdownMenuItem>
                            );
                          })
                        )}
                      </DropdownMenuGroup>
                      {parentCategories.length > 6 && (
                        <div className="pointer-events-none sticky bottom-1 flex justify-center py-1">
                          <ChevronDown className="h-8 w-8 text-muted-foreground scroll-hint-bounce" />
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {touched.categoryId && errors.categoryId ? (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.categoryId}
                    </p>
                  ) : null}
                </div>
                <div>
                  <PriceInput
                    value={value.price || 0}
                    onChange={(n) => {
                      setField("price", n);
                      setTouched((t) => ({ ...t, price: true }));
                    }}
                    loading={loading}
                    error={errors.price}
                    touched={!!touched.price}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Cấp độ
                  </label>
                  <Select
                    value={value.level}
                    onValueChange={(v) => setField("level", v as any)}
                  >
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
                    <p className="mt-1 text-xs text-destructive">
                      {errors.level}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Trạng thái
                  </label>
                  <div className="flex items-center gap-3 h-9">
                    <Switch
                      checked={value.status}
                      onCheckedChange={(checked) => setField("status", checked)}
                      disabled={loading}
                    />
                    <span className="text-sm text-muted-foreground">
                      {value.status ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Ghi chú</label>
              <Textarea
                className="min-h-[200px] font-['Be_Vietnam_Pro']"
                value={value.notes || ""}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Nhập ghi chú cho khoá học..."
                disabled={loading}
              />
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-4">
                  Nội dung chi tiết
                </h3>
                <label className="mb-2 block text-sm font-medium">Mô tả</label>
                <div className="ckeditor-wrapper rounded-lg border border-border overflow-hidden">
                  {typeof window !== "undefined" &&
                  (window as any).__CKE__?.CKEditor &&
                  (window as any).__CKE__?.ClassicEditor ? (
                    React.createElement((window as any).__CKE__.CKEditor, {
                      editor: (window as any).__CKE__.ClassicEditor,
                      data: value.description || "",
                      disabled: loading,
                      config: {
                        toolbar: {
                          items: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "underline",
                            "strikethrough",
                            "|",
                            "link",
                            "uploadImage",
                            "blockQuote",
                            "codeBlock",
                            "|",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "outdent",
                            "indent",
                            "|",
                            "undo",
                            "redo",
                          ],
                        },
                        placeholder: "Nhập mô tả chi tiết cho khoá học...",
                      },
                      onReady: (editor: any) => {
                        const root =
                          editor?.editing?.view?.document?.getRoot?.();
                        if (root) {
                          editor.editing.view.change((writer: any) => {
                            writer.setStyle("min-height", "400px", root);
                            writer.setStyle(
                              "font-family",
                              "'Be Vietnam Pro', sans-serif",
                              root
                            );
                            writer.setStyle("font-size", "15px", root);
                            writer.setStyle("line-height", "1.6", root);
                            writer.setStyle("padding", "16px", root);
                          });
                        }
                        // Custom editor container styles
                        const editorElement = editor.ui.view.editable.element;
                        if (editorElement) {
                          editorElement.style.fontFamily =
                            "'Be Vietnam Pro', sans-serif";
                        }
                      },
                      onChange: (_e: any, editor: any) =>
                        setField("description", editor.getData()),
                    })
                  ) : (
                    <Textarea
                      className="min-h-[400px] font-['Be_Vietnam_Pro'] text-[15px] leading-relaxed"
                      value={value.description || ""}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="Nhập mô tả chi tiết cho khoá học..."
                      disabled={loading}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-lg border p-6 bg-card h-fit">
            <h3 className="text-base font-semibold">Hình ảnh mô tả</h3>
            <div>
              <div className="space-y-2">
                <button
                  type="button"
                  aria-label="Tải ảnh"
                  className="group relative cursor-pointer w-full aspect-video min-h-64 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex items-center justify-center overflow-hidden hover:bg-muted/20 hover:ring-2 hover:ring-primary/20 transition"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {value.thumbnail ? (
                    <img
                      src={value.thumbnail}
                      alt="thumbnail"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm font-medium">Tải ảnh</span>
                      <span className="text-[11px] text-muted-foreground/80">
                        JPG, PNG, WEBP · ≤ 5MB
                      </span>
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
                    const f = e.target.files?.[0];
                    if (f) void tryUpload(f);
                  }}
                />
                {value.thumbnail ? (
                  <a
                    href={value.thumbnail}
                    className="block text-xs underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mở ảnh trong tab mới
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
