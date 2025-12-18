import Image from "next/image";
import Link from "next/link";
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper";

interface BlogCardProps {
  id: string | number;
  title: string;
  image: string;
  author: string;
  category?: string;
  date?: string;
  readTime?: string;
  description?: string;
}

const BlogCard = ({
  id,
  title,
  image,
  author,
  category = "Công nghệ",
  description,
  date,
  readTime,
}: BlogCardProps) => {
  return (
    <Link href={`/blog/${id}`} className="block h-full">
      <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <span className="text-sm font-medium text-blue-600 mb-2">
            {category}
          </span>

          <TruncateTooltipWrapper lineClamp={1} className="mb-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
          </TruncateTooltipWrapper>

          {description && (
            <div className="mb-3">
              <TruncateTooltipWrapper lineClamp={2}>
                <p className="text-sm text-gray-600">{description}</p>
              </TruncateTooltipWrapper>
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=random`}
                  alt={author}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-600 truncate">{author}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
