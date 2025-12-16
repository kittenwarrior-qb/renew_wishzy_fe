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
import { MoreHorizontal, Users, GraduationCap, BookOpen, Clock, Inbox } from "lucide-react";
import { useInstructorStudents, useSendMessageToStudent } from "@/hooks/useInstructorApi";
import type { StudentListQuery } from "@/types/instructor";

export default function StudentsPage() {
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // API query parameters
  const queryParams: StudentListQuery = React.useMemo(() => ({
    page,
    limit,
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    sortBy: "joinDate",
    sortOrder: "desc"
  }), [page, limit, searchTerm, statusFilter]);

  // API hooks
  const { data: studentsData, isPending, isFetching } = useInstructorStudents(queryParams);
  console.log("ccc", studentsData)
  const sendMessageMutation = useSendMessageToStudent();

  // Extract data from API response
  const students = studentsData?.data?.items || [];
  const pagination = studentsData?.data?.pagination;
  const statistics = studentsData?.data?.statistics;

  const totalStudents = statistics?.totalStudents || 0;
  const activeStudents = statistics?.activeStudents || 0;
  const avgProgress = Math.round(statistics?.averageProgress || 0);

  const formatLastActivity = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} tuần trước`;
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleSendMessage = (studentId: string) => {
    const message = prompt('Nhập tin nhắn gửi cho học viên:');
    if (message && message.trim()) {
      sendMessageMutation.mutate({ studentId, message: message.trim() });
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'student',
      label: 'Học viên',
      type: 'text',
      render: (row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {row.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'courses',
      label: 'Khóa học',
      type: 'short',
      render: (row: any) => (
        <div className="text-sm">
          <div>{row.totalEnrolledCourses} đăng ký</div>
          <div className="text-muted-foreground">{row.totalCompletedCourses} hoàn thành</div>
        </div>
      ),
    },
    {
      key: 'progress',
      label: 'Tiến độ',
      type: 'short',
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${row.averageProgress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{row.averageProgress}%</span>
        </div>
      ),
    },
    {
      key: 'lastActivity',
      label: 'Hoạt động cuối',
      type: 'short',
      render: (row: any) => (
        <span className="text-sm text-muted-foreground">{formatLastActivity(row.lastActivity)}</span>
      ),
    },
    {
      key: 'joinDate',
      label: 'Ngày tham gia',
      type: 'short',
      render: (row: any) => (
        <span className="text-sm">{formatJoinDate(row.joinDate)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'short',
      render: (row: any) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>
          {row.status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Badge>
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
            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSendMessage(row.id)}>
              {/* Gửi tin nhắn */}
            </DropdownMenuItem>
            <DropdownMenuItem>Xem tiến độ</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="relative">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng học viên</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-xs text-muted-foreground">+2 từ tháng trước</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Học viên hoạt động</p>
              <p className="text-2xl font-bold">{activeStudents}</p>
              <p className="text-xs text-muted-foreground">{Math.round((activeStudents / totalStudents) * 100)}% tổng số</p>
            </div>
            <GraduationCap className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tiến độ trung bình</p>
              <p className="text-2xl font-bold">{avgProgress}%</p>
              <p className="text-xs text-muted-foreground">Trên tất cả khóa học</p>
            </div>
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hoạt động gần đây</p>
              <p className="text-2xl font-bold">24h</p>
              <p className="text-xs text-muted-foreground">Thời gian hoạt động cuối</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm học viên
              </label>
              <Input 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }} 
                placeholder="Nhập tên hoặc email học viên..." 
                className="h-9 w-52" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo trạng thái
              </label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">👥 Tất cả học viên</SelectItem>
                  <SelectItem value="active">✅ Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">⏸️ Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />

        {students.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/60" />
              <span>Không có dữ liệu</span>
            </div>
          </div>
        ) : (
          <DynamicTable
            columns={columns}
            data={students}
            loading={isPending || isFetching}
            pagination={{
              totalItems: pagination?.total || 0,
              currentPage: pagination?.page || 1,
              itemsPerPage: pagination?.limit || 10,
              onPageChange: (p) => setPage(p),
              pageSizeOptions: [10, 20, 50],
              onPageSizeChange: (sz) => {
                setLimit(sz);
                setPage(1);
              },
            }}
          />
        )}
      </div>
    </div>
  );
}