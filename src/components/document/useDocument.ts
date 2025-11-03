import type * as DocumentTypes from '@/types/document';
import { useApiQuery } from '@/hooks/useApi';

const documentEndpoints = {
  list: 'documents',
  detail: 'documents',
} as const;

export const Document = () => {
  const useDocumentList = (filter?: DocumentTypes.DocumentFilter) => {
    const queryParams: Record<string, string> = {};

    if (filter) {
      if (filter.page !== undefined) {
        queryParams.page = filter.page.toString();
      }
      if (filter.limit !== undefined) {
        queryParams.limit = filter.limit.toString();
      }
      if (filter.name) {
        queryParams.name = filter.name;
      }
      if (filter.entityId) {
        queryParams.entityId = filter.entityId;
      }
      if (filter.entityType) {
        queryParams.entityType = filter.entityType;
      }
      if (filter.createdBy) {
        queryParams.createdBy = filter.createdBy;
      }
    }

    return useApiQuery<DocumentTypes.DocumentListResponse>(
      documentEndpoints.list,
      {
        queryParams:
          Object.keys(queryParams).length > 0 ? queryParams : undefined,
      },
    );
  };

  const useDocumentDetail = (id: string) => {
    return useApiQuery<DocumentTypes.DocumentDetailResponse>(
      `${documentEndpoints.detail}/${id}`,
    );
  };

  return {
    useDocumentList,
    useDocumentDetail,
  };
};

export const useDocumentList = (filter?: DocumentTypes.DocumentFilter) =>
  Document().useDocumentList(filter);
export const useDocumentDetail = (id: string) => Document().useDocumentDetail(id);
