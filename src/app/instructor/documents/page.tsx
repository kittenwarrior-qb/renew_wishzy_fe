"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay";
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  FileText, 
  Upload,
  Download,
  Eye,
  Plus,
  File,
  Inbox
} from "lucide-react";
import { useInstructorDocuments, useDeleteDocument } from "@/hooks/useInstructorApi";
import type { DocumentListQuery } from "@/types/instructor";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { useQueryClient } from "@tanstack/react-query";
import { instructorQueryKeys } from "@/hooks/useInstructorApi";

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = React.useState(false);

  // API query parameters
  const queryParams: DocumentListQuery = React.useMemo(() => {
    let fileType = undefined;
    if (typeFilter !== "all") {
      if (typeFilter === "word") {
        // For word filter, we'll handle client-side filtering since API expects specific types
        fileType = undefined;
      } else {
        fileType = typeFilter;
      }
    }
    
    return {
      page,
      limit,
      search: searchTerm || undefined,
      fileType,
      sortBy: "uploadedAt",
      sortOrder: "desc"
    };
  }, [page, limit, searchTerm, typeFilter]);

  // API hooks
  const { data: documentsData, isPending, isFetching } = useInstructorDocuments(queryParams);
  const deleteDocumentMutation = useDeleteDocument();

  // Extract data from API response
  const rawDocuments = documentsData?.data?.items || [];
  const pagination = documentsData?.data?.pagination;

  // Apply client-side filtering for "word" filter
  const documents = React.useMemo(() => {
    if (typeFilter === "word") {
      return rawDocuments.filter((doc: any) => 
        doc.fileType?.toLowerCase() === 'doc' || doc.fileType?.toLowerCase() === 'docx'
      );
    }
    return rawDocuments;
  }, [rawDocuments, typeFilter]);

  const total = pagination?.total || 0;
  const currentPage = pagination?.page || 1;
  const pageSize = pagination?.limit || 10;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <File className="h-4 w-4 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      pdf: "bg-red-100 text-red-800",
      doc: "bg-blue-100 text-blue-800",
      docx: "bg-blue-100 text-blue-800"
    };

    const normalizedType = type.toLowerCase();
    return (
      <Badge className={colors[normalizedType] || "bg-gray-100 text-gray-800"}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteDocument = (documentId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      // Call backend API to get download URL
      const response = await fetch(`/api/documents/instructor/${doc.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data = await response.json();
      const downloadUrl = data.data?.downloadUrl || data.downloadUrl;

      // Fetch the actual file
      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok) {
        throw new Error('Download failed');
      }

      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to direct URL
      window.open(doc.url, '_blank');
    }
  };

  const handlePreview = (doc: any) => {
    setSelectedDocument(doc);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="relative">
      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Tổng tài liệu</div>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{totalDocuments}</div>
          <p className="text-xs text-muted-foreground">Trên tất cả khóa học</p>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Tổng lượt tải</div>
            <Download className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{totalDownloads}</div>
          <p className="text-xs text-muted-foreground">Từ học viên</p>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Dung lượng</div>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
          <p className="text-xs text-muted-foreground">Tổng dung lượng</p>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Trung bình/tài liệu</div>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{totalDocuments > 0 ? Math.round(totalDownloads / totalDocuments) : 0}</div>
          <p className="text-xs text-muted-foreground">Lượt tải/tài liệu</p>
        </div>
      </div> */}

      {/* Search and Filters */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm tài liệu
              </label>
              <Input 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Nhập tên tài liệu để tìm kiếm..." 
                className="h-9 w-52" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo loại file
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-40">
                  <SelectValue placeholder="Chọn loại file" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="word">Word (DOC/DOCX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tải lên tài liệu
          </Button>
        </div>
      </div>

      <div className="relative min-h-[300px] max-h-[calc(100vh-300px)] overflow-hidden">
        <LoadingOverlay show={isPending || isFetching} />

        {documents.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/60" />
              <span>Không có dữ liệu</span>
            </div>
          </div>
        ) : (
          <div className="overflow-auto max-w-[1320px]">
            {(() => {
              const columns: Column<any>[] = [
              {
                key: 'name',
                label: 'Tên file',
                type: 'text',
                render: (row: any) => (
                  <div className="flex items-center space-x-3">
                    {getFileIcon(row.fileType)}
                    <div>
                      <div className="font-medium text-sm">{row.name}</div>
                      <div className="mt-1">
                        {getTypeBadge(row.fileType)}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'courseName',
                label: 'Khóa học',
                type: 'short',
                render: (row: any) => (
                  <span className="text-sm">{row.courseName}</span>
                ),
              },
              {
                key: 'lectureTitle',
                label: 'Bài giảng',
                type: 'short',
                render: (row: any) => (
                  <span className="text-sm text-muted-foreground">{row.lectureTitle || 'Chung'}</span>
                ),
              },
              // {
              //   key: 'size',
              //   label: 'Kích thước',
              //   type: 'short',
              //   render: (row: any) => (
              //     <span className="text-sm">{formatFileSize(row.size)}</span>
              //   ),
              // },
              {
                key: 'uploadedAt',
                label: 'Ngày tải lên',
                type: 'short',
                render: (row: any) => (
                  <span className="text-sm text-muted-foreground">{formatDate(row.uploadedAt)}</span>
                ),
              },
              {
                key: 'actions',
                label: 'Hành động',
                type: 'action',
                render: (row: any) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(row)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem trước
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(row)}>
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Upload className="h-4 w-4 mr-2" />
                        Cập nhật
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteDocument(row.id)}
                      >
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ];
            return (
              <DynamicTable
                columns={columns}
                data={documents}
                loading={isPending || isFetching}
                pagination={{
                  totalItems: total,
                  currentPage,
                  itemsPerPage: pageSize,
                  onPageChange: (p) => setPage(p),
                  pageSizeOptions: [10, 20, 50],
                  onPageSizeChange: (sz) => {
                    setLimit(sz)
                    setPage(1)
                  },
                }}
              />
            )
            })()}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <UploadDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUploadSuccess={() => {
          // Invalidate queries to refetch documents
          queryClient.invalidateQueries({ queryKey: instructorQueryKeys.documents });
        }}
      />

      {/* Preview Document Modal */}
      {selectedDocument && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${
            isPreviewModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(selectedDocument.fileType)}
                  <div>
                    <h2 className="text-xl font-semibold">{selectedDocument.name}</h2>
                    <div className="mt-1">
                      {getTypeBadge(selectedDocument.fileType)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Khóa học</p>
                    <p className="font-medium">{selectedDocument.courseName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bài giảng</p>
                    <p className="font-medium">{selectedDocument.lectureTitle || 'Chung'}</p>
                  </div>
                  {/* <div>
                    <p className="text-sm text-muted-foreground">Kích thước</p>
                    <p className="font-medium">{formatFileSize(selectedDocument.size)}</p>
                  </div> */}
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày tải lên</p>
                    <p className="font-medium">{formatDate(selectedDocument.uploadedAt)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => window.open(selectedDocument.url, '_blank')}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mở file
                  </Button>
                  <Button
                    onClick={() => handleDownload(selectedDocument)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}