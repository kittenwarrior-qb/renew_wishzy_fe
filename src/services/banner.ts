import api from './api';
import type {
  Banner,
  CreateBannerRequest,
  UpdateBannerRequest,
  BannerResponse,
  BannersResponse,
} from '@/types/banner';

const BANNER_ENDPOINTS = {
  base: '/banners',
  byId: (id: string) => `/banners/${id}`,
} as const;

export const bannerService = {

  async getAll(): Promise<Banner[]> {
    const response = await api.get<BannersResponse>(BANNER_ENDPOINTS.base);
    return response.data.data.banners;
  },

  async getById(bannerId: string): Promise<Banner> {
    const response = await api.get<BannerResponse>(
      BANNER_ENDPOINTS.byId(bannerId)
    );
    return response.data.data.banner;
  },

  async create(data: CreateBannerRequest): Promise<Banner> {
    const response = await api.post<BannerResponse>(
      BANNER_ENDPOINTS.base,
      data
    );
    return response.data.data.banner;
  },

  async update(
    bannerId: string,
    data: UpdateBannerRequest
  ): Promise<Banner> {
    const response = await api.patch<BannerResponse>(
      BANNER_ENDPOINTS.byId(bannerId),
      data
    );
    return response.data.data.banner;
  },

  async delete(bannerId: string): Promise<Banner> {
    const response = await api.delete<BannerResponse>(
      BANNER_ENDPOINTS.byId(bannerId)
    );
    return response.data.data.banner;
  },
};
