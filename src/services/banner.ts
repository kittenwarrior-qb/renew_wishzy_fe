import api from "./api";

const BASE = "/banners";

export type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export const bannerService = {
  async list(params?: Record<string, any>) {
    const res = await api.get(BASE, { params });
    return res.data;
  },
  async get(id: string) {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },
  async create(data: Partial<Banner>) {
    const res = await api.post(BASE, data);
    return res.data;
  },
  async update(id: string, data: Partial<Banner>) {
    const res = await api.patch(`${BASE}/${id}`, data);
    return res.data;
  },
  async remove(id: string) {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  },
};
