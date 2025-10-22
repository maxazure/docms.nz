import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMenuStore } from '@/stores/menu'
import { createTestPinia, mockApiResponse } from '../utils/test-utils'
import * as menuApi from '@/api/menu'
import type { MenuItem } from '@/types'

// Mock the menu API
vi.mock('@/api/menu', () => ({
  menuApi: {
    getMainMenuItems: vi.fn(),
    getMenuItems: vi.fn()
  }
}))

describe('Menu Store', () => {
  const mockMenuItems: MenuItem[] = [
    {
      id: '1',
      label: '首页',
      slug: 'home',
      type: 'page',
      menuCode: 'main',
      linkType: 'internal',
      order: 1,
      isVisible: true,
      isActive: true,
      parentId: null
    },
    {
      id: '2',
      label: '产品中心',
      slug: 'products',
      type: 'product',
      menuCode: 'main',
      linkType: 'internal',
      order: 2,
      isVisible: true,
      isActive: true,
      parentId: null
    },
    {
      id: '3',
      label: '家庭水培设备',
      slug: 'home-hydroponics',
      type: 'product',
      menuCode: 'main',
      linkType: 'internal',
      order: 1,
      isVisible: true,
      isActive: true,
      parentId: '2'
    },
    {
      id: '4',
      label: '新闻资讯',
      slug: 'news',
      type: 'postList',
      menuCode: 'main',
      linkType: 'internal',
      order: 3,
      isVisible: true,
      isActive: false,
      parentId: null
    }
  ]

  beforeEach(() => {
    createTestPinia()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useMenuStore()

      expect(store.menuItems).toEqual([])
      expect(store.mainMenuItems).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('mainMenuTree should build tree structure correctly', () => {
      const store = useMenuStore()
      store.mainMenuItems = mockMenuItems.filter(
        item => item.menuCode === 'main'
      )

      const tree = store.mainMenuTree

      expect(tree).toHaveLength(3) // 首页, 产品中心, 新闻资讯
      expect(tree[0].label).toBe('首页')
      expect(tree[1].label).toBe('产品中心')
      expect(tree[1].children).toHaveLength(1)
      expect(tree[1].children![0].label).toBe('家庭水培设备')
    })

    it('mainMenuTree should sort by order', () => {
      const store = useMenuStore()
      store.mainMenuItems = [
        {
          id: '1',
          label: 'Third',
          slug: 'third',
          type: 'page',
          menuCode: 'main',
          linkType: 'internal',
          order: 3,
          isVisible: true,
          isActive: true,
          parentId: null
        },
        {
          id: '2',
          label: 'First',
          slug: 'first',
          type: 'page',
          menuCode: 'main',
          linkType: 'internal',
          order: 1,
          isVisible: true,
          isActive: true,
          parentId: null
        },
        {
          id: '3',
          label: 'Second',
          slug: 'second',
          type: 'page',
          menuCode: 'main',
          linkType: 'internal',
          order: 2,
          isVisible: true,
          isActive: true,
          parentId: null
        }
      ]

      const tree = store.mainMenuTree

      expect(tree[0].label).toBe('First')
      expect(tree[1].label).toBe('Second')
      expect(tree[2].label).toBe('Third')
    })

    it('activeMenuItems should filter active items', () => {
      const store = useMenuStore()
      store.menuItems = mockMenuItems

      const activeItems = store.activeMenuItems

      expect(activeItems).toHaveLength(3)
      expect(activeItems.every(item => item.isActive)).toBe(true)
    })

    it('getMenuItemById should find item by id', () => {
      const store = useMenuStore()
      store.menuItems = mockMenuItems

      const item = store.getMenuItemById('2')

      expect(item).toBeDefined()
      expect(item?.label).toBe('产品中心')
    })

    it('getMenuItemById should return undefined for non-existent id', () => {
      const store = useMenuStore()
      store.menuItems = mockMenuItems

      const item = store.getMenuItemById('999')

      expect(item).toBeUndefined()
    })
  })

  describe('Actions - Fetch Main Menu', () => {
    it('should fetch main menu successfully', async () => {
      const store = useMenuStore()
      const mockResponse = mockApiResponse(mockMenuItems)

      vi.spyOn(menuApi.menuApi, 'getMainMenuItems').mockResolvedValue(
        mockResponse
      )

      const result = await store.fetchMainMenu()

      expect(result.success).toBe(true)
      expect(store.mainMenuItems).toEqual(mockMenuItems)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle fetch main menu failure', async () => {
      const store = useMenuStore()
      const mockResponse = {
        success: false,
        data: null,
        message: '获取菜单失败'
      }

      vi.spyOn(menuApi.menuApi, 'getMainMenuItems').mockResolvedValue(
        mockResponse
      )

      const result = await store.fetchMainMenu()

      expect(result.success).toBe(false)
      expect(store.error).toBe('获取菜单失败')
      expect(store.loading).toBe(false)
    })

    it('should handle fetch main menu error', async () => {
      const store = useMenuStore()

      vi.spyOn(menuApi.menuApi, 'getMainMenuItems').mockRejectedValue(
        new Error('Network error')
      )

      const result = await store.fetchMainMenu()

      expect(result.success).toBe(false)
      expect(store.error).toBe('Network error')
    })
  })

  describe('Actions - Fetch All Menu Items', () => {
    it('should fetch all menu items successfully', async () => {
      const store = useMenuStore()
      const mockResponse = mockApiResponse(mockMenuItems)

      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(mockResponse)

      const result = await store.fetchAllMenuItems()

      expect(result.success).toBe(true)
      expect(store.menuItems).toEqual(mockMenuItems)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Actions - Refresh Menu', () => {
    it('should refresh both main and all menu items', async () => {
      const store = useMenuStore()
      const mockResponse = mockApiResponse(mockMenuItems)

      vi.spyOn(menuApi.menuApi, 'getMainMenuItems').mockResolvedValue(
        mockResponse
      )
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(mockResponse)

      await store.refreshMenu()

      expect(menuApi.menuApi.getMainMenuItems).toHaveBeenCalled()
      expect(menuApi.menuApi.getMenuItems).toHaveBeenCalled()
    })
  })
})
