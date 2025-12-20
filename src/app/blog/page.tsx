"use client";
import { Suspense } from "react";
import BlogListPage from "@/components/shared/blog/BlogListPage"

const BlogPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BlogListPage />
    </Suspense>
  )
}

export default BlogPage