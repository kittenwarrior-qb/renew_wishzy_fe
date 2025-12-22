"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentService } from "@/services/document";
import type { CreateDocumentDto, UpdateDocumentDto } from "@/types/document.types";
import { notify } from "@/components/shared/admin/Notifications";

// Fetch documents by lecture ID
export function useDocumentsByLecture(lectureId: string | undefined) {
  return useQuery({
    queryKey: ["documents", "lecture", lectureId],
    queryFn: () => documentService.getByEntity(lectureId!, "lecture"),
    enabled: !!lectureId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch documents by course ID
export function useDocumentsByCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ["documents", "course", courseId],
    queryFn: () => documentService.getByEntity(courseId!, "course"),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create document mutation
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentDto) => documentService.create(data),
    onSuccess: (_, variables) => {
      // Invalidate based on entity type
      if (variables.entityType === "course") {
        queryClient.invalidateQueries({
          queryKey: ["documents", "course", variables.entityId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["documents", "lecture", variables.entityId],
        });
      }
      // Also invalidate instructor documents list
      queryClient.invalidateQueries({
        queryKey: ["instructor", "documents"],
      });
      notify({ title: "Đã thêm tài liệu", variant: "success" });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.message || "Không thể thêm tài liệu",
        variant: "destructive",
      });
    },
  });
}

// Update document mutation
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, lectureId, ...data }: UpdateDocumentDto & { id: string; lectureId: string }) =>
      documentService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both lecture and course queries (lectureId might be courseId)
      queryClient.invalidateQueries({
        queryKey: ["documents", "lecture", variables.lectureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["documents", "course", variables.lectureId],
      });
      // Also invalidate instructor documents list
      queryClient.invalidateQueries({
        queryKey: ["instructor", "documents"],
      });
      notify({ title: "Đã cập nhật tài liệu", variant: "success" });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật tài liệu",
        variant: "destructive",
      });
    },
  });
}

// Delete document mutation
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; lectureId: string }) => documentService.remove(id),
    onSuccess: (_, variables) => {
      // Invalidate both lecture and course queries (lectureId might be courseId)
      queryClient.invalidateQueries({
        queryKey: ["documents", "lecture", variables.lectureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["documents", "course", variables.lectureId],
      });
      // Also invalidate instructor documents list
      queryClient.invalidateQueries({
        queryKey: ["instructor", "documents"],
      });
      notify({ title: "Đã xoá tài liệu", variant: "success" });
    },
    onError: (error: any) => {
      notify({
        title: "Lỗi",
        description: error?.message || "Không thể xoá tài liệu",
        variant: "destructive",
      });
    },
  });
}
