'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { enrollmentsApi } from '@/services/enrollments';
import { Loader2, Download, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Enrollment } from '@/types/enrollment';

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const enrollmentId = params.enrollmentId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchCertificate = async () => {
      try {
        const enrollmentData = await enrollmentsApi.getEnrollment(enrollmentId);
        
        if (enrollmentData.progress < 100) {
          setError('Khóa học chưa hoàn thành');
          setLoading(false);
          return;
        }

        if (!enrollmentData.certificateImageUrl) {
          setIsGenerating(true);
          setLoading(false);
          
          // Poll every 3 seconds
          if (!intervalId) {
            intervalId = setInterval(async () => {
              try {
                const updatedData = await enrollmentsApi.getEnrollment(enrollmentId);
                if (updatedData.certificateImageUrl) {
                  setEnrollment(updatedData);
                  setIsGenerating(false);
                  if (intervalId) clearInterval(intervalId);
                }
              } catch (err) {
                console.error('Polling error:', err);
              }
            }, 3000);
          }
          return;
        }

        setEnrollment(enrollmentData);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải chứng chỉ');
        setLoading(false);
      }
    };

    fetchCertificate();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [enrollmentId]);

  const handleDownload = () => {
    if (!enrollment?.certificateImageUrl) return;
    
    const link = document.createElement('a');
    link.href = enrollment.certificateImageUrl;
    link.download = `chung-chi-${enrollment.course?.name || 'khoa-hoc'}.png`;
    link.target = '_blank';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>  
    );
  }

  if (isGenerating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-center text-lg">Chứng chỉ đang được tạo, vui lòng chờ...</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-center text-lg text-destructive">{error || 'Không tìm thấy chứng chỉ'}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="mx-auto mb-8 flex max-w-[1300px] px-4 items-center justify-between">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </Button>
        </div>

        <div className="mx-auto max-w-[700px] px-4">
          <div 
            className="overflow-hidden rounded-lg bg-white shadow-2xl transition-transform hover:scale-[1.02]"
            onClick={() => setIsPreviewMode(true)}
          >
            <img 
              src={enrollment.certificateImageUrl || ''} 
              alt="Certificate"
              className="h-auto w-full cursor-pointer"
            />
          </div>
          
          <p className="mt-4 text-center text-sm text-gray-500">
            Click vào chứng chỉ để xem toàn màn hình
          </p>  
        </div>
      </div>

      {isPreviewMode && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsPreviewMode(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setIsPreviewMode(false);
            }}
          >
            <X className="h-6 w-6" />
          </Button>
          
          <img 
            src={enrollment.certificateImageUrl || ''} 
            alt="Certificate Preview"
            className="max-h-[95vh] max-w-[95vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
