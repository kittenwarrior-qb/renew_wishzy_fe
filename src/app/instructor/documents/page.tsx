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
  Image,
  Video,
  Package,
  Inbox
} from "lucide-react";
import { useInstructorDocuments, useUploadDocument, useDeleteDocument } from "@/hooks/useInstructorApi";
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

  // API query parameters
  const queryParams: DocumentListQuery = React.useMemo(() => ({
    page,
    limit,
    search: searchTerm || undefined,
    fileType: typeFilter !== "all" ? typeFilter : undefined,
    sortBy: "uploadedAt",
    sortOrder: "desc"
  }), [page, limit, searchTerm, typeFilter]);

  // API hooks
  const { data: documentsData, isPending, isFetching } = useInstructorDocuments(queryParams);
  const uploadDocumentMutation = useUploadDocument();
  const deleteDocumentMutation = useDeleteDocument();

  // Extract data from API response
  const documents = documentsData?.data?.items || [];
  const pagination = documentsData?.data?.pagination;
  const statistics = documentsData?.data?.statistics;

  const totalDocuments = statistics?.totalDocuments || 0;
  const totalDownloads = statistics?.totalDownloads || 0;
  const totalSize = statistics?.totalSize || 0;
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
    switch (type) {
      case "pdf":
        return <File className="h-4 w-4 text-red-500" />;
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "png":
      case "jpg":
      case "jpeg":
        return <Image className="h-4 w-4 text-green-500" />;
      case "mp4":
      case "avi":
        return <Video className="h-4 w-4 text-purple-500" />;
      case "zip":
      case "rar":
        return <Package className="h-4 w-4 text-orange-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      pdf: "bg-red-100 text-red-800",
      docx: "bg-blue-100 text-blue-800",
      png: "bg-green-100 text-green-800",
      jpg: "bg-green-100 text-green-800",
      jpeg: "bg-green-100 text-green-800",
      mp4: "bg-purple-100 text-purple-800",
      zip: "bg-orange-100 text-orange-800",
      rar: "bg-orange-100 text-orange-800"
    };

    return (
      <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>
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

  return (
    <div className="relative">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      </div>

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
                  <SelectItem value="docx">Word</SelectItem>
                  <SelectItem value="png">Hình ảnh</SelectItem>
                  <SelectItem value="zip">Archive</SelectItem>
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
              {
                key: 'size',
                label: 'Kích thước',
                type: 'short',
                render: (row: any) => (
                  <span className="text-sm">{formatFileSize(row.size)}</span>
                ),
              },
              {
                key: 'uploadedAt',
                label: 'Ngày tải lên',
                type: 'short',
                render: (row: any) => (
                  <span className="text-sm text-muted-foreground">{formatDate(row.uploadedAt)}</span>
                ),
              },
              {
                key: 'downloadCount',
                label: 'Lượt tải',
                type: 'short',
                render: (row: any) => (
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span className="text-sm">{row.downloadCount}</span>
                  </div>
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
                      <DropdownMenuItem onClick={() => window.open(row.url, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem trước
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(row.downloadUrl, '_blank')}>
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
    </div>
  );
}