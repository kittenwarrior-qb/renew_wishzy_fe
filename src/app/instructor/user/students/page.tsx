"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay";
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Users, GraduationCap, BookOpen, Clock, Inbox, Mail } from "lucide-react";
import { useInstructorStudents } from "@/hooks/useInstructorApi";
import type { StudentListQuery } from "@/types/instructor";

export default function StudentsPage() {
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  // API query parameters
  const queryParams: StudentListQuery = React.useMemo(() => ({
    page,
    limit,
    search: searchTerm || undefined,
    sortBy: "joinDate",
    sortOrder: "desc"
  }), [page, limit, searchTerm]);

  // API hooks
  const { data: studentsData, isPending, isFetching } = useInstructorStudents(queryParams);
  console.log("ccc", studentsData)

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

  const handleViewDetail = (student: any) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
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
      key: 'actions',
      label: 'Hành động',
      type: 'action',
      render: (row: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(row)}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="relative">
      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      </div> */}

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

      {/* Student Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thông tin học viên</DialogTitle>
            <DialogDescription>
              Chi tiết về học viên và các khóa học đã đăng ký
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-medium text-primary">
                    {selectedStudent.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-4 w-4" />
                    {selectedStudent.email}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Ngày tham gia</p>
                      <p className="text-sm font-medium">{formatJoinDate(selectedStudent.joinDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hoạt động cuối</p>
                      <p className="text-sm font-medium">{formatLastActivity(selectedStudent.lastActivity)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-card border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-xs">Đã đăng ký</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedStudent.totalEnrolledCourses}</p>
                </div>
                <div className="p-4 bg-card border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-xs">Hoàn thành</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedStudent.totalCompletedCourses}</p>
                </div>
                <div className="p-4 bg-card border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Tiến độ TB</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedStudent.averageProgress}%</p>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <h4 className="font-semibold mb-3">Các khóa học đã mua</h4>
                {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudent.enrollments.map((enrollment: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium">{enrollment.courseName}</h5>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Đăng ký: {formatJoinDate(enrollment.enrolledAt)}</span>
                              {enrollment.completedAt && (
                                <span className="text-green-600">
                                  Hoàn thành: {formatJoinDate(enrollment.completedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                              {enrollment.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Tiến độ</span>
                            <span className="font-medium">{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có khóa học nào</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}