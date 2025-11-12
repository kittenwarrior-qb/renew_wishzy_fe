import api from "./api";

export const enrollmentService = {
    getMyLearning: async () => {
        const response = await api.get('enrollments/my-enrollments');
        return response.data.data;
    }
};