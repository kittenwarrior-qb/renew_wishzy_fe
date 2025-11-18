import api from "./api";
import type { Enrollment } from "@/types/enrollment";

export const enrollmentService = {
    getMyLearning: async () => {
        const response = await api.get('enrollments/my-enrollments');
        return response.data.data;
    },
    getEnrollmentsByUserId: async (userId: string): Promise<Enrollment[]> => {
        const response = await api.get(`enrollments/user/${userId}`);
        return response.data.data || [];
    },
};
