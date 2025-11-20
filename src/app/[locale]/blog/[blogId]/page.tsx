import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";
import { blogData } from "@/lib/blogData";

interface BlogDetailPageProps {
  params: Promise<{
    blogId: string;
    locale: string;
  }>;
}

const BlogDetailPage = async ({ params }: BlogDetailPageProps) => {
  const { blogId } = await params;
  const blog = blogData.find(b => b.id === blogId);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative w-full h-[400px] md:h-[500px] bg-muted">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Blog
        </Link>

        {/* Article Header */}
        <div className="bg-background rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium mb-6">
            <span className="text-primary">✦</span>
            <span>Blog</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground leading-tight">
            {blog.title}
          </h1>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {blog.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{blog.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{blog.readTime}</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-background rounded-2xl shadow-xl p-8 md:p-12 mb-16">
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
              prose-ul:text-muted-foreground prose-ul:my-6
              prose-li:my-2
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:text-primary prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </article>
    </div>
  );
};

export default BlogDetailPage;