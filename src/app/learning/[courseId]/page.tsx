'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChapterList } from '@/components/shared/chapter/useChapter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, ArrowLeft } from 'lucide-react';

export default function CourseRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [hasNoContent, setHasNoContent] = useState(false);

  const { data: chaptersData, isLoading } = useChapterList(courseId);

  useEffect(() => {
    if (!isLoading && chaptersData?.items !== undefined) {
      const chapters = chaptersData.items;
      
      // Find first chapter with lectures
      const firstChapterWithLectures = chapters.find(
        chapter => chapter.lecture && chapter.lecture.length > 0
      );

      if (firstChapterWithLectures && firstChapterWithLectures.lecture) {
        const firstLecture = firstChapterWithLectures.lecture[0];
        // Redirect to first lecture
        router.replace(`/learning/${courseId}/${firstLecture.id}`);
      } else {
        // No lectures found - show friendly message
        setHasNoContent(true);
      }
    }
  }, [chaptersData, isLoading, courseId, router]);

  // Show friendly message when course has no content yet
  if (hasNoContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold mb-3">
              Khóa học đang được cập nhật
            </h2>
            <p className="text-muted-foreground mb-6">
              Nội dung khóa học đang được giảng viên chuẩn bị. 
              Bạn sẽ nhận được thông báo khi có bài học mới.
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => router.push(`/course-detail/${courseId}`)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Xem thông tin khóa học
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/dashboard`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Về trang học tập của tôi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang tải khóa học...</p>
      </div>
    </div>
  );
}
