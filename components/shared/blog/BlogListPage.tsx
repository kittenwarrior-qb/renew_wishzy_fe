"use client"

import { useControlParams } from "@/hooks/useControlParams"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, ArrowRight, TrendingUp } from "lucide-react"
import BlogCard from "./BlogCard"
import { usePostList } from "../post/usePost"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

const ITEMS_PER_PAGE = 8

interface BlogListPageProps {
  limit?: number
}

export const BlogListPage = ({ limit }: BlogListPageProps) => {
  const { queryParams, replaceParams } = useControlParams()
  const currentPage = Math.max(1, parseInt(queryParams.page || '1', 10))

  const { data, isLoading } = usePostList({
    page: currentPage,
    limit: limit || ITEMS_PER_PAGE,
    isActive: true
  })

  const blogs = data?.items || []
  const totalPages = data?.totalPages || 0

  // Featured Post is the first one on the first page
  const featuredBlog = currentPage === 1 ? blogs[0] : null;

  // The rest of the blogs on this page
  const listBlogs = currentPage === 1 ? blogs.slice(1) : blogs;

  // Simulate "Most Viewed" using real data (first 5)
  const mostViewedBlogs = blogs.slice(0, 5)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      replaceParams({ page: newPage.toString() })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    if (isLoading) return null

    return pageNumbers.map((pageNum) => (
      <Button
        key={pageNum}
        variant={currentPage === pageNum ? "default" : "outline"}
        size="sm"
        className={`min-w-10 h-10 p-0 ${currentPage === pageNum ? 'font-bold' : ''}`}
        onClick={() => handlePageChange(pageNum)}
      >
        {pageNum}
      </Button>
    ))
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">Blogs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section (Featured Post) - Only on first page */}
        {currentPage === 1 && featuredBlog && (
          <div className="relative rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
            <div className="relative h-[400px] md:h-[500px] w-full">
              {featuredBlog.image && (
                <Image
                  src={featuredBlog.image}
                  alt={featuredBlog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              )}
            </div>
            <div className="absolute bottom-0 left-0 p-6 md:p-10 z-20 max-w-3xl text-white space-y-4">
              <Badge variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90 pointer-events-none mb-2">
                Mới nhất
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {featuredBlog.title}
              </h1>
              <p className="text-gray-200 line-clamp-2 md:text-lg">
                {featuredBlog.description}
              </p>
              <div className="pt-4">
                <Button asChild size="lg" className="rounded-full">
                  <Link href={`/blog/${featuredBlog.id}`}>
                    Đọc ngay <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Blog Content Layout - Single Column */}
        <div className="space-y-16">

          {/* Most Viewed Section - Moved to Top */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary border-b pb-4">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-xl font-bold text-foreground">
                Xu hướng & Đọc nhiều nhất
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mostViewedBlogs.slice(0, 3).map((blog) => (
                <Link href={`/blog/${blog.id}`} key={blog.id} className="group flex gap-4 items-start md:block md:space-y-3">
                  <div className="relative w-24 h-20 md:w-full md:h-40 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {blog.image && (
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <h4 className="font-semibold text-sm md:text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(blog.createdAt), "dd/MM/yyyy", { locale: vi })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content: Blog List */}
          <div className="space-y-10">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold tracking-tight">Bài viết mới</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[350px] bg-muted animate-pulse rounded-xl" />
                ))
              ) : listBlogs.length > 0 ? (
                listBlogs.map((blog) => (
                  <div key={blog.id} className="group">
                    <BlogCard
                      id={blog.id}
                      title={blog.title}
                      image={blog.image || ""}
                      author={blog.author?.fullName || "Wishzy"}
                      category={blog.category?.name}
                      description={blog.description || ""}
                      date={format(new Date(blog.createdAt), "dd/MM/yyyy", { locale: vi })}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  Không tìm thấy bài viết nào.
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-center gap-4 pt-10 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {renderPageNumbers()}

                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default BlogListPage