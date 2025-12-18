"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, File, X } from "lucide-react";
import { uploadDocument } from "@/services/uploads";
import { notify } from "@/components/shared/admin/Notifications";
import { api } from "@/lib/api";

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: () => void;
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  onUploadSuccess,
}: UploadDocumentDialogProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("");
  const [documentDescription, setDocumentDescription] = React.useState<string>("");
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch instructor's courses
  React.useEffect(() => {
    if (open) {
      fetchCourses();
    }
  }, [open]);

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const response = await api.get('/courses/instructor/my-courses', {
        params: { 
          page: 1,
          limit: 100 
        }
      });

      const coursesData = response.data?.data?.items || [];
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      notify({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        notify({
          title: "File quá lớn",
          description: "Kích thước file không được vượt quá 10MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/zip',
        'application/x-rar-compressed',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        notify({
          title: "Loại file không hỗ trợ",
          description: "Vui lòng chọn file PDF, DOC, DOCX, PNG, JPG, ZIP hoặc TXT",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      notify({
        title: "Thiếu file",
        description: "Vui lòng chọn file để tải lên",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCourseId) {
      notify({
        title: "Thiếu khóa học",
        description: "Vui lòng chọn khóa học",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Step 1: Upload file to cloud storage
      const { url, fileName } = await uploadDocument(selectedFile, {
        onProgress: (progress) => {
          setUploadProgress(progress * 0.7); // 70% for upload
        }
      });

      setUploadProgress(75);

      // Step 2: Create document record in database
      const documentData = {
        name: selectedFile.name,
        notes: `Tài liệu được tải lên từ khóa học`, // Add notes field
        descriptions: documentDescription || `Tài liệu ${selectedFile.name} được tải lên bởi instructor`,
        fileUrl: url,
        entityId: selectedCourseId,
        entityType: 'course', // Backend will validate this as enum
      };

      const response = await api.post('/documents', documentData);

      setUploadProgress(100);

      notify({
        title: "Thành công",
        description: "Tài liệu đã được tải lên thành công",
        variant: "success"
      });

      // Reset form
      handleReset();
      onOpenChange(false);

      // Trigger refresh
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (error: any) {
      console.error('Error uploading document:', error);
      notify({
        title: "Lỗi upload",
        description: error?.message || "Không thể tải lên tài liệu",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedCourseId("");
    setDocumentDescription("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tải lên tài liệu mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>File tài liệu</Label>
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {!selectedFile ? (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Kéo thả file vào đây</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hoặc click để chọn file từ máy tính
                  </p>
                  <Button variant="outline" type="button">
                    Chọn file
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Hỗ trợ: PDF, DOC, DOCX, PNG, JPG, ZIP, TXT (Tối đa 10MB)
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.rar,.txt"
            />
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course-select">Khóa học *</Label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              disabled={isUploading || isLoadingCourses}
            >
              <SelectTrigger id="course-select">
                <SelectValue placeholder={isLoadingCourses ? "Đang tải..." : "Chọn khóa học"} />
              </SelectTrigger>
              <SelectContent>
                {courses.length === 0 ? (
                  <SelectItem value="no-courses" disabled>
                    Không có khóa học nào
                  </SelectItem>
                ) : (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả (tùy chọn)</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả cho tài liệu..."
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              rows={3}
              disabled={isUploading}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Đang tải lên...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
            disabled={isUploading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !selectedCourseId}
          >
            {isUploading ? "Đang tải lên..." : "Tải lên"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
