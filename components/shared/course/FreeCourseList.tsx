'use client'

import { useFreeCourses } from './useCourse'
import FreeCourseCard from './FreeCourseCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import useEmblaCarousel from 'embla-carousel-react'

const FreeCourseList = () => {
    const { data: courses, isLoading, error } = useFreeCourses(6)
    
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        slidesToScroll: 1,
        dragFree: true,
        containScroll: 'trimSnaps'
    })

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    if (isLoading) {
        return (
            <div className="w-full py-8 text-center">
                Đang tải ...
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full py-8 text-center text-muted-foreground">
                Không thể tải khóa học miễn phí
            </div>
        )
    }

    if (!courses || courses.length === 0) {
        return (
            <div className="w-full py-8 text-center text-muted-foreground">
                Chưa có khóa học miễn phí
            </div>
        )
    }

    return (
        <>
            <div className="mb-4 max-w-[1300px] mx-auto px-4 mt-8">
                <h2 className="text-3xl font-bold mb-2">Khóa học miễn phí</h2>
            </div>
            <div className="w-full py-4 flex justify-center">
                <div className="relative w-full max-w-[1300px] px-4 group/carousel">
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-lg bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        onClick={scrollPrev}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="overflow-hidden py-2" ref={emblaRef}>
                        <div className="flex gap-6 -mx-2">
                            {courses.map((course) => (
                                <div 
                                    key={course.id} 
                                    className="flex-shrink-0 w-full sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] px-2"
                                >
                                    <FreeCourseCard course={course} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-lg bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        onClick={scrollNext}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </>
    )
}

export default FreeCourseList
