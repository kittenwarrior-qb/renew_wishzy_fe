import BlogCard from "./BlogCard";
import { usePostList } from "@/components/shared/post/usePost";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BlogListProps {
  limit?: number;
}

const BlogList = ({ limit = 3 }: BlogListProps) => {
  const { data, isLoading } = usePostList({
    limit,
    isActive: true,
  });

  const blogs = data?.items || [];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1300px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-background rounded-full text-sm font-medium shadow-sm mb-4">
            <span className="text-primary">✦</span>
            <span>Blog</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Bài Viết Mới Nhất
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground italic">
            Chưa có bài viết nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                title={blog.title}
                image={blog.image || ""}
                author={blog.author?.fullName || "Wishzy Team"}
                category={blog.category?.name || "Tin tức"}
                description={blog.description || ""}
                date={format(new Date(blog.createdAt), "dd MMM, yyyy", { locale: vi })}
                views={blog.views}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogList;
