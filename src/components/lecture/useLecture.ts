import type * as LectureTypes from '@/types/lecture';
import { useApiQuery } from '@/hooks/useApi';

const lectureEndpoints = {
  list: 'lectures',
  detail: 'lectures',
} as const;

export const Lecture = () => {
  const useLectureList = (chapterId: string) => {
    return useApiQuery<LectureTypes.LectureListResponse>(
      `${lectureEndpoints.list}/${chapterId}/chapter`,
    );
  };

  const useLectureDetail = (id: string) => {
    return useApiQuery<LectureTypes.LectureDetailResponse>(
      `${lectureEndpoints.detail}/${id}`,
    );
  };

  return {
    useLectureList,
    useLectureDetail,
  };
};

export const useLectureList = (chapterId: string) => Lecture().useLectureList(chapterId);
export const useLectureDetail = (id: string) => Lecture().useLectureDetail(id);
