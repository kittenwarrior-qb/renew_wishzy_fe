"use client";

import * as React from "react";
import { FileText, Download, Eye, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDocumentsByLecture } from "@/components/shared/lecture/useDocument";
import type { Document } from "@/types/document.types";
import { cn } from "@/lib/utils";

interface LectureDocumentsViewProps {
  lectureId: string;
}

export function LectureDocumentsView({ lectureId }: LectureDocumentsViewProps) {
  const [previewDoc, setPreviewDoc] = React.useState<Document | null>(null);
  const { data: documentsData, isLoading } = useDocumentsByLecture(lectureId);

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tài liệu bài học</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Đang tải tài liệu...</p>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return null; // Don't show section if no documents
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Tài liệu bài học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                    <FileText className={cn("w-5 h-5", getFileIcon(doc.fileUrl))} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                    {doc.descriptions && (
                      <p className="text-xs text-muted-foreground truncate">{doc.descriptions}</p>
                    )}
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {getFileExtension(doc.fileUrl)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canPreview(doc.fileUrl) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Tải xuống
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(o) => !o && setPreviewDoc(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>{previewDoc?.name}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(previewDoc?.fileUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Mở trong tab mới
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
    </>
  );
}
