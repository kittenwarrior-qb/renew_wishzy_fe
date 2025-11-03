import type * as CourseTypes from '@/types/course';
import { useApiQuery } from '@/hooks/useApi';

const courseEndpoints = {
  list: 'courses',
  detail: 'courses',
} as const;

export const Course = () => {
  const useCourseList = (filter?: CourseTypes.CourseFilter) => {
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
      if (filter.categoryId) {
        queryParams.categoryId = filter.categoryId;
      }
      if (filter.courseLevel) {
        queryParams.courseLevel = filter.courseLevel;
      }
      if (filter.createdBy) {
        queryParams.createdBy = filter.createdBy;
      }
      if (filter.rating !== undefined) {
        queryParams.rating = filter.rating.toString();
      }
      if (filter.minPrice !== undefined) {
        queryParams.minPrice = filter.minPrice.toString();
      }
      if (filter.maxPrice !== undefined) {
        queryParams.maxPrice = filter.maxPrice.toString();
      }
      if (filter.status) {
        queryParams.status = filter.status;
      }
    }

    return useApiQuery<CourseTypes.CourseListResponse>(
      courseEndpoints.list,
      {
        queryParams:
          Object.keys(queryParams).length > 0 ? queryParams : undefined,
      },
    );
  };

  const useCourseDetail = (id: string) => {
    return useApiQuery<CourseTypes.CourseDetailResponse>(
      `${courseEndpoints.detail}/${id}`,
    );
  };

  return {
    useCourseList,
    useCourseDetail,
  };
};

export const useCourseList = (filter?: CourseTypes.CourseFilter) =>
  Course().useCourseList(filter);
export const useCourseDetail = (id: string) => Course().useCourseDetail(id);
