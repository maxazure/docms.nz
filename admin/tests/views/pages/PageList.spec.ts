import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithProviders, flushPromises, mockApiResponse } from '../../utils/test-utils'
import PageList from '@/views/pages/PageList.vue'
import * as pageApi from '@/api/page'
import type { Page } from '@/types'

// Mock the page API
vi.mock('@/api/page', () => ({
  pageApi: {
    getPageList: vi.fn(),
    deletePage: vi.fn(),
    publishPage: vi.fn(),
    unpublishPage: vi.fn()
  }
}))

describe('PageList Component', () => {
  const mockPages: Page[] = [
    {
      id: '1',
      menuItemId: 'home',
      title: '首页',
      slug: 'home',
      blocks: [],
      status: 'published',
      publishedAt: '2025-01-01T00:00:00Z',
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      menuItemId: 'about',
      title: '关于我们',
      slug: 'about',
      blocks: [],
      status: 'draft',
      createdAt: '2025-01-02T00:00:00Z'
    },
    {
      id: '3',
      menuItemId: 'contact',
      title: '联系我们',
      slug: 'contact',
      blocks: [],
      status: 'published',
      publishedAt: '2025-01-03T00:00:00Z',
      createdAt: '2025-01-03T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render page list title', () => {
      const wrapper = mountWithProviders(PageList)

      expect(wrapper.text()).toContain('页面管理')
    })

    it('should load pages on mount', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      expect(pageApi.pageApi.getPageList).toHaveBeenCalled()
    })

    it('should display loading state while fetching', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApiResponse({
          data: mockPages,
          total: 3,
          page: 1,
          limit: 20
        })), 100))
      )

      const wrapper = mountWithProviders(PageList)

      expect(wrapper.vm.loading).toBe(true)

      await flushPromises()
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Page Display', () => {
    it('should display pages in table', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      expect(wrapper.vm.pages.length).toBe(3)
      expect(wrapper.vm.pages[0].title).toBe('首页')
    })

    it('should display page status', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      const statuses = wrapper.vm.pages.map(p => p.status)
      expect(statuses).toContain('published')
      expect(statuses).toContain('draft')
    })
  })

  describe('Create Page', () => {
    it('should navigate to create page', async () => {
      const wrapper = mountWithProviders(PageList)
      const router = wrapper.vm.$router

      await wrapper.vm.handleCreate()
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('PageEditor')
    })
  })

  describe('Edit Page', () => {
    it('should navigate to edit page', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      await wrapper.vm.handleEdit(mockPages[0])
      await flushPromises()

      expect(wrapper.vm.$router.currentRoute.value.name).toBe('PageEditor')
      expect(wrapper.vm.$router.currentRoute.value.params.id).toBe('1')
    })
  })

  describe('Delete Page', () => {
    it('should show confirm dialog before delete', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      await wrapper.vm.handleDelete(mockPages[0])

      expect(wrapper.vm.deleteConfirmVisible).toBe(true)
      expect(wrapper.vm.deleteTarget).toBe(mockPages[0])
    })

    it('should delete page successfully', async () => {
      vi.spyOn(pageApi.pageApi, 'deletePage').mockResolvedValue(
        mockApiResponse(undefined)
      )
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages.slice(1),
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      wrapper.vm.deleteTarget = mockPages[0]
      await wrapper.vm.confirmDelete()
      await flushPromises()

      expect(pageApi.pageApi.deletePage).toHaveBeenCalledWith('1')
    })
  })

  describe('Publish/Unpublish', () => {
    it('should publish draft page', async () => {
      const publishedPage = { ...mockPages[1], status: 'published' as const }

      vi.spyOn(pageApi.pageApi, 'publishPage').mockResolvedValue(
        mockApiResponse(publishedPage)
      )
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      await wrapper.vm.handlePublish(mockPages[1])
      await flushPromises()

      expect(pageApi.pageApi.publishPage).toHaveBeenCalledWith('2')
    })

    it('should unpublish published page', async () => {
      const unpublishedPage = { ...mockPages[0], status: 'draft' as const }

      vi.spyOn(pageApi.pageApi, 'unpublishPage').mockResolvedValue(
        mockApiResponse(unpublishedPage)
      )
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      await wrapper.vm.handleUnpublish(mockPages[0])
      await flushPromises()

      expect(pageApi.pageApi.unpublishPage).toHaveBeenCalledWith('1')
    })
  })

  describe('Search and Filter', () => {
    it('should search pages by title', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: [mockPages[0]],
          total: 1,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      wrapper.vm.searchQuery = '首页'
      await wrapper.vm.handleSearch()
      await flushPromises()

      expect(pageApi.pageApi.getPageList).toHaveBeenCalledWith(
        expect.objectContaining({ search: '首页' })
      )
    })

    it('should filter pages by status', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages.filter(p => p.status === 'published'),
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      wrapper.vm.filterStatus = 'published'
      await wrapper.vm.handleFilter()
      await flushPromises()

      expect(pageApi.pageApi.getPageList).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'published' })
      )
    })

    it('should filter pages by menu item', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: [mockPages[0]],
          total: 1,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      wrapper.vm.filterMenuItemId = 'home'
      await wrapper.vm.handleFilter()
      await flushPromises()

      expect(pageApi.pageApi.getPageList).toHaveBeenCalledWith(
        expect.objectContaining({ menuItemId: 'home' })
      )
    })
  })

  describe('Pagination', () => {
    it('should load next page', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages,
          total: 50,
          page: 2,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      wrapper.vm.currentPage = 2
      await wrapper.vm.loadPages()
      await flushPromises()

      expect(pageApi.pageApi.getPageList).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    })

    it('should change page size', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: mockPages,
          total: 50,
          page: 1,
          limit: 50
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      wrapper.vm.pageSize = 50
      await wrapper.vm.loadPages()
      await flushPromises()

      expect(pageApi.pageApi.getPageList).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle load error gracefully', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockRejectedValue(
        new Error('Network error')
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      expect(wrapper.vm.error).toBeTruthy()
    })

    it('should handle delete error gracefully', async () => {
      vi.spyOn(pageApi.pageApi, 'deletePage').mockRejectedValue(
        new Error('Delete failed')
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      wrapper.vm.deleteTarget = mockPages[0]
      await wrapper.vm.confirmDelete()
      await flushPromises()

      expect(wrapper.vm.error).toBeTruthy()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no pages', async () => {
      vi.spyOn(pageApi.pageApi, 'getPageList').mockResolvedValue(
        mockApiResponse({
          data: [],
          total: 0,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(PageList)
      await flushPromises()

      expect(wrapper.vm.pages.length).toBe(0)
    })
  })
})
