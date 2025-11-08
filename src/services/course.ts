import api from "./api";

export const courseService = {
    async getCourses() {
        const response = await api.get('/courses');
        return response.data.data;
    },

    async getCourseById(id: string) {
        const response = await api.get(`/courses/${id}`);
        return response.data.data;
    }
}