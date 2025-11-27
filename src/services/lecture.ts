import api from "./api";

export const lectureService = {
  get: async (id: string) => {
    const res = await api.get(`/lectures/${id}`);
    return res.data.data || res.data;
  },
  create: async (data: { name: string; fileUrl: string; duration: number; orderIndex: number; chapterId: string; description?: string; isPreview?: boolean }) => {
    console.log('lectureService.create called with data:', data);
    const res = await api.post(`/lectures`, data);
    console.log('lectureService.create response:', res.data);
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
