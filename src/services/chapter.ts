import api from "./api";

export const chapterService = {
    getChapterByCourseId: async (courseId: string) => {
        const response = await api.get(`/chapters/course/${courseId}`);
        return response.data.data;
    }
}