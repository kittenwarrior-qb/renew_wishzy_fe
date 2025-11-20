import BlogCard from "./BlogCard";
import { blogData } from "@/lib/blogData";

interface BlogListProps {
  limit?: number;
}

const BlogList = ({ limit = 3 }: BlogListProps) => {
  const blogs = blogData.slice(0, limit);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog, index) => (
            <BlogCard key={`${blog.id}-${index}`} {...blog} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogList;
