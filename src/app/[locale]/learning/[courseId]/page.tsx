'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChapterList } from '@/components/shared/chapter/useChapter';

export default function CourseRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const locale = params.locale as string;

  const { data: chaptersData, isLoading } = useChapterList(courseId);

  useEffect(() => {
    if (!isLoading && chaptersData?.items) {
      const chapters = chaptersData.items;
      
      // Find first chapter with lectures
      const firstChapterWithLectures = chapters.find(
        chapter => chapter.lecture && chapter.lecture.length > 0
      );

      if (firstChapterWithLectures && firstChapterWithLectures.lecture) {
        const firstLecture = firstChapterWithLectures.lecture[0];
        // Redirect to first lecture
        router.replace(`/${locale}/learning/${courseId}/${firstLecture.id}`);
      } else {
        // No lectures found, redirect to courses
        router.replace(`/${locale}/courses`);
      }
    }
  }, [chaptersData, isLoading, courseId, locale, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    </div>
  );
}
