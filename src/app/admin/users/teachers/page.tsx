"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  useInstructorList,
  useUserDetail,
  useApproveInstructor,
  useRejectInstructor,
  usePendingInstructorCount,
  usePendingInstructorList,
} from "@/components/shared/user/useUser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Search, Check, X, BookOpen } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { courseService } from "@/src/services/course";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DynamicTable, {
  type Column,
} from "@/components/shared/common/DynamicTable";
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper";
import QueryController from "@/components/shared/common/QueryController";

export default function Page() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "vi";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useAppStore();
  const logoSrc =
    theme === "dark" ? "/images/white-logo.png" : "/images/black-logo.png";

  const [page, setPage] = React.useState<number>(
    Number(searchParams.get("page") || 1)
  );
  const [limit, setLimit] = React.useState<number>(
    Number(searchParams.get("limit") || 10)
  );
  const [queryState, setQueryState] = React.useState<{
    type: "name" | "email";
    q: string;
  }>(() => ({
    type: (searchParams.get("type") as "name" | "email" | null) || "name",
    q: searchParams.get("q") || "",
  }));
  const [statusFilter, setStatusFilter] = React.useState<
    "pending" | "approved"
  >((searchParams.get("status") as "pending" | "approved") || "approved");

  const [selectedTeacherId, setSelectedTeacherId] = React.useState<
    string | null
  >(null);
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [confirmApproveId, setConfirmApproveId] = React.useState<string | null>(
    null
  );
  const [rejectDialogId, setRejectDialogId] = React.useState<string | null>(
    null
  );
  const [rejectReason, setRejectReason] = React.useState("");

  const { data: teacherDetail, isLoading: isLoadingDetail } = useUserDetail(
    selectedTeacherId || undefined
  );

  // Lấy danh sách khóa học của instructor
  const { data: instructorCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["instructor-courses", selectedTeacherId],
    queryFn: async () => {
      const res = await courseService.list({ userId: selectedTeacherId });
      const data = res?.data ?? res;
      return data?.items ?? [];
    },
    enabled: !!selectedTeacherId && openDetailModal,
  });

  const { mutate: approve, isPending: approving } = useApproveInstructor();
  const { mutate: reject, isPending: rejecting } = useRejectInstructor();
  const { data: pendingCountData, refetch: refetchPendingCount } =
    usePendingInstructorCount();
  const pTotal = pendingCountData?.total ?? 0;

  React.useEffect(() => {
    const qs = new URLSearchParams();
    if (queryState.type) qs.append("type", queryState.type);
    if (queryState.q) qs.append("q", queryState.q);
    qs.append("status", statusFilter);
    qs.append("page", String(page));
    qs.append("limit", String(limit));
    const href = `/admin/users/teachers${
      qs.toString() ? `?${qs.toString()}` : ""
    }`;
    router.replace(href);
  }, [page, limit, queryState, statusFilter, router]);

  const {
    data: pendingData,
    isPending: isPendingLoading,
    isFetching: isPendingFetching,
    refetch: refetchPending,
  } = usePendingInstructorList(
    { page, limit },
    { enabled: statusFilter === "pending" }
  );

  const {
    data: instructorData,
    isPending: isInstructorLoading,
    isFetching: isInstructorFetching,
    refetch: refetchInstructors,
  } = useInstructorList(
    {
      page,
      limit,
      fullName:
        queryState.type === "name" && queryState.q ? queryState.q : undefined,
      email:
        queryState.type === "email" && queryState.q ? queryState.q : undefined,
    },
    { enabled: statusFilter === "approved" }
  );

  const currentData = statusFilter === "pending" ? pendingData : instructorData;
  const items = currentData?.data ?? [];
  const total = currentData?.total ?? 0;
  const baseIndex = (page - 1) * limit;
  const isPending =
    statusFilter === "pending" ? isPendingLoading : isInstructorLoading;
  const isFetching =
    statusFilter === "pending" ? isPendingFetching : isInstructorFetching;

  const handleApprove = (id: string) => {
    approve(id, {
      onSuccess: () => {
        setConfirmApproveId(null);
        refetchPending();
        refetchInstructors();
        refetchPendingCount();
      },
    });
  };

  const handleReject = () => {
    if (!rejectDialogId) return;
    reject(
      { id: rejectDialogId, reason: rejectReason || undefined },
      {
        onSuccess: () => {
          setRejectDialogId(null);
          setRejectReason("");
          refetchPending();
          refetchInstructors();
          refetchPendingCount();
        },
      }
    );
  };

  return (
    <div className="relative p-4 md:p-6 space-y-4">
      {(isPending || isFetching) && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <img
              src={logoSrc}
              alt="Wishzy"
              className="h-10 w-auto opacity-90"
            />
            <div
              aria-label="loading"
              className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            />
            <span>Đang tải dữ liệu...</span>
          </div>
        </div>
      )}
      <QueryController
        initial={{ type: queryState.type, q: queryState.q }}
        debounceMs={300}
        onChange={(q: any) => {
          setQueryState(q);
          setPage(1);
        }}
      >
        {({ query, setQuery }) => (
          <form className="mb-4 space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div className="flex gap-3">
              <div className="space-y-2 flex-1 md:max-w-md">
                <label className="text-sm font-medium">Từ khóa tìm kiếm</label>
                <div className="relative">
                  <Input
                    placeholder={
                      query.type === "name"
                        ? "Nhập tên giảng viên..."
                        : "Nhập email..."
                    }
                    value={query.q || ""}
                    onChange={(e) => setQuery({ q: e.target.value })}
                    className="h-10 pr-10"
                  />
                  <Button
                    className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2"
                    variant="outline"
                    size="icon"
                    aria-label="Tìm kiếm"
                    type="button"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại tìm kiếm</label>
                <Select
                  value={query.type}
                  onValueChange={(v) => setQuery({ type: v as any })}
                >
                  <SelectTrigger className="h-10 w-40">
                    <SelectValue placeholder="Chọn kiểu tìm kiếm" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="name">Theo tên</SelectItem>
                    <SelectItem value="email">Theo email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                  value={statusFilter}
                  onValueChange={(v: any) => {
                    setStatusFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-40">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="pending">Chưa duyệt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        )}
      </QueryController>

      {(() => {
        type TeacherRow = {
          id: string | number;
          avatar?: string | null;
          fullName: string;
          email: string;
          isInstructorActive?: boolean;
        };
        const filtered = items.filter((u: any) => u.id);
        const columns: Column<TeacherRow>[] = [
          {
            key: "stt",
            title: "STT",
            align: "center",
            render: (_v: unknown, _r: TeacherRow, i: number) =>
              baseIndex + i + 1,
            width: 80,
          },
          {
            key: "avatar",
            title: "Avatar",
            align: "center",
            type: "short",
            render: (row: TeacherRow) =>
              row.avatar ? (
                <img
                  src={row.avatar}
                  alt={row.fullName}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                  {row.fullName?.charAt(0)?.toUpperCase() || "T"}
                </div>
              ),
          },
          {
            key: "fullName",
            title: "Họ tên",
            render: (row: TeacherRow) => (
              <TruncateTooltipWrapper className="max-w-[220px]">
                {row.fullName}
              </TruncateTooltipWrapper>
            ),
          },
          {
            key: "email",
            title: "Email",
            render: (row: TeacherRow) => (
              <TruncateTooltipWrapper className="max-w-[260px]">
                {row.email}
              </TruncateTooltipWrapper>
            ),
          },
          {
            key: "isInstructorActive",
            title: "Trạng thái",
            align: "center",
            type: "short",
            render: (row: TeacherRow) => (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                  statusFilter === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {statusFilter === "pending" ? "Chờ duyệt" : "Đã duyệt"}
              </span>
            ),
          },
          {
            key: "actions",
            title: "Hành động",
            align: "center",
            type: "action",
            render: (row: TeacherRow) => (
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => {
                    setSelectedTeacherId(String(row.id));
                    setOpenDetailModal(true);
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-accent cursor-pointer"
                  title="Xem chi tiết"
                  type="button"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {statusFilter === "pending" && (
                  <>
                    <button
                      onClick={() => setConfirmApproveId(String(row.id))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-accent cursor-pointer text-emerald-600"
                      title="Duyệt"
                      type="button"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setRejectDialogId(String(row.id))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-accent cursor-pointer text-destructive"
                      title="Từ chối"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ),
          },
        ];
        return (
          <DynamicTable
            columns={columns}
            data={filtered as unknown as TeacherRow[]}
            loading={isPending || isFetching}
            pagination={{
              totalItems: total,
              currentPage: page,
              itemsPerPage: limit,
              onPageChange: (np) => setPage(np),
              pageSizeOptions: [10, 20, 50],
              onPageSizeChange: (sz) => {
                setLimit(sz);
                setPage(1);
              },
            }}
          />
        );
      })()}

      {/* Teacher Detail Modal */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent className="w-[600px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Thông tin giảng viên</DialogTitle>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-6">
              <div className="text-muted-foreground text-sm">Đang tải...</div>
            </div>
          ) : teacherDetail ? (
            <div className="space-y-5">
              {/* Thông tin cơ bản */}
              <div className="flex items-center gap-3">
                {teacherDetail.avatar ? (
                  <img
                    src={teacherDetail.avatar}
                    alt={teacherDetail.fullName}
                    className="h-14 w-14 rounded-full object-cover border-2 border-border flex-shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary flex-shrink-0">
                    {teacherDetail.fullName?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-semibold truncate">{teacherDetail.fullName}</h3>
                  <p className="text-sm text-muted-foreground truncate">{teacherDetail.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {teacherDetail.phone && (
                      <span className="text-sm text-muted-foreground">{teacherDetail.phone}</span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs flex-shrink-0 ${
                        teacherDetail.isInstructorActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {teacherDetail.isInstructorActive ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Danh sách khóa học */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h4 className="text-sm font-medium">Khóa học ({instructorCourses?.length || 0})</h4>
                </div>
                
                {isLoadingCourses ? (
                  <div className="text-sm text-muted-foreground py-3 text-center">Đang tải...</div>
                ) : instructorCourses && instructorCourses.length > 0 ? (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto overflow-x-hidden scrollbar-thin pr-1">
                    {instructorCourses.map((course: any) => (
                      <div
                        key={course.id}
                        onClick={() => router.push(`/course-detail/${course.id}`)}
                        className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.name}
                            className="h-12 w-16 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-sm font-medium truncate">{course.name}</p>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <span
                              className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs flex-shrink-0 ${
                                course.status === "approved"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : course.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {course.status === "approved" ? "Đã duyệt" : course.status === "pending" ? "Chờ duyệt" : course.status || "Nháp"}
                            </span>
                            <span className="text-xs font-medium text-primary whitespace-nowrap flex-shrink-0">
                              {course.price ? formatPrice(course.price) : 'Miễn phí'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">
                    Chưa có khóa học nào
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-6">
              <div className="text-muted-foreground text-sm">Không tìm thấy thông tin</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={!!confirmApproveId}
        onOpenChange={(o) => {
          if (!o) setConfirmApproveId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt giảng viên?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Bạn có chắc muốn duyệt quyền giảng viên cho người dùng này?
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmApproveId(null)}>
              Huỷ
            </Button>
            <Button
              onClick={() =>
                confirmApproveId && handleApprove(confirmApproveId)
              }
              disabled={approving}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectDialogId}
        onOpenChange={(o) => {
          if (!o) {
            setRejectDialogId(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối giảng viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do (tuỳ chọn)</Label>
            <Input
              id="reason"
              placeholder="Nhập lý do"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setRejectDialogId(null);
                setRejectReason("");
              }}
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting}
            >
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
