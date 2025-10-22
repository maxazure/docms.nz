import { defineStore } from 'pinia'
import { menuApi } from '@/api'
import type { MenuItem, MenuTreeNode } from '@/types'

interface MenuState {
  menuItems: MenuItem[]
  mainMenuItems: MenuItem[]
  loading: boolean
  error: string | null
}

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    menuItems: [],
    mainMenuItems: [],
    loading: false,
    error: null
  }),

  getters: {
    // 获取树形结构的主导航菜单
    mainMenuTree: (state): MenuTreeNode[] => {
      return buildMenuTree(state.mainMenuItems)
    },

    // 获取所有激活的菜单项
    activeMenuItems: (state) => {
      return state.menuItems.filter(item => item.isActive)
    },

    // 根据 ID 查找菜单项
    getMenuItemById: (state) => {
      return (id: string) => state.menuItems.find(item => item.id === id)
    }
  },

  actions: {
    // 获取主导航菜单（用于左侧导航）
    async fetchMainMenu() {
      this.loading = true
      this.error = null

      try {
        const response = await menuApi.getMainMenuItems()
        
        if (response.success && response.data) {
          this.mainMenuItems = response.data
          return { success: true, data: response.data }
        }
        
        this.error = response.message || '获取菜单失败'
        return { success: false, error: this.error }
      } catch (error: any) {
        console.error('Fetch main menu error:', error)
        this.error = error.message || '获取菜单失败'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 获取所有菜单项
    async fetchAllMenuItems() {
      this.loading = true
      this.error = null

      try {
        const response = await menuApi.getMenuItems()
        
        if (response.success && response.data) {
          this.menuItems = response.data
          return { success: true, data: response.data }
        }
        
        this.error = response.message || '获取菜单失败'
        return { success: false, error: this.error }
      } catch (error: any) {
        console.error('Fetch all menu items error:', error)
        this.error = error.message || '获取菜单失败'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 刷新菜单（添加、编辑、删除后调用）
    async refreshMenu() {
      await Promise.all([
        this.fetchMainMenu(),
        this.fetchAllMenuItems()
      ])
    },

    // 初始化菜单（应用启动时调用）
    async init() {
      await this.fetchMainMenu()
    }
  }
})

// 构建树形菜单结构
function buildMenuTree(items: MenuItem[], parentId: string | null = null): MenuTreeNode[] {
  const tree: MenuTreeNode[] = []

  // 筛选出当前层级的菜单项
  const currentLevelItems = items.filter(item => 
    (parentId === null && !item.parentId) || item.parentId === parentId
  )

  // 按 order 排序
  currentLevelItems.sort((a, b) => a.order - b.order)

  // 递归构建子树
  for (const item of currentLevelItems) {
    const node: MenuTreeNode = {
      ...item,
      children: buildMenuTree(items, item.id)
    }
    tree.push(node)
  }

  return tree
}
