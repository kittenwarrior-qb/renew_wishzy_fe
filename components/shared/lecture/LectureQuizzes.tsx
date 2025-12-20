"use client";

import * as React from "react";
import { ListChecks, Edit, Trash2, Plus, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useLectureQuizzes,
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  useQuizAdminDetails,
  type Quiz,
} from "@/hooks/useQuizzes";
import { notify } from "@/components/shared/admin/Notifications";
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay";
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog";
import { LectureQuizFormModal } from "./LectureQuizFormModal";

interface LectureQuizzesProps {
  lectureId: string;
  lectureName: string;
}

export function LectureQuizzes({ lectureId, lectureName }: LectureQuizzesProps) {
  const { data: quizzes, isLoading, isError } = useLectureQuizzes(lectureId);
  const { mutate: createQuiz, isPending: creatingQuiz } = useCreateQuiz();
  const { mutate: updateQuiz, isPending: updatingQuiz } = useUpdateQuiz();
  const { mutate: deleteQuiz, isPending: deletingQuiz } = useDeleteQuiz();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editingQuizId, setEditingQuizId] = React.useState<string | null>(null);
  const [openDeleteId, setOpenDeleteId] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState(false);

  const { data: editingQuiz, isLoading: loadingQuizDetails } = useQuizAdminDetails(
    editingQuizId || ""
  );

  const handleCreate = (data: any) => {
    createQuiz(
      {
        ...data,
        entityId: lectureId,
        isPublic: true,
        isFree: true,
        price: 0,
        questions: data.questions.map((q: any, i: number) => ({
          questionText: q.questionText,
          points: q.points || 1,
          orderIndex: i,
          answerOptions: q.answerOptions.map((a: any, j: number) => ({
            optionText: a.optionText,
            isCorrect: a.isCorrect,
            orderIndex: j,
          })),
        })),
      },
      {
        onSuccess: () => {
          notify({ title: "Thành công", description: "Đã thêm bài kiểm tra", variant: "success" });
          setOpenCreate(false);
        },
        onError: (error: any) => {
          notify({
            title: "Lỗi",
            description: error?.message || "Không thể thêm bài kiểm tra",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUpdate = (data: any) => {
    if (!editingQuizId) return;

    updateQuiz(
      {
        id: editingQuizId,
        entityId: lectureId,
        data: {
          ...data,
          questions: data.questions.map((q: any, i: number) => ({
            questionText: q.questionText,
            points: q.points || 1,
            orderIndex: i,
            answerOptions: q.answerOptions.map((a: any, j: number) => ({
              optionText: a.optionText,
              isCorrect: a.isCorrect,
              orderIndex: j,
            })),
          })),
        },
      },
      {
        onSuccess: () => {
          notify({ title: "Thành công", description: "Đã cập nhật bài kiểm tra", variant: "success" });
          setOpenEdit(false);
          setEditingQuizId(null);
        },
        onError: (error: any) => {
          notify({
            title: "Lỗi",
            description: error?.message || "Không thể cập nhật bài kiểm tra",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDelete = (quizId: string) => {
    deleteQuiz(
      { id: quizId, entityId: lectureId },
      {
        onSuccess: () => {
          notify({ title: "Thành công", description: "Đã xoá bài kiểm tra", variant: "success" });
          setOpenDeleteId(null);
        },
        onError: (error: any) => {
          notify({
            title: "Lỗi",
            description: error?.message || "Không thể xoá bài kiểm tra",
            variant: "destructive",
          });
        },
      }
    );
  };

  const openEditModal = (quizId: string) => {
    setEditingQuizId(quizId);
    setOpenEdit(true);
  };

  if (isLoading) {
    return (
      <div className="mt-3 relative min-h-[40px]">
        <LoadingOverlay show={true} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-3 text-sm text-destructive">
        Không thể tải bài kiểm tra
      </div>
    );
  }

  const hasQuizzes = quizzes && quizzes.length > 0;

  return (
    <div className="mt-3 border-t border-border/40 pt-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ListChecks className="h-4 w-4" />
          <span>Bài kiểm tra {hasQuizzes && `(${quizzes.length})`}</span>
        </button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 text-xs"
          onClick={() => setOpenCreate(true)}
        >
          <Plus className="h-3 w-3" />
          Thêm
        </Button>
      </div>

      {expanded && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          {hasQuizzes ? (
            quizzes.map((quiz: Quiz) => (
              <div
                key={quiz.id}
                className="group flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex-shrink-0">
                    <FileQuestion className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{quiz.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{quiz.questions?.length || 0} câu</span>
                      {quiz.timeLimit && <span>• {quiz.timeLimit} phút</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => openEditModal(quiz.id)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setOpenDeleteId(quiz.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Chưa có bài kiểm tra nào
            </div>
          )}
        </div>
      )}

      {/* Create Quiz Modal */}
      <LectureQuizFormModal
        open={openCreate}
        onOpenChange={setOpenCreate}
        loading={creatingQuiz}
        title="Thêm bài kiểm tra"
        onSubmit={handleCreate}
      />

      {/* Edit Quiz Modal */}
      <LectureQuizFormModal
        open={openEdit}
        onOpenChange={(o) => {
          if (!o) {
            setOpenEdit(false);
            setEditingQuizId(null);
          } else {
            setOpenEdit(true);
          }
        }}
        loading={updatingQuiz || loadingQuizDetails}
        title="Sửa bài kiểm tra"
        defaultValue={
          editingQuiz
            ? {
                title: editingQuiz.title,
                description: editingQuiz.description || "",
                timeLimit: editingQuiz.timeLimit || 10,
                questions: (editingQuiz.questions || []).map((q: any) => ({
                  questionText: q.questionText,
                  points: q.points || 1,
                  orderIndex: q.orderIndex || 0,
                  answerOptions: (q.answerOptions || []).map((a: any) => ({
                    optionText: a.optionText,
                    isCorrect: a.isCorrect,
                    orderIndex: a.orderIndex || 0,
                  })),
                })),
              }
            : undefined
        }
        onSubmit={handleUpdate}
      />

      {/* Delete Confirmation */}
      <AdminActionDialog
        open={!!openDeleteId}
        onOpenChange={(o) => setOpenDeleteId(o ? openDeleteId : null)}
        title="Xác nhận xoá"
        description={<span>Bạn có chắc muốn xoá bài kiểm tra này?</span>}
        confirmText={deletingQuiz ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deletingQuiz}
        position="top"
        onConfirm={() => {
          if (openDeleteId) {
            handleDelete(openDeleteId);
          }
        }}
      />
    </div>
  );
}
