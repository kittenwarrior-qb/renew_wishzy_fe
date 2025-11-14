"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export interface SearchParams {
  // Pagination
  pPage: string | null;
  pLimit: string | null;
  // Common filters
  pId: string | null;
  pSearch: string | null;
  pStatus: string | null;
  pPaymentMethod: string | null;
  pRole: string | null;
  pIsInstructorActive: string | null;
  pCategoryId: string | null;
  pCourseId: string | null;
  pFullName: string | null;
  pEmail: string | null;
  pApplyScope: string | null;
  pIsActive: string | null;
  pCode: string | null;
  pName: string | null;
  pLevel: string | null;
  pMinPrice: string | null;
  pMaxPrice: string | null;
  // Date ranges
  pCreatedAtFrom: string | null;
  pCreatedAtTo: string | null;
  pEndDateFrom: string | null;
  pEndDateTo: string | null;
  // Sorting
  pSortField: string | null;
  pSortType: string | null;
  // Misc
  pTab: string | null;
  pDeleted: string | null;
  // Arrays (if needed)
  pCategories: string[] | null;
  pStatuses: string[] | null;
}

const getQueryParams = (searchParams: URLSearchParams): SearchParams => ({
  pPage: searchParams.get("page"),
  pLimit: searchParams.get("limit"),
  pId: searchParams.get("id"),
  pSearch: searchParams.get("search"),
  pStatus: searchParams.get("status"),
  pPaymentMethod: searchParams.get("paymentMethod"),
  pRole: searchParams.get("role"),
  pIsInstructorActive: searchParams.get("isInstructorActive"),
  pCategoryId: searchParams.get("categoryId") ?? searchParams.get("category"),
  pCourseId: searchParams.get("courseId"),
  pFullName: searchParams.get("fullName"),
  pEmail: searchParams.get("email"),
  pApplyScope: searchParams.get("applyScope"),
  pIsActive: searchParams.get("isActive"),
  pCode: searchParams.get("code"),
  pName: searchParams.get("name"),
  pLevel: searchParams.get("courseLevel") ?? searchParams.get("level"),
  pMinPrice: searchParams.get("minPrice"),
  pMaxPrice: searchParams.get("maxPrice"),
  pCreatedAtFrom: searchParams.get("createdAtFrom"),
  pCreatedAtTo: searchParams.get("createdAtTo"),
  pEndDateFrom: searchParams.get("endDateFrom"),
  pEndDateTo: searchParams.get("endDateTo"),
  pSortField: searchParams.get("sortField"),
  pSortType: searchParams.get("sortType"),
  pTab: searchParams.get("tab"),
  pDeleted: searchParams.get("deleted"),
  pCategories: (() => {
    const vals = searchParams.getAll("categories");
    return vals.length ? vals : null;
  })(),
  pStatuses: (() => {
    const vals = searchParams.getAll("status");
    return vals.length ? vals : null;
  })(),
});

type UpdatableValue = string | number | boolean | null | undefined
type UpdatableArray = Array<string | number | boolean>

export const useControlParams = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [queryParams, setQueryParams] = useState<SearchParams>(() =>
    getQueryParams(searchParams),
  );

  useEffect(() => {
    setQueryParams(getQueryParams(searchParams));
  }, [searchParams]);

  const replaceParams = useCallback(
    (paramsToUpdate: Record<string, UpdatableValue | UpdatableArray>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        params.delete(key);
        if (Array.isArray(value)) {
          value.forEach((v) => {
            params.append(key, String(v));
          });
        } else if (value !== undefined && value !== null && value !== "") {
          // allow false/0
          if (typeof value === 'boolean' || typeof value === 'number') {
            params.set(key, String(value));
          } else {
            params.set(key, value);
          }
        }
      });

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      replace(newUrl);
    },
    [searchParams, pathname, replace],
  );

  const clearParams = useCallback(() => {
    replace(pathname);
  }, [pathname, replace]);

  return { searchParams, queryParams, replaceParams, clearParams };
};

