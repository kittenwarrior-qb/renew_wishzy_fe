"use client";

import * as React from "react";
import { useMyQuizzes, useDeleteQuiz, type Quiz } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay";
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Users,
  Clock,
  FileQuestion,
  ExternalLink,
  Inbox
} from "lucide-react";
import { notify } from "@/components/shared/admin/Notifications";
import Link from "next/link";

const InstructorQuizzesPage = () => {
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [openDelete, setOpenDelete] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string>("");

  const { data: quizzes, isLoading, isError } = useMyQuizzes();
  const { mutate: deleteQuiz, isPending: deleting } = useDeleteQuiz();

  const filteredQuizzes = React.useMemo(() => {
    if (!quizzes) return [];
    return quizzes.filter((quiz: Quiz) => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "public" && quiz.isPublic) ||
                           (statusFilter === "private" && !quiz.isPublic);
      
      return matchesSearch && matchesStatus;
    });
  }, [quizzes, searchTerm, statusFilter]);

  const total = filteredQuizzes.length;
  const currentPage = page;
  const pageSize = limit;
  const totalPages = Math.ceil(total / pageSize);

  const handleDelete = () => {
    if (!deleteId) return;

    deleteQuiz(deleteId, {
      onSuccess: () => {
        notify({ title: "Thành công", description: "Xoá quiz thành công", variant: "success" });
        setOpenDelete(false);
        setDeleteId("");
      },
      onError: (error: any) => {
        notify({
          title: "Lỗi",
          description: error?.message || "Không thể xoá quiz",
          variant: "destructive",
        });
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="relative w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Tổng Quiz</div>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{quizzes?.length || 0}</div>
          <p className="text-xs text-muted-foreground">Tất cả quiz</p>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Quiz công khai</div>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {quizzes?.filter((q: Quiz) => q.isPublic).length || 0}
          </div>
          <p className="text-xs text-muted-foreground">Đã xuất bản</p>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Tổng lượt làm</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {quizzes?.reduce((sum: number, q: Quiz) => sum + q.totalAttempts, 0) || 0}
          </div>
          <p className="text-xs text-muted-foreground">Từ học viên</p>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Lượt chia sẻ</div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {quizzes?.reduce((sum: number, q: Quiz) => sum + q.shareCount, 0) || 0}
          </div>
          <p className="text-xs text-muted-foreground">Tổng chia sẻ</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm quiz
              </label>
              <Input 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Nhập tên quiz để tìm kiếm..." 
                className="h-9 w-52" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo trạng thái
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-40">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="public">Công khai</SelectItem>
                  <SelectItem value="private">Riêng tư</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Link href="/instructor/quizzes/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo Quiz Mới
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative min-h-[300px] max-w-[1300px]">
        <LoadingOverlay show={isLoading} />

        {isError ? (
          <div className="py-16 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/60" />
              <span>Không có dữ liệu</span>
            </div>
          </div>
        ) : (
          (() => {
            const columns: Column<Quiz>[] = [
              {
                key: 'title',
                label: 'Tiêu đề',
                type: 'text',
                render: (row: Quiz) => (
                  <Link
                    href={`/instructor/quizzes/${row.id}`}
                    className="hover:underline flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">{row.title}</span>
                  </Link>
                ),
              },
              {
                key: 'description',
                label: 'Mô tả',
                type: 'text',
                render: (row: Quiz) => (
                  <span className="text-sm text-muted-foreground line-clamp-2">
                    {row.description || '-'}
                  </span>
                ),
              },
              {
                key: 'questions',
                label: 'Câu hỏi',
                type: 'short',
                render: (row: Quiz) => (
                  <div className="flex items-center gap-1">
                    <FileQuestion className="h-3 w-3" />
                    <span className="text-sm">{row.questions?.length || 0}</span>
                  </div>
                ),
              },
              {
                key: 'timeLimit',
                label: 'Thời gian',
                type: 'short',
                render: (row: Quiz) => (
                  row.timeLimit ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">{row.timeLimit} phút</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Không giới hạn</span>
                  )
                ),
              },
              {
                key: 'status',
                label: 'Trạng thái',
                type: 'short',
                render: (row: Quiz) => (
                  <div className="flex flex-col gap-1">
                    {row.isPublic ? (
                      <Badge className="bg-green-100 text-green-800">Công khai</Badge>
                    ) : (
                      <Badge variant="secondary">Riêng tư</Badge>
                    )}
                    {!row.isFree && (
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(row.price)}
                      </Badge>
                    )}
                  </div>
                ),
              },
              {
                key: 'totalAttempts',
                label: 'Lượt làm',
                type: 'short',
                render: (row: Quiz) => (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="text-sm">{row.totalAttempts}</span>
                  </div>
                ),
              },
              {
                key: 'createdAt',
                label: 'Ngày tạo',
                type: 'short',
                render: (row: Quiz) => (
                  <span className="text-sm text-muted-foreground">
                    {new Date(row.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Hành động',
                type: 'action',
                render: (row: Quiz) => (
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      href={`/instructor/quizzes/${row.id}/edit`}
                      className="inline-flex text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteId(row.id);
                        setOpenDelete(true);
                      }}
                      disabled={deleting}
                      className="inline-flex text-destructive hover:text-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ),
              },
            ];
            return (
              <DynamicTable
                columns={columns}
                data={filteredQuizzes}
                loading={isLoading}
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
          })()
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xoá</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xoá quiz này? Hành động này không thể hoàn tác và sẽ xoá tất cả
              dữ liệu liên quan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenDelete(false)}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Đang xoá..." : "Xoá"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorQuizzesPage;