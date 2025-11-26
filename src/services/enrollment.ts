import api from "./api";
import type { Enrollment } from "@/types/enrollment";
import { cache } from "@/lib/cache";

const CACHE_TTL = 5; // 5 minutes

export const enrollmentService = {
    getMyLearning: async (skipCache: boolean = false): Promise<Enrollment[]> => {
        // Try cache first (unless skipCache is true)
        if (!skipCache) {
            const cached = cache.get<Enrollment[]>('my_enrollments');
            if (cached) {
                console.log('Using cached enrollments');
                return cached;
            }
        }

        console.log('Fetching fresh enrollments from API');
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
    
    getEnrollmentByCourseId: async (courseId: string, skipCache: boolean = false): Promise<Enrollment | null> => {
        // Try to get from cache first (unless skipCache is true)
        const cacheKey = `enrollment_course_${courseId}`;
        if (!skipCache) {
            const cached = cache.get<Enrollment>(cacheKey);
            if (cached) {
                console.log('Using cached enrollment for course:', courseId);
                return cached;
            }
        }

        console.log('Fetching fresh enrollment for course:', courseId);
        // Get all enrollments (skip cache if requested)
        const enrollments = await enrollmentService.getMyLearning(skipCache);
        
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
        // Clear all enrollment-related cache with proper prefix
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.includes('wishzy_cache_enrollment_course_') || 
                key.includes('wishzy_cache_enrollments_user_')) {
                localStorage.removeItem(key);
            }
        });
        console.log('Enrollment cache cleared');
    },
};
