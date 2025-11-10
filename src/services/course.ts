import api from "./api";
const BASE = "/courses";

export const courseService = {
    async getCourses() {
        const response = await api.get(BASE);
        return response.data.data;
    },

    async getCourseById(id: string) {
        const response = await api.get(`${BASE}/${id}`);
        return response.data.data;
    },

    async list(params?: Record<string, any>) {
        const res = await api.get(BASE, { params });
        return res.data;
    },
    async get(id: string) {
        const res = await api.get(`${BASE}/${id}`);
        return res.data;
    },
    async create(data: any) {
        const res = await api.post(BASE, data);
        return res.data;
    },
    async update(id: string, data: any) {
        const res = await api.put(`${BASE}/${id}`, data);
        return res.data;
    },
    async remove(id: string) {
        const res = await api.delete(`${BASE}/${id}`);
        return res.data;
    },
    async toggleStatus(id: string) {
        const res = await api.patch(`${BASE}/${id}/status`);
        return res.data;
    },
}