export interface CourseItemType {
  id: string
  name: string
  description: string
  notes: string
  thumbnail: string
  price: string
  saleInfo:any
  rating: number
  status: boolean
  averageRating: string
  numberOfStudents: number
  level: string
  totalDuration: number
  categoryId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  deletedAt: any
  category: Category
  creator: Creator
  chapters: Chapter[]
}

export interface Category {
  id: string
  name: string
  notes: any
  parentId: any
  createdAt: string
  updatedAt: string
  deletedAt: string
}

export interface Creator {
  passwordModified: boolean
  id: string
  email: string
  fullName: string
}

export interface Chapter {
  id: string
  name: string
  description: string
  duration: number
  courseId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  deletedAt: string
}
