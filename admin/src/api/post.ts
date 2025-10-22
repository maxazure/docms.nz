/**
 * Post API
 * 文章管理API
 */

import { http } from '@/utils/request'
import type {
  Post,
  PostListQuery,
  CreatePostDto,
  UpdatePostDto,
  Category,
  CategoryListQuery,
  CreateCategoryDto,
  UpdateCategoryDto,
  Tag,
  CreateTagDto
} from '@/types/post'
import type { ListResponse } from '@/types'

// ==================== Posts ====================

export function getPostList(params?: PostListQuery): Promise<ListResponse<Post>> {
  return http.get('/posts', { params })
}

export function getPost(id: string): Promise<Post> {
  return http.get(`/api/posts/${id}`)
}

export function createPost(data: CreatePostDto): Promise<Post> {
  return http.post('/posts', data)
}

export function updatePost(id: string, data: UpdatePostDto): Promise<Post> {
  return http.put(`/api/posts/${id}`, data)
}

export function deletePost(id: string): Promise<void> {
  return http.delete(`/api/posts/${id}`)
}

export function publishPost(id: string): Promise<Post> {
  return http.post(`/api/posts/${id}/publish`)
}

export function unpublishPost(id: string): Promise<Post> {
  return http.post(`/api/posts/${id}/unpublish`)
}

// ==================== Categories ====================

export function getCategoryList(params?: CategoryListQuery): Promise<Category[]> {
  return http.get('/posts/categories', { params })
}

export function getCategory(id: string): Promise<Category> {
  return http.get(`/api/posts/categories/${id}`)
}

export function createCategory(data: CreateCategoryDto): Promise<Category> {
  return http.post('/posts/categories', data)
}

export function updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
  return http.put(`/api/posts/categories/${id}`, data)
}

export function deleteCategory(id: string): Promise<void> {
  return http.delete(`/api/posts/categories/${id}`)
}

// ==================== Tags ====================

export function getTagList(): Promise<Tag[]> {
  return http.get('/posts/tags')
}

export function getTag(id: string): Promise<Tag> {
  return http.get(`/api/posts/tags/${id}`)
}

export function createTag(data: CreateTagDto): Promise<Tag> {
  return http.post('/posts/tags', data)
}

export function deleteTag(id: string): Promise<void> {
  return http.delete(`/api/posts/tags/${id}`)
}
