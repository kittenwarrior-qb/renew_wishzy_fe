'use client';

import Link from "next/link";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface SearchBreadcrumbProps {
  selectedCategory: any;
}

export const SearchBreadcrumb = ({ selectedCategory }: SearchBreadcrumbProps) => {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="inline-flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Trang chủ
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {selectedCategory ? (
            <BreadcrumbLink asChild>
              <Link href="/search">Khóa học</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Khóa học</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {selectedCategory && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{selectedCategory.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
