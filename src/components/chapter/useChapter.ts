import type * as ChapterTypes from '@/types/chapter';
import { useApiQuery } from '@/hooks/useApi';

const chapterEndpoints = {
  list: 'chapters',
  detail: 'chapters',
} as const;

export const Chapter = () => {
  const useChapterList = (courseId: string) => {
    return useApiQuery<ChapterTypes.ChapterListResponse>(
      `${chapterEndpoints.list}/course/${courseId}`,
    );
  };

  const useChapterDetail = (id: string) => {
    return useApiQuery<ChapterTypes.ChapterDetailResponse>(
      `${chapterEndpoints.detail}/${id}`,
    );
  };

  return {
    useChapterList,
    useChapterDetail,
  };
};

export const useChapterList = (courseId: string) => Chapter().useChapterList(courseId);
export const useChapterDetail = (id: string) => Chapter().useChapterDetail(id);
