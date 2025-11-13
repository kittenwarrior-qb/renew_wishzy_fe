'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Users, BookOpen } from 'lucide-react';
import { useParentCategories } from '@/components/shared/category/useCategory';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Fetch real parent categories
  const { data: categoriesData, isLoading } = useParentCategories();
  
  // Prepare categories for dropdown
  const categories = [
    { value: 'all', label: 'Tất cả danh mục' },
    ...(categoriesData?.data?.map(category => ({
      value: category.id,
      label: category.name
    })) || [])
  ];

  const handleSearch = () => {
    console.log('Searching for:', searchQuery, 'in category:', selectedCategory);
    // Here you would typically navigate to search results page
    // router.push(`/courses?search=${searchQuery}&category=${selectedCategory}`);
  };

  return (
    <section className="w-full bg-background py-16 md:py-20">
      <div className="max-w-[1300px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          <div className="w-full lg:w-3/5 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <BookOpen className="w-4 h-4 mr-2" />
                Wishzy - The Leader In Online Learning
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Engaging & Accessible
                <br />
                <span className="text-primary">
                  Online
                </span>{' '}
                Courses For All
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl">
                Discover thousands of courses from expert instructors. Learn at your own pace with lifetime access on mobile and desktop.
              </p>
            </div>

            <div className="md:hidden w-full">
              <div className="flex flex-col space-y-4">
                <div className="w-full">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-14 rounded-full bg-background border shadow-sm px-6">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex w-full rounded-full overflow-hidden border shadow-sm bg-background">
                  <Input
                    type="text"
                    placeholder="Search Courses, Instructors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-full bg-transparent px-6"
                  />
                  <Button 
                    onClick={handleSearch}
                    className="h-14 px-6 rounded-r-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:block bg-background rounded-full shadow-sm border overflow-hidden max-w-3xl">
              <div className="flex">
                <div className="shrink-0 w-48 border-r">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-14 border-0 focus:ring-0 focus:ring-offset-0 rounded-none bg-transparent px-6">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 relative flex items-center">
                  <Input
                    type="text"
                    placeholder="Search Courses, Instructors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none bg-transparent px-6"
                  />
                </div>

                <Button 
                  onClick={handleSearch}
                  className="h-14 px-8 rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Search className="w-5 h-5" />
                  <span className="ml-2">Search</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-10 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">250K+</div>
                <div>Students Enrolled</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <span className="font-semibold text-foreground">4.9</span>
                <span>/ 200 Review</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Trusted by over 15K Users worldwide since 2024
            </div>
          </div>

          {/* Right Content - 40% */}
          <div className="w-full lg:w-2/5 relative">
            <div className="relative">
              {/* Main Image Placeholder */}
              <div className="relative bg-primary/10 rounded-2xl p-8 overflow-hidden">
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  50+ Courses
                </div>
                
                {/* Student Avatar Group */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-primary/80 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-primary/60 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-primary/40 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-primary/20 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-foreground text-sm font-medium">250K+ Students</div>
                </div>

                {/* Placeholder for student image */}
                <div className="mt-16 flex justify-center">
                  <div className="w-48 h-64 bg-primary/5 rounded-2xl flex items-center justify-center">
                    <Users className="w-16 h-16 text-primary/40" />
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground">Live Learning</span>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary/30 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;