import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProductEditor from '@/views/products/ProductEditor.vue'
import * as productApi from '@/api/product'
import * as mediaApi from '@/api/media'

vi.mock('@/api/product')
vi.mock('@/api/media')

// Mock router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: 'create' }
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('ProductEditor Component', () => {
  const mockProduct = {
    id: 'prod1',
    menuItemId: 'products',
    name: '水培系统 Pro',
    slug: 'hydroponic-system-pro',
    summary: '专业级水培系统',
    description: '<p>适合商业种植的专业水培系统</p>',
    coverImageId: 'img1',
    coverImageUrl: 'https://example.com/image1.jpg',
    categoryId: 'cat1',
    tagIds: ['tag1', 'tag2'],
    specs: [
      { key: 'capacity', label: '容量', value: '48', unit: '株' },
      { key: 'power', label: '功率', value: '200', unit: 'W' }
    ],
    gallery: ['img2', 'img3'],
    isActive: true,
    isFeatured: true,
    meta: {
      seoTitle: '专业水培系统Pro',
      seoDescription: '商业级水培解决方案',
      seoKeywords: ['水培', '系统', '商业']
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }

  const mockMediaList = [
    {
      id: 'img1',
      filename: 'cover.jpg',
      url: 'https://example.com/cover.jpg',
      mimeType: 'image/jpeg',
      size: 2048,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'img2',
      filename: 'gallery1.jpg',
      url: 'https://example.com/gallery1.jpg',
      mimeType: 'image/jpeg',
      size: 3072,
      createdAt: '2024-01-02T00:00:00Z'
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should render create form', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    expect(component.isNew).toBe(true)
    expect(component.formData.name).toBe('')
  })

  it('should have all form fields', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    expect(component.formData).toHaveProperty('name')
    expect(component.formData).toHaveProperty('slug')
    expect(component.formData).toHaveProperty('specs')
    expect(component.formData).toHaveProperty('gallery')
    expect(component.formData).toHaveProperty('seoTitle')
  })

  it('should add specification', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    const initialLength = component.formData.specs.length

    component.handleAddSpec()

    expect(component.formData.specs.length).toBe(initialLength + 1)
    expect(component.formData.specs[initialLength]).toEqual({
      key: '',
      label: '',
      value: '',
      unit: ''
    })
  })

  it('should remove specification', async () => {
    vi.mocked(productApi.getProduct).mockResolvedValue(mockProduct)

    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const component = wrapper.vm as any
    if (component.formData.specs.length > 0) {
      const initialLength = component.formData.specs.length
      component.handleRemoveSpec(0)
      expect(component.formData.specs.length).toBe(initialLength - 1)
    } else {
      // If no specs yet, add one then remove it
      component.handleAddSpec()
      const length = component.formData.specs.length
      component.handleRemoveSpec(0)
      expect(component.formData.specs.length).toBe(length - 1)
    }
  })

  it('should have upload modal state', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    expect(component.showGalleryUploadModal).toBeDefined()
    expect(component.showGallerySelectModal).toBeDefined()
  })

  it('should toggle media selection', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    const mediaId = 'img1'

    component.toggleMediaSelection(mediaId)
    expect(component.selectedMediaIds).toContain(mediaId)

    component.toggleMediaSelection(mediaId)
    expect(component.selectedMediaIds).not.toContain(mediaId)
  })

  it('should add selected media to gallery', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    component.selectedMediaIds = ['img4', 'img5']

    component.handleConfirmMediaSelection()

    expect(component.formData.gallery).toContain('img4')
    expect(component.formData.gallery).toContain('img5')
    expect(component.selectedMediaIds.length).toBe(0)
    expect(component.showGallerySelectModal).toBe(false)
  })

  it('should prevent duplicate gallery images', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    component.formData.gallery = ['img1', 'img2']
    component.selectedMediaIds = ['img2', 'img3']

    component.handleConfirmMediaSelection()

    const img2Count = component.formData.gallery.filter((id: string) => id === 'img2').length
    expect(img2Count).toBe(1)
    expect(component.formData.gallery).toContain('img3')
  })

  it('should have form validation rules', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    expect(component.formRules).toBeDefined()
    expect(component.formRules.name).toBeDefined()
    expect(component.formRules.slug).toBeDefined()
  })

  it('should validate slug pattern', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    const slugRule = component.formRules.slug.find((rule: any) => rule.pattern)

    expect(slugRule).toBeDefined()
    expect(slugRule.pattern.test('valid-slug-123')).toBe(true)
    expect(slugRule.pattern.test('Invalid Slug')).toBe(false)
  })

  it('should track SEO title length', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    component.formData.seoTitle = '测试标题'

    expect(component.seoTitleLength).toBe(4)
  })

  it('should track SEO description length', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    component.formData.seoDescription = '测试描述内容'

    expect(component.seoDescriptionLength).toBe(6)
  })

  it('should have upload action URL', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    expect(component.uploadAction).toContain('/media/upload')
  })

  it('should have upload headers', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    expect(component.uploadHeaders).toHaveProperty('Authorization')
  })

  it('should handle upload finish', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    const mockResponse = {
      event: {
        target: {
          response: JSON.stringify({ id: 'new-img-id' })
        }
      }
    }

    component.handleGalleryUploadFinish(mockResponse)

    expect(component.formData.gallery).toContain('new-img-id')
    expect(component.showGalleryUploadModal).toBe(false)
  })

  it('should remove image from gallery', async () => {
    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    component.formData.gallery = ['img1', 'img2', 'img3']
    const initialLength = component.formData.gallery.length

    component.handleRemoveGalleryImage(0)

    expect(component.formData.gallery.length).toBe(initialLength - 1)
  })

  it('should handle create product', async () => {
    vi.mocked(productApi.createProduct).mockResolvedValue(mockProduct)

    const wrapper = mount(ProductEditor)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    component.formData.name = '新产品'
    component.formData.slug = 'new-product'
    component.formData.description = '描述'
    component.formData.menuItemId = 'products'

    await component.handleSave()

    expect(productApi.createProduct).toHaveBeenCalled()
  })
})
