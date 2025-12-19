export interface Post {
    id: number | string
    title: string
    slug: string
    content: string
    excerpt?: string
    thumbnail?: string
    authorId: number | string

    // SEO
    seoTitle?: string
    seoDescription?: string

    // Category & Tags
    categoryId?: string
    tags?: string[]

    // Status
    status: 'draft' | 'published' | 'archived'

    // Dates
    createdAt: string
    updatedAt: string
    publishedAt?: string
}

export interface Author {
    id: number | string
    name: string
    avatar?: string
    bio?: string
}

export interface Category {
    id: number | string
    name: string
    slug: string
    description?: string
}

export interface Tag {
    id: number | string
    name: string
    slug: string
}

export interface Comment {
    id: number | string
    postId: number | string
    authorName: string
    authorAvatar?: string
    content: string
    createdAt: string
}

export interface PostListResponse {
    data: Post[]
    total: number
    page: number
    limit: number
}

export interface PostDetailResponse {
    data: Post
}
