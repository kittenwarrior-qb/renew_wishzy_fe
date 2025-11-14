'use client';

import HeroSection from "@/components/shared/sections/HeroSection";
import CtaSection from "@/components/shared/sections/CtaSection";
import FaqSection from "@/components/shared/sections/FaqSection";
import FeaturesSection from "@/components/shared/sections/FeaturesSection";
import { BannerCarousel } from "@/components/shared/banner";
import StatSection from "@/components/shared/sections/StatSection";
import CategoryListSection from "@/components/shared/sections/CategoryListSection";
import ListBestSellerCourseCard from "@/components/shared/course/ListBestSellerCourseCard";
import BlogSection from "@/components/shared/sections/BlogSection";
import HotCourseSection from "@/components/shared/sections/HotCourseSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <StatSection />
      {/* <ListBestSellerCourseCard /> */}
      <HotCourseSection />
      <CategoryListSection />
      {/* <BannerCarousel /> */}
      <BlogSection />
      <FeaturesSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}