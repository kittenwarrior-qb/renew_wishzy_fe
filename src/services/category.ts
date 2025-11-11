import api from "./api"

const BASE = "/categories"

export const categoryService = {
  async list(params?: Record<string, any>) {
    const res = await api.get(BASE, { params })
    return res.data
  },
  async get(id: string) {
    const res = await api.get(`${BASE}/${id}`)
    return res.data
  },
  async create(data: any) {
    const res = await api.post(BASE, data)
    return res.data
  },
  async update(id: string, data: any) {
    const res = await api.put(`${BASE}/${id}`, data)
    return res.data
  },
  async remove(id: string) {
    const res = await api.delete(`${BASE}/${id}`)
    return res.data
  },
  async restore(id: string) {
    const res = await api.put(`${BASE}/${id}/restore`)
    return res.data
  },
  async trash(params?: Record<string, any>) {
    const res = await api.get(`${BASE}/trash`, { params })
    return res.data
  },
  async parents(params?: Record<string, any>) {
    const res = await api.get(BASE, { params })
    return res.data
  },
  async subcategories(parentId: string, params?: Record<string, any>) {
    const res = await api.get(BASE, { params: { ...params, parentId, isSubCategory: true } })
    return res.data
  },
  async popular(limit = 10) {
    const res = await api.get(`${BASE}/popular`, { params: { limit } })
    return res.data
  },
  async search(q: string) {
    const res = await api.get(`${BASE}/search`, { params: { q } })
    return res.data
  },
}
