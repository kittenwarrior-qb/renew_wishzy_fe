"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import { Pencil, Trash2, Inbox, Eye } from "lucide-react";
import type { Category } from "@/types/category";
import { useSubCategories } from "@/components/shared/category/useCategory";
import { useAppStore } from "@/stores/useAppStore";

export function InlineChildrenRow({
  parentId,
  onAddChild,
  onEditChild,
  onDeleteChild,
  onViewChild,
}: {
  parentId: string;
  onAddChild: () => void;
  onEditChild: (c: Category) => void;
  onDeleteChild: (c: Category) => void;
  onViewChild?: (c: Category) => void;
}) {
  const { theme } = useAppStore();
  const logoSrc =
    theme === "dark" ? "/images/white-logo.png" : "/images/black-logo.png";
  const { data, isPending, isError } = useSubCategories(parentId, 1, 100);
  const items = (data?.data ?? []) as Category[];

  return (
    <div className="space-y-2">
      {isPending ? (
        <div className="py-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <img src={logoSrc} alt="Wishzy" className="h-8 w-auto opacity-90" />
            <div
              aria-label="loading"
              className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
            />
            <span>Đang tải danh mục con...</span>
          </div>
        </div>
      ) : isError ? (
        <div className="text-sm text-destructive">
          Không tải được danh mục con
        </div>
      ) : items.length > 0 ? (
        <div className="divide-y rounded-md border w-full">
          {items.map((c: Category, idx: number) => (
            <div
              key={String(c.id)}
              className="flex items-center gap-2 justify-between py-1.5 px-2 hover:bg-muted/20"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 text-center text-xs text-muted-foreground">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-medium truncate text-sm">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    Tạo:{" "}
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString()
                      : "-"}{" "}
                    • Cập nhật:{" "}
                    {c.updatedAt
                      ? new Date(c.updatedAt).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {onViewChild ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer h-7 w-7"
                    onClick={() => onViewChild(c)}
                    title="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer h-7 w-7"
                  onClick={() => onEditChild(c)}
                  title="Sửa"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer h-7 w-7"
                  onClick={() => onDeleteChild(c)}
                  title="Xoá"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Inbox className="h-8 w-8 text-muted-foreground/60" />
            <span>Không có danh mục con</span>
          </div>
        </div>
      )}
    </div>
  );
}
