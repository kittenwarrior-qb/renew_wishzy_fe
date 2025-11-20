'use client';

import { Button } from "@/components/ui/button";

interface SearchPaginationProps {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

export const SearchPagination = ({
  currentPage,
  totalPage,
  onPageChange,
}: SearchPaginationProps) => {
  if (totalPage <= 1) return null;

  return (
    <div className="flex justify-center mt-8">
      <div className="flex gap-2">
        {currentPage > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
          >
            &laquo;
          </Button>
        )}

        {Array.from({ length: totalPage }, (_, i) => i + 1)
          .map((page) => {
            const showPage =
              page === 1 ||
              page === totalPage ||
              Math.abs(page - currentPage) <= 1;

            if (!showPage) {
              if (page === 2 || page === totalPage - 1) {
                return (
                  <span key={page} className="flex items-center px-3">
                    ...
                  </span>
                );
              }
              return null;
            }
            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            );
          })
          .filter(Boolean)}

        {currentPage < totalPage && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
          >
            &raquo;
          </Button>
        )}
      </div>
    </div>
  );
};
