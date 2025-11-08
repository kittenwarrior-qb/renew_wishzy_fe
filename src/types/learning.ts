// Types based on backend entities
export interface Chapter {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  courseId: string;
  order: number;
  lectures: Lecture[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lecture {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  chapterId: string;
  order: number;
  isCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

// ==================== VIDEO PROGRESS TRACKING ====================
export interface LectureProgress {
  id: string;
  userId: string;
  lectureId: string;
  courseId: string;
  chapterId: string;
  currentTime: number;
  duration: number;
  isCompleted: boolean;
  completedAt?: Date;
  lastWatchedAt: Date;
  playbackRate?: number;
  volume?: number;
  quality?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateLectureProgressDto {
  lectureId: string;
  currentTime: number;
  duration: number;
  isCompleted?: boolean;
  playbackRate?: number;
  volume?: number;
  quality?: string;
}

export interface ChapterProgress {
  chapterId: string;
  totalLectures: number;
  completedLectures: number;
  progressPercentage: number;
  totalDuration: number;
  watchedDuration: number;
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  
  totalLectures: number;
  completedLectures: number;
  
  totalDuration: number;        
  
  chapters: ChapterProgress[];
  
  currentLectureId?: string;    
  currentChapterId?: string;    
  
  isCompleted: boolean;
  completedAt?: Date;
  
  lastAccessedAt: Date;
  enrolledAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoPlayerOptions {
  autoplay?: boolean;
  controls?: boolean;
  responsive?: boolean;
  fluid?: boolean;
  playbackRates?: number[];      
  controlBar?: {
    volumePanel?: { inline: boolean };
    pictureInPictureToggle?: boolean;
  };
  userActions?: {
    hotkeys?: boolean;
  };
}

export interface VideoEventData {
  lectureId: string;
  eventType: 'play' | 'pause' | 'seek' | 'ended' | 'ratechange' | 'volumechange';
  currentTime: number;
  duration: number;
  playbackRate?: number;
  volume?: number;
  timestamp: Date;
}
