import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithProviders, flushPromises, mockApiResponse } from '../../utils/test-utils'
import PageEditor from '@/views/pages/PageEditor.vue'
import * as pageApi from '@/api/page'
import type { Page, Block } from '@/types'

vi.mock('@/api/page', () => ({
  pageApi: {
    getPage: vi.fn(),
    createPage: vi.fn(),
    updatePage: vi.fn()
  }
}))

describe('PageEditor Component', () => {
  const mockPage: Page = {
    id: '1',
    menuItemId: 'home',
    title: '首页',
    slug: 'home',
    blocks: [
      {
        id: 'block1',
        type: 'hero',
        props: {
          title: 'Welcome',
          subtitle: 'Subtitle'
        },
        order: 0,
        visibility: true
      },
      {
        id: 'block2',
        type: 'text',
        props: {
          content: '<p>Content</p>'
        },
        order: 1,
        visibility: true
      }
    ],
    status: 'draft',
    createdAt: '2025-01-01T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render page editor', async () => {
      const wrapper = mountWithProviders(PageEditor, {
        props: {}
      })

      expect(wrapper.find('.page-editor').exists()).toBe(true)
    })

    it('should load existing page when editing', async () => {
      vi.spyOn(pageApi.pageApi, 'getPage').mockResolvedValue(
        mockApiResponse(mockPage)
      )

      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.$router.push({ params: { id: '1' } })
      await flushPromises()

      expect(pageApi.pageApi.getPage).toHaveBeenCalledWith('1')
    })

    it('should initialize empty page for new', async () => {
      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.$router.push({ params: { id: 'new' } })
      await flushPromises()

      expect(wrapper.vm.pageData.blocks).toEqual([])
    })
  })

  describe('Block Operations', () => {
    it('should add new block', async () => {
      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.pageData.blocks = []

      await wrapper.vm.handleAddBlock('hero')

      expect(wrapper.vm.pageData.blocks.length).toBe(1)
      expect(wrapper.vm.pageData.blocks[0].type).toBe('hero')
    })

    it('should remove block', async () => {
      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.pageData.blocks = [mockPage.blocks[0]]

      await wrapper.vm.handleRemoveBlock(0)

      expect(wrapper.vm.pageData.blocks.length).toBe(0)
    })

    it('should move block up', async () => {
      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.pageData.blocks = [...mockPage.blocks]

      await wrapper.vm.handleMoveBlockUp(1)

      expect(wrapper.vm.pageData.blocks[0].id).toBe('block2')
      expect(wrapper.vm.pageData.blocks[1].id).toBe('block1')
    })

    it('should move block down', async () => {
      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.pageData.blocks = [...mockPage.blocks]

      await wrapper.vm.handleMoveBlockDown(0)

      expect(wrapper.vm.pageData.blocks[0].id).toBe('block2')
      expect(wrapper.vm.pageData.blocks[1].id).toBe('block1')
    })

    it('should duplicate block', async () => {
      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.pageData.blocks = [mockPage.blocks[0]]

      await wrapper.vm.handleDuplicateBlock(0)

      expect(wrapper.vm.pageData.blocks.length).toBe(2)
      expect(wrapper.vm.pageData.blocks[1].type).toBe('hero')
    })

    it('should toggle block visibility', async () => {
      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.pageData.blocks = [mockPage.blocks[0]]

      await wrapper.vm.handleToggleBlockVisibility(0)

      expect(wrapper.vm.pageData.blocks[0].visibility).toBe(false)
    })
  })

  describe('Block Configuration', () => {
    it('should select block for editing', async () => {
      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.pageData.blocks = [...mockPage.blocks]

      await wrapper.vm.handleSelectBlock(0)

      expect(wrapper.vm.selectedBlockIndex).toBe(0)
    })

    it('should update block props', async () => {
      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.pageData.blocks = [mockPage.blocks[0]]
      wrapper.vm.selectedBlockIndex = 0

      await wrapper.vm.handleUpdateBlockProps({ title: 'New Title' })

      expect(wrapper.vm.pageData.blocks[0].props.title).toBe('New Title')
    })
  })

  describe('Save Operations', () => {
    it('should save new page', async () => {
      vi.spyOn(pageApi.pageApi, 'createPage').mockResolvedValue(
        mockApiResponse(mockPage)
      )

      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.$router.push({ params: { id: 'new' } })
      wrapper.vm.pageData = {
        menuItemId: 'home',
        title: '首页',
        slug: 'home',
        blocks: [],
        status: 'draft'
      }

      await wrapper.vm.handleSave()
      await flushPromises()

      expect(pageApi.pageApi.createPage).toHaveBeenCalled()
    })

    it('should update existing page', async () => {
      vi.spyOn(pageApi.pageApi, 'updatePage').mockResolvedValue(
        mockApiResponse(mockPage)
      )

      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.$router.push({ params: { id: '1' } })
      wrapper.vm.pageData = mockPage

      await wrapper.vm.handleSave()
      await flushPromises()

      expect(pageApi.pageApi.updatePage).toHaveBeenCalledWith('1', expect.any(Object))
    })

    it('should validate required fields before save', async () => {
      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.pageData = {
        menuItemId: '',
        title: '',
        slug: '',
        blocks: []
      }

      const isValid = await wrapper.vm.validateForm()

      expect(isValid).toBe(false)
    })
  })

  describe('Auto-save', () => {
    it('should trigger auto-save after changes', async () => {
      vi.useFakeTimers()
      const wrapper = mountWithProviders(PageEditor)
      const saveSpy = vi.spyOn(wrapper.vm, 'handleAutoSave')

      wrapper.vm.pageData.title = 'Changed Title'
      wrapper.vm.triggerAutoSave()

      vi.advanceTimersByTime(3000)
      await flushPromises()

      expect(saveSpy).toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('Error Handling', () => {
    it('should handle load error gracefully', async () => {
      vi.spyOn(pageApi.pageApi, 'getPage').mockRejectedValue(
        new Error('Network error')
      )

      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.$router.push({ params: { id: '1' } })
      await flushPromises()

      expect(wrapper.vm.error).toBeTruthy()
    })

    it('should handle save error gracefully', async () => {
      vi.spyOn(pageApi.pageApi, 'createPage').mockRejectedValue(
        new Error('Save failed')
      )

      const wrapper = mountWithProviders(PageEditor)
      wrapper.vm.pageData = {
        menuItemId: 'home',
        title: 'Test',
        slug: 'test',
        blocks: []
      }

      await wrapper.vm.handleSave()
      await flushPromises()

      expect(wrapper.vm.error).toBeTruthy()
    })
  })
})
