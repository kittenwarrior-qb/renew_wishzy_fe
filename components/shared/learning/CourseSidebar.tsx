'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronDown, ChevronRight, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Course, Chapter, Lecture } from '@/types/learning';

interface CourseSidebarProps {
  course: Course;
  courseId: string;
  currentLectureId?: string;
}

export function CourseSidebar({ course, courseId, currentLectureId }: CourseSidebarProps) {
  const params = useParams();
  const locale = params.locale as string;
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Auto-expand chapter containing current lecture
  useEffect(() => {
    if (currentLectureId) {
      // Find which chapter contains the current lecture
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
    <div className="w-full h-screen bg-card border-r flex flex-col sticky top-0">
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <h2 className="font-semibold text-lg mb-2">{course.title}</h2>
        <div className="text-sm text-muted-foreground mb-3">
          Progress: {course.completedLessons}/{course.totalLessons} lessons
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${course.progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {course.progressPercentage}% complete
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
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
                    {chapter.lectures.length} lessons
                  </div>
                </div>
              </div>
            </Button>

            {/* Lectures List */}
            {expandedChapters.has(chapter.id) && (
              <div className="pb-2">
                {chapter.lectures.map((lecture) => (
                  <Link
                    key={lecture.id}
                    href={`/${locale}/learning/${courseId}/${lecture.id}`}
                    className={cn(
                      "block px-4 py-3 ml-6 mr-2 rounded-lg transition-colors",
                      currentLectureId === lecture.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center">
                        {lecture.isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Play className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-sm font-medium truncate",
                          currentLectureId === lecture.id ? "text-primary" : ""
                        )}>
                          {lecture.order}. {lecture.title}
                        </div>
                        {lecture.isCompleted && (
                          <div className="text-xs text-green-600 mt-1">
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
