export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  url?: string;
};

export type PaginationMeta = {
  totalPage: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
};

export type PaginatedResponse<T> = {
  message?: string;
  items: T[];
  pagination: PaginationMeta;
};
