import BlogCard from "./BlogCard";

interface BlogListProps {
  limit?: number;
}

const BlogList = ({ limit = 3 }: BlogListProps) => {
  const blogs = [
    {
      id: "1",
      title: "Bắt Đầu Với Các Component shadcn/ui",
      description: "Tìm hiểu cách tích hợp và tùy chỉnh các component shadcn/ui trong dự án Next.js của bạn. Chúng tôi sẽ hướng dẫn cài đặt, thiết lập theme và các phương pháp tốt nhất để xây dựng giao diện hiện đại.",
      image: "/images/simple-logo.png",
      slug: "getting-started-shadcn-ui"
    },
    {
      id: "2",
      title: "Xây Dựng Ứng Dụng Web Dễ Tiếp Cận",
      description: "Khám phá cách tạo trải nghiệm web toàn diện bằng các component có khả năng tiếp cận của shadcn/ui. Tìm hiểu các mẹo thực tế để triển khai ARIA labels, điều hướng bàn phím và HTML ngữ nghĩa.",
      image: "/images/simple-logo.png",
      slug: "building-accessible-web-apps"
    },
    {
      id: "3",
      title: "Hệ Thống Thiết Kế Hiện Đại Với Tailwind CSS",
      description: "Tìm hiểu cách tạo hệ thống thiết kế có khả năng mở rộng bằng Tailwind CSS và shadcn/ui. Học cách duy trì tính nhất quán trong khi xây dựng thư viện component linh hoạt và dễ bảo trì.",
      image: "/images/simple-logo.png",
      slug: "modern-design-systems-tailwind"
    }
  ].slice(0, limit);

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
          {blogs.map((blog) => (
            <BlogCard key={blog.id} {...blog} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogList;
