import api from "./api"

const BASE = "/category-blogs"

export interface CategoryBlog {
    id: string
    name: string
    description?: string
    createdAt: string
    updatedAt: string
}

export interface PaginationResponse<T> {
    items: T[]
    pagination: {
        totalItems: number
        totalPage: number
        currentPage: number
        itemsPerPage: number
    }
}

export interface CategoryBlogListResponse extends PaginationResponse<CategoryBlog> { }

export const categoryBlogService = {
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
}
