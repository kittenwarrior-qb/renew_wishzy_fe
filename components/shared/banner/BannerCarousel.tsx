'use client';

import * as React from 'react';
import Link from 'next/link';
import { useBanners } from './useBanner';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Card } from '@/components/ui/card';

interface BannerCarouselProps {
  autoplayDelay?: number;
  className?: string;
}

export function BannerCarousel({
  autoplayDelay = 5000,
  className = '',
}: BannerCarouselProps) {
  const { data: banners, isLoading, error } = useBanners();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: autoplayDelay, stopOnInteraction: true })
  );

  const sortedBanners = React.useMemo(() => {
    if (!banners) return [];
    return [...banners].sort((a, b) => a.position - b.position);
  }, [banners]);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (isLoading || error || !sortedBanners || sortedBanners.length === 0) {
    return null;
  }

  return (
    <div className={`max-w-[1300px] px-4 mx-auto ${className}`}>
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full group"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {sortedBanners.map((banner) => (
            <CarouselItem key={banner.id}>
              <Card className="overflow-hidden border-0 rounded-2xl h-[400px] py-0">
                <Link
                  href={banner.link}
                  className="block relative w-full h-full"
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  
                  {/* {banner.title && (
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-white text-2xl font-bold drop-shadow-lg">
                        {banner.title}
                      </h3>
                    </div>
                  )} */}
                </Link>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {sortedBanners.length > 1 && (
          <>
            <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 shadow-lg" />
            <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 shadow-lg" />
            
            <div className="flex justify-center gap-2 mt-4">
              {sortedBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 active:scale-90 ${
                    index === current
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
}
