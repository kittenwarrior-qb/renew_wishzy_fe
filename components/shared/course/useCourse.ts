import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/services/course'
import { UserRole } from '@/types/auth'
import { CourseItemType } from '@/types/course/course-item.types'

export type Course = {
  id: string
  name: string
  description?: string
  notes?: string
  thumbnail?: string
  price: number
  saleInfo?: Record<string, unknown>
  rating: number
  status: boolean
  averageRating: number
  numberOfStudents: number
  level: 'beginner' | 'intermediate' | 'advanced'
  totalDuration: number
  categoryId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  category?: { id: string; name: string } | null
}

export type CourseListResponse = {
  data: Course[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CourseFilter = Partial<{
  page: number
  limit: number
  name: string
  categoryId: string
  createdBy: string
  rating: number
  courseLevel: 'beginner' | 'intermediate' | 'advanced'
  minPrice: number
  maxPrice: number
  status: boolean
}>

const ENDPOINT = 'courses'

export const useCourseList = (filter?: CourseFilter, options?: { enabled?: boolean }) => {
  const params: Record<string, any> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
    name: filter?.name,
    categoryId: filter?.categoryId,
    createdBy: filter?.createdBy,
    rating: filter?.rating,
    courseLevel: filter?.courseLevel,
    minPrice: filter?.minPrice !== undefined ? 
              (filter.minPrice === 0 ? 0.000001 : filter.minPrice) : 
              undefined,
    maxPrice: filter?.maxPrice !== undefined ? filter.maxPrice : undefined,
    status: typeof filter?.status === 'boolean' ? filter?.status : undefined,
  }
  
  return useQuery<CourseListResponse>({
    queryKey: [ENDPOINT, params],
    queryFn: async () => courseService.list(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
    select: (res: any): CourseListResponse => {
      const payload = res?.data ?? res
      const items: Course[] = payload?.items ?? []
      const p = payload?.pagination ?? {}
      return {
        data: items as Course[],
        total: p?.totalItems ?? 0,
        page: p?.currentPage ?? params.page,
        limit: p?.itemsPerPage ?? params.limit,
        totalPages: p?.totalPage ?? 0,
      }
    },
  })
}

export const useCourseDetail = (id?: string) => {
  return useQuery<Course>({
    queryKey: [ENDPOINT, id],
    queryFn: async () => courseService.get(id as string),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    select: (res: any): Course => {
      const payload = res?.data ?? res
      const item = (payload && typeof payload === 'object' && 'data' in payload) ? (payload as any).data : payload
      return item as Course
    },
  })
}

export const useBestSellerCourses = (limit: number = 3) => {
  return useQuery<CourseItemType[]>({
    queryKey: [ENDPOINT, '', limit],
    queryFn: async () => {
      const response = await courseService.list({ 
        limit,
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
    select: (res: any): CourseItemType[] => {
      const payload = res?.data ?? res;
      if (Array.isArray(payload)) return payload as CourseItemType[];
      const items = payload?.items ?? [];
      return items as CourseItemType[];
    },
  })
}

export const useCreateCourse = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, Partial<Course>>({
    mutationFn: async (data) => courseService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
    },
  })
}

export const useUpdateCourse = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string } & Partial<Course>>({
    mutationFn: async ({ id, ...data }) => courseService.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
      if (vars?.id) qc.invalidateQueries({ queryKey: [`${ENDPOINT}/${vars.id}`] })
    },
  })
}

export const useToggleCourseStatus = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => courseService.toggleStatus(id),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
      if (vars?.id) qc.invalidateQueries({ queryKey: [`${ENDPOINT}/${vars.id}`] })
    },
  })
}

export const useDeleteCourse = () => {
  const qc = useQueryClient()
  return useMutation<any, unknown, { id: string }>({
    mutationFn: async ({ id }) => courseService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENDPOINT] })
    },
  })
}

// Instructor types
export interface Instructor {
  id: string;
  fullName: string;
  avatar?: string;
  email: string;
  bio?: string;
  role: UserRole;
  courses?: number;
  students?: number;
  rating?: number;
  specialties?: string[];
}

export interface InstructorListResponse {
  data: Instructor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type InstructorFilter = Partial<{
  page: number;
  limit: number;
  fullName: string;
  specialties: string[];
  rating: number;
}>

const mockInstructors: Instructor[] = [
  {
    id: '1',
    fullName: 'Nguyễn Văn A',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    email: 'nguyenvana@wishzy.edu',
    bio: 'Giảng viên với hơn 10 năm kinh nghiệm về JavaScript và React',
    role: UserRole.INSTRUCTOR,
    courses: 12,
    students: 1240,
    rating: 4.8,
    specialties: ['JavaScript', 'React', 'Node.js']
  },
  {
    id: '2',
    fullName: 'Trần Thị B',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    email: 'tranthib@wishzy.edu',
    bio: 'Chuyên gia về Python và Data Science',
    role: UserRole.INSTRUCTOR,
    courses: 8,
    students: 950,
    rating: 4.9,
    specialties: ['Python', 'Data Science', 'Machine Learning']
  },
  {
    id: '3',
    fullName: 'Lê Văn C',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    email: 'levanc@wishzy.edu',
    bio: 'Giảng viên về UX/UI Design và Front-end Development',
    role: UserRole.INSTRUCTOR,
    courses: 5,
    students: 720,
    rating: 4.7,
    specialties: ['UX/UI Design', 'HTML/CSS', 'Figma']
  }
];

export const useInstructorSearch = (filter?: InstructorFilter, options?: { enabled?: boolean }) => {
  const params: Record<string, any> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? 10,
    fullName: filter?.fullName,
    specialties: filter?.specialties,
    rating: filter?.rating,
  };
  
  return useQuery<InstructorListResponse>({
    queryKey: ['instructors', 'search', params],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filtered = mockInstructors.filter(instructor => {
        if (params.fullName && !instructor.fullName.toLowerCase().includes(params.fullName.toLowerCase())) {
          return false;
        }
        
        if (params.rating && instructor.rating !== undefined && instructor.rating < params.rating) {
          return false;
        }
        
        if (params.specialties && params.specialties.length > 0) {
          const hasSpecialty = params.specialties.some((specialty: string) => 
            instructor.specialties?.includes(specialty)
          );
          if (!hasSpecialty) return false;
        }
        
        return true;
      });
      
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit;
      const paginatedItems = filtered.slice(start, end);
      
      return {
        data: paginatedItems,
        total: filtered.length,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(filtered.length / params.limit)
      };
    },
    staleTime: 5 * 60 * 1000, 
    enabled: options?.enabled,
  });
};
