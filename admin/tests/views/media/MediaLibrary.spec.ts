import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithProviders, flushPromises, mockApiResponse } from '../../utils/test-utils'
import MediaLibrary from '@/views/media/MediaLibrary.vue'
import * as mediaApi from '@/api/media'
import type { Media } from '@/types'

// Mock the media API
vi.mock('@/api/media', () => ({
  mediaApi: {
    getMediaList: vi.fn(),
    getMedia: vi.fn(),
    uploadMedia: vi.fn(),
    uploadMediaBatch: vi.fn(),
    updateMedia: vi.fn(),
    deleteMedia: vi.fn(),
    deleteMediaBatch: vi.fn()
  }
}))

describe('MediaLibrary Component', () => {
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
      title: 'Homepage Banner',
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
    },
    {
      id: '3',
      filename: 'document.pdf',
      mime: 'application/pdf',
      size: 2048000,
      url: '/uploads/document.pdf',
      title: 'Product Manual',
      uploadedBy: 'user1',
      createdAt: '2025-01-03T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render media library page with title', () => {
      const wrapper = mountWithProviders(MediaLibrary)

      expect(wrapper.text()).toContain('媒体库')
    })

    it('should load media items on mount', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      expect(mediaApi.mediaApi.getMediaList).toHaveBeenCalled()
    })

    it('should display loading state while fetching', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApiResponse({
          data: mockMediaItems,
          total: 3,
          page: 1,
          limit: 20
        })), 100))
      )

      const wrapper = mountWithProviders(MediaLibrary)

      expect(wrapper.vm.loading).toBe(true)

      await flushPromises()
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('View Mode Toggle', () => {
    it('should toggle between grid and list view', async () => {
      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      expect(wrapper.vm.viewMode).toBe('grid')

      await wrapper.vm.toggleViewMode()
      expect(wrapper.vm.viewMode).toBe('list')

      await wrapper.vm.toggleViewMode()
      expect(wrapper.vm.viewMode).toBe('grid')
    })
  })

  describe('Media Display', () => {
    it('should display media items in grid view', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      expect(wrapper.vm.mediaItems.length).toBe(3)
      expect(wrapper.vm.mediaItems[0].filename).toBe('hero-banner.jpg')
    })

    it('should display media metadata', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      const firstItem = wrapper.vm.mediaItems[0]
      expect(firstItem.filename).toBe('hero-banner.jpg')
      expect(firstItem.size).toBe(1024000)
      expect(firstItem.width).toBe(1920)
      expect(firstItem.height).toBe(1080)
    })
  })

  describe('Upload Media', () => {
    it('should upload single file successfully', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const uploadedMedia: Media = {
        id: '4',
        filename: 'test.jpg',
        mime: 'image/jpeg',
        size: 7,
        url: '/uploads/test.jpg',
        uploadedBy: 'user1',
        createdAt: '2025-01-04T00:00:00Z'
      }

      vi.spyOn(mediaApi.mediaApi, 'uploadMedia').mockResolvedValue(
        mockApiResponse(uploadedMedia)
      )
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: [...mockMediaItems, uploadedMedia],
          total: 4,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      await wrapper.vm.handleUpload(file)
      await flushPromises()

      expect(mediaApi.mediaApi.uploadMedia).toHaveBeenCalledWith(file, undefined)
    })

    it('should upload multiple files successfully', async () => {
      const files = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      ]

      vi.spyOn(mediaApi.mediaApi, 'uploadMediaBatch').mockResolvedValue(
        mockApiResponse([
          {
            id: '4',
            filename: 'test1.jpg',
            mime: 'image/jpeg',
            size: 8,
            url: '/uploads/test1.jpg',
            uploadedBy: 'user1',
            createdAt: '2025-01-04T00:00:00Z'
          },
          {
            id: '5',
            filename: 'test2.jpg',
            mime: 'image/jpeg',
            size: 8,
            url: '/uploads/test2.jpg',
            uploadedBy: 'user1',
            createdAt: '2025-01-04T00:00:00Z'
          }
        ])
      )
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 5,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      await wrapper.vm.handleUploadBatch(files)
      await flushPromises()

      expect(mediaApi.mediaApi.uploadMediaBatch).toHaveBeenCalledWith(files, undefined)
    })

    it('should validate file size before upload', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

      const wrapper = mountWithProviders(MediaLibrary)
      wrapper.vm.maxFileSize = 10 * 1024 * 1024 // 10MB

      const isValid = wrapper.vm.validateFileSize(largeFile)
      expect(isValid).toBe(false)
    })

    it('should validate file type before upload', async () => {
      const invalidFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' })

      const wrapper = mountWithProviders(MediaLibrary)
      wrapper.vm.acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']

      const isValid = wrapper.vm.validateFileType(invalidFile)
      expect(isValid).toBe(false)
    })
  })

  describe('Edit Media', () => {
    it('should show edit dialog with existing data', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      await wrapper.vm.handleEdit(mockMediaItems[0])

      expect(wrapper.vm.showEditDialog).toBe(true)
      expect(wrapper.vm.editFormData.alt).toBe('Hero Banner')
      expect(wrapper.vm.editFormData.title).toBe('Homepage Banner')
    })

    it('should update media metadata successfully', async () => {
      const updatedMedia = { ...mockMediaItems[0], alt: 'Updated Alt Text' }

      vi.spyOn(mediaApi.mediaApi, 'updateMedia').mockResolvedValue(
        mockApiResponse(updatedMedia)
      )
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      wrapper.vm.currentEditId = '1'
      wrapper.vm.editFormData = {
        alt: 'Updated Alt Text',
        title: 'Homepage Banner'
      }

      await wrapper.vm.handleSubmitEdit()
      await flushPromises()

      expect(mediaApi.mediaApi.updateMedia).toHaveBeenCalledWith('1', {
        alt: 'Updated Alt Text',
        title: 'Homepage Banner'
      })
    })
  })

  describe('Delete Media', () => {
    it('should show confirm dialog before delete', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      await wrapper.vm.handleDelete(mockMediaItems[0])

      expect(wrapper.vm.deleteConfirmVisible).toBe(true)
      expect(wrapper.vm.deleteTarget).toBe(mockMediaItems[0])
    })

    it('should delete media successfully', async () => {
      vi.spyOn(mediaApi.mediaApi, 'deleteMedia').mockResolvedValue(
        mockApiResponse(undefined)
      )
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems.slice(1),
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      wrapper.vm.deleteTarget = mockMediaItems[0]
      await wrapper.vm.confirmDelete()
      await flushPromises()

      expect(mediaApi.mediaApi.deleteMedia).toHaveBeenCalledWith('1')
    })

    it('should delete multiple media items', async () => {
      vi.spyOn(mediaApi.mediaApi, 'deleteMediaBatch').mockResolvedValue(
        mockApiResponse(undefined)
      )
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: [mockMediaItems[2]],
          total: 1,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      wrapper.vm.selectedIds = ['1', '2']
      await wrapper.vm.handleBatchDelete()
      await flushPromises()

      expect(mediaApi.mediaApi.deleteMediaBatch).toHaveBeenCalledWith(['1', '2'])
    })
  })

  describe('Preview Media', () => {
    it('should show preview dialog for image', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 3,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      await wrapper.vm.handlePreview(mockMediaItems[0])

      expect(wrapper.vm.showPreviewDialog).toBe(true)
      expect(wrapper.vm.previewMedia).toBe(mockMediaItems[0])
    })
  })

  describe('Search and Filter', () => {
    it('should filter media by search term', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: [mockMediaItems[0]],
          total: 1,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      wrapper.vm.searchQuery = 'hero'
      await wrapper.vm.handleSearch()
      await flushPromises()

      expect(mediaApi.mediaApi.getMediaList).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'hero' })
      )
    })

    it('should filter media by MIME type', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems.filter(m => m.mime.startsWith('image/')),
          total: 2,
          page: 1,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      wrapper.vm.filterMimeType = 'image/jpeg'
      await wrapper.vm.handleFilter()
      await flushPromises()

      expect(mediaApi.mediaApi.getMediaList).toHaveBeenCalledWith(
        expect.objectContaining({ mime: 'image/jpeg' })
      )
    })
  })

  describe('Pagination', () => {
    it('should load next page', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 50,
          page: 2,
          limit: 20
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      wrapper.vm.currentPage = 2
      await wrapper.vm.loadMedia()
      await flushPromises()

      expect(mediaApi.mediaApi.getMediaList).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    })

    it('should change page size', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockResolvedValue(
        mockApiResponse({
          data: mockMediaItems,
          total: 50,
          page: 1,
          limit: 50
        })
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      wrapper.vm.pageSize = 50
      await wrapper.vm.loadMedia()
      await flushPromises()

      expect(mediaApi.mediaApi.getMediaList).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle load error gracefully', async () => {
      vi.spyOn(mediaApi.mediaApi, 'getMediaList').mockRejectedValue(
        new Error('Network error')
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      expect(wrapper.vm.error).toBeTruthy()
    })

    it('should handle upload error gracefully', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })

      vi.spyOn(mediaApi.mediaApi, 'uploadMedia').mockRejectedValue(
        new Error('Upload failed')
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      await wrapper.vm.handleUpload(file)
      await flushPromises()

      expect(wrapper.vm.error).toBeTruthy()
    })

    it('should handle delete error gracefully', async () => {
      vi.spyOn(mediaApi.mediaApi, 'deleteMedia').mockRejectedValue(
        new Error('Delete failed')
      )

      const wrapper = mountWithProviders(MediaLibrary)
      await flushPromises()

      wrapper.vm.deleteTarget = mockMediaItems[0]
      await wrapper.vm.confirmDelete()
      await flushPromises()

      expect(wrapper.vm.error).toBeTruthy()
    })
  })

  describe('Selection', () => {
    it('should toggle media item selection', async () => {
      const wrapper = mountWithProviders(MediaLibrary)
      wrapper.vm.mediaItems = mockMediaItems

      expect(wrapper.vm.selectedIds).toEqual([])

      wrapper.vm.toggleSelection('1')
      expect(wrapper.vm.selectedIds).toEqual(['1'])

      wrapper.vm.toggleSelection('2')
      expect(wrapper.vm.selectedIds).toEqual(['1', '2'])

      wrapper.vm.toggleSelection('1')
      expect(wrapper.vm.selectedIds).toEqual(['2'])
    })

    it('should select all media items', async () => {
      const wrapper = mountWithProviders(MediaLibrary)
      wrapper.vm.mediaItems = mockMediaItems

      wrapper.vm.selectAll()
      expect(wrapper.vm.selectedIds).toEqual(['1', '2', '3'])
    })

    it('should clear all selections', async () => {
      const wrapper = mountWithProviders(MediaLibrary)
      wrapper.vm.mediaItems = mockMediaItems
      wrapper.vm.selectedIds = ['1', '2', '3']

      wrapper.vm.clearSelection()
      expect(wrapper.vm.selectedIds).toEqual([])
    })
  })
})
