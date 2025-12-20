'use client';

import HeroSection from "@/components/shared/sections/HeroSection";
import CtaSection from "@/components/shared/sections/CtaSection";
import FaqSection from "@/components/shared/sections/FaqSection";
import FeaturesSection from "@/components/shared/sections/FeaturesSection";
import StatSection from "@/components/shared/sections/StatSection";
import CategoryListSection from "@/components/shared/sections/CategoryListSection";
import BlogSection from "@/components/shared/sections/BlogSection";
import HotCourseSection from "@/components/shared/sections/HotCourseSection";
import FreeCourseList from "@/components/shared/course/FreeCourseList";
import { QuizSection } from "@/components/shared/sections/QuizSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <StatSection />
      <HotCourseSection />
      <FreeCourseList />
      <CategoryListSection />
      <QuizSection />
      <BlogSection />
      <FeaturesSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}