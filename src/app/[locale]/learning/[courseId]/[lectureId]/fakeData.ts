import type { Course, Chapter, Lecture, LectureProgress } from '@/types/learning';

export const fakeLectureProgress: Record<string, LectureProgress> = {
  "1": {
    id: "progress-1",
    userId: "user-123",
    lectureId: "1",
    courseId: "1",
    chapterId: "1",
    currentTime: 850,
    duration: 900,
    isCompleted: true,
    completedAt: new Date('2025-11-07T10:30:00Z'),
    lastWatchedAt: new Date('2025-11-07T10:30:00Z'),
    playbackRate: 1,
    volume: 0.8,
    quality: '720p',
    createdAt: new Date('2025-11-07T10:00:00Z'),
    updatedAt: new Date('2025-11-07T10:30:00Z'),
  },
  "2": {
    id: "progress-2",
    userId: "user-123",
    lectureId: "2",
    courseId: "1",
    chapterId: "1",
    currentTime: 245,
    duration: 600,
    isCompleted: false,
    lastWatchedAt: new Date('2025-11-08T09:15:00Z'),
    playbackRate: 1.5,
    volume: 0.8,
    quality: '1080p',
    createdAt: new Date('2025-11-08T09:00:00Z'),
    updatedAt: new Date('2025-11-08T09:15:00Z'),
  },
  "3": {
    id: "progress-3",
    userId: "user-123",
    lectureId: "3",
    courseId: "1",
    chapterId: "2",
    currentTime: 0,
    duration: 1200,
    isCompleted: false,
    lastWatchedAt: new Date(),
    playbackRate: 1,
    volume: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
};

export const fakeCourse: Course = {
  id: "1",
  title: "Ultimate Guide to File Uploads with Next.js",
  description: "Learn how to handle file uploads in Next.js applications",
  totalLessons: 15,
  completedLessons: 1,
  progressPercentage: 7,
  chapters: [
    {
      id: "1",
      name: "Chapter No. 1",
      description: "Introduction to file uploads",
      duration: 1800, 
      courseId: "1",
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      lectures: [
        {
          id: "1",
          title: "Introduction To Course",
          description: "Overview of what you'll learn in this course",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          duration: 900, 
          chapterId: "1",
          order: 1,
          isCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          title: "Prerequisites",
          description: "What you need to know before starting",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          duration: 600,
          chapterId: "1",
          order: 2,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]
    },
    {
      id: "2",
      name: "Chapter No. 2",
      description: "Setting up the environment",
      duration: 2400,
      courseId: "1",
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      lectures: [
        {
          id: "3",
          title: "Project Setup",
          description: "Setting up Next.js project",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          duration: 1200, 
          chapterId: "2",
          order: 1,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "4",
          title: "Installing Dependencies",
          description: "Required packages for file uploads",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          duration: 1200, 
          chapterId: "2",
          order: 2,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]
    },
    {
      id: "3",
      name: "Chapter No. 3",
      description: "Basic file upload implementation",
      duration: 3600,
      courseId: "1",
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      lectures: [
        {
          id: "5",
          title: "Creating Upload Component",
          description: "Building the upload interface",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          duration: 1800,
          chapterId: "3",
          order: 1,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "6",
          title: "Handling File Selection",
          description: "Managing file input and validation",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
          duration: 1800,
          chapterId: "3",
          order: 2,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]
    },
    {
      id: "4",
      name: "Chapter No. 4",
      description: "Advanced upload features",
      duration: 2400,
      courseId: "1",
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      lectures: [
        {
          id: "7",
          title: "Progress Tracking",
          description: "Implementing upload progress",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
          duration: 1200,
          chapterId: "4",
          order: 1,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "8",
          title: "Error Handling",
          description: "Managing upload errors gracefully",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
          duration: 1200,
          chapterId: "4",
          order: 2,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]
    },
    {
      id: "5",
      name: "Chapter No. 5",
      description: "Production deployment",
      duration: 1800,
      courseId: "1",
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      lectures: [
        {
          id: "9",
          title: "Deployment Strategies",
          description: "Deploying your upload system",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
          duration: 1800,
          chapterId: "5",
          order: 1,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]
    }
  ]
};

export const getLectureById = (lectureId: string): Lecture | undefined => {
  for (const chapter of fakeCourse.chapters) {
    const lecture = chapter.lectures.find(l => l.id === lectureId);
    if (lecture) return lecture;
  }
  return undefined;
};

export const getChapterByLectureId = (lectureId: string): Chapter | undefined => {
  for (const chapter of fakeCourse.chapters) {
    const lecture = chapter.lectures.find(l => l.id === lectureId);
    if (lecture) return chapter;
  }
  return undefined;
};

export const getNextLecture = (currentLectureId: string): Lecture | undefined => {
  const currentChapter = getChapterByLectureId(currentLectureId);
  if (!currentChapter) return undefined;

  const currentLecture = currentChapter.lectures.find(l => l.id === currentLectureId);
  if (!currentLecture) return undefined;

  const nextInChapter = currentChapter.lectures.find(l => l.order === currentLecture.order + 1);
  if (nextInChapter) return nextInChapter;

  const nextChapter = fakeCourse.chapters.find(c => c.order === currentChapter.order + 1);
  if (nextChapter && nextChapter.lectures.length > 0) {
    return nextChapter.lectures[0];
  }

  return undefined;
};

export const getPreviousLecture = (currentLectureId: string): Lecture | undefined => {
  const currentChapter = getChapterByLectureId(currentLectureId);
  if (!currentChapter) return undefined;

  const currentLecture = currentChapter.lectures.find(l => l.id === currentLectureId);
  if (!currentLecture) return undefined;

  const prevInChapter = currentChapter.lectures.find(l => l.order === currentLecture.order - 1);
  if (prevInChapter) return prevInChapter;

  const prevChapter = fakeCourse.chapters.find(c => c.order === currentChapter.order - 1);
  if (prevChapter && prevChapter.lectures.length > 0) {
    return prevChapter.lectures[prevChapter.lectures.length - 1];
  }

  return undefined;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
