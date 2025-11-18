'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ExternalLink, 
  Clock,
  User,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import type { Lecture, Chapter } from '@/types/learning';

interface LectureInfoProps {
  lecture: Lecture;
  chapter: Chapter;
  onMarkComplete?: () => void;
}

export function LectureInfo({ lecture, chapter, onMarkComplete }: LectureInfoProps) {
  const [showDescription, setShowDescription] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="space-y-6">
      {/* Lecture Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{chapter.name}</Badge>
                {lecture.isCompleted && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl mb-2">{lecture.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {lecture.duration ? formatDuration(lecture.duration) : 'N/A'}
                </div>
                <div className="flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  Lesson {lecture.order}
                </div>
              </div>
            </div>
            
          </div>
        </CardHeader>

        {lecture.description && (
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDescription(!showDescription)}
                className="p-0 h-auto font-normal text-left"
              >
                {showDescription ? 'Hide' : 'Show'} Description
              </Button>
              
              {showDescription && (
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {lecture.description}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Chapter Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chapter Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Completed Lessons</span>
              <span>
                {chapter.lectures.filter(l => l.isCompleted).length} / {chapter.lectures.length}
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(chapter.lectures.filter(l => l.isCompleted).length / chapter.lectures.length) * 100}%` 
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {chapter.lectures.filter(l => l.isCompleted).length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {chapter.lectures.length - chapter.lectures.filter(l => l.isCompleted).length}
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
