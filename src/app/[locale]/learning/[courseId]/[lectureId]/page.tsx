'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CourseSidebar } from '@/components/shared/learning/CourseSidebar';
import { VideoPlayer } from '@/components/shared/learning/VideoPlayer';
import { LectureInfo } from '@/components/shared/learning/LectureInfo';
import { 
  fakeCourse, 
  fakeLectureProgress,
  getLectureById, 
  getChapterByLectureId, 
  getNextLecture, 
  getPreviousLecture
} from '@/src/app/[locale]/learning/[courseId]/[lectureId]/fakeData';
import type { Lecture, Chapter, LectureProgress, UpdateLectureProgressDto } from '@/types/learning';

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lectureId = params.lectureId as string;
  
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [progress, setProgress] = useState<LectureProgress | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundLecture = getLectureById(lectureId);
    const foundChapter = getChapterByLectureId(lectureId);
    const foundProgress = fakeLectureProgress[lectureId];
    
    setLecture(foundLecture || null);
    setChapter(foundChapter || null);
    setProgress(foundProgress);
    setIsLoading(false);
  }, [lectureId]);

  const handleNext = () => {
    const nextLecture = getNextLecture(lectureId);
    if (nextLecture) {
      router.push(`/learning/${courseId}/${nextLecture.id}`);
    }
  };

  const handlePrevious = () => {
    const prevLecture = getPreviousLecture(lectureId);
    if (prevLecture) {
      router.push(`/learning/${courseId}/${prevLecture.id}`);
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

  const handleComplete = () => {
    setProgress(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        isCompleted: true,
        completedAt: new Date(),
      };
    });
    
    if (lecture) {
      setLecture({ ...lecture, isCompleted: true });
    }
  };

  const handleMarkComplete = () => {
    handleComplete();
    
    setTimeout(() => {
      handleNext();
    }, 1000);
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

  const nextLecture = getNextLecture(lectureId);
  const prevLecture = getPreviousLecture(lectureId);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <CourseSidebar 
        course={fakeCourse}
        courseId={courseId}
        currentLectureId={lectureId} 
      />

      <div className="flex-1 flex flex-col">
        <div className="p-6 pb-0">
          <VideoPlayer
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
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <LectureInfo
                lecture={lecture}
                chapter={chapter}
                onMarkComplete={handleMarkComplete}
              />
            </div>

            {/* Right Sidebar - Additional Info */}
            <div className="lg:col-span-1">
              <div className="bg-muted/30 rounded-lg p-4 text-center text-muted-foreground">
                <p className="text-sm">Additional content area</p>
                <p className="text-xs mt-1">Notes, comments, etc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
