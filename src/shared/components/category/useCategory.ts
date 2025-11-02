import type * as CategoryTypes from '@/types/category';
import { useApiQuery } from '@/hooks/useApi';

const categoryEndpoints = {
  list: 'categories',
  detail: 'categories',
} as const;

export const Category = () => {
  const useCategoryList = (filter?: CategoryTypes.CategoryFilter) => {
    const queryParams: Record<string, string> = {};

    if (filter) {
      if (filter.page !== undefined) {
        queryParams.page = filter.page.toString();
      }
      if (filter.limit !== undefined) {
        queryParams.limit = filter.limit.toString();
      }
      if (filter.name) {
        queryParams.name = filter.name;
      }
      if (filter.parentId) {
        queryParams.parentId = filter.parentId;
      }
      if (filter.isSubCategory !== undefined) {
        queryParams.isSubCategory = filter.isSubCategory.toString();
      }
    }

    return useApiQuery<CategoryTypes.CategoryListResponse>(
      categoryEndpoints.list,
      {
        queryParams:
          Object.keys(queryParams).length > 0 ? queryParams : undefined,
      },
    );
  };

  const useCategoryDetail = (id: string) => {
    return useApiQuery<CategoryTypes.CategoryDetailResponse>(
      `${categoryEndpoints.detail}/${id}`,
    );
  };

  return {
    useCategoryList,
    useCategoryDetail,
  };
};

export const useCategoryList = (filter?: CategoryTypes.CategoryFilter) =>
  Category().useCategoryList(filter);
export const useCategoryDetail = (id: string) =>
  Category().useCategoryDetail(id);
