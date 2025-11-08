export interface ChapterType {
  id: string
  name: string
  description: string
  duration: number
  courseId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  deletedAt: string
  course: Course
  lecture: Lecture[]
}

export interface Course {
  id: string
  name: string
}

export interface Lecture {
  id: string
  name: string
  duration: number
  isPreview: boolean
  orderIndex: number
  fileUrl?: string
}