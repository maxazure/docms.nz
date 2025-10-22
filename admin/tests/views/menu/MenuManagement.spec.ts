import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithProviders, flushPromises, mockApiResponse } from '../../utils/test-utils'
import MenuManagement from '@/views/menu/MenuManagement.vue'
import { useMenuStore } from '@/stores/menu'
import * as menuApi from '@/api/menu'
import type { MenuItem } from '@/types'

// Mock the menu API
vi.mock('@/api/menu', () => ({
  menuApi: {
    getMenuItems: vi.fn(),
    getMenuItem: vi.fn(),
    createMenuItem: vi.fn(),
    updateMenuItem: vi.fn(),
    deleteMenuItem: vi.fn(),
    updateMenuOrder: vi.fn()
  }
}))

describe('MenuManagement Component', () => {
  const mockMenuItems: MenuItem[] = [
    {
      id: '1',
      menuCode: 'main',
      label: '首页',
      slug: 'home',
      type: 'page',
      linkType: 'internal',
      order: 1,
      isVisible: true,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      menuCode: 'main',
      label: '产品中心',
      slug: 'products',
      type: 'product',
      linkType: 'internal',
      order: 2,
      isVisible: true,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '3',
      menuCode: 'main',
      label: '家庭水培设备',
      slug: 'home-hydroponics',
      type: 'product',
      linkType: 'internal',
      order: 1,
      parentId: '2',
      isVisible: true,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render menu management page with title', () => {
      const wrapper = mountWithProviders(MenuManagement)

      expect(wrapper.text()).toContain('菜单管理')
    })

    it('should load menu items on mount', async () => {
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(
        mockApiResponse(mockMenuItems)
      )

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      expect(menuApi.menuApi.getMenuItems).toHaveBeenCalled()
    })

    it('should display loading state while fetching', async () => {
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApiResponse(mockMenuItems)), 100))
      )

      const wrapper = mountWithProviders(MenuManagement)

      // Check loading state
      expect(wrapper.vm.loading).toBe(true)

      await flushPromises()
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Menu Tree Display', () => {
    it('should display menu items in tree structure', async () => {
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(
        mockApiResponse(mockMenuItems)
      )

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      const menuStore = useMenuStore()
      expect(menuStore.menuItems.length).toBeGreaterThan(0)
    })

    it('should show parent and child menu items', async () => {
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(
        mockApiResponse(mockMenuItems)
      )

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      // Should display parent items
      expect(wrapper.text()).toContain('首页')
      expect(wrapper.text()).toContain('产品中心')
    })

    it('should display menu item metadata', async () => {
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(
        mockApiResponse(mockMenuItems)
      )

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      // Should show menu type badges
      const vm = wrapper.vm as any
      const firstItem = vm.menuItems[0]
      expect(['page', 'postList', 'product']).toContain(firstItem.type)
    })
  })

  describe('Create Menu Item', () => {
    it('should show create menu dialog when add button clicked', async () => {
      const wrapper = mountWithProviders(MenuManagement)

      const addButton = wrapper.find('[data-test="add-menu-button"]')
      await addButton.trigger('click')

      expect(wrapper.vm.showDialog).toBe(true)
      expect(wrapper.vm.dialogMode).toBe('create')
    })

    it('should create menu item successfully', async () => {
      const newMenuItem: MenuItem = {
        id: '4',
        menuCode: 'main',
        label: '新闻资讯',
        slug: 'news',
        type: 'postList',
        linkType: 'internal',
        order: 3,
        isVisible: true,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z'
      }

      vi.spyOn(menuApi.menuApi, 'createMenuItem').mockResolvedValue(
        mockApiResponse(newMenuItem)
      )
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(
        mockApiResponse([...mockMenuItems, newMenuItem])
      )

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      // Open dialog
      await wrapper.vm.handleCreate()

      // Fill form
      wrapper.vm.formData = {
        menuCode: 'main',
        label: '新闻资讯',
        slug: 'news',
        type: 'postList',
        linkType: 'internal',
        isVisible: true,
        isActive: true
      }

      // Submit
      await wrapper.vm.handleSubmit()
      await flushPromises()

      expect(menuApi.menuApi.createMenuItem).toHaveBeenCalledWith({
        menuCode: 'main',
        label: '新闻资讯',
        slug: 'news',
        type: 'postList',
        linkType: 'internal',
        isVisible: true,
        isActive: true
      })
    })

    it('should validate required fields', async () => {
      const wrapper = mountWithProviders(MenuManagement)

      wrapper.vm.formData = {
        menuCode: '',
        label: '',
        slug: '',
        type: 'page',
        linkType: 'internal'
      }

      const isValid = await wrapper.vm.validateForm()
      expect(isValid).toBe(false)
    })
  })

  describe('Edit Menu Item', () => {
    it('should show edit dialog with existing data', async () => {
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(
        mockApiResponse(mockMenuItems)
      )

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      await wrapper.vm.handleEdit(mockMenuItems[0])

      expect(wrapper.vm.showDialog).toBe(true)
      expect(wrapper.vm.dialogMode).toBe('edit')
      expect(wrapper.vm.formData.label).toBe('首页')
    })

    it('should update menu item successfully', async () => {
      const updatedItem = { ...mockMenuItems[0], label: '首页(更新)' }

      vi.spyOn(menuApi.menuApi, 'updateMenuItem').mockResolvedValue(
        mockApiResponse(updatedItem)
      )
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(
        mockApiResponse(mockMenuItems)
      )

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      wrapper.vm.currentEditId = '1'
      wrapper.vm.formData = {
        menuCode: 'main',
        label: '首页(更新)',
        slug: 'home',
        type: 'page',
        linkType: 'internal',
        isVisible: true,
        isActive: true
      }

      await wrapper.vm.handleSubmit()
      await flushPromises()

      expect(menuApi.menuApi.updateMenuItem).toHaveBeenCalledWith('1', expect.any(Object))
    })
  })

  describe('Delete Menu Item', () => {
    it('should show confirm dialog before delete', async () => {
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(
        mockApiResponse(mockMenuItems)
      )

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      await wrapper.vm.handleDelete(mockMenuItems[0])

      // Should show confirmation
      expect(wrapper.vm.deleteConfirmVisible).toBe(true)
      expect(wrapper.vm.deleteTarget).toBe(mockMenuItems[0])
    })

    it('should delete menu item successfully', async () => {
      vi.spyOn(menuApi.menuApi, 'deleteMenuItem').mockResolvedValue(
        mockApiResponse({ success: true })
      )
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockResolvedValue(
        mockApiResponse(mockMenuItems.slice(1))
      )

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      wrapper.vm.deleteTarget = mockMenuItems[0]
      await wrapper.vm.confirmDelete()
      await flushPromises()

      expect(menuApi.menuApi.deleteMenuItem).toHaveBeenCalledWith('1')
    })

    it('should not delete if has children', async () => {
      const itemWithChildren = mockMenuItems[1] // 产品中心 has children

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      const canDelete = wrapper.vm.canDeleteItem(itemWithChildren)
      expect(canDelete).toBe(false)
    })
  })

  describe('Drag and Drop Reordering', () => {
    it('should update order after drag and drop', async () => {
      vi.spyOn(menuApi.menuApi, 'updateMenuOrder').mockResolvedValue(
        mockApiResponse({ success: true })
      )

      const wrapper = mountWithProviders(MenuManagement)
      wrapper.vm.menuItems = [...mockMenuItems]

      // Simulate drag and drop (swap first two items)
      const reorderedItems = [mockMenuItems[1], mockMenuItems[0], mockMenuItems[2]]

      await wrapper.vm.handleReorder(reorderedItems)
      await flushPromises()

      expect(menuApi.menuApi.updateMenuOrder).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle load error gracefully', async () => {
      vi.spyOn(menuApi.menuApi, 'getMenuItems').mockRejectedValue(
        new Error('Network error')
      )

      const wrapper = mountWithProviders(MenuManagement)
      await flushPromises()

      expect(wrapper.vm.error).toBeTruthy()
    })

    it('should handle create error gracefully', async () => {
      vi.spyOn(menuApi.menuApi, 'createMenuItem').mockRejectedValue(
        new Error('Create failed')
      )

      const wrapper = mountWithProviders(MenuManagement)

      wrapper.vm.formData = {
        menuCode: 'main',
        label: 'Test',
        slug: 'test',
        type: 'page',
        linkType: 'internal'
      }

      await wrapper.vm.handleSubmit()
      await flushPromises()

      expect(wrapper.vm.error).toBeTruthy()
    })
  })

  describe('Real-time Sidebar Sync', () => {
    it('should refresh menu store after create/update/delete', async () => {
      const menuStore = useMenuStore()
      const refreshSpy = vi.spyOn(menuStore, 'refreshMenu')

      vi.spyOn(menuApi.menuApi, 'createMenuItem').mockResolvedValue(
        mockApiResponse(mockMenuItems[0])
      )

      const wrapper = mountWithProviders(MenuManagement)

      wrapper.vm.formData = {
        menuCode: 'main',
        label: 'Test',
        slug: 'test',
        type: 'page',
        linkType: 'internal'
      }

      await wrapper.vm.handleSubmit()
      await flushPromises()

      expect(refreshSpy).toHaveBeenCalled()
    })
  })
})
