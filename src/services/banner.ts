import api from './api';
import type {
    Banner,
    CreateBannerRequest,
    UpdateBannerRequest,
    BannerResponse,
    BannersResponse,
} from '@/types/banner';

export type {
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

    async list(params?: Record<string, any>): Promise<{ items: Banner[]; pagination?: any }> {
        const response = await api.get<any>(BANNER_ENDPOINTS.base, { params });
        const root = response?.data ?? {};
        const data = root?.data ?? root;
        const items: Banner[] = data?.items ?? data?.banners ?? [];
        const pagination = data?.pagination;
        return { items, pagination };
    },

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
