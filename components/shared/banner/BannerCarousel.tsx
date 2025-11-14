'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBannerList } from './useBanner';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface BannerCarouselProps {
  autoplayDelay?: number;
  className?: string;
}

export function BannerCarousel({
  autoplayDelay = 5000,
  className = '',
}: BannerCarouselProps) {
  const { data, isPending, isError } = useBannerList({ page: 1, limit: 20 });
  const banners = data?.data ?? [];

  const plugin = React.useRef(
    Autoplay({ delay: autoplayDelay, stopOnInteraction: true })
  );

  if (isPending) {
    return (
      <div className={`w-full h-[400px] bg-gray-200 animate-pulse ${className}`} />
    );
  }

  if (isError || !banners || banners.length === 0) {
    return null;
  }

  const sortedBanners = [...banners].sort((a, b) => a.position - b.position);

  return (
    <div className={`w-full ${className}`}>
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {sortedBanners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative w-full h-[400px] overflow-hidden">
                <Link href={banner.link} className="block w-full h-full">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    priority={banner.position === 1}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white text-2xl font-bold drop-shadow-lg">
                      {banner.title}
                    </h3>
                  </div>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {sortedBanners.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
    </div>
  );
}
