"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  MessageSquare,
  Tag,
  Heart,
  Reply
} from "lucide-react";
import { notFound } from "next/navigation";

import { blogData } from "@/lib/blogData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Comments from "@/components/shared/blog/Comments";

interface BlogDetailPageProps {
  params: Promise<{
    blogId: string;
    locale: string;
  }>;
}

const BlogDetailPage = ({ params }: BlogDetailPageProps) => {
  const { blogId } = React.use(params);

  const blog = blogData.find((b) => b.id === blogId);

  if (!blog) notFound();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const [commentLikes, setCommentLikes] = React.useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        blog.comments?.map((c) => [c.id, c.likes ?? 0]) ?? []
      )
  );

  const toggleLike = (id: string) => {
    setCommentLikes((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }));
  };

  const sharePost = async () => {
    if (navigator.share) {
      await navigator.share({
        title: blog.title,
        text: blog.description,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link đã được sao chép!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 -mt-20 relative z-10">
        <div className="bg-background rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 pb-0">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại Blog
            </Link>
          </div>

          <div className="p-6 md:p-12 pt-4 md:pt-8">
            <Badge variant="secondary" className="gap-1.5 mb-6">
              <Tag className="w-3.5 h-3.5" />
              {blog.categoryBlog}
            </Badge>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {blog.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              {blog.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-t pt-6">
              <div className="flex items-center gap-2">
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    blog.author
                  )}&background=random`}
                  alt={blog.author}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                {blog.author}
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(blog.date)}
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {blog.readTime}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={sharePost}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>

          <div className="px-6 pb-12 md:px-12">
            <Separator className="mb-8" />
            <div
              className="prose prose-lg max-w-none
              prose-headings:text-foreground
              prose-p:text-muted-foreground
              prose-p:leading-8
              prose-a:text-primary
              prose-blockquote:border-l-4 prose-blockquote:border-primary
              prose-code:bg-muted prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          <div className="p-6 md:p-8 border-t">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-xl font-semibold">
                Bình luận ({blog.comments?.length ?? 0})
              </h3>
            </div>
            <Comments comments={blog.comments || []} />
          </div>
        </div>
        {/* Related */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogData
              .filter((b) => b.id !== blog.id)
              .slice(0, 3)
              .map((item) => (
                <Link key={item.id} href={`/blog/${item.id}`} className="group">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </Link>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlogDetailPage;
