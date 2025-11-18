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
    getEnrollmentByCourseId: async (courseId: string): Promise<Enrollment | null> => {
        const response = await api.get('enrollments/my-enrollments');
        console.log('API Response:', response.data);
        
        // Handle different response structures
        const enrollments = response.data.data?.enrollments || response.data.enrollments || response.data.data || [];
        console.log('Enrollments:', enrollments);
        
        const found = enrollments.find((e: Enrollment) => e.courseId === courseId);
        console.log('Found enrollment for courseId', courseId, ':', found);
        
        return found || null;
    },
};
