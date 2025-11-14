'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category';
import { Category } from '@/types/category';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface CategoryWithChildren extends Category {
  hasChildren: boolean;
  children: CategoryWithChildren[];
}

const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const res = await categoryService.list({ limit: 1000 });
      return res;
    },
    staleTime: 5 * 60 * 1000, 
  });
};

const DiscoverDropdown = () => {
  const { data: categoriesData, isLoading } = useCategoriesQuery();
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  
  const { parentCategories, categoriesByParent } = useMemo(() => {
    const result: {
      parentCategories: CategoryWithChildren[];
      categoriesByParent: Record<string, CategoryWithChildren[]>;
    } = {
      parentCategories: [],
      categoriesByParent: {}
    };
    
    if (!categoriesData) return result;
    
    const allCategories: Category[] = [];
    if (Array.isArray(categoriesData?.data?.items)) {
      allCategories.push(...categoriesData.data.items);
    } else if (Array.isArray(categoriesData?.items)) {
      allCategories.push(...categoriesData.items);
    } else if (Array.isArray(categoriesData?.data)) {
      allCategories.push(...categoriesData.data);
    } else if (Array.isArray(categoriesData)) {
      allCategories.push(...categoriesData);
    }
    
    const withChildren = allCategories.map(cat => ({
      ...cat,
      hasChildren: false,
      children: []
    }));
    
    withChildren.forEach(category => {
      if (!category.parentId) {
        result.parentCategories.push(category);
      } else {
        if (!result.categoriesByParent[category.parentId]) {
          result.categoriesByParent[category.parentId] = [];
        }
        result.categoriesByParent[category.parentId].push(category);
      }
    });
    
    result.parentCategories.forEach(parent => {
      parent.hasChildren = !!result.categoriesByParent[parent.id]?.length;
    });
    
    result.parentCategories.sort((a, b) => {
      if (a.hasChildren !== b.hasChildren) {
        return a.hasChildren ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    return result;
  }, [categoriesData]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpenCategoryId(null);
    }
  };

  const handleSubMenuOpen = (categoryId: string, open: boolean) => {
    if (open) {
      setOpenCategoryId(categoryId);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger className="text-foreground text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer px-4 py-2 rounded-md flex items-center gap-1">
        Khám phá <ChevronDown className='h-4 w-4 ml-1' />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white dark:bg-gray-900">
        <DropdownMenuGroup>
          {isLoading ? (
            <DropdownMenuItem disabled>
              <span className="text-gray-500">Đang tải danh mục...</span>
            </DropdownMenuItem>
          ) : parentCategories.length > 0 ? (
            parentCategories.map((category) => (
              category.hasChildren ? (
                <DropdownMenuSub 
                  key={category.id}
                  onOpenChange={(open) => handleSubMenuOpen(category.id, open)}
                >
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <span className="flex-1">{category.name}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-white dark:bg-gray-900">
                    {openCategoryId === category.id && 
                      categoriesByParent[category.id]?.map((subCategory) => (
                        <DropdownMenuItem key={subCategory.id} asChild>
                          <Link href={`/search?categoryId=${subCategory.id}`} className="w-full">
                            {subCategory.name}
                          </Link>
                        </DropdownMenuItem>
                      ))
                    }
                    {openCategoryId === category.id && (!categoriesByParent[category.id] || categoriesByParent[category.id].length === 0) && (
                      <DropdownMenuItem disabled>
                        <span className="text-gray-500">Không có danh mục con</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : (
                <DropdownMenuItem key={category.id} asChild>
                  <Link href={`/search?categoryId=${category.id}`} className="w-full">
                    {category.name}
                  </Link>
                </DropdownMenuItem>
              )
            ))
          ) : (
            <DropdownMenuItem disabled>
              <span className="text-gray-500 dark:text-gray-400">Không có danh mục</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DiscoverDropdown;