'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CourseSidebar } from '@/components/shared/learning/CourseSidebar';
import { VideoPlayer } from '@/components/shared/learning/VideoPlayer';
import { LectureInfo } from '@/components/shared/learning/LectureInfo';
import { LearningComment } from '@/components/shared/learning/LearningComment';
import { useChapterList, useChapterListForEnrolled } from '@/components/shared/chapter/useChapter';
import { useCourseDetail } from '@/components/shared/course/useCourse';
import { enrollmentService } from '@/services/enrollment';
import { usePrefetchLearning, usePrefetchAdjacentLectures } from '@/hooks/usePrefetchLearning';
import type { Lecture, Chapter, LectureProgress, UpdateLectureProgressDto, Course } from '@/src/types/learning';

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lectureId = params.lectureId as string;
  
  const [progress, setProgress] = useState<LectureProgress | undefined>(undefined);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [completedLectureIds, setCompletedLectureIds] = useState<string[]>([]);
  
  // Ref to track if we're navigating after completion (to skip lock check)
  const isNavigatingAfterCompletionRef = useRef(false);
  // Ref to store the latest completed lecture IDs (for immediate access in effects)
  const completedLectureIdsRef = useRef<string[]>([]);
  // Ref to track which lecture we last checked for lock (to prevent re-checking)
  const lastCheckedLectureIdRef = useRef<string | null>(null);

  // Prefetch data for better performance
  usePrefetchLearning(courseId);

  // Fetch enrollment ID and completed lectures
  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        // Skip cache to ensure fresh data
        const enrollment = await enrollmentService.getEnrollmentByCourseId(courseId, true);
        if (enrollment) {
          setEnrollmentId(enrollment.id);
          // Set initial completed lectures
          if (enrollment.attributes?.finishedLectures) {
            setCompletedLectureIds(enrollment.attributes.finishedLectures);
          }
        } else {
          // Retry once after a short delay (in case enrollment was just created)
          setTimeout(async () => {
            const retryEnrollment = await enrollmentService.getEnrollmentByCourseId(courseId, true);
            if (retryEnrollment) {
              setEnrollmentId(retryEnrollment.id);
              if (retryEnrollment.attributes?.finishedLectures) {
                setCompletedLectureIds(retryEnrollment.attributes.finishedLectures);
              }
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch enrollment:', error);
      }
    };
    if (courseId) {
      fetchEnrollment();
    }
  }, [courseId]);

  // Fetch course data
  const { data: courseData, isLoading: isCourseLoading } = useCourseDetail(courseId);
  
  // Try enrolled API first, fallback to public API if it fails
  const { 
    data: enrolledChaptersData, 
    isLoading: isEnrolledChaptersLoading,
    isError: isEnrolledChaptersError 
  } = useChapterListForEnrolled(courseId);
  
  // Fallback to public API if enrolled API fails (e.g., endpoint not deployed yet)
  const { 
    data: publicChaptersData, 
    isLoading: isPublicChaptersLoading 
  } = useChapterList(courseId);
  
  // Use enrolled data if available, otherwise fallback to public data
  const chaptersData = isEnrolledChaptersError ? publicChaptersData : enrolledChaptersData;
  const isChaptersLoading = isEnrolledChaptersError ? isPublicChaptersLoading : isEnrolledChaptersLoading;

  // Process data to find current lecture and chapter
  const { lecture, chapter, course, allLectures } = useMemo((): {
    lecture: Lecture | null;
    chapter: Chapter | null;
    course: Course | null;
    allLectures: Array<{ lecture: Lecture; chapter: Chapter; chapterIndex: number }>;
  } => {
    if (!chaptersData?.items || !courseData) {
      return { lecture: null, chapter: null, course: null, allLectures: [] };
    }

    const chaptersRaw = chaptersData.items;
    let foundLecture: Lecture | null = null;
    let foundChapter: Chapter | null = null;
    const lectures: Array<{ lecture: Lecture; chapter: Chapter; chapterIndex: number }> = [];

    // Transform chapters data to match expected format
    const transformedChapters: Chapter[] = chaptersRaw.map((ch) => {
      const chapterLectures: Lecture[] = (ch.lecture || []).map((lec, index) => ({
        id: lec.id,
        title: lec.name,
        description: '',
        videoUrl: lec.fileUrl || undefined,
        duration: lec.duration,
        chapterId: ch.id,
        order: lec.orderIndex || index,
        isCompleted: false,
        requiresQuiz: lec.requiresQuiz || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      return {
        id: ch.id,
        name: ch.name,
        description: ch.description,
        duration: ch.duration,
        courseId: ch.courseId,
        order: 0,
        lectures: chapterLectures,
        createdAt: new Date(ch.createdAt),
        updatedAt: new Date(ch.updatedAt),
      };
    });

    // Build flat list of all lectures with their chapters
    transformedChapters.forEach((ch, chapterIndex) => {
      ch.lectures.forEach((lec) => {
        lectures.push({ lecture: lec, chapter: ch, chapterIndex });
        if (lec.id === lectureId) {
          foundLecture = lec;
          foundChapter = ch;
        }
      });
    });

    // Sort lectures by chapter order first, then by lecture order within chapter
    lectures.sort((a, b) => {
      if (a.chapterIndex !== b.chapterIndex) {
        return a.chapterIndex - b.chapterIndex;
      }
      return a.lecture.order - b.lecture.order;
    });

    // Build course object
    const totalLessons = lectures.length;
    const completedLessons = lectures.filter(l => l.lecture.isCompleted).length;
    
    const courseObj: Course = {
      id: courseData.id,
      title: courseData.name,
      description: courseData.description || '',
      chapters: transformedChapters,
      totalLessons,
      completedLessons,
      progressPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    };

    return { 
      lecture: foundLecture, 
      chapter: foundChapter, 
      course: courseObj,
      allLectures: lectures 
    };
  }, [chaptersData, courseData, lectureId]);

  const isLoading = isCourseLoading || isChaptersLoading;

  // Keep ref in sync with state
  useEffect(() => {
    completedLectureIdsRef.current = completedLectureIds;
  }, [completedLectureIds]);

  // Check if current lecture is locked and redirect if necessary
  useEffect(() => {
    // Skip if navigating after completion
    if (isNavigatingAfterCompletionRef.current) {
      isNavigatingAfterCompletionRef.current = false;
      lastCheckedLectureIdRef.current = lectureId;
      return;
    }
    
    // Skip if we already checked this lecture
    if (lastCheckedLectureIdRef.current === lectureId) {
      return;
    }
    
    // Only check after we have enrollment data loaded
    if (isLoading || !allLectures.length || !lectureId || !enrollmentId) return;
    
    // Mark this lecture as checked
    lastCheckedLectureIdRef.current = lectureId;
    
    const currentIndex = allLectures.findIndex(l => l.lecture.id === lectureId);
    if (currentIndex === -1) return;
    
    // First lecture is always accessible
    if (currentIndex === 0) return;
    
    // Use ref for most up-to-date completed lectures
    const currentCompletedIds = completedLectureIdsRef.current;
    
    // Check if this lecture is already completed - if so, allow access
    if (currentCompletedIds.includes(lectureId)) return;
    
    // Get the previous lecture in the flat list
    const previousLectureInList = allLectures[currentIndex - 1];
    
    // If previous lecture is completed, this lecture is accessible
    if (currentCompletedIds.includes(previousLectureInList.lecture.id)) return;
    
    // Previous lecture is not completed - this lecture is locked
    toast.error('Bạn cần hoàn thành bài học trước để mở khóa bài này');
    
    // Find the next lecture that should be watched (first uncompleted lecture)
    let targetLectureId = allLectures[0].lecture.id;
    for (let i = 0; i < allLectures.length; i++) {
      if (!currentCompletedIds.includes(allLectures[i].lecture.id)) {
        targetLectureId = allLectures[i].lecture.id;
        break;
      }
    }
    
    router.replace(`/learning/${courseId}/${targetLectureId}`);
  }, [allLectures, lectureId, isLoading, courseId, router, enrollmentId]);

  // Prefetch adjacent lectures for smoother navigation
  usePrefetchAdjacentLectures(courseId, lectureId, allLectures);

  // Navigation helpers
  const { nextLecture, prevLecture } = useMemo(() => {
    const currentIndex = allLectures.findIndex(l => l.lecture.id === lectureId);
    return {
      nextLecture: currentIndex >= 0 && currentIndex < allLectures.length - 1 
        ? allLectures[currentIndex + 1] 
        : null,
      prevLecture: currentIndex > 0 
        ? allLectures[currentIndex - 1] 
        : null,
    };
  }, [allLectures, lectureId]);

  const handleNext = () => {
    if (nextLecture) {
      router.push(`/learning/${courseId}/${nextLecture.lecture.id}`);
    }
  };

  const handlePrevious = () => {
    if (prevLecture) {
      router.push(`/learning/${courseId}/${prevLecture.lecture.id}`);
    }
  };

  const handleProgressUpdate = (progressData: UpdateLectureProgressDto) => {
    setProgress(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        currentTime: progressData.currentTime,
        duration: progressData.duration,
        isCompleted: progressData.isCompleted || false,
        playbackRate: progressData.playbackRate,
        volume: progressData.volume,
        lastWatchedAt: new Date(),
        updatedAt: new Date(),
      };
    });
  };

  const handleComplete = async () => {
    // Update completed lectures immediately for sidebar (đồng bộ với API call ở 90%)
    if (lectureId && !completedLectureIds.includes(lectureId)) {
      const newCompletedLectures = [...completedLectureIds, lectureId];
      setCompletedLectureIds(newCompletedLectures);
      // Also update ref for immediate access
      completedLectureIdsRef.current = newCompletedLectures;
      
      // Show toast notification for lecture completion
      toast.success('Bài học hoàn thành! 🎉', {
        description: lecture?.title || 'Tuyệt vời!',
        duration: 2000,
      });

      // Check if all lectures are completed
      const totalLectures = allLectures.length;
      if (newCompletedLectures.length === totalLectures) {
        // All lectures completed - show certificate notification
        toast.success('🎓 Chúc mừng! Bạn đã hoàn thành khóa học!', {
          description: 'Chứng chỉ của bạn đã được tạo. Kiểm tra email hoặc xem trong trang học của tôi.',
          duration: 5000,
        });
      } else {
        // Auto navigate to next lecture after a short delay
        setTimeout(() => {
          if (nextLecture) {
            // Set flag to skip lock check when navigating after completion
            isNavigatingAfterCompletionRef.current = true;
            // Pre-set the lastCheckedLectureId to the next lecture to prevent double-check
            lastCheckedLectureIdRef.current = nextLecture.lecture.id;
            router.push(`/learning/${courseId}/${nextLecture.lecture.id}`);
          }
        }, 2000); // Wait 2 seconds before auto-navigate
      }
    }
    
    setProgress(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        isCompleted: true,
        completedAt: new Date(),
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lecture...</p>
        </div>
      </div>
    );
  }

  if (!lecture || !chapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lecture not found</h1>
          <p className="text-muted-foreground mb-4">
            The lecture you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/courses')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Container with max-width */}
      <div className="max-w-[1300px] mx-auto">
        <div className="flex">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <aside className="hidden lg:block lg:w-80 shrink-0">
            {course && (
              <CourseSidebar 
                course={course}
                courseId={courseId}
                currentLectureId={lectureId}
                completedLectureIds={completedLectureIds}
              />
            )}
          </aside>

          <main className="flex-1 min-w-0">
            <div className="w-full ">
              <div className="px-4 py-4">
                {!enrollmentId ? (
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center shadow-2xl">
                    <div className="text-white text-center p-4">
                      <p className="mb-2">Enrollment not found</p>
                      <p className="text-sm text-gray-400">Please enroll in this course first</p>
                    </div>
                  </div>
                ) : lecture && !lecture.requiresQuiz ? (
                  <>
                    <VideoPlayer
                      enrollmentId={enrollmentId}
                      lectureId={lectureId}
                      videoUrl={lecture.videoUrl || ''}
                      title={lecture.title}
                    initialProgress={progress}
                    onProgressUpdate={handleProgressUpdate}
                    onComplete={handleComplete}
                    onNext={nextLecture ? handleNext : undefined}
                    onPrevious={prevLecture ? handlePrevious : undefined}
                    hasNext={!!nextLecture}
                    hasPrevious={!!prevLecture}
                  />
                  </>
                ) : null}
              </div>
            </div>

            <div className="px-4 py-6 space-y-6">
              {lecture && chapter && (
                <LectureInfo
                  lecture={lecture}
                  chapter={chapter}
                  onSeekToTime={(seconds) => {
                    const event = new CustomEvent('seekToTime', { detail: { seconds } });
                    window.dispatchEvent(event);
                  }}
                  courseId={courseId}
                  isEnrolled={!!enrollmentId}
                  enrollmentId={enrollmentId || undefined}
                  isQuizLecture={lecture.requiresQuiz}
                  onQuizComplete={(allPassed) => {
                    if (allPassed && lectureId && !completedLectureIds.includes(lectureId)) {
                      // Quiz completed - mark lecture as completed
                      const newCompletedLectures = [...completedLectureIds, lectureId];
                      setCompletedLectureIds(newCompletedLectures);
                      completedLectureIdsRef.current = newCompletedLectures;
                      
                      // Check if all lectures are completed
                      const totalLectures = allLectures.length;
                      if (newCompletedLectures.length === totalLectures) {
                        toast.success('🎓 Chúc mừng! Bạn đã hoàn thành khóa học!', {
                          description: 'Chứng chỉ của bạn đã được tạo.',
                          duration: 5000,
                        });
                      } else if (nextLecture) {
                        // Auto navigate to next lecture
                        setTimeout(() => {
                          isNavigatingAfterCompletionRef.current = true;
                          lastCheckedLectureIdRef.current = nextLecture.lecture.id;
                          router.push(`/learning/${courseId}/${nextLecture.lecture.id}`);
                        }, 2000);
                      }
                    }
                  }}
                />
              )}

              {/* Learning Comments (Q&A) */}
              <div className="border-t pt-6">
                <LearningComment 
                  courseId={courseId}
                  lectureId={lectureId}
                  isEnrolled={!!enrollmentId}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {/* Add mobile sidebar toggle logic */}}
          className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
