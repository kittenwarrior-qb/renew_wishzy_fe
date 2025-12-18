"use client"

import { useSearchParams } from "next/navigation"
import { useControlParams } from "@/hooks/useControlParams"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import BlogCard from "./BlogCard"
import { blogData } from "@/lib/blogData"
import { BlogSectionHeader } from "./BlogSectionHeader"

const ITEMS_PER_PAGE = 6

interface BlogListPageProps {
  limit?: number
}

export const BlogListPage = ({ limit }: BlogListPageProps) => {
  const { queryParams, replaceParams } = useControlParams()
  const currentPage = Math.max(1, parseInt(queryParams.pPage || '1', 10))

  const totalPages = Math.ceil(blogData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedBlogs = blogData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (newPage: number) => {
    replaceParams({ pPage: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BlogSectionHeader
          title="Tất cả bài viết"
          description="Khám phá các bài viết mới nhất về giáo dục và học tập"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedBlogs.map((blog) => (
            <BlogCard key={blog.id} {...blog} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3
                ? i + 1
                : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i

              if (pageNum < 1 || pageNum > totalPages) return null

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export default BlogListPage