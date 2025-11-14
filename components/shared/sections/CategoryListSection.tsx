'use client';

import { usePopularCategories } from '../category/useCategory';
import Link from 'next/link';
import { BookOpen, ChevronRight, GraduationCap, TrendingUp, Search, Globe, Paintbrush, Laptop } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const categoryIcons = [BookOpen, GraduationCap, Globe, TrendingUp, Search, Laptop, Paintbrush, BookOpen];

const CategoryListSection = () => {
  const { data } = usePopularCategories(8);
  const categories = data?.data || [];

  return (
    <section className="relative w-full overflow-hidden bg-background py-16 md:py-20">
      <div className="max-w-[1300px] mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            {/* <div className="inline-flex items-center gap-2 px-5 py-2 bg-background rounded-full text-sm font-medium shadow-sm mb-4">
              <span className="text-primary">✦</span>
              <span>Danh mục khóa học</span>
            </div> */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Danh Mục Phổ biến</h2>
            <p className="text-muted-foreground">
              Khám phá các khóa học phong phú được thiết kế để giúp bạn đạt được mục tiêu học tập.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full px-7 h-[40px] text-[14px] transition-transform hover:-translate-y-1"
          >
            <Link href="/search" className="flex items-center gap-2">
              Xem tất cả
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <Link key={category.id} href={`/search?categoryId=${category.id}`}>
                <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="px-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.totalCourses || 0} khóa học
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryListSection;