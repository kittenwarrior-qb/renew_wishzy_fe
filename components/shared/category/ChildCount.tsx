"use client"

import * as React from "react"
import { useSubCategoriesCount } from "@/components/shared/category/useCategory"

export function ChildCount({ parentId }: { parentId: string }) {
  const { data } = useSubCategoriesCount(parentId)
  const total = data?.total ?? 0
  return <>{total}</>
}
