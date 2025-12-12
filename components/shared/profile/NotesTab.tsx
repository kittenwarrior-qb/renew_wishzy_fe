'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Clock, Play, BookOpen } from 'lucide-react';
import { lectureNoteService, type LectureNoteWithDetails } from '@/services/lecture-note';
import { toast } from 'sonner';

type GroupedNotes = {
  courseName: string;
  courseId: string;
  lectures: {
    lectureId: string;
    lectureName: string;
    notes: LectureNoteWithDetails[];
  }[];
};

export const NotesTab = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<LectureNoteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await lectureNoteService.getMyNotes(1, 100);
      setNotes(data.items || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Không thể tải danh sách ghi chú');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };


  const handleGoToLecture = (note: LectureNoteWithDetails) => {
    const courseId = note.lecture?.chapter?.course?.id;
    const lectureId = note.lectureId;
    const timestamp = note.timestampSeconds;
    
    if (courseId && lectureId) {
      router.push(`/learning/${courseId}?lectureId=${lectureId}&t=${Math.floor(timestamp)}`);
    } else {
      toast.error('Không thể mở bài giảng này');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Bạn chưa có ghi chú nào</p>
          <Button onClick={() => router.push('/profile?tab=my-learning')}>
            Xem khóa học của tôi
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group notes by course, then by lecture
  const groupedData = notes.reduce<GroupedNotes[]>((acc, note) => {
    const courseId = note.lecture?.chapter?.course?.id || 'unknown';
    const courseName = note.lecture?.chapter?.course?.name || 'Khóa học không xác định';
    const lectureId = note.lectureId;
    const lectureName = note.lecture?.name || 'Bài giảng';

    let course = acc.find(c => c.courseId === courseId);
    if (!course) {
      course = { courseId, courseName, lectures: [] };
      acc.push(course);
    }

    let lecture = course.lectures.find(l => l.lectureId === lectureId);
    if (!lecture) {
      lecture = { lectureId, lectureName, notes: [] };
      course.lectures.push(lecture);
    }

    lecture.notes.push(note);
    return acc;
  }, []);


  return (
    <div className="space-y-8">
      {groupedData.map((course) => (
        <div key={course.courseId}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">{course.courseName}</h2>
          </div>
          
          <div className="space-y-4 ml-2">
            {course.lectures.map((lecture) => (
              <Card key={lecture.lectureId}>
                <div className="px-4 py-3 border-b bg-muted/50">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    {lecture.lectureName}
                    <span className="text-muted-foreground font-normal">
                      ({lecture.notes.length} ghi chú)
                    </span>
                  </h3>
                </div>
                
                <CardContent className="p-0 divide-y">
                  {lecture.notes.map((note) => (
                    <div key={note.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                            <span>{formatDate(note.createdAt)}</span>
                          </div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-primary-dark"
                          onClick={() => handleGoToLecture(note)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          {formatTimestamp(note.timestampSeconds)}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
