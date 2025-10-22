import { http } from '@/utils/request'
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '@/types'

// 菜单 API
export const menuApi = {
  // 获取菜单列表
  async getMenuItems() {
    const response = await http.get<MenuItem[]>('/menu')
    return response.data
  },

  // 获取单个菜单项
  async getMenuItem(id: string) {
    const response = await http.get<MenuItem>(`/menu/${id}`)
    return response.data
  },

  // 创建菜单项
  async createMenuItem(data: CreateMenuItemRequest) {
    const response = await http.post<MenuItem>('/menu', data)
    return response.data
  },

  // 更新菜单项
  async updateMenuItem(id: string, data: UpdateMenuItemRequest) {
    const response = await http.put<MenuItem>(`/menu/${id}`, data)
    return response.data
  },

  // 删除菜单项
  async deleteMenuItem(id: string) {
    const response = await http.delete(`/menu/${id}`)
    return response.data
  },

  // 批量更新菜单项排序
  async updateMenuOrder(items: Array<{ id: string; order: number; parentId?: string }>) {
    const response = await http.patch('/menu/order', { items })
    return response.data
  },

  // 获取主导航菜单（用于左侧导航）
  async getMainMenuItems() {
    return this.getMenuItems()
  },

  // 获取页脚导航菜单
  async getFooterMenuItems() {
    return this.getMenuItems()
  }
}
