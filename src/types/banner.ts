export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBannerRequest {
  title: string;
  imageUrl: string;
  link: string;
  position: number;
}

export interface UpdateBannerRequest {
  title?: string;
  imageUrl?: string;
  link?: string;
  position?: number;
}

export interface BannerResponse {
  success: boolean;
  data: {
    banner: Banner;
  };
  message: string;
  url: string;
}

export interface BannersResponse {
  success: boolean;
  data: {
    banners: Banner[];
  };
  message: string;
  url: string;
}
