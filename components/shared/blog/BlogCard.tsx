import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface BlogCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
}

const BlogCard = ({ id, title, description, image }: BlogCardProps) => {
  return (
    <Link
      href={`/blog/${id}`}
      className="inline-flex items-center gap-2 text-sm font-medium transition-all"
    >
      <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer">
        <div className="relative h-[240px] w-full overflow-hidden bg-muted">
          <Image
            src={image || "/images/momo.png"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <CardContent className="px-6">
          <h3 className="text-lg font-semibold mb-2 text-foreground line-clamp-2 min-h-[56px]">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[60px]">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;
