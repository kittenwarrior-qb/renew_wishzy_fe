import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BlogList from "@/components/shared/blog/BlogList";

const BlogSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-background">
        <BlogList limit={3} />
    </section>
  );
};

export default BlogSection;
