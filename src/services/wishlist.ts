import api from "./api";

export const wishlistService = {
    getWishlist: async () => {
        const res = await api.get('/wishlist');
        return res.data.data;
    },
    
    addToWishlist: async (courseId: string) => {
        const res = await api.post('/wishlist', { courseId });
        return res.data.data;
    },
    
    removeFromWishlist: async (courseId: string) => {
        const res = await api.delete(`/wishlist/${courseId}`);
        return res.data.data;
    }
}