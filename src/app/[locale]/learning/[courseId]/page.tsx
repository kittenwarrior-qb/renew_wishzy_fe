'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fakeCourse } from '@/src/app/[locale]/learning/[courseId]/[lectureId]/fakeData';

export default function CourseRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const locale = params.locale as string;

  useEffect(() => {
    // Get first lecture from first chapter
    const firstChapter = fakeCourse.chapters[0];
    if (firstChapter && firstChapter.lectures.length > 0) {
      const firstLecture = firstChapter.lectures[0];
      // Redirect to first lecture
      router.replace(`/${locale}/learning/${courseId}/${firstLecture.id}`);
    } else {
      // No lectures found, redirect to courses
      router.replace(`/${locale}/courses`);
    }
  }, [courseId, locale, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    </div>
  );
}
