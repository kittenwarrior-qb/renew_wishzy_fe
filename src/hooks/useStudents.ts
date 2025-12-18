import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user";
import type { UserListParams, Student } from "@/types/user";
import type { User } from "@/types/auth";

const STUDENTS_ENDPOINT = "students";

const transformUserToStudent = (user: User): Student => {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phone || "",
    avatar: user.avatar || "",
    courses: [],
    joinDate: user.createdAt,
    fullName: user.fullName,
    role: user.role,
    verified: user.verified,
  };
};

export const useStudents = (params?: UserListParams) => {
  return useQuery({
    queryKey: [STUDENTS_ENDPOINT, params],
    queryFn: async () => {
      let response;
      
      // Nếu role là instructor, sử dụng endpoint riêng
      if (params?.role === 'instructor') {
        const { role, ...restParams } = params;
        // Endpoint /users/instructors/my-students tự động lấy instructorId từ token
        // Truyền page, limit và các filter params (fullName, email)
        response = await userService.getInstructorStudents(restParams);
      } else if (params?.role) {
        // Sử dụng role từ params cho admin hoặc các role khác
        const { role, ...restParams } = params;
        response = await userService.getUsersByRole(role as 'user' | 'instructor' | 'admin', restParams);
      } else {
        // Nếu không có role, lấy tất cả users (không filter theo role)
        response = await userService.getUsers(params);
      }
      
      const items = response.data.data.items.map(transformUserToStudent);
      const apiPagination = response.data.data.pagination;
      return {
        success: response.success,
        message: response.message,
        data: {
          items,
          pagination: {
            total: apiPagination.totalItems,
            page: apiPagination.currentPage,
            limit: apiPagination.itemsPerPage,
            totalPages: apiPagination.totalPage,
          },
        },
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useStudent = (studentId: string) => {
  return useQuery({
    queryKey: [STUDENTS_ENDPOINT, studentId],
    queryFn: async () => {
      const user = await userService.getUserById(studentId);
      return transformUserToStudent(user);
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
