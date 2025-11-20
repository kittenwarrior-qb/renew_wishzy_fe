import api from "./api";
import type { Enrollment } from "@/types/enrollment";
import { cache } from "@/lib/cache";

const CACHE_TTL = 5; // 5 minutes

export const enrollmentService = {
    getMyLearning: async (): Promise<Enrollment[]> => {
        // Try cache first
        const cached = cache.get<Enrollment[]>('my_enrollments');
        if (cached) {
            return cached;
        }

        const response = await api.get('enrollments/my-enrollments');
        // Handle different response structures to ensure we always return an array
        const enrollments = response.data.data?.enrollments || response.data.enrollments || response.data.data || (Array.isArray(response.data) ? response.data : []);
        
        // Cache the result
        cache.set('my_enrollments', enrollments, CACHE_TTL);
        
        return enrollments;
    },
    
    getEnrollmentsByUserId: async (userId: string): Promise<Enrollment[]> => {
        const cacheKey = `enrollments_user_${userId}`;
        const cached = cache.get<Enrollment[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const response = await api.get(`enrollments/user/${userId}`);
        const enrollments = response.data.data || [];
        
        cache.set(cacheKey, enrollments, CACHE_TTL);
        
        return enrollments;
    },
    
    getEnrollmentByCourseId: async (courseId: string): Promise<Enrollment | null> => {
        // Try to get from cache first
        const cacheKey = `enrollment_course_${courseId}`;
        const cached = cache.get<Enrollment>(cacheKey);
        if (cached) {
            return cached;
        }

        // Get all enrollments (which may be cached)
        const enrollments = await enrollmentService.getMyLearning();
        
        const found = enrollments.find((e: Enrollment) => e.courseId === courseId);
        
        // Cache individual enrollment
        if (found) {
            cache.set(cacheKey, found, CACHE_TTL);
        }
        
        return found || null;
    },

    // Clear enrollment cache (call after updates)
    clearCache: () => {
        cache.remove('my_enrollments');
        // Clear all enrollment-related cache
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.includes('enrollment_course_') || key.includes('enrollments_user_')) {
                localStorage.removeItem(key);
            }
        });
    },
};
