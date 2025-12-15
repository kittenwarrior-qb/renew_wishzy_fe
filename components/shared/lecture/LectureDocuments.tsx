"use client";

import * as React from "react";
import { FileText, Plus, Pencil, Trash2, ExternalLink, ChevronDown, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog";
import { DocumentFormModal } from "@/components/shared/lecture/DocumentFormModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDocumentsByLecture,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
} from "@/components/shared/lecture/useDocument";
import type { Document } from "@/types/document.types";
import { cn } from "@/lib/utils";

interface LectureDocumentsProps {
  lectureId: string;
  lectureName: string;
}

export function LectureDocuments({ lectureId, lectureName }: LectureDocumentsProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editingDoc, setEditingDoc] = React.useState<Document | null>(null);
  const [deleteDocId, setDeleteDocId] = React.useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = React.useState<Document | null>(null);

  const { data: documentsData, isLoading } = useDocumentsByLecture(lectureId);
  const { mutate: createDocument, isPending: creating } = useCreateDocument();
  const { mutate: updateDocument, isPending: updating } = useUpdateDocument();
  const { mutate: deleteDocument, isPending: deleting } = useDeleteDocument();

  const documents = documentsData?.items || [];

  const getFileExtension = (url: string) => {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? match[1].toUpperCase() : "FILE";
  };

  const getFileIcon = (url: string) => {
    const ext = getFileExtension(url).toLowerCase();
    const iconColors: Record<string, string> = {
      pdf: "text-red-500",
      doc: "text-blue-500",
      docx: "text-blue-500",
      xls: "text-green-500",
      xlsx: "text-green-500",
      ppt: "text-orange-500",
      pptx: "text-orange-500",
      txt: "text-gray-500",
      zip: "text-yellow-500",
      rar: "text-yellow-500",
    };
    return iconColors[ext] || "text-primary";
  };

  const canPreview = (url: string) => {
    const ext = getFileExtension(url).toLowerCase();
    return ['pdf', 'doc', 'docx'].includes(ext);
  };

  const getPreviewUrl = (doc: Document) => {
    const ext = getFileExtension(doc.fileUrl).toLowerCase();
    if (ext === 'pdf') {
      return doc.fileUrl;
    }
    // For DOC/DOCX, use Google Docs Viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(doc.fileUrl)}&embedded=true`;
  };

  const handleCreate = (payload: { name: string; notes?: string; descriptions?: string; fileUrl: string }) => {
    createDocument(
      {
        ...payload,
        entityId: lectureId,
        entityType: "lecture",
      },
      {
        onSuccess: () => setOpenCreate(false),
      }
    );
  };

  const handleUpdate = (payload: { name: string; notes?: string; descriptions?: string; fileUrl: string }) => {
    if (!editingDoc) return;
    updateDocument(
      {
        id: editingDoc.id,
        lectureId,
        ...payload,
      },
      {
        onSuccess: () => setEditingDoc(null),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteDocId) return;
    deleteDocument(
      { id: deleteDocId, lectureId },
      {
        onSuccess: () => setDeleteDocId(null),
      }
    );
  };

  return (
    <div className="mt-2">
      {/* Document Section Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
          <FileText className="w-3.5 h-3.5" />
          <span>
            Tài liệu: {isLoading ? "..." : documents.length} file
          </span>
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            setOpenCreate(true);
          }}
        >
          <Plus className="w-3 h-3" />
          Thêm
        </Button>
      </div>

      {/* Document List */}
      {expanded && (
        <div className="mt-2 pl-5 space-y-1.5">
          {isLoading ? (
            <div className="text-xs text-muted-foreground py-2">Đang tải...</div>
          ) : documents.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2 italic">
              Chưa có tài liệu nào
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center justify-between p-2 rounded-md border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className={cn("w-4 h-4 flex-shrink-0", getFileIcon(doc.fileUrl))} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium truncate">{doc.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {getFileExtension(doc.fileUrl)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title={canPreview(doc.fileUrl) ? "Xem trước" : "Tải xuống"}
                    onClick={() => canPreview(doc.fileUrl) ? setPreviewDoc(doc) : window.open(doc.fileUrl, "_blank")}
                  >
                    {canPreview(doc.fileUrl) ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Sửa tài liệu"
                    onClick={() => setEditingDoc(doc)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1 rounded text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Xoá tài liệu"
                    onClick={() => setDeleteDocId(doc.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Document Modal */}
      <DocumentFormModal
        open={openCreate}
        onOpenChange={setOpenCreate}
        loading={creating}
        title="Thêm tài liệu"
        onSubmit={handleCreate}
      />

      {/* Edit Document Modal */}
      <DocumentFormModal
        open={!!editingDoc}
        onOpenChange={(o) => !o && setEditingDoc(null)}
        loading={updating}
        title="Sửa tài liệu"
        defaultValue={
          editingDoc
            ? {
                name: editingDoc.name,
                notes: editingDoc.notes,
                descriptions: editingDoc.descriptions,
                fileUrl: editingDoc.fileUrl,
              }
            : undefined
        }
        onSubmit={handleUpdate}
      />

      {/* Delete Confirmation */}
      <AdminActionDialog
        open={!!deleteDocId}
        onOpenChange={(o) => !o && setDeleteDocId(null)}
        title="Xác nhận xoá"
        description={<span>Bạn có chắc muốn xoá tài liệu này?</span>}
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deleting}
        position="top"
        onConfirm={handleDelete}
      />

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(o) => !o && setPreviewDoc(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>{previewDoc?.name}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewDoc(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="w-full h-[calc(90vh-80px)] overflow-hidden">
            {previewDoc && (
              <iframe
                src={getPreviewUrl(previewDoc)}
                className="w-full h-full border-0"
                title={previewDoc.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
