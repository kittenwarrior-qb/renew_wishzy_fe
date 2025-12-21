import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/services/course";
import { CourseFilter, CourseListResponse } from "@/types/course";

export const useCourseList = (params?: CourseFilter) => {
    return useQuery<CourseListResponse['data']>({
        queryKey: ["courses", params],
        queryFn: async () => {
            // courseService.list returns 'any' but aligns with CourseListResponse structure
            const response = await courseService.list(params);
            // The API response structure is { data: { items: [], pagination: {} }, message: "" }
            // courseService.list usually returns res.data (the body).
            // So response is the body. We need response.data.
            return response.data;
        },
    });
};
