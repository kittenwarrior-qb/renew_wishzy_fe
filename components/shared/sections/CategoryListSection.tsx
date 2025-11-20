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
    <section className="relative w-full overflow-hidden bg-background pt-16">
      <div className="max-w-[1300px] mx-auto px-4 py-4">
        <div className="mb-4">
          <h2 className="text-3xl font-bold mb-2 text-foreground">
            Danh mục nổi
          </h2>
          <p className="text-muted-foreground mb-8">
            Khám phá những khóa học mới được cập nhật
          </p>
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