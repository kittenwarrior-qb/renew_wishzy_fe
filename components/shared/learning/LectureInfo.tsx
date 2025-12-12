'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  CheckCircle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  User,
  Star
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Lecture, Chapter } from '@/src/types/learning';
import { lectureService } from '@/src/services/lecture';
import { lectureNoteService, LectureNote } from '@/src/services/lecture-note';
import CourseComment from '@/components/shared/course/CourseComment';
import { Trash2, Edit2 } from 'lucide-react';

interface Instructor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  title?: string;
  rating?: number;
  studentsCount?: number;
  coursesCount?: number;
}

interface LectureInfoProps {
  lecture: Lecture;
  chapter: Chapter;
  onMarkComplete?: () => void;
  onSeekToTime?: (seconds: number) => void;
  courseId?: string;
  isEnrolled?: boolean;
  instructor?: Instructor;
}



export function LectureInfo({ lecture, chapter, onSeekToTime, courseId, isEnrolled = false, instructor }: LectureInfoProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [description, setDescription] = useState<string>(lecture.description || '');
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);
  const [notes, setNotes] = useState<LectureNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [currentTimestampSeconds, setCurrentTimestampSeconds] = useState(0);
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const MAX_DESCRIPTION_LENGTH = 200;

  const fetchNotes = async () => {
    console.log('fetchNotes called:', { lectureId: lecture.id, isEnrolled });
    if (!lecture.id || !isEnrolled) {
      console.log('fetchNotes skipped - missing lectureId or not enrolled');
      return;
    }
    
    setIsLoadingNotes(true);
    try {
      const response = await lectureNoteService.listByLecture(lecture.id);
      console.log('fetchNotes response:', response);
      setNotes(response.items || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  useEffect(() => {
    const fetchLectureDetails = async () => {
      if (!lecture.id) return;
      
      setIsLoadingDescription(true);
      try {
        const lectureData = await lectureService.get(lecture.id);
        if (lectureData.description) {
          setDescription(lectureData.description);
        }
      } catch (error) {
        console.error('Failed to fetch lecture description:', error);
      } finally {
        setIsLoadingDescription(false);
      }
    };

    fetchLectureDetails();
    fetchNotes();
  }, [lecture.id, isEnrolled]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const isDescriptionLong = description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = isDescriptionLong && !showFullDescription 
    ? description.slice(0, MAX_DESCRIPTION_LENGTH) + '...'
    : description;

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNoteClick = (timestampSeconds: number) => {
    onSeekToTime?.(timestampSeconds);
  };

  const handleAddNoteClick = () => {
    const handleTimeResponse = (event: CustomEvent) => {
      const { currentTime } = event.detail;
      setCurrentTimestampSeconds(Math.floor(currentTime));
      window.removeEventListener('currentTimeResponse', handleTimeResponse as EventListener);
    };

    window.addEventListener('currentTimeResponse', handleTimeResponse as EventListener);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('requestCurrentTime'));
    }, 10);
    
    setShowAddNote(true);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !lecture.id) return;
    
    try {
      await lectureNoteService.create({
        lectureId: lecture.id,
        content: noteContent.trim(),
        timestampSeconds: currentTimestampSeconds,
      });
      setNoteContent('');
      setShowAddNote(false);
      // Fetch notes directly without isEnrolled check since user just created a note
      setIsLoadingNotes(true);
      try {
        const response = await lectureNoteService.listByLecture(lecture.id);
        console.log('Notes after save:', response);
        setNotes(response.items || []);
      } finally {
        setIsLoadingNotes(false);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleCancelNote = () => {
    setNoteContent('');
    setShowAddNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await lectureNoteService.delete(noteId);
      // Refresh notes list
      const response = await lectureNoteService.listByLecture(lecture.id);
      setNotes(response.items || []);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleEditNote = (note: LectureNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) return;
    
    try {
      await lectureNoteService.update(noteId, { content: editingContent.trim() });
      setEditingNoteId(null);
      setEditingContent('');
      // Refresh notes list
      const response = await lectureNoteService.listByLecture(lecture.id);
      setNotes(response.items || []);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  return (
    <div className="space-y-6">
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

        {(description || isLoadingDescription) && (
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground leading-relaxed">
                {isLoadingDescription ? 'Loading description...' : displayDescription}
              </div>
              
              {isDescriptionLong && !isLoadingDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="p-0 h-auto font-normal text-primary"
                >
                  {showFullDescription ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Thu gọn
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Xem thêm
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Ghi chú của tôi</CardTitle>
            <Button size="sm" variant="outline" onClick={handleAddNoteClick}>
              <Plus className="w-4 h-4 mr-1" />
              Thêm ghi chú
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddNote && (
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  {formatTimestamp(currentTimestampSeconds)}
                </Badge>
                <span className="text-sm text-muted-foreground">Thời điểm hiện tại</span>
              </div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Nhập ghi chú của bạn..."
                className="w-full min-h-20 p-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={handleCancelNote}>
                  Hủy
                </Button>
                <Button size="sm" onClick={handleSaveNote} disabled={!noteContent.trim()}>
                  Lưu ghi chú
                </Button>
              </div>
            </div>
          )}

          {isLoadingNotes ? (
            <p className="text-sm text-muted-foreground">Đang tải ghi chú...</p>
          ) : notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <div 
                  key={note.id} 
                  className="flex gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <Badge 
                    variant="secondary" 
                    className="h-fit bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleNoteClick(note.timestampSeconds)}
                  >
                    {formatTimestamp(note.timestampSeconds)}
                  </Badge>
                  {editingNoteId === note.id ? (
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full min-h-16 p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          Hủy
                        </Button>
                        <Button size="sm" onClick={() => handleUpdateNote(note.id)} disabled={!editingContent.trim()}>
                          Lưu
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm flex-1 cursor-pointer" onClick={() => handleNoteClick(note.timestampSeconds)}>
                        {note.content}
                      </p>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditNote(note)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteNote(note.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có ghi chú nào. Nhấn "Thêm ghi chú" để tạo ghi chú mới.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Course Comments Section */}
      {courseId && (
        <CourseComment courseId={courseId} isEnrolled={isEnrolled} />
      )}

      {/* Instructor Section */}
      {instructor && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Giảng viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {instructor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{instructor.name}</h3>
                  {instructor.title && (
                    <p className="text-sm text-muted-foreground">{instructor.title}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {instructor.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{instructor.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">Đánh giá</span>
                    </div>
                  )}
                  {instructor.studentsCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{instructor.studentsCount.toLocaleString()}</span>
                      <span className="text-muted-foreground">Học viên</span>
                    </div>
                  )}
                  {instructor.coursesCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{instructor.coursesCount}</span>
                      <span className="text-muted-foreground">Khóa học</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {instructor.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {instructor.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
