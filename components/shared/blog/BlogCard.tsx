import Image from "next/image";
import Link from "next/link";
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper";

import { Calendar, Eye } from "lucide-react";

interface BlogCardProps {
  id: string | number;
  title: string;
  image: string;
  author: string;
  category?: string;
  date?: string;
  readTime?: string;
  description?: string;
  views?: number;
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
  views,
}: BlogCardProps) => {
  return (
    <Link href={`/blog/${id}`} className="block h-full">
      <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group">
        <div className="relative aspect-video overflow-hidden group/image">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {/* Category back in valid position */}
          <span className="inline-flex px-3 py-1 mb-3 text-[10px] font-bold bg-primary rounded-full w-fit uppercase tracking-wider">
            {category}
          </span>

          <TruncateTooltipWrapper
            lineClamp={2}
            className="mb-2"
            contentClassName="!bg-primary !text-primary-foreground shadow-xl rounded-lg px-3 py-2 text-sm font-medium leading-relaxed"
          >
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </TruncateTooltipWrapper>

          {description && (
            <div className="mb-4">
              <TruncateTooltipWrapper
                lineClamp={2}
                contentClassName="!bg-primary !text-primary-foreground shadow-xl rounded-lg px-3 py-2 text-sm font-medium leading-relaxed"
              >
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  {description}
                </p>
              </TruncateTooltipWrapper>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
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
                <span className="truncate max-w-[150px] sm:max-w-[150px]">{author}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {views || 0}
                </div> */}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {date}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
