import api from "./api";

export const lectureService = {
  create: async (data: { name: string; fileUrl: string; duration: number; orderIndex: number; chapterId: string; description?: string; isPreview?: boolean }) => {
    const res = await api.post(`/lectures`, data);
    return res.data;
  },
  update: async (id: string, data: Partial<{ name: string; fileUrl: string; duration: number; orderIndex: number; chapterId: string; description?: string; isPreview?: boolean }>) => {
    const res = await api.put(`/lectures/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/lectures/${id}`);
    return res.data;
  },
};
