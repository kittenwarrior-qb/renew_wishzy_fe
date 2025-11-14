"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCourseList } from "@/components/shared/course/useCourse";
import { useParentCategories } from "@/components/shared/category/useCategory";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, ChevronDown, Filter, Loader2, Home } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ListCourse from "@/components/shared/course/ListCourse";
import { Course } from "@/components/shared/course/useCourse";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";


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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [locale, setLocale] = useState('vi');
  
  // Effect to detect locale from URL path
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/en/')) {
      setLocale('en');
    } else if (path.startsWith('/vi/')) {
      setLocale('vi');
    }
  }, []);
  
  React.useEffect(() => {
    const search = searchParams.get("search");
    const page = searchParams.get("page");
    const rating = searchParams.get("rating");
    const level = searchParams.get("level");
    const price = searchParams.get("price");
    const categoryId = searchParams.get("categoryId");
    
    if (search !== null) setSearchQuery(search);
    if (page !== null) setCurrentPage(Number(page));
    if (rating !== null) setSelectedRating(rating);
    if (level !== null) setSelectedLevel(level);
    if (price !== null) setSelectedPrice(price);
    if (categoryId !== null) setSelectedCategoryId(categoryId);
  }, [searchParams]);

  let minPrice = undefined;
  let maxPrice = undefined;
  
  if (selectedPrice === "free") {
    minPrice = 0;
    maxPrice = 0;
  } else if (selectedPrice === "paid") {
    minPrice = 0.01;
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
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useParentCategories();
  const categoriesData = categoriesResponse?.data || [];

  const updateUrlAndNavigate = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (selectedLevel) params.set("level", selectedLevel);
    if (selectedRating) params.set("rating", selectedRating);
    if (selectedPrice) params.set("price", selectedPrice);
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);

    const url = `/${locale}/search?${params.toString()}`;
    router.push(url);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setSelectedRating("");
    setSelectedLevel("");
    setSelectedPrice("");
    setSelectedCategoryId("");
    
    router.push(`/${locale}/search`);
    
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setCurrentPage(1);
    updateUrlAndNavigate();
  };
  
  const handleRatingChange = (rating: string) => {
    setSelectedRating(rating);
    setCurrentPage(1);
    updateUrlAndNavigate();
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
    
    const url = `/${locale}/search?${params.toString()}`;
    router.push(url);
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    updateUrlAndNavigate();
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
    categoriesData.find((category: any) => category.id === selectedCategoryId) : null;

  return (
    <div className="max-w-[1300px] mx-auto py-8 px-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${locale}`} className="inline-flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Trang chủ
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {selectedCategory ? (
              <BreadcrumbLink asChild>
                <Link href={`/${locale}/search`}>
                  Khóa học
                </Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>
                Khóa học
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {selectedCategory && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {selectedCategory.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : selectedCategory ? selectedCategory.name : "Khóa học"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {pagination?.totalItems || courses.length} khóa học được tìm thấy
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 overflow-x-auto pb-2">
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full overflow-y-auto p-6 animate-slide-in-right">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Bộ lọc</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFilterDrawerOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Đánh giá</h4>
                  <RadioGroup
                    value={selectedRating}
                    onValueChange={handleRatingChange}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4.5" id="dr1" />
                        <Label htmlFor="dr1" className="flex items-center">
                          <span className="flex text-yellow-400">
                            {"★★★★★"} <span className="text-gray-400"></span>
                          </span>
                          <span className="ml-1">4.5 & up (195)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4.0" id="dr2" />
                        <Label htmlFor="dr2" className="flex items-center">
                          <span className="flex text-yellow-400">
                            {"★★★★"} <span className="text-gray-400">★</span>
                          </span>
                          <span className="ml-1">4.0 & up (346)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3.5" id="dr3" />
                        <Label htmlFor="dr3" className="flex items-center">
                          <span className="flex text-yellow-400">
                            {"★★★★"} <span className="text-gray-400">★</span>
                          </span>
                          <span className="ml-1">3.5 & up (384)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3.0" id="dr4" />
                        <Label htmlFor="dr4" className="flex items-center">
                          <span className="flex text-yellow-400">
                            {"★★★"} <span className="text-gray-400">★★</span>
                          </span>
                          <span className="ml-1">3.0 & up (392)</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Giá</h4>
                  <RadioGroup
                    value={selectedPrice}
                    onValueChange={handlePriceChange}
                    defaultValue=""
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="" id="dp0" />
                        <Label htmlFor="dp0">Tất cả</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="free" id="dp1" />
                        <Label htmlFor="dp1">Miễn phí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paid" id="dp2" />
                        <Label htmlFor="dp2">Trả phí</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Cấp độ</h4>
                  <RadioGroup
                    value={selectedLevel}
                    onValueChange={handleLevelChange}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="" id="dl0" />
                        <Label htmlFor="dl0">Tất cả</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="beginner" id="dl1" />
                        <Label htmlFor="dl1">Cơ bản</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="intermediate" id="dl2" />
                        <Label htmlFor="dl2">Trung cấp</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advanced" id="dl3" />
                        <Label htmlFor="dl3">Nâng cao</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Danh mục</h4>
                  {isCategoriesLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : categoriesData.length > 0 ? (
                    <RadioGroup
                      value={selectedCategoryId}
                      onValueChange={handleCategoryChange}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="" id="dc0" />
                          <Label htmlFor="dc0">Tất cả</Label>
                        </div>
                        {categoriesData.map((category: any) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={category.id} id={`dc-${category.id}`} />
                            <Label htmlFor={`dc-${category.id}`}>{category.name}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <p className="text-sm text-gray-500">Không có danh mục nào</p>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      updateUrlAndNavigate();
                      setIsFilterDrawerOpen(false);
                    }}
                  >
                    Áp dụng bộ lọc
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      resetFilters();
                      setIsFilterDrawerOpen(false);
                    }}
                    disabled={!selectedRating && !selectedLevel && !selectedPrice && !selectedCategoryId}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
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

          <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              Đánh giá
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-2">
              <h4 className="font-medium">Đánh giá</h4>
              <RadioGroup
                value={selectedRating}
                onValueChange={handleRatingChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4.5" id="r1" />
                  <Label htmlFor="r1" className="flex items-center">
                    <span className="flex text-yellow-400">
                      {"★★★★★"} <span className="text-gray-400"></span>
                    </span>
                    <span className="ml-1">4.5 & up</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4.0" id="r2" />
                  <Label htmlFor="r2" className="flex items-center">
                    <span className="flex text-yellow-400">
                      {"★★★★"} <span className="text-gray-400">★</span>
                    </span>
                    <span className="ml-1">4.0 & up</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3.5" id="r3" />
                  <Label htmlFor="r3" className="flex items-center">
                    <span className="flex text-yellow-400">
                      {"★★★★"} <span className="text-gray-400">★</span>
                    </span>
                    <span className="ml-1">3.5 & up</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3.0" id="r4" />
                  <Label htmlFor="r4" className="flex items-center">
                    <span className="flex text-yellow-400">
                      {"★★★"} <span className="text-gray-400">★★</span>
                    </span>
                    <span className="ml-1">3.0 & up </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              Level
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-2">
              <h4 className="font-medium">Level</h4>
              <RadioGroup
                value={selectedLevel}
                onValueChange={handleLevelChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="l0" />
                  <Label htmlFor="l0">Tất cả</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="l1" />
                  <Label htmlFor="l1">Cơ bản</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="l2" />
                  <Label htmlFor="l2">Trung cấp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="l3" />
                  <Label htmlFor="l3">Nâng cao</Label>
                </div>
              </RadioGroup>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              Giá
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-2">
              <h4 className="font-medium">Giá</h4>
              <RadioGroup
                value={selectedPrice}
                onValueChange={handlePriceChange}
                defaultValue=""
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="p0" />
                  <Label htmlFor="p0">Tất cả</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="p1" />
                  <Label htmlFor="p1">Miễn phí</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="p2" />
                  <Label htmlFor="p2">Trả phí</Label>
                </div>
              </RadioGroup>
            </div>
          </PopoverContent>
        </Popover>

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
            courses={courses.map((course) => ({
              id: course.id,
              name: course.name,
              description: course.description || "",
              notes: course.notes || "",
              thumbnail: course.thumbnail || "",
              price: course.price.toString(),
              saleInfo: {},
              rating: course.rating || 0,
              status: course.status,
              averageRating:
                course.averageRating?.toString() ||
                course.rating?.toString() ||
                "0",
              numberOfStudents: course.numberOfStudents || 0,
              level: course.level || "beginner",
              totalDuration: course.totalDuration || 0,
              categoryId: course.categoryId || "",
              createdBy: course.createdBy || "",
              createdAt: course.createdAt || "",
              updatedAt: course.updatedAt || "",
              deletedAt: course.deletedAt || null,
              creator: {
                id: course.createdBy || "",
                email: "",
                fullName: course.createdBy || "Giảng viên",
                passwordModified: false,
              },
              category: {
                id: course.categoryId || "",
                name: course.category?.name || "",
                notes: null,
                parentId: null,
                createdAt: "",
                updatedAt: "",
                deletedAt: "",
              },
              chapters: [],
            }))}
          />
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {/* Previous page button */}
            {pagination.currentPage > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                &laquo;
              </Button>
            )}

            {Array.from({ length: pagination.totalPage }, (_, i) => i + 1)
              .map((page) => {
                const showPage =
                  page === 1 ||
                  page === pagination.totalPage ||
                  Math.abs(page - pagination.currentPage) <= 1;

                if (!showPage) {
                  if (page === 2 || page === pagination.totalPage - 1) {
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
                    variant={
                      page === pagination.currentPage ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })
              .filter(Boolean)}

            {pagination.currentPage < pagination.totalPage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                &raquo;
              </Button>
            )}
          </div>
        </div>
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
