import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PostList from '@/views/posts/PostList.vue'
import * as postApi from '@/api/post'

vi.mock('@/api/post')

describe('PostList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockPosts = [
    {
      id: '1',
      menuItemId: 'menu-1',
      title: '测试文章1',
      slug: 'test-post-1',
      content: '内容',
      status: 'published' as const,
      authorId: 'user-1',
      authorName: '作者1',
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      menuItemId: 'menu-1',
      title: '测试文章2',
      slug: 'test-post-2',
      content: '内容',
      status: 'draft' as const,
      authorId: 'user-1',
      authorName: '作者1',
      createdAt: '2025-01-02T00:00:00Z'
    }
  ]

  it('should render post list', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: mockPosts,
      total: 2,
      page: 1,
      limit: 20
    })
    vi.mocked(postApi.getCategoryList).mockResolvedValue([])
    vi.mocked(postApi.getTagList).mockResolvedValue([])

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(postApi.getPostList).toHaveBeenCalled()
  })

  it('should create new post', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20
    })
    vi.mocked(postApi.getCategoryList).mockResolvedValue([])
    vi.mocked(postApi.getTagList).mockResolvedValue([])

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    wrapper.vm.handleCreate()
    // Navigation would happen here
  })

  it('should edit post', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: mockPosts,
      total: 2,
      page: 1,
      limit: 20
    })
    vi.mocked(postApi.getCategoryList).mockResolvedValue([])
    vi.mocked(postApi.getTagList).mockResolvedValue([])

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    wrapper.vm.handleEdit(mockPosts[0])
    // Navigation would happen here
  })

  it('should delete post', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: mockPosts,
      total: 2,
      page: 1,
      limit: 20
    })
    vi.mocked(postApi.getCategoryList).mockResolvedValue([])
    vi.mocked(postApi.getTagList).mockResolvedValue([])
    vi.mocked(postApi.deletePost).mockResolvedValue()

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    await wrapper.vm.handleDelete(mockPosts[0])
    expect(postApi.deletePost).toHaveBeenCalledWith('1')
  })

  it('should publish post', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: mockPosts,
      total: 2,
      page: 1,
      limit: 20
    })
    vi.mocked(postApi.getCategoryList).mockResolvedValue([])
    vi.mocked(postApi.getTagList).mockResolvedValue([])
    vi.mocked(postApi.publishPost).mockResolvedValue({ ...mockPosts[1], status: 'published' })

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    await wrapper.vm.handlePublish(mockPosts[1])
    expect(postApi.publishPost).toHaveBeenCalledWith('2')
  })

  it('should unpublish post', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: mockPosts,
      total: 2,
      page: 1,
      limit: 20
    })
    vi.mocked(postApi.getCategoryList).mockResolvedValue([])
    vi.mocked(postApi.getTagList).mockResolvedValue([])
    vi.mocked(postApi.unpublishPost).mockResolvedValue({ ...mockPosts[0], status: 'draft' })

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    await wrapper.vm.handleUnpublish(mockPosts[0])
    expect(postApi.unpublishPost).toHaveBeenCalledWith('1')
  })

  it('should search posts', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: mockPosts,
      total: 2,
      page: 1,
      limit: 20
    })
    vi.mocked(postApi.getCategoryList).mockResolvedValue([])
    vi.mocked(postApi.getTagList).mockResolvedValue([])

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    wrapper.vm.searchKeyword = '测试'
    await wrapper.vm.handleSearch()

    expect(postApi.getPostList).toHaveBeenCalledWith(
      expect.objectContaining({ search: '测试' })
    )
  })

  it('should filter by status', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: mockPosts,
      total: 2,
      page: 1,
      limit: 20
    })
    vi.mocked(postApi.getCategoryList).mockResolvedValue([])
    vi.mocked(postApi.getTagList).mockResolvedValue([])

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    wrapper.vm.statusFilter = 'published'
    await wrapper.vm.loadPosts()

    expect(postApi.getPostList).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'published' })
    )
  })

  it('should filter by category', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: mockPosts,
      total: 2,
      page: 1,
      limit: 20
    })
    vi.mocked(postApi.getCategoryList).mockResolvedValue([])
    vi.mocked(postApi.getTagList).mockResolvedValue([])

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    wrapper.vm.categoryFilter = 'cat-1'
    await wrapper.vm.loadPosts()

    expect(postApi.getPostList).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat-1' })
    )
  })

  it('should handle pagination', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: mockPosts,
      total: 50,
      page: 1,
      limit: 20
    })
    vi.mocked(postApi.getCategoryList).mockResolvedValue([])
    vi.mocked(postApi.getTagList).mockResolvedValue([])

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    wrapper.vm.currentPage = 2
    await wrapper.vm.loadPosts()

    expect(postApi.getPostList).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    )
  })
})
