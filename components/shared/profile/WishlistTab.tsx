"use client";

import { useQueryHook } from "@/src/hooks/useQueryHook";
import { wishlistService } from "@/src/services/wishlist";
import { Loader2 } from "lucide-react";
import CourseCard from "../course/CourseCard";
import { CourseItemType } from "@/src/types/course/course-item.types";
import { useAppStore } from "@/src/stores/useAppStore";
import { useEffect } from "react";

export const WishlistTab = () => {
  const { wishlist: storeWishlist, setWishlist } = useAppStore();
  const {
    data: apiWishlist,
    isLoading,
    refetch,
  } = useQueryHook(["wishlist"], () => wishlistService.getWishlist(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Sync API wishlist với store mỗi khi có thay đổi
  useEffect(() => {
    if (apiWishlist !== undefined) {
      // Handle cả 2 trường hợp: API trả về array trực tiếp hoặc object có courseDetails
      const wishlistData = Array.isArray(apiWishlist)
        ? apiWishlist
        : apiWishlist?.courseDetails || [];
      setWishlist(wishlistData);
    }
  }, [apiWishlist, setWishlist]);

  // Refetch khi component mount để đảm bảo đồng bộ
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!storeWishlist || storeWishlist.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách yêu thích</h2>
        <div className="text-muted-foreground">
          <p>Chưa có khóa học yêu thích nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {storeWishlist.map((course: CourseItemType) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
