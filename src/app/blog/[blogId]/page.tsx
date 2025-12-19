"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Tag,
  Star,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";

import { usePostDetail } from "@/components/shared/post/usePost";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Comments from "@/components/shared/blog/Comments";
import { RelatedPosts } from "@/components/shared/blog/RelatedPosts";
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper";
import { LoginModal } from "@/components/shared/auth/LoginModal";

// Mock Data for Top Selling Courses
const TOP_SELLING_COURSES = [
  {
    id: 1,
    title: "Master ReactJS & Next.js Pro",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop",
    price: "1.299.000đ",
    rating: 4.8,
    students: 1540,
  },
  {
    id: 2,
    title: "Fullstack Web Development 2024",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2564&auto=format&fit=crop",
    price: "2.499.000đ",
    rating: 4.9,
    students: 2100,
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?q=80&w=2670&auto=format&fit=crop",
    price: "899.000đ",
    rating: 4.7,
    students: 850,
  },
  {
    id: 4,
    title: "DevOps Zero to Hero",
    image: "https://images.unsplash.com/photo-1667372393119-c81c0e86a9f9?q=80&w=2670&auto=format&fit=crop",
    price: "1.599.000đ",
    rating: 4.9,
    students: 1200,
  },
];

interface BlogDetailPageProps {
  params: Promise<{
    blogId: string;
    locale: string;
  }>;
}

const BlogDetailPage = ({ params }: BlogDetailPageProps) => {
  const { blogId } = React.use(params);

  const { data: blog, isLoading } = usePostDetail(blogId)

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>

  if (!blog) notFound();

  const sharePost = async () => {
    if (navigator.share) {
      await navigator.share({
        title: blog.title,
        text: blog.description || "",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link đã được sao chép!");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
        {blog.image && (
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="max-w-7.5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-background rounded-2xl shadow-xl overflow-hidden border">
              <div className="p-6 pb-0">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại Blog
                </Link>
              </div>

              <div className="p-6 md:p-10 pt-4 md:pt-6">
                <Badge variant="secondary" className="gap-1.5 mb-4 bg-primary/10 text-primary-dark hover:bg-primary/20">
                  <Tag className="w-3.5 h-3.5" />
                  {blog.category?.name || "Chưa phân loại"}
                </Badge>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
                  {blog.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        blog.author?.fullName || "Wishzy"
                      )}&background=random`}
                      alt={blog.author?.fullName || "Author"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="font-medium text-foreground">{blog.author?.fullName || "Tác giả Wishzy"}</span>
                  </div>

                  <Separator orientation="vertical" className="h-4" />

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(blog.createdAt), "dd 'tháng' MM, yyyy", { locale: vi })}
                  </div>

                  <Separator orientation="vertical" className="h-4 hidden sm:block" />

                  <div className="flex items-center gap-2 hidden sm:flex">
                    <Clock className="w-4 h-4" />
                    {Math.max(1, Math.ceil((blog.content?.length || 0) / 1000))} phút đọc
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-muted-foreground hover:text-primary"
                    onClick={sharePost}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>

                <div
                  className="prose prose-lg max-w-none
                            prose-headings:text-foreground prose-headings:font-bold
                            prose-p:text-muted-foreground prose-p:leading-8
                            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
                            prose-img:rounded-xl prose-img:shadow-md
                            prose-code:bg-muted prose-code:text-primary-dark prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>

              <div className="p-6 md:p-10 border-t bg-muted/20">
                <Comments comments={blog.comments || []} blogId={blog.id} />
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar (Top Selling Courses) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-background rounded-2xl shadow-lg p-6 sticky top-24 border border-border/40">
              <h3 className="text-xl font-bold mb-6 text-foreground tracking-tight">
                Khóa học bán chạy
              </h3>
              <div className="space-y-6">
                {TOP_SELLING_COURSES.map((course, index) => (
                  <Link href="#" key={course.id} className="group block relative pl-4">
                    {/* Ranking Number */}
                    <span
                      className={`absolute -left-2 top-0 text-3xl font-black italic opacity-20 select-none
                            ${index === 0 ? 'text-yellow-500 opacity-60 scale-110' :
                          index === 1 ? 'text-slate-400 opacity-50' :
                            index === 2 ? 'text-orange-700 opacity-40' : 'text-foreground'}`}
                    >
                      {index + 1}
                    </span>

                    <div className="flex gap-4 items-start relative z-10 pl-2">
                      <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-muted shadow-sm">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <TruncateTooltipWrapper lineClamp={2} contentClassName="!bg-primary !text-primary-foreground">
                          <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
                            {course.title}
                          </h4>
                        </TruncateTooltipWrapper>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <div className="flex items-center text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded-md">
                            {course.rating} ★
                          </div>
                          <span>{course.students} học viên</span>
                        </div>
                        <div className="text-primary font-bold text-sm">
                          {course.price}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Button className="w-full mt-8 rounded-xl font-bold" variant="outline" size="lg">
                Xem bảng xếp hạng
              </Button>
            </div>
          </div>

        </div>

        {/* Bottom: Related Posts */}
        <div className="mt-16">
          <Separator className="mb-10" />
          <RelatedPosts currentPostId={blog.id} limit={5} />
        </div>

      </div>
      <LoginModal />
    </div>
  );
};

export default BlogDetailPage;
