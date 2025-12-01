"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TrashPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main categories page with deleted filter
    router.replace("/admin/categories?deleted=true");
  }, [router]);

  return null;
}
