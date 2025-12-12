import BlogList from "@/components/shared/blog/BlogList";

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <BlogList limit={3} />
    </div>
  );
};

export default BlogPage;