"use client";

import Link from "next/link";
import Image from "next/image";
import { usePostList } from "../post/usePost";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface RelatedPostsProps {
    currentPostId: string;
    categoryId?: string;
    className?: string;
    limit?: number;
}

export const RelatedPosts = ({
    currentPostId,
    categoryId,
    className = "",
    limit = 10
}: RelatedPostsProps) => {
    const { data, isLoading } = usePostList({
        limit: limit + 1, // Fetch one extra in case current is included
        isActive: true,
        categoryId
    })

    const relatedPosts = (data?.items || [])
        .filter(blog => blog.id !== currentPostId)
        .slice(0, limit);

    if (relatedPosts.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Bài viết liên quan</h2>
                    <div className="flex gap-2">
                        <CarouselPrevious className="static translate-y-0" />
                        <CarouselNext className="static translate-y-0" />
                    </div>
                </div>

                <CarouselContent className="-ml-4">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/4">
                                <div className="h-[250px] bg-muted animate-pulse rounded-2xl" />
                            </CarouselItem>
                        ))
                    ) : (relatedPosts || []).map((post) => (
                        <CarouselItem key={post.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                            <Link
                                href={`/blog/${post.id}`}
                                className="group block h-full"
                            >
                                <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="relative aspect-video overflow-hidden">
                                        <Image
                                            src={post.image}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        />
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <Badge variant="secondary" className="w-fit mb-3 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200">
                                            {post.category?.name || "Tin tức"}
                                        </Badge>
                                        <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <div className="mt-auto pt-4 flex items-center text-xs text-muted-foreground gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : "--/--/----"}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
};

export default RelatedPosts;