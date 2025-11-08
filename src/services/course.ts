import api from "./api";

export const courseService = {
    async getCourses() {
        const response = await api.get('/courses');
        return response.data.data;
    }
}