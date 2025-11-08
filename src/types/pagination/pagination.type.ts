export interface PaginationResponse<T> {
    items: T[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
    }
}