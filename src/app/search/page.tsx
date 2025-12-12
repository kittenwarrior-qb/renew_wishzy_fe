"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCourseList } from "@/components/shared/course/useCourse";
import { useAllCategories } from "@/components/shared/category/useCategory";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import ListCourse from "@/components/shared/course/ListCourse";
import { Course } from "@/components/shared/course/useCourse";
import { FilterPopovers } from "@/components/shared/search/FilterPopovers";
import { CategoryDropdown } from "@/components/shared/search/CategoryDropdown";
import { SearchPagination } from "@/components/shared/search/SearchPagination";
import { SearchBreadcrumb } from "@/components/shared/search/SearchBreadcrumb";


const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialRating = searchParams.get("rating") || "";
  const initialLevel = searchParams.get("level") || "";
  const initialPrice = searchParams.get("price") || "";
  const initialCategoryId = searchParams.get("categoryId") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [selectedPrice, setSelectedPrice] = useState(initialPrice);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("minPrice") || "");
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("maxPrice") || "");

  React.useEffect(() => {
    const search = searchParams.get("search");
    const page = searchParams.get("page");
    const rating = searchParams.get("rating");
    const level = searchParams.get("level");
    const price = searchParams.get("price");
    const categoryId = searchParams.get("categoryId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    
    // Always sync state with URL params (use empty string as default for cleared filters)
    setSearchQuery(search || "");
    setCurrentPage(page ? Number(page) : 1);
    setSelectedRating(rating || "");
    setSelectedLevel(level || "");
    setSelectedPrice(price || "");
    setSelectedCategoryId(categoryId || "");
    setMinPriceInput(minPrice || "");
    setMaxPriceInput(maxPrice || "");
  }, [searchParams]);

  let minPrice = undefined;
  let maxPrice = undefined;
  
  if (selectedPrice === "free") {
    minPrice = 0;
    maxPrice = 0;
  } else if (selectedPrice === "paid") {
    minPrice = 0.01;
  } else if (selectedPrice === "custom") {
    minPrice = minPriceInput ? Number(minPriceInput) : undefined;
    maxPrice = maxPriceInput ? Number(maxPriceInput) : undefined;
  } else {
    minPrice = undefined;
    maxPrice = undefined;
  }
  
  const filter = Object.fromEntries(
    Object.entries({
      name: searchQuery || undefined,
      courseLevel: selectedLevel
        ? (selectedLevel as "beginner" | "intermediate" | "advanced")
        : undefined,
      rating: selectedRating ? Number(selectedRating) : undefined,
      minPrice,
      maxPrice,
      categoryId: selectedCategoryId || undefined,
      page: currentPage,
      limit: 12,
      status: true, 
    }).filter(([_, value]) => value !== undefined)
  );
  
  const { data: coursesData, isLoading, isError } = useCourseList(filter);
  const { data: categoriesData, isLoading: isCategoriesLoading } = useAllCategories();

  const { parentCategories, categoriesByParent, allCategories } = React.useMemo(() => {
    const result: {
      parentCategories: any[]
      categoriesByParent: Record<string, any[]>
      allCategories: any[]
    } = {
      parentCategories: [],
      categoriesByParent: {},
      allCategories: []
    }

    if (!categoriesData?.data || !categoriesData.data.length) return result

    const categories = categoriesData.data
    result.allCategories = categories

    const withChildren = categories.map((cat: any) => ({
      ...cat,
      hasChildren: false,
      children: []
    }))

    withChildren.forEach((category: any) => {
      if (!category.parentId) {
        result.parentCategories.push(category)
      } else {
        if (!result.categoriesByParent[category.parentId]) {
          result.categoriesByParent[category.parentId] = []
        }
        result.categoriesByParent[category.parentId].push(category)
      }
    })

    result.parentCategories.forEach((parent: any) => {
      parent.hasChildren = !!result.categoriesByParent[parent.id]?.length
    })

    // Sort: categories with children first, then alphabetically
    result.parentCategories.sort((a: any, b: any) => {
      if (a.hasChildren !== b.hasChildren) {
        return a.hasChildren ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    return result
  }, [categoriesData])

  const selectedCategoryLabel = React.useMemo(() => {
    if (!selectedCategoryId) return ""
    const found = allCategories.find((c: any) => String(c.id) === String(selectedCategoryId))
    return found?.name ?? ""
  }, [allCategories, selectedCategoryId])

  const updateUrlAndNavigate = (pageOverride?: number) => {
    const params = new URLSearchParams();
    const pageToUse = pageOverride !== undefined ? pageOverride : currentPage;

    if (searchQuery) params.set("search", searchQuery);
    if (pageToUse > 1) params.set("page", pageToUse.toString());
    if (selectedLevel) params.set("level", selectedLevel);
    if (selectedRating) params.set("rating", selectedRating);
    if (selectedPrice) params.set("price", selectedPrice);
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
    if (selectedPrice === "custom") {
      if (minPriceInput) params.set("minPrice", minPriceInput);
      if (maxPriceInput) params.set("maxPrice", maxPriceInput);
    }

    const url = `/search?${params.toString()}`;
    router.push(url);
  };

  const resetFilters = () => {
    // Reset all state immediately
    setSearchQuery("");
    setCurrentPage(1);
    setSelectedRating("");
    setSelectedLevel("");
    setSelectedPrice("");
    setSelectedCategoryId("");
    setMinPriceInput("");
    setMaxPriceInput("");
    
    // Navigate to clean search URL - state will sync via useEffect
    router.push(`/search`);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setCurrentPage(1);
    
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (level) params.set("level", level);
    if (selectedRating) params.set("rating", selectedRating);
    if (selectedPrice) params.set("price", selectedPrice);
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
    if (selectedPrice === "custom") {
      if (minPriceInput) params.set("minPrice", minPriceInput);
      if (maxPriceInput) params.set("maxPrice", maxPriceInput);
    }
    
    const url = `/search?${params.toString()}`;
    router.push(url);
  };
  
  const handleRatingChange = (rating: string) => {
    setSelectedRating(rating);
    setCurrentPage(1);
    
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedLevel) params.set("level", selectedLevel);
    if (rating) params.set("rating", rating);
    if (selectedPrice) params.set("price", selectedPrice);
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
    if (selectedPrice === "custom") {
      if (minPriceInput) params.set("minPrice", minPriceInput);
      if (maxPriceInput) params.set("maxPrice", maxPriceInput);
    }
    
    const url = `/search?${params.toString()}`;
    router.push(url);
  };
  
  const handlePriceChange = (price: string) => {
    setSelectedPrice(price);
    setCurrentPage(1);
    
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedLevel) params.set("level", selectedLevel);
    if (selectedRating) params.set("rating", selectedRating);
    if (price) params.set("price", price);
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
    if (price === "custom") {
      if (minPriceInput) params.set("minPrice", minPriceInput);
      if (maxPriceInput) params.set("maxPrice", maxPriceInput);
    }
    
    const url = `/search?${params.toString()}`;
    router.push(url);
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedLevel) params.set("level", selectedLevel);
    if (selectedRating) params.set("rating", selectedRating);
    if (selectedPrice) params.set("price", selectedPrice);
    if (categoryId) params.set("categoryId", categoryId);
    if (selectedPrice === "custom") {
      if (minPriceInput) params.set("minPrice", minPriceInput);
      if (maxPriceInput) params.set("maxPrice", maxPriceInput);
    }
    
    const url = `/search?${params.toString()}`;
    router.push(url);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlAndNavigate();
  };
  const courses: Course[] = coursesData?.data || [];
  const pagination = coursesData
    ? {
        currentPage: coursesData.page || 1,
        totalPage: coursesData.totalPages || 1,
        totalItems: coursesData.total || 0,
        itemsPerPage: coursesData.limit || 10,
      }
    : undefined;

  const selectedCategory = selectedCategoryId ? 
    allCategories.find((category: any) => category.id === selectedCategoryId) : null;

  return (
    <div className="max-w-[1300px] mx-auto py-8 px-4">
      <SearchBreadcrumb selectedCategory={selectedCategory} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : selectedCategory ? selectedCategory.name : "Khóa học"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {pagination?.totalItems || courses.length} khóa học được tìm thấy
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 overflow-x-auto pb-2">
        {/* Tạm ẩn FilterDrawer - bộ lọc tất cả đang có lỗi
        <FilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          selectedRating={selectedRating}
          selectedPrice={selectedPrice}
          selectedLevel={selectedLevel}
          selectedCategoryId={selectedCategoryId}
          onRatingChange={handleRatingChange}
          onPriceChange={handlePriceChange}
          onLevelChange={handleLevelChange}
          onCategoryChange={handleCategoryChange}
          onApply={() => {
            updateUrlAndNavigate();
            setIsFilterDrawerOpen(false);
          }}
          onReset={() => {
            resetFilters();
            setIsFilterDrawerOpen(false);
          }}
          parentCategories={parentCategories}
          categoriesByParent={categoriesByParent}
          isCategoriesLoading={isCategoriesLoading}
          minPrice={minPriceInput}
          maxPrice={maxPriceInput}
          onMinPriceChange={setMinPriceInput}
          onMaxPriceChange={setMaxPriceInput}
        />

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 rounded-full"
          onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
        >
          <Filter className="h-4 w-4" />
          Tất cả bộ lọc
          <ChevronDown className="h-4 w-4" />
        </Button>
        */}

        <FilterPopovers
          selectedRating={selectedRating}
          selectedLevel={selectedLevel}
          selectedPrice={selectedPrice}
          onRatingChange={handleRatingChange}
          onLevelChange={handleLevelChange}
          onPriceChange={handlePriceChange}
          minPrice={minPriceInput}
          maxPrice={maxPriceInput}
          onMinPriceChange={setMinPriceInput}
          onMaxPriceChange={setMaxPriceInput}
        />

        <CategoryDropdown
          selectedCategoryLabel={selectedCategoryLabel}
          parentCategories={parentCategories}
          categoriesByParent={categoriesByParent}
          isCategoriesLoading={isCategoriesLoading}
          onCategoryChange={handleCategoryChange}
        />

        {(selectedRating || selectedLevel || selectedPrice || selectedCategoryId) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Courses grid */}
      <div className="mb-8">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center p-12">
            <p className="text-red-500 mb-2">
              Đã xảy ra lỗi khi tải danh sách khóa học
            </p>
            <Button onClick={() => {
              // Use router.refresh() instead of window.location.reload()
              router.refresh();
            }} variant="outline">
              Thử lại
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Không tìm thấy khóa học nào
            </p>
            <Button onClick={resetFilters} variant="outline">
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <ListCourse
            courses={courses.map((course: any) => ({
              id: course.id,
              name: course.name,
              description: course.description || "",
              notes: course.notes || "",
              thumbnail: course.thumbnail || "",
              price: course.price.toString(),
              saleInfo: course.saleInfo || {},
              rating: course.rating || 0,
              status: course.status,
              averageRating:
                course.averageRating?.toString() ||
                course.rating?.toString() ||
                "0",
              numberOfStudents: course.numberOfStudents || 0,
              reviewCount: course.reviewCount || 0,
              level: course.level || "beginner",
              totalDuration: course.totalDuration || 0,
              categoryId: course.categoryId || "",
              createdBy: course.createdBy || "",
              createdAt: course.createdAt || "",
              updatedAt: course.updatedAt || "",
              deletedAt: course.deletedAt || null,
              creator: course.creator || {
                id: course.createdBy || "",
                email: "",
                fullName: "Giảng viên",
                passwordModified: false,
              },
              category: course.category || {
                id: course.categoryId || "",
                name: "",
                notes: null,
                parentId: null,
                createdAt: "",
                updatedAt: "",
                deletedAt: "",
              },
              chapters: course.chapters || [],
            }))}
          />
        )}
      </div>

      {pagination && (
        <SearchPagination
          currentPage={pagination.currentPage}
          totalPage={pagination.totalPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

// Loading component for Suspense fallback
const LoadingState = () => (
  <div className="flex items-center justify-center p-12 min-h-[400px]">
    <div className="w-full max-w-sm text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Wrap the SearchPage with Suspense
const SearchPageWrapper = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchPage />
    </Suspense>
  );
};

export default SearchPageWrapper;

// Prevent static prerendering of this page
export const dynamic = 'force-dynamic'
export const dynamicParams = true
