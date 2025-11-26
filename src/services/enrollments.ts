import api from './api';
import type { Enrollment } from '@/types/enrollment';
import { cache } from '@/lib/cache';

export interface UpdateEnrollmentAttributesDto {
  attributes: {
    finishedLectures?: string[];
    lectureOnlearning?: {
      lectureId: string;
      duration: number;
      currentTime: number;
      lastWatchedAt: string;
      quality: {
        '400'?: string;
        '720'?: string;
        '1080'?: string;
      };
      volume: number;
    };
  };
}

export interface UpdateEnrollmentStatusDto {
  status: 'not_started' | 'ongoing' | 'completed';
}

const CACHE_TTL = 5; // 5 minutes

export const enrollmentsApi = {
  getEnrollment: async (enrollmentId: string): Promise<Enrollment> => {
    // Try cache first
    const cacheKey = `enrollment_${enrollmentId}`;
    const cached = cache.get<Enrollment>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await api.get(`/enrollments/${enrollmentId}`);
    const enrollment = response.data.data || response.data;
    
    // Cache the result
    cache.set(cacheKey, enrollment, CACHE_TTL);
    
    return enrollment;
  },
  
  updateAttributes: async (enrollmentId: string, data: UpdateEnrollmentAttributesDto) => {
    const response = await api.patch(`/enrollments/${enrollmentId}/attributes`, data);
    
    // Clear cache after update
    cache.remove(`enrollment_${enrollmentId}`);
    cache.remove('my_enrollments');
    
    return response.data.data || response.data;
  },

  updateStatus: async (enrollmentId: string, data: UpdateEnrollmentStatusDto) => {
    const response = await api.patch(`/enrollments/${enrollmentId}`, data);
    
    // Clear cache after update
    cache.remove(`enrollment_${enrollmentId}`);
    cache.remove('my_enrollments');
    
    return response.data.data || response.data;
  },

  getCertificate: async (enrollmentId: string): Promise<{
    certificateUrl: string | null;
    enrollment?: Enrollment;
  }> => {
    const response = await api.get(`/enrollments/${enrollmentId}/certificate`);
    return response.data.data || response.data;
  },

  regenerateCertificate: async (enrollmentId: string): Promise<{
    certificateImageUrl: string;
  }> => {
    const response = await api.patch(`/enrollments/${enrollmentId}/certificate/regenerate`);
    
    // Clear cache after regenerate
    cache.remove(`enrollment_${enrollmentId}`);
    
    return response.data.data || response.data;
  },
};
