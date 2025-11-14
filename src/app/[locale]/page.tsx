'use client';

import { useQueryHook } from "@/src/hooks/useQueryHook";
import { courseService } from "@/src/services/course";
import { CourseItemType } from "@/src/types/course/course-item.types";
import { PaginationResponse } from "@/src/types/pagination/pagination.type";
import ListCourse from "@/components/shared/course/ListCourse";
import HeroSection from "@/components/shared/sections/HeroSection";
import CtaSection from "@/components/shared/sections/CtaSection";
import FaqSection from "@/components/shared/sections/FaqSection";
import FeaturesSection from "@/components/shared/sections/FeaturesSection";
import { BannerCarousel } from "@/components/shared/banner";
import StatSection from "@/components/shared/sections/StatSection";

export default function Home() {
  const { data: courses } = useQueryHook<PaginationResponse<CourseItemType>>(
    ['courses'],
    () => courseService.getCourses(),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <StatSection />
      
      <BannerCarousel />
      
      <div className="max-w-[1300px] mx-auto px-4 py-12 space-y-16">
        <div>
          <h2 className="text-2xl font-bold mb-6">Danh sách khoá học</h2>
          <ListCourse courses={courses?.items || []} />
        </div>
      </div>

      <FeaturesSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}