import api from './api';
import type { Enrollment } from '@/types/enrollment';

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

export const enrollmentsApi = {
  getEnrollment: async (enrollmentId: string): Promise<Enrollment> => {
    const response = await api.get(`/enrollments/${enrollmentId}`);
    // Backend returns {success, data, message} structure
    return response.data.data || response.data;
  },
  
  updateAttributes: async (enrollmentId: string, data: UpdateEnrollmentAttributesDto) => {
    const response = await api.patch(`/enrollments/${enrollmentId}/attributes`, data);
    // Backend returns {success, data, message} structure
    return response.data.data || response.data;
  },
};
