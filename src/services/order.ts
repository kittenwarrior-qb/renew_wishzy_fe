import api from "./api"

export type OrderStatus = 'pending' | 'completed' | 'cancelled'

export type OrderListParams = {
    page?: number
    limit?: number
    id?: string
    courseId?: string
    voucherId?: string
}

export const orderService = {
    async list(params?: OrderListParams) {
        const res = await api.get(`/orders`, { params })
        return res.data
    },
    async getOrderById(orderId: string) {
        const response = await api.get(`/orders/${orderId}`)
        return response.data
    },
    async updateStatus(orderId: string, status: OrderStatus) {
        const res = await api.patch(`/orders/${orderId}`, { status })
        return res.data
    },
}