import type { Block } from './block'
import { ContentStatus } from './api'

// 页面
export interface Page {
  id: string
  menuItemId: string
  title: string
  slug: string
  blocks: Block[]
  status: ContentStatus
  publishedAt?: string
  meta?: PageMeta
  createdAt: string
  updatedAt?: string
}

// 页面元信息 (SEO)
export interface PageMeta {
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  canonical?: string
  keywords?: string[]
}

// 创建页面请求
export interface CreatePageRequest {
  menuItemId: string
  title: string
  slug: string
  blocks?: Block[]
  status?: ContentStatus
  meta?: PageMeta
}

// 更新页面请求
export interface UpdatePageRequest extends Partial<CreatePageRequest> {
  id: string
}

// 页面版本
export interface PageVersion {
  id: string
  pageId: string
  blocks: Block[]
  createdBy: string
  createdAt: string
}
