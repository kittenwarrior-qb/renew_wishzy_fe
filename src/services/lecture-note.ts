import api from "./api";

const BASE = "/lecture-notes";

export type LectureNote = {
  id: string;
  userId: string;
  lectureId: string;
  content: string;
  timestampSeconds: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateLectureNoteRequest = {
  lectureId: string;
  content: string;
  timestampSeconds: number;
};

export type UpdateLectureNoteRequest = {
  content?: string;
  timestampSeconds?: number;
};

export type LectureNoteListResponse = {
  items: LectureNote[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPage: number;
  };
};

export const lectureNoteService = {
  async listByLecture(lectureId: string, page: number = 1, limit: number = 50): Promise<LectureNoteListResponse> {
    const res = await api.get<any>(`${BASE}/lecture/${lectureId}`, {
      params: { page, limit }
    });
    
    if (res.data?.items) {
      return res.data;
    }
    return { items: [], pagination: { totalItems: 0, currentPage: 1, itemsPerPage: 50, totalPage: 0 } };
  },

  async create(data: CreateLectureNoteRequest): Promise<LectureNote> {
    const res = await api.post<{ data: LectureNote; message: string }>(BASE, data);
    return res.data.data;
  },

  async update(id: string, data: UpdateLectureNoteRequest): Promise<LectureNote> {
    const res = await api.put<{ data: LectureNote; message: string }>(`${BASE}/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
  },
};
