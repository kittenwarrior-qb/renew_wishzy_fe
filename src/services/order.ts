import api from "./api"

export const orderService = {
    getOrderById: async (orderId: string) => {
        const response = await api.get(`/orders/${orderId}`)
        return response.data.data
    }
}