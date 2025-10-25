/**
 * Page API
 * 页面管理相关 API 接口
 */

import { http } from '@/utils/request'
import type {
  Page,
  CreatePageRequest,
  UpdatePageRequest,
  PageVersion,
  ApiResponse
} from '@/types'

export interface PageListQuery {
  page?: number
  limit?: number
  search?: string
  menuItemId?: string
  status?: string
  sort?: 'createdAt' | 'updatedAt' | 'title'
  order?: 'asc' | 'desc'
}

export interface PageListResponse {
  data: Page[]
  total: number
  page: number
  limit: number
}

/**
 * 获取页面列表
 */
export async function getPageList(
  query?: PageListQuery
): Promise<ApiResponse<PageListResponse>> {
  return http.get('/pages', { params: query })
}

/**
 * 获取单个页面详情
 */
export async function getPage(id: string): Promise<ApiResponse<Page>> {
  return http.get(`/pages/${id}`)
}

/**
 * 通过 slug 获取页面详情
 */
export async function getPageBySlug(slug: string): Promise<ApiResponse<Page>> {
  return http.get(`/pages/by-slug/${slug}`)
}

/**
 * 创建页面
 */
export async function createPage(
  data: CreatePageRequest
): Promise<ApiResponse<Page>> {
  return http.post('/pages', data)
}

/**
 * 更新页面
 */
export async function updatePage(
  id: string,
  data: Partial<UpdatePageRequest>
): Promise<ApiResponse<Page>> {
  return http.put(`/pages/${id}`, data)
}

/**
 * 删除页面
 */
export async function deletePage(id: string): Promise<ApiResponse<void>> {
  return http.delete(`/pages/${id}`)
}

/**
 * 发布页面
 */
export async function publishPage(id: string): Promise<ApiResponse<Page>> {
  return http.post(`/pages/${id}/publish`)
}

/**
 * 取消发布页面
 */
export async function unpublishPage(id: string): Promise<ApiResponse<Page>> {
  return http.post(`/pages/${id}/unpublish`)
}

/**
 * 获取页面版本历史
 */
export async function getPageVersions(
  pageId: string
): Promise<ApiResponse<PageVersion[]>> {
  return http.get(`/pages/${pageId}/versions`)
}

/**
 * 恢复到指定版本
 */
export async function restorePageVersion(
  pageId: string,
  versionId: string
): Promise<ApiResponse<Page>> {
  return http.post(`/pages/${pageId}/versions/${versionId}/restore`)
}

export const pageApi = {
  getPageList,
  getPage,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  publishPage,
  unpublishPage,
  getPageVersions,
  restorePageVersion
}
