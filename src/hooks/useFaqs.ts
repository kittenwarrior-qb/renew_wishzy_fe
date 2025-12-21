import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { faqService, CreateFaqRequest, UpdateFaqRequest, Faq } from '@/services/faq';

// Query key
export const FAQ_QUERY_KEY = 'faqs';
export const FAQ_ADMIN_QUERY_KEY = 'faqs-admin';

// Public hook - get active FAQs
export const useFaqs = () => {
  return useQuery({
    queryKey: [FAQ_QUERY_KEY],
    queryFn: () => faqService.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Admin hook - get all FAQs
export const useFaqsAdmin = () => {
  return useQuery({
    queryKey: [FAQ_ADMIN_QUERY_KEY],
    queryFn: () => faqService.listAdmin(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get single FAQ
export const useFaq = (id: string) => {
  return useQuery({
    queryKey: [FAQ_QUERY_KEY, id],
    queryFn: () => faqService.get(id),
    enabled: !!id,
  });
};

// Create FAQ mutation
export const useCreateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFaqRequest) => faqService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAQ_ADMIN_QUERY_KEY] });
    },
  });
};

// Update FAQ mutation
export const useUpdateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFaqRequest }) =>
      faqService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAQ_ADMIN_QUERY_KEY] });
    },
  });
};

// Toggle active mutation
export const useToggleFaqActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => faqService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAQ_ADMIN_QUERY_KEY] });
    },
  });
};

// Delete FAQ mutation
export const useDeleteFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => faqService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAQ_ADMIN_QUERY_KEY] });
    },
  });
};
