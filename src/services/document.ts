import api from "./api";
import type { Document, CreateDocumentDto, UpdateDocumentDto, DocumentListResponse } from "@/types/document.types";

const BASE = "/documents";

export const documentService = {
  // Get documents by entity (lecture, course, etc.)
  getByEntity: async (entityId: string, entityType: string = "lecture"): Promise<DocumentListResponse> => {
    const res = await api.get(BASE, {
      params: { entityId, entityType }
    });
    const data = res.data?.data || res.data;
    if (data?.items) {
      return data;
    }
    // If response is an array, wrap it
    if (Array.isArray(data)) {
      return { items: data };
    }
    return { items: [] };
  },

  // Get single document by ID
  get: async (id: string): Promise<Document> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data?.data || res.data;
  },

  // Create new document
  create: async (data: CreateDocumentDto): Promise<Document> => {
    const res = await api.post(BASE, data);
    return res.data?.data || res.data;
  },

  // Update document
  update: async (id: string, data: UpdateDocumentDto): Promise<Document> => {
    const res = await api.patch(`${BASE}/${id}`, data);
    return res.data?.data || res.data;
  },

  // Delete document
  remove: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};
