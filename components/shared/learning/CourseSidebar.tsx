'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { enrollmentService } from '@/src/services/enrollment';
import type { Course } from '@/src/types/learning';

interface CourseSidebarProps {
  course: Course;
  courseId: string;
  currentLectureId?: string;
  completedLectureIds?: string[];
  onRefreshCompleted?: () => void;
}

export function CourseSidebar({ 
  course, 
  courseId, 
  currentLectureId,
  completedLectureIds,
  onRefreshCompleted 
}: CourseSidebarProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [finishedLectures, setFinishedLectures] = useState<string[]>([]);
  const [totalLectures, setTotalLectures] = useState(0);

  // Fetch enrollment data for completed lectures
  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        // Reset state when courseId changes
        setFinishedLectures([]);
        
        const enrollment = await enrollmentService.getEnrollmentByCourseId(courseId);
        if (enrollment?.attributes?.finishedLectures) {
          setFinishedLectures(enrollment.attributes.finishedLectures);
        }
      } catch (error) {
        console.error('Failed to fetch enrollment:', error);
      }
    };
    fetchEnrollment();
  }, [courseId]);

  // Update finishedLectures when completedLectureIds prop changes
  useEffect(() => {
    if (completedLectureIds && completedLectureIds.length > 0) {
      setFinishedLectures(completedLectureIds);
    }
  }, [completedLectureIds]);

  useEffect(() => {
    const total = course.chapters.reduce((sum, chapter) => sum + chapter.lectures.length, 0);
    setTotalLectures(total);
  }, [course.chapters]);

  useEffect(() => {
    if (currentLectureId) {
      const chapterWithLecture = course.chapters.find(chapter =>
        chapter.lectures.some(lecture => lecture.id === currentLectureId)
      );
      
      if (chapterWithLecture) {
        setExpandedChapters(prev => {
          const newExpanded = new Set(prev);
          newExpanded.add(chapterWithLecture.id);
          return newExpanded;
        });
      }
    }
  }, [currentLectureId, course.chapters]);

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-card border-r flex flex-col sticky top-16">
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <h2 className="font-semibold text-lg mb-2">{course.title}</h2>
        <div className="text-sm text-muted-foreground mb-3">
          Progress: {finishedLectures.length}/{totalLectures} lectures
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${totalLectures > 0 ? Math.round((finishedLectures.length / totalLectures) * 100) : 0}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {totalLectures > 0 ? Math.round((finishedLectures.length / totalLectures) * 100) : 0}% complete
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden"
           style={{
             scrollbarWidth: 'thin',
             scrollbarColor: 'hsl(var(--muted-foreground) / 0.3) transparent'
           }}>
        {course.chapters.map((chapter) => (
          <div key={chapter.id} className="border-b">
            <Button
              variant="ghost"
              className="w-full justify-start p-4 h-auto hover:bg-accent hover:text-accent-foreground"
              onClick={() => toggleChapter(chapter.id)}
            >
              <div className="flex items-center gap-3 w-full">
                {expandedChapters.has(chapter.id) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
                <div className="flex-1 text-left">
                  <div className="font-medium">{chapter.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {chapter.lectures.length} lectures
                  </div>
                </div>
              </div>
            </Button>

            {/* Lectures List */}
            {expandedChapters.has(chapter.id) && (
              <div className="pb-2">
                {[...chapter.lectures]
                  .sort((a, b) => {
                    const orderA = a.orderIndex ?? a.order ?? 0;
                    const orderB = b.orderIndex ?? b.order ?? 0;
                    return orderA - orderB;
                  })
                  .map((lecture, index, sortedLectures) => {
                    // Check if previous lecture is completed (for sequential learning)
                    const previousLecture = index > 0 ? sortedLectures[index - 1] : null;
                    const isPreviousCompleted = !previousLecture || finishedLectures.includes(previousLecture.id);
                    const isLocked = !isPreviousCompleted && !finishedLectures.includes(lecture.id);
                    
                    return isLocked ? (
                      <div
                        key={lecture.id}
                        className={cn(
                          "block px-4 py-3 ml-6 mr-2 rounded-lg transition-colors cursor-not-allowed",
                          "bg-muted/30 border border-dashed border-muted-foreground/20"
                        )}
                        title="Hoàn thành bài học trước để mở khóa"
                      >
                        <div className="flex items-center gap-3 opacity-60">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-muted">
                            <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0 flex items-start gap-2">
                            <span className="text-sm shrink-0 w-6 text-left tabular-nums font-medium text-muted-foreground">
                              {lecture.order}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm truncate font-medium text-muted-foreground">
                                {lecture.title}
                              </div>
                              <div className="text-xs text-muted-foreground/70 mt-0.5">
                                🔒 Khóa
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        key={lecture.id}
                        href={`/learning/${courseId}/${lecture.id}`}
                        className={cn(
                          "block px-4 py-3 ml-6 mr-2 rounded-lg transition-colors",
                          currentLectureId === lecture.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50"
                        )}
                      >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                        {finishedLectures.includes(lecture.id) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Play className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex items-start gap-2">
                        <span className={cn(
                          "text-sm flex-shrink-0 w-6 text-left tabular-nums font-medium",
                          currentLectureId === lecture.id ? "text-primary" : "text-foreground"
                        )}>
                          {lecture.order}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-sm truncate font-medium",
                            currentLectureId === lecture.id ? "text-primary" : "text-foreground"
                          )}>
                            {lecture.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
