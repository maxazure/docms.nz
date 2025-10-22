/**
 * Media Types
 * 媒体库相关类型定义
 */

export interface Media {
  id: string
  filename: string
  mime: string
  size: number
  width?: number
  height?: number
  url: string
  alt?: string
  title?: string
  uploadedBy: string
  createdAt: string
  updatedAt?: string
}

export interface CreateMediaRequest {
  file: File
  alt?: string
  title?: string
}

export interface UpdateMediaRequest {
  alt?: string
  title?: string
}

export interface MediaListQuery {
  page?: number
  limit?: number
  search?: string
  mime?: string
  sort?: 'createdAt' | 'filename' | 'size'
  order?: 'asc' | 'desc'
}

export interface MediaListResponse {
  data: Media[]
  total: number
  page: number
  limit: number
}

export type MediaViewMode = 'grid' | 'list'

export interface MediaSelectorProps {
  visible: boolean
  multiple?: boolean
  accept?: string
  maxSize?: number // in bytes
  onSelect?: (media: Media | Media[]) => void
  onCancel?: () => void
}
