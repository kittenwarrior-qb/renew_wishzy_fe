"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "@/providers/TranslationProvider";

interface PaginationControlsProps {
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
  currentPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export const PaginationControls = ({
  pagination,
  currentPage,
  isLoading,
  onPageChange,
}: PaginationControlsProps) => {
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);

  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{pagination.total}</span>
        <span>{translate("studentsFound")}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
          className="min-w-[80px]"
        >
          {translate("previous")}
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {translate("page")}
          </span>
          <span className="text-sm font-medium">
            {pagination.page} / {pagination.totalPages}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
          disabled={currentPage === pagination.totalPages || isLoading}
          className="min-w-[80px]"
        >
          {translate("next")}
        </Button>
      </div>
    </div>
  );
};

