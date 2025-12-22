import api from "./api";

export interface Faq {
  id: string;
  question: string;
  answer: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFaqRequest {
  question: string;
  answer: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface UpdateFaqRequest extends Partial<CreateFaqRequest> {}

export interface FaqListResponse {
  success: boolean;
  data: Faq[];
  message: string;
}

export interface FaqResponse {
  success: boolean;
  data: Faq;
  message: string;
}

export const faqService = {
  // Public - get active FAQs
  async list(): Promise<Faq[]> {
    const res = await api.get<FaqListResponse>('/faqs');
    return res.data.data;
  },

  // Admin - get all FAQs
  async listAdmin(): Promise<Faq[]> {
    const res = await api.get<FaqListResponse>('/faqs/admin');
    return res.data.data;
  },

  // Get single FAQ
  async get(id: string): Promise<Faq> {
    const res = await api.get<FaqResponse>(`/faqs/${id}`);
    return res.data.data;
  },

  // Create FAQ
  async create(data: CreateFaqRequest): Promise<Faq> {
    const res = await api.post<FaqResponse>('/faqs', data);
    return res.data.data;
  },

  // Update FAQ
  async update(id: string, data: UpdateFaqRequest): Promise<Faq> {
    const res = await api.patch<FaqResponse>(`/faqs/${id}`, data);
    return res.data.data;
  },

  // Toggle active status
  async toggleActive(id: string): Promise<Faq> {
    const res = await api.patch<FaqResponse>(`/faqs/${id}/toggle-active`);
    return res.data.data;
  },

  // Delete FAQ
  async delete(id: string): Promise<void> {
    await api.delete(`/faqs/${id}`);
  },
};
