'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Category } from '@/types/category';
import { useAllCategories } from '@/components/shared/category/useCategory';
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

const DiscoverDropdown = () => {
  const router = useRouter();
  const { data: categoriesData, isLoading } = useAllCategories();
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
    
    const allCategories: Category[] = categoriesData.data || [];
    
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
                  <DropdownMenuSubTrigger 
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/search?categoryId=${category.id}`);
                    }}
                  >
                    <span className="flex-1">
                      {category.name}{category.totalCourses !== undefined && ` (${category.totalCourses})`}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-white dark:bg-gray-900">
                    {openCategoryId === category.id && 
                      categoriesByParent[category.id]?.map((subCategory) => (
                        <DropdownMenuItem key={subCategory.id} asChild>
                          <Link href={`/search?categoryId=${subCategory.id}`} className="w-full">
                            {subCategory.name}{subCategory.totalCourses !== undefined && ` (${subCategory.totalCourses})`}
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
                    {category.name}{category.totalCourses !== undefined && ` (${category.totalCourses})`}
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