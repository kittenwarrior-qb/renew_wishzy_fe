import api from "./api";

export const chapterService = {
  getChapterByCourseId: async (courseId: string) => {
    const response = await api.get(`/chapters/course/${courseId}`);
    return response.data.data;
  },

  getChapterByCourse: async (courseId: string) => {
    const response = await api.get(`/chapters/course/${courseId}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    courseId: string;
    description?: string;
    duration?: number;
    afterChapterId?: string;
  }) => {
    const res = await api.post(`/chapters`, data);
    return res.data;
  },

  update: async (
    id: string,
    data: Partial<{ name: string; description?: string; duration?: number }>
  ) => {
    const res = await api.patch(`/chapters/${id}`, data);
    return res.data;
  },

  remove: async (id: string) => {
    const res = await api.delete(`/chapters/${id}`);
    return res.data;
  },
};
