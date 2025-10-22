import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithProviders, flushPromises, mockApiResponse } from '../../utils/test-utils'
import MediaSelector from '@/components/media/MediaSelector.vue'
import * as mediaApi from '@/api/media'
import type { Media } from '@/types'

// Mock the media API
vi.mock('@/api/media', () => ({
  mediaApi: {
    getMediaList: vi.fn(),
    uploadMedia: vi.fn()
  }
}))

describe('MediaSelector Component', () => {
  const mockMediaItems: Media[] = [
    {
      id: '1',
      filename: 'hero-banner.jpg',
      mime: 'image/jpeg',
      size: 1024000,
      width: 1920,
      height: 1080,
      url: '/uploads/hero-banner.jpg',
      alt: 'Hero Banner',
      uploadedBy: 'user1',
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      filename: 'product-photo.png',
      mime: 'image/png',
      size: 512000,
      width: 800,
      height: 600,
      url: '/uploads/product-photo.png',
      alt: 'Product Photo',
      uploadedBy: 'user1',
      createdAt: '2025-01-02T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should not be visible by default', () => {
      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: false
        }
      })

      expect(wrapper.vm.visible).toBe(false)
    })

    it('should load media items when opened', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true
        }
      })
      await flushPromises()

      expect(mediaApi.mediaApi.getMediaList).toHaveBeenCalled()
    })
  })

  describe('Single Selection Mode', () => {
    it('should select single item', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true,
          multiple: false
        }
      })
      await flushPromises()

      await wrapper.vm.handleSelect(mockMediaItems[0])

      expect(wrapper.vm.selectedMedia).toEqual(mockMediaItems[0])
    })

    it('should emit selected media on confirm', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const onSelect = vi.fn()
      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true,
          multiple: false,
          onSelect
        }
      })
      await flushPromises()

      await wrapper.vm.handleSelect(mockMediaItems[0])
      await wrapper.vm.handleConfirm()

      expect(onSelect).toHaveBeenCalledWith(mockMediaItems[0])
    })
  })

  describe('Multiple Selection Mode', () => {
    it('should select multiple items', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true,
          multiple: true
        }
      })
      await flushPromises()

      await wrapper.vm.handleSelect(mockMediaItems[0])
      await wrapper.vm.handleSelect(mockMediaItems[1])

      expect(wrapper.vm.selectedMedia).toEqual(mockMediaItems)
    })

    it('should deselect item when clicked again', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true,
          multiple: true
        }
      })
      await flushPromises()

      await wrapper.vm.handleSelect(mockMediaItems[0])
      expect(wrapper.vm.selectedMedia).toEqual([mockMediaItems[0]])

      await wrapper.vm.handleSelect(mockMediaItems[0])
      expect(wrapper.vm.selectedMedia).toEqual([])
    })

    it('should emit array of selected media on confirm', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const onSelect = vi.fn()
      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true,
          multiple: true,
          onSelect
        }
      })
      await flushPromises()

      await wrapper.vm.handleSelect(mockMediaItems[0])
      await wrapper.vm.handleSelect(mockMediaItems[1])
      await wrapper.vm.handleConfirm()

      expect(onSelect).toHaveBeenCalledWith(mockMediaItems)
    })
  })

  describe('Upload in Selector', () => {
    it('should upload and auto-select new file in single mode', async () => {
      const newFile: Media = {
        id: '3',
        filename: 'new-upload.jpg',
        mime: 'image/jpeg',
        size: 256000,
        url: '/uploads/new-upload.jpg',
        uploadedBy: 'user1',
        createdAt: '2025-01-03T00:00:00Z'
      }

      vi.spyOn(mediaApi.mediaApi, 'uploadMedia').mockResolvedValue(
        mockApiResponse(newFile)
      )
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: [...mockMediaItems, newFile],
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const file = new File(['content'], 'new-upload.jpg', { type: 'image/jpeg' })

      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true,
          multiple: false
        }
      })
      await flushPromises()

      await wrapper.vm.handleUploadInSelector(file)
      await flushPromises()

      expect(wrapper.vm.selectedMedia).toEqual(newFile)
    })

    it('should upload and add to selection in multiple mode', async () => {
      const newFile: Media = {
        id: '3',
        filename: 'new-upload.jpg',
        mime: 'image/jpeg',
        size: 256000,
        url: '/uploads/new-upload.jpg',
        uploadedBy: 'user1',
        createdAt: '2025-01-03T00:00:00Z'
      }

      vi.spyOn(mediaApi.mediaApi, 'uploadMedia').mockResolvedValue(
        mockApiResponse(newFile)
      )
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: [...mockMediaItems, newFile],
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const file = new File(['content'], 'new-upload.jpg', { type: 'image/jpeg' })

      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true,
          multiple: true
        }
      })
      await flushPromises()

      await wrapper.vm.handleSelect(mockMediaItems[0])
      await wrapper.vm.handleUploadInSelector(file)
      await flushPromises()

      expect(wrapper.vm.selectedMedia).toEqual([mockMediaItems[0], newFile])
    })
  })

  describe('File Type Filter', () => {
    it('should filter by accepted file types', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems.filter(m => m.mime.startsWith('image/jpeg')),
          total: 1,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true,
          accept: 'image/jpeg'
        }
      })
      await flushPromises()

      expect(mediaApi.mediaApi.getMediaList).toHaveBeenCalledWith(
        expect.objectContaining({ mime: 'image/jpeg' })
      )
    })
  })

  describe('Max File Size Validation', () => {
    it('should validate file size before upload', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true,
          maxSize: 10 * 1024 * 1024
        }
      })

      const isValid = wrapper.vm.validateFileSize(largeFile)
      expect(isValid).toBe(false)
    })
  })

  describe('Cancel Action', () => {
    it('should emit cancel event and clear selection', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const onCancel = vi.fn()
      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true,
          onCancel
        }
      })
      await flushPromises()

      await wrapper.vm.handleSelect(mockMediaItems[0])
      await wrapper.vm.handleCancel()

      expect(onCancel).toHaveBeenCalled()
      expect(wrapper.vm.selectedMedia).toEqual(null)
    })
  })

  describe('Search and Pagination', () => {
    it('should search media by filename', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: [mockMediaItems[0]],
          total: 1,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true
        }
      })
      await flushPromises()

      wrapper.vm.searchQuery = 'hero'
      await wrapper.vm.handleSearch()
      await flushPromises()

      expect(mediaApi.mediaApi.getMediaList).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'hero' })
      )
    })

    it('should load next page', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 50,
          page: 2,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaSelector, {
        props: {
          visible: true
        }
      })
      await flushPromises()

      wrapper.vm.currentPage = 2
      await wrapper.vm.loadMedia()
      await flushPromises()

      expect(mediaApi.mediaApi.getMediaList).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    })
  })
})
