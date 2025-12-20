"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Eye, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay";
import DynamicTable, {
  type Column,
} from "@/components/shared/common/DynamicTable";
import { AdminDataErrorState } from "@/components/shared/admin/AdminDataErrorState";
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore";
import { useAdminQuizAttempts } from "@/src/hooks/useAdminQuizAttempts";
import { AttemptDetailModal } from "@/components/shared/quiz/AttemptDetailModal";
import type { QuizAttemptListItem } from "@/src/types/quiz-attempts";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPrimaryAction } = useAdminHeaderStore();

  // Read initial values from URL or use defaults
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "10", 10);
  const initialStatus = searchParams.get("status") || "";

  const [page, setPage] = React.useState(initialPage);
  const [limit, setLimit] = React.useState(initialLimit);
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [search, setSearch] = React.useState("");

  const [selectedAttemptId, setSelectedAttemptId] = React.useState<string | null>(null);
  const [openDetail, setOpenDetail] = React.useState(false);

  // Sync URL when page, limit, or status changes
  const updateURL = React.useCallback(
    (newPage: number, newLimit: number, newStatus: string) => {
      const params = new URLSearchParams();
      params.set("page", String(newPage));
      params.set("limit", String(newLimit));
      if (newStatus) params.set("status", newStatus);
      router.replace(`/admin/quiz-attempts?${params.toString()}`, {
        scroll: false,
      });
    },
    [router]
  );

  const { data, isPending, isFetching, isError, refetch } = useAdminQuizAttempts({
    page,
    limit,
    status: statusFilter || undefined,
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? page;
  const pageSize = data?.limit ?? limit;

  // Filter items based on search (client-side)
  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    const searchLower = search.toLowerCase();
    return items.filter(
      (item) =>
        item.user?.fullName?.toLowerCase().includes(searchLower) ||
        item.user?.email?.toLowerCase().includes(searchLower) ||
        item.quiz?.title?.toLowerCase().includes(searchLower)
    );
  }, [items, search]);

  React.useEffect(() => {
    setPrimaryAction(null);
  }, [setPrimaryAction]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Hoàn thành</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Đang làm</Badge>;
      case "abandoned":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Đã bỏ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: Column<QuizAttemptListItem>[] = [
    {
      key: "user",
      title: "Học viên",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.user?.fullName || "—"}</span>
          <span className="text-xs text-muted-foreground">{row.user?.email || ""}</span>
        </div>
      ),
    },
    {
      key: "quiz",
      title: "Bài kiểm tra",
      render: (row) => (
        <span className="font-medium">{row.quiz?.title || "—"}</span>
      ),
    },
    {
      key: "score",
      title: "Điểm",
      align: "center",
      render: (row) => (
        <div className="flex flex-col items-center">
          <span className="font-semibold">{row.totalScore}/{row.maxScore}</span>
          <span className={`text-xs ${
            row.percentage >= 80 ? "text-green-600" :
            row.percentage >= 50 ? "text-yellow-600" : "text-red-600"
          }`}>
            ({Number(row.percentage).toFixed(1)}%)
          </span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      align: "center",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "startedAt",
      title: "Bắt đầu",
      align: "center",
      render: (row) => (
        <span className="text-sm">{formatDate(row.startedAt)}</span>
      ),
    },
    {
      key: "completedAt",
      title: "Hoàn thành",
      align: "center",
      render: (row) => (
        <span className="text-sm">{formatDate(row.completedAt)}</span>
      ),
    },
    {
      key: "actions",
      title: "Hành động",
      align: "right",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedAttemptId(row.id);
            setOpenDetail(true);
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="relative p-4 md:p-6">
      <LoadingOverlay show={isPending || isFetching} />

      {/* Search and Filters Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, bài kiểm tra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? "" : value);
              setPage(1);
              updateURL(1, limit, value === "all" ? "" : value);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="in_progress">Đang làm</SelectItem>
              <SelectItem value="abandoned">Đã bỏ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError ? (
        <AdminDataErrorState
          title="Không thể tải danh sách bài làm"
          onRetry={() => refetch()}
        />
      ) : (
        <DynamicTable
          columns={columns}
          data={filteredItems}
          loading={isPending || isFetching}
          pagination={{
            totalItems: total,
            currentPage,
            itemsPerPage: pageSize,
            onPageChange: (np) => {
              setPage(np);
              updateURL(np, limit, statusFilter);
            },
            pageSizeOptions: [10, 20, 50],
            onPageSizeChange: (sz) => {
              setLimit(sz);
              setPage(1);
              updateURL(1, sz, statusFilter);
            },
          }}
        />
      )}

      {/* Detail Modal */}
      <AttemptDetailModal
        open={openDetail}
        onOpenChange={(o) => {
          setOpenDetail(o);
          if (!o) setSelectedAttemptId(null);
        }}
        attemptId={selectedAttemptId}
      />
    </div>
  );
}
