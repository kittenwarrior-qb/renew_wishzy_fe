"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePostList } from "./usePost";
import { cn } from "@/lib/utils";

interface PostNavigationProps {
    currentPostId: string;
    categoryId?: string;
}

export const PostNavigation = ({ currentPostId, categoryId }: PostNavigationProps) => {
    // Fetch a reasonably sized batch to find neighbors
    const { data } = usePostList({
        limit: 50,
        isActive: true,
        categoryId
    });

    const items = data?.items || [];
    const currentIndex = items.findIndex(post => post.id === currentPostId);

    const nextPost = currentIndex > 0 ? items[currentIndex - 1] : null;
    const prevPost = currentIndex !== -1 && currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

    if (!prevPost && !nextPost) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 pt-8 border-t">
            <div className="relative group">
                {prevPost ? (
                    <Link href={`/blog/${prevPost.id}`} className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-slate-50 transition-all group/card h-full">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover/card:bg-primary/10 transition-colors">
                            <ChevronLeft className="w-6 h-6 text-slate-400 group-hover/card:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Bài trước</span>
                            <span className="text-sm font-bold text-slate-800 line-clamp-1 group-hover/card:text-primary transition-colors">
                                {prevPost.title}
                            </span>
                        </div>
                    </Link>
                ) : (
                    <div className="h-full border border-dashed rounded-2xl flex items-center justify-center p-4 opacity-40">
                        <span className="text-xs font-medium text-muted-foreground italic">Đây là bài viết đầu tiên</span>
                    </div>
                )}
            </div>

            <div className="relative group">
                {nextPost ? (
                    <Link href={`/blog/${nextPost.id}`} className="flex items-center justify-between gap-4 p-4 rounded-2xl border bg-card hover:bg-slate-50 transition-all group/card h-full text-right">
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Bài tiếp theo</span>
                            <span className="text-sm font-bold text-slate-800 line-clamp-1 group-hover/card:text-primary transition-colors">
                                {nextPost.title}
                            </span>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover/card:bg-primary/10 transition-colors">
                            <ChevronRight className="w-6 h-6 text-slate-400 group-hover/card:text-primary transition-colors" />
                        </div>
                    </Link>
                ) : (
                    <div className="h-full border border-dashed rounded-2xl flex items-center justify-center p-4 opacity-40">
                        <span className="text-xs font-medium text-muted-foreground italic">Đây là bài viết mới nhất</span>
                    </div>
                )}
            </div>
        </div>
    );
};
