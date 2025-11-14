"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BestSellerCourseCard from "./BestSellerCourseCard";
import { useBestSellerCourses } from "./useCourse";
import { Button } from "@/components/ui/button";

const ListBestSellerCourseCard = () => {
  const { data: courses = [], isLoading: loading } = useBestSellerCourses(5);
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: "center",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 10000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-background">
        <div className="max-w-[1300px] mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-[200px] rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-background ">
        <div className="max-w-[1300px] mx-auto px-4">
          <div className="text-center py-8 text-muted-foreground">
            Không có khóa học nào
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-background">
      <div className="max-w-[1300px] mx-auto px-4">
        <div className="relative group">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="flex-[0_0_100%] min-w-0"
                >
                  <BestSellerCourseCard course={course} />
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-lg"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-lg"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ListBestSellerCourseCard;
