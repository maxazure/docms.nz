/**
 * Media API
 * 媒体库相关 API 接口
 */

import { http } from '@/utils/request'
import type {
  Media,
  UpdateMediaRequest,
  MediaListQuery,
  MediaListResponse,
  ApiResponse
} from '@/types'

/**
 * 获取媒体列表
 */
export async function getMediaList(
  query?: MediaListQuery
): Promise<ApiResponse<MediaListResponse>> {
  return http.get('/media', { params: query })
}

/**
 * 获取单个媒体详情
 */
export async function getMedia(id: string): Promise<ApiResponse<Media>> {
  return http.get(`/media/${id}`)
}

/**
 * 上传媒体文件
 */
export async function uploadMedia(
  file: File,
  data?: { alt?: string; title?: string }
): Promise<ApiResponse<Media>> {
  const formData = new FormData()
  formData.append('file', file)
  if (data?.alt) formData.append('alt', data.alt)
  if (data?.title) formData.append('title', data.title)

  return http.post('/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量上传媒体文件
 */
export async function uploadMediaBatch(
  files: File[],
  data?: { alt?: string; title?: string }
): Promise<ApiResponse<Media[]>> {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  if (data?.alt) formData.append('alt', data.alt)
  if (data?.title) formData.append('title', data.title)

  return http.post('/media/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 更新媒体元信息
 */
export async function updateMedia(
  id: string,
  data: UpdateMediaRequest
): Promise<ApiResponse<Media>> {
  return http.put(`/media/${id}`, data)
}

/**
 * 删除媒体
 */
export async function deleteMedia(id: string): Promise<ApiResponse<void>> {
  return http.delete(`/media/${id}`)
}

/**
 * 批量删除媒体
 */
export async function deleteMediaBatch(ids: string[]): Promise<ApiResponse<void>> {
  return http.post('/media/batch-delete', { ids })
}

export const mediaApi = {
  getMediaList,
  getMedia,
  uploadMedia,
  uploadMediaBatch,
  updateMedia,
  deleteMedia,
  deleteMediaBatch
}
