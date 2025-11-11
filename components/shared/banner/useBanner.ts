import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannerService } from '@/services/banner';
import type {
  Banner,
  CreateBannerRequest,
  UpdateBannerRequest,
} from '@/types/banner';

const BANNER_KEYS = {
  all: ['banners'] as const,
  detail: (id: string) => ['banners', id] as const,
};

export const useBanners = () => {
  return useQuery({
    queryKey: BANNER_KEYS.all,
    queryFn: bannerService.getAll,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBanner = (bannerId: string, enabled = true) => {
  return useQuery({
    queryKey: BANNER_KEYS.detail(bannerId),
    queryFn: () => bannerService.getById(bannerId),
    enabled: enabled && !!bannerId,
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBannerRequest) => bannerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNER_KEYS.all });
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bannerId,
      data,
    }: {
      bannerId: string;
      data: UpdateBannerRequest;
    }) => bannerService.update(bannerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BANNER_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: BANNER_KEYS.detail(variables.bannerId),
      });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerId: string) => bannerService.delete(bannerId),
    onSuccess: (_, bannerId) => {
      queryClient.invalidateQueries({ queryKey: BANNER_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: BANNER_KEYS.detail(bannerId),
      });
    },
  });
};
