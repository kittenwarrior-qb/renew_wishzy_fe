"use client";

import Link from "next/link";
import Image from "next/image";
import { usePostList } from "../post/usePost";
import { cn } from "@/lib/utils";
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
    authorId?: string;
    className?: string;
    limit?: number;
}

export const RelatedPosts = ({
    currentPostId,
    categoryId,
    authorId,
    className = "",
    limit = 10
}: RelatedPostsProps) => {
    // Fetch a larger pool to filter client-side (since we shouldn't touch BE for complex filters)
    const { data, isLoading } = usePostList({
        limit: 100,
        isActive: true,
    })

    const relatedPosts = (data?.items || [])
        .filter(blog => blog.id !== currentPostId)
        .filter(blog =>
            blog.categoryId === categoryId ||
            blog.authorId === authorId
        )
        .slice(0, limit);

    if (!isLoading && relatedPosts.length === 0) {
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
                                <div className="h-[300px] bg-muted animate-pulse rounded-2xl" />
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
                                            src={post.image || "https://placehold.co/600x400?text=Wishzy"}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        />
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <Badge variant="secondary" className="w-fit mb-3 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 uppercase tracking-tighter px-2">
                                            {post.category?.name || "Tin tức"}
                                        </Badge>
                                        <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                            {post.title}
                                        </h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-muted-foreground border-t">
                                            <div className="font-medium flex items-center gap-1">
                                                <Image
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                        post.author?.fullName || "Wishzy"
                                                    )}&background=random`}
                                                    alt={post.author?.fullName || "Author"}
                                                    width={20}
                                                    height={20}
                                                    unoptimized
                                                    className="rounded-full mr-2"
                                                />
                                                {post.author?.fullName}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : "--/--/----"}
                                            </div>
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