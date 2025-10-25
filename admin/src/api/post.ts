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

export async function getPostList(params?: PostListQuery): Promise<ListResponse<Post>> {
  const response = await http.get('/posts', { params })
  return response.data
}

export async function getPost(id: string): Promise<Post> {
  const response = await http.get(`/posts/${id}`)
  return response.data
}

export async function createPost(data: CreatePostDto): Promise<Post> {
  const response = await http.post('/posts', data)
  return response.data
}

export async function updatePost(id: string, data: UpdatePostDto): Promise<Post> {
  const response = await http.put(`/posts/${id}`, data)
  return response.data
}

export async function deletePost(id: string): Promise<void> {
  const response = await http.delete(`/posts/${id}`)
  return response.data
}

export async function publishPost(id: string): Promise<Post> {
  const response = await http.post(`/posts/${id}/publish`)
  return response.data
}

export async function unpublishPost(id: string): Promise<Post> {
  const response = await http.post(`/posts/${id}/unpublish`)
  return response.data
}

// ==================== Categories ====================

export async function getCategoryList(params?: CategoryListQuery): Promise<Category[]> {
  const response = await http.get('/posts/categories', { params })
  // Unwrap the API response: response.data = {success: true, data: [...]}
  return response.data.data || []
}

export async function getCategory(id: string): Promise<Category> {
  const response = await http.get(`/api/posts/categories/${id}`)
  return response.data
}

export async function createCategory(data: CreateCategoryDto): Promise<Category> {
  const response = await http.post('/posts/categories', data)
  return response.data
}

export async function updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
  const response = await http.put(`/api/posts/categories/${id}`, data)
  return response.data
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await http.delete(`/api/posts/categories/${id}`)
  return response.data
}

// ==================== Tags ====================

export async function getTagList(): Promise<Tag[]> {
  const response = await http.get('/posts/tags')
  return response.data.data || []
}

export async function getTag(id: string): Promise<Tag> {
  const response = await http.get(`/api/posts/tags/${id}`)
  return response.data
}

export async function createTag(data: CreateTagDto): Promise<Tag> {
  const response = await http.post('/posts/tags', data)
  return response.data
}

export async function deleteTag(id: string): Promise<void> {
  const response = await http.delete(`/api/posts/tags/${id}`)
  return response.data
}
