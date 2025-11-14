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
      if (params?.role) {
        // Sử dụng role từ params (lấy từ useCurrentUser)
        // Admin: role = 'admin', Instructor: role = 'instructor'
        const { role, ...restParams } = params;
        response = await userService.getUsersByRole(role, restParams);
      } else {
        // Nếu không có role, lấy tất cả users (không filter theo role)
        response = await userService.getUsers(params);
      }
      const items = response.data.data.items.map(transformUserToStudent);
      const apiPagination = response.data.data.pagination;
      return {
        ...response,
        data: {
          ...response.data,
          data: {
            items,
            pagination: {
              ...apiPagination,
              total: apiPagination.totalItems,
              page: apiPagination.currentPage,
              limit: apiPagination.itemsPerPage,
              totalPages: apiPagination.totalPage,
            },
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
