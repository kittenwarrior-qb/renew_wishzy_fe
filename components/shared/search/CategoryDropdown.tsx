'use client';

import { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
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

interface CategoryDropdownProps {
  selectedCategoryLabel: string;
  parentCategories: any[];
  categoriesByParent: Record<string, any[]>;
  isCategoriesLoading: boolean;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryDropdown = ({
  selectedCategoryLabel,
  parentCategories,
  categoriesByParent,
  isCategoriesLoading,
  onCategoryChange,
}: CategoryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setOpenCategoryId(null);
    }
  };

  const handleSubMenuOpen = (categoryId: string, open: boolean) => {
    if (open) {
      setOpenCategoryId(categoryId);
    } else if (openCategoryId === categoryId) {
      setOpenCategoryId(null);
    }
  };

  const handleCategoryClick = (categoryId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onCategoryChange(categoryId);
    setIsOpen(false);
    setOpenCategoryId(null);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          {selectedCategoryLabel || "Danh mục"}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white dark:bg-gray-900">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => handleCategoryClick("", e)}
          >
            <span className="truncate">Tất cả</span>
          </DropdownMenuItem>
          {isCategoriesLoading ? (
            <DropdownMenuItem disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </DropdownMenuItem>
          ) : parentCategories.length === 0 ? (
            <DropdownMenuItem disabled>
              Không có danh mục
            </DropdownMenuItem>
          ) : (
            parentCategories.map((parent: any) => {
              const children = categoriesByParent[parent.id] || [];
              if (children.length > 0) {
                return (
                  <DropdownMenuSub 
                    key={parent.id}
                    onOpenChange={(open) => handleSubMenuOpen(parent.id, open)}
                  >
                    <DropdownMenuSubTrigger
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCategoryClick(String(parent.id), e);
                      }}
                    >
                      <span className="flex-1 truncate">
                        {parent.name}
                        {parent.totalCourses !== undefined && ` (${parent.totalCourses})`}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-white dark:bg-gray-900">
                      {openCategoryId === parent.id && 
                        children.map((child: any) => (
                          <DropdownMenuItem
                            key={child.id}
                            className="cursor-pointer"
                            onClick={(e) => handleCategoryClick(String(child.id), e)}
                          >
                            <span className="truncate">
                              {child.name}
                              {child.totalCourses !== undefined && ` (${child.totalCourses})`}
                            </span>
                          </DropdownMenuItem>
                        ))
                      }
                      {openCategoryId === parent.id && children.length === 0 && (
                        <DropdownMenuItem disabled>
                          <span className="text-gray-500">Không có danh mục con</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                );
              }
              return (
                <DropdownMenuItem
                  key={parent.id}
                  className="cursor-pointer"
                  onClick={(e) => handleCategoryClick(String(parent.id), e)}
                >
                  <span className="truncate">
                    {parent.name}
                    {parent.totalCourses !== undefined && ` (${parent.totalCourses})`}
                  </span>
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
