import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProductList from '@/views/products/ProductList.vue'
import * as productApi from '@/api/product'

vi.mock('@/api/product')

describe('ProductList Component', () => {
  const mockProducts = [
    {
      id: 'prod1',
      menuItemId: 'products',
      name: '水培系统 Pro',
      slug: 'hydroponic-system-pro',
      summary: '专业级水培系统',
      coverImageUrl: 'https://example.com/image1.jpg',
      isActive: true,
      isFeatured: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prod2',
      menuItemId: 'products',
      name: '家庭水培系统',
      slug: 'home-hydroponic-system',
      summary: '家用水培系统',
      coverImageUrl: 'https://example.com/image4.jpg',
      isActive: false,
      isFeatured: false,
      createdAt: '2024-01-03T00:00:00Z'
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should render product list', async () => {
    vi.mocked(productApi.getProductList).mockResolvedValue({
      data: mockProducts,
      total: 2,
      page: 1,
      limit: 20
    })

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(productApi.getProductList).toHaveBeenCalled()
  })

  it('should handle empty product list', async () => {
    vi.mocked(productApi.getProductList).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20
    })

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const component = wrapper.vm as any
    expect(Array.isArray(component.products)).toBe(true)
    expect(component.products.length).toBe(0)
  })

  it('should have search and filter state', async () => {
    vi.mocked(productApi.getProductList).mockResolvedValue({
      data: mockProducts,
      total: 2,
      page: 1,
      limit: 20
    })

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    expect(component.searchKeyword).toBeDefined()
    expect(component.activeFilter).toBeDefined()
    expect(component.featuredFilter).toBeDefined()
    expect(component.categoryFilter).toBeDefined()
  })

  it('should perform search', async () => {
    vi.mocked(productApi.getProductList).mockResolvedValue({
      data: mockProducts,
      total: 2,
      page: 1,
      limit: 20
    })

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    component.searchKeyword = '水培'

    const initialCallCount = vi.mocked(productApi.getProductList).mock.calls.length
    await component.handleSearch()

    expect(vi.mocked(productApi.getProductList).mock.calls.length).toBeGreaterThan(initialCallCount)
  })

  it('should reset filters', async () => {
    vi.mocked(productApi.getProductList).mockResolvedValue({
      data: mockProducts,
      total: 2,
      page: 1,
      limit: 20
    })

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    component.searchKeyword = '测试'
    component.activeFilter = true
    component.featuredFilter = true

    await component.handleReset()

    expect(component.searchKeyword).toBe('')
    expect(component.activeFilter).toBeNull()
    expect(component.featuredFilter).toBeNull()
  })

  it('should handle pagination', async () => {
    vi.mocked(productApi.getProductList).mockResolvedValue({
      data: mockProducts,
      total: 50,
      page: 1,
      limit: 20
    })

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    expect(component.currentPage).toBe(1)
    expect(component.pageSize).toBe(20)

    const initialCallCount = vi.mocked(productApi.getProductList).mock.calls.length
    await component.handlePageChange(2)

    expect(component.currentPage).toBe(2)
    expect(vi.mocked(productApi.getProductList).mock.calls.length).toBeGreaterThan(initialCallCount)
  })

  it('should handle page size change', async () => {
    vi.mocked(productApi.getProductList).mockResolvedValue({
      data: mockProducts,
      total: 50,
      page: 1,
      limit: 20
    })

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    await component.handlePageSizeChange(50)

    expect(component.pageSize).toBe(50)
    expect(component.currentPage).toBe(1)
  })

  it('should toggle active status', async () => {
    vi.mocked(productApi.getProductList).mockResolvedValue({
      data: mockProducts,
      total: 2,
      page: 1,
      limit: 20
    })
    vi.mocked(productApi.toggleActive).mockResolvedValue(mockProducts[0])

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    await component.handleToggleActive(mockProducts[0])

    expect(productApi.toggleActive).toHaveBeenCalledWith(mockProducts[0].id)
  })

  it('should toggle featured status', async () => {
    vi.mocked(productApi.getProductList).mockResolvedValue({
      data: mockProducts,
      total: 2,
      page: 1,
      limit: 20
    })
    vi.mocked(productApi.toggleFeatured).mockResolvedValue(mockProducts[0])

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    await component.handleToggleFeatured(mockProducts[0])

    expect(productApi.toggleFeatured).toHaveBeenCalledWith(mockProducts[0].id)
  })

  it('should handle API errors', async () => {
    vi.mocked(productApi.getProductList).mockRejectedValue(new Error('API Error'))

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const component = wrapper.vm as any
    expect(Array.isArray(component.products)).toBe(true)
  })

  it('should expose component methods', async () => {
    vi.mocked(productApi.getProductList).mockResolvedValue({
      data: mockProducts,
      total: 2,
      page: 1,
      limit: 20
    })

    const wrapper = mount(ProductList)
    await wrapper.vm.$nextTick()

    const component = wrapper.vm as any
    expect(component.loadProducts).toBeDefined()
    expect(component.handleCreate).toBeDefined()
    expect(component.handleEdit).toBeDefined()
    expect(component.handleDelete).toBeDefined()
    expect(component.handleToggleActive).toBeDefined()
    expect(component.handleToggleFeatured).toBeDefined()
  })
})
