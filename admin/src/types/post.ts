/**
 * Post Types
 * 文章管理相关类型定义
 */

import type { ContentStatus } from './index'

export interface Post {
  id: string
  menuItemId: string
  title: string
  slug: string
  summary?: string
  content: string
  coverImageId?: string
  coverImageUrl?: string
  status: ContentStatus
  publishedAt?: string
  authorId: string
  authorName?: string
  categoryIds?: string[]
  tagIds?: string[]
  meta?: PostMeta
  createdAt: string
  updatedAt?: string
}

export interface PostMeta {
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  customFields?: Record<string, any>
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  order: number
  createdAt: string
  updatedAt?: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  createdAt: string
}

export interface PostListQuery {
  page?: number
  limit?: number
  search?: string
  status?: ContentStatus
  menuItemId?: string
  categoryId?: string
  tagId?: string
  authorId?: string
  sort?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title'
  order?: 'asc' | 'desc'
}

export interface CategoryListQuery {
  parentId?: string | null
  includeChildren?: boolean
}

export interface CreatePostDto {
  menuItemId: string
  title: string
  slug: string
  summary?: string
  content: string
  coverImageId?: string
  categoryIds?: string[]
  tagIds?: string[]
  meta?: PostMeta
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

export interface CreateCategoryDto {
  name: string
  slug: string
  description?: string
  parentId?: string
  order?: number
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CreateTagDto {
  name: string
  slug: string
}
