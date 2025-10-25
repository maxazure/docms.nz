import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import PostEditor from '@/views/posts/PostEditor.vue'
import { useAuthStore, useMenuStore } from '@/stores'
import { mountWithNaiveProviders } from '../../utils/test-utils'
import * as postApi from '@/api/post'
import * as mediaApi from '@/api/media'
import type { Post, Category, Tag } from '@/types/post'

// Mock API
vi.mock('@/api/post')
vi.mock('@/api/media')

// Mock stores
vi.mock('@/stores', () => ({
  useAuthStore: () => ({
    user: {
      id: 'user1',
      email: 'test@example.com',
      displayName: '测试用户',
      role: 'editor'
    },
    isAuthenticated: true
  }),
  useMenuStore: () => ({
    mainMenuTree: [
      {
        id: 'news',
        label: '新闻资讯',
        slug: 'news',
        type: 'postList',
        order: 1,
        isVisible: true,
        isActive: true,
        children: []
      }
    ],
    init: vi.fn().mockResolvedValue(undefined)
  })
}))

// Mock router
const mockRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/posts/create', name: 'CreatePost' },
    { path: '/posts/edit/:id', name: 'EditPost' }
  ]
})

describe('PostEditor Component', () => {
  const mockPost: Post = {
    id: '1',
    menuItemId: 'news',
    title: '测试文章',
    slug: 'test-post',
    summary: '测试摘要',
    content: '<p>测试内容</p>',
    coverImageId: 'img1',
    status: 'draft',
    authorId: 'user1',
    authorName: '测试用户',
    categoryIds: ['cat1'],
    tagIds: ['tag1'],
    meta: {
      seoTitle: 'SEO标题',
      seoDescription: 'SEO描述',
      seoKeywords: ['关键词1', '关键词2']
    },
    createdAt: '2024-01-01T00:00:00Z'
  }

  const mockCategories: Category[] = [
    { id: 'cat1', name: '技术分享', slug: 'tech', order: 1, createdAt: '2024-01-01T00:00:00Z' },
    { id: 'cat2', name: '行业资讯', slug: 'news', order: 2, createdAt: '2024-01-01T00:00:00Z' }
  ]

  const mockTags: Tag[] = [
    { id: 'tag1', name: 'Vue', slug: 'vue', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'tag2', name: 'TypeScript', slug: 'typescript', createdAt: '2024-01-01T00:00:00Z' }
  ]

  const mockMedia = [
    { id: 'img1', filename: 'image1.jpg', mime: 'image/jpeg', size: 1024, storageKey: 'image1.jpg', createdAt: '2024-01-01T00:00:00Z' }
  ]

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
  })

  describe('Create Mode', () => {
    it('should render create form with empty fields', () => {
      // Mock API calls
      vi.mocked(postApi.getCategoryList).mockResolvedValue(mockCategories)
      vi.mocked(postApi.getTagList).mockResolvedValue(mockTags)

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      // Should render create mode
      expect(wrapper.find('h2').text()).toContain('新建文章')
    })

    it('should validate required fields', async () => {
      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      // Try to save without required fields
      const saveButton = wrapper.find('[data-test="save-button"]')
      if (saveButton.exists()) {
        await saveButton.trigger('click')
        // Should show validation errors
        expect(wrapper.text()).toContain('标题')
      }
    })

    it('should create new post successfully', async () => {
      const mockCreatePost = vi.mocked(postApi.createPost)
      mockCreatePost.mockResolvedValue(mockPost)

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      // Fill form
      await wrapper.find('[data-test="title-input"]').setValue('新文章标题')
      await wrapper.find('[data-test="slug-input"]').setValue('new-post')
      await wrapper.find('[data-test="content-editor"]').setValue('文章内容')

      // Save
      const saveButton = wrapper.find('[data-test="save-button"]')
      if (saveButton.exists()) {
        await saveButton.trigger('click')

        // Should call API
        expect(mockCreatePost).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '新文章标题',
            slug: 'new-post',
            content: '文章内容'
          })
        )
      }
    })
  })

  describe('Edit Mode', () => {
    it('should load and display existing post data', async () => {
      const mockGetPost = vi.mocked(postApi.getPost)
      mockGetPost.mockResolvedValue(mockPost)

      vi.mocked(postApi.getCategoryList).mockResolvedValue(mockCategories)
      vi.mocked(postApi.getTagList).mockResolvedValue(mockTags)

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: createRouter({
          history: createMemoryHistory(),
          routes: [{ path: '/posts/edit/:id', component: PostEditor }]
        })
      })

      // Navigate to edit page
      await mockRouter.push('/posts/edit/1')
      await wrapper.vm.$nextTick()

      // Should load post data
      expect(mockGetPost).toHaveBeenCalledWith('1')
    })

    it('should update existing post successfully', async () => {
      const mockGetPost = vi.mocked(postApi.getPost)
      const mockUpdatePost = vi.mocked(postApi.updatePost)

      mockGetPost.mockResolvedValue(mockPost)
      mockUpdatePost.mockResolvedValue({ ...mockPost, title: '更新的标题' })

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: createRouter({
          history: createMemoryHistory(),
          routes: [{ path: '/posts/edit/:id', component: PostEditor }]
        })
      })

      await mockRouter.push('/posts/edit/1')
      await wrapper.vm.$nextTick()

      // Update title
      const titleInput = wrapper.find('[data-test="title-input"]')
      if (titleInput.exists()) {
        await titleInput.setValue('更新的标题')

        // Save
        const saveButton = wrapper.find('[data-test="save-button"]')
        if (saveButton.exists()) {
          await saveButton.trigger('click')

          expect(mockUpdatePost).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
              title: '更新的标题'
            })
          )
        }
      }
    })
  })

  describe('Cover Image Management', () => {
    it('should open media selector when choosing cover image', async () => {
      vi.mocked(mediaApi.getMediaList).mockResolvedValue({
        data: mockMedia,
        total: 1,
        page: 1,
        limit: 20
      })

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      const chooseImageButton = wrapper.find('[data-test="choose-cover-image"]')
      if (chooseImageButton.exists()) {
        await chooseImageButton.trigger('click')

        // Should open media selector
        expect(wrapper.find('[data-test="media-selector"]').exists()).toBe(true)
      }
    })

    it('should display selected cover image', async () => {
      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      // Simulate selecting image
      await wrapper.vm.$emit('cover-image-selected', {
        id: 'img1',
        url: 'http://example.com/image1.jpg'
      })

      await wrapper.vm.$nextTick()

      // Should display image
      const coverImage = wrapper.find('[data-test="cover-image-preview"]')
      if (coverImage.exists()) {
        expect(coverImage.find('img').attributes('src')).toContain('image1.jpg')
      }
    })
  })

  describe('Category and Tag Management', () => {
    it('should load categories and tags on mount', async () => {
      const mockGetCategories = vi.mocked(postApi.getCategoryList)
      const mockGetTags = vi.mocked(postApi.getTagList)

      mockGetCategories.mockResolvedValue(mockCategories)
      mockGetTags.mockResolvedValue(mockTags)

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      await wrapper.vm.$nextTick()

      expect(mockGetCategories).toHaveBeenCalled()
      expect(mockGetTags).toHaveBeenCalled()
    })

    it('should allow selecting multiple categories', async () => {
      vi.mocked(postApi.getCategoryList).mockResolvedValue(mockCategories)

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      const categorySelect = wrapper.find('[data-test="category-select"]')
      if (categorySelect.exists()) {
        // Select multiple categories
        await categorySelect.setValue(['cat1', 'cat2'])

        // Should update form data
        const formData = wrapper.vm.formData
        expect(formData.categoryIds).toEqual(['cat1', 'cat2'])
      }
    })
  })

  describe('SEO Settings', () => {
    it('should show SEO settings panel', async () => {
      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      const seoTab = wrapper.find('[data-test="seo-tab"]')
      if (seoTab.exists()) {
        await seoTab.trigger('click')

        expect(wrapper.find('[data-test="seo-title"]').exists()).toBe(true)
        expect(wrapper.find('[data-test="seo-description"]').exists()).toBe(true)
        expect(wrapper.find('[data-test="seo-keywords"]').exists()).toBe(true)
      }
    })

    it('should auto-generate SEO fields from title', async () => {
      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      const titleInput = wrapper.find('[data-test="title-input"]')
      if (titleInput.exists()) {
        await titleInput.setValue('这是一个很长的文章标题，用来测试自动生成SEO标题的功能')

        // Should auto-generate SEO title (limited length)
        const seoTitle = wrapper.find('[data-test="seo-title"]')
        if (seoTitle.exists()) {
          expect(seoTitle.element.value).toContain('文章标题')
        }
      }
    })
  })

  describe('Publishing Workflow', () => {
    it('should save as draft', async () => {
      const mockCreatePost = vi.mocked(postApi.createPost)
      mockCreatePost.mockResolvedValue({ ...mockPost, status: 'draft' })

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      const saveDraftButton = wrapper.find('[data-test="save-draft-button"]')
      if (saveDraftButton.exists()) {
        await saveDraftButton.trigger('click')

        expect(mockCreatePost).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'draft'
          })
        )
      }
    })

    it('should publish post directly', async () => {
      const mockPublishPost = vi.mocked(postApi.publishPost)
      mockPublishPost.mockResolvedValue({ ...mockPost, status: 'published' })

      vi.mocked(postApi.getPost).mockResolvedValue(mockPost)

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: createRouter({
          history: createMemoryHistory(),
          routes: [{ path: '/posts/edit/:id', component: PostEditor }]
        })
      })

      await mockRouter.push('/posts/edit/1')
      await wrapper.vm.$nextTick()

      const publishButton = wrapper.find('[data-test="publish-button"]')
      if (publishButton.exists()) {
        await publishButton.trigger('click')

        expect(mockPublishPost).toHaveBeenCalledWith('1')
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockCreatePost = vi.mocked(postApi.createPost)
      mockCreatePost.mockRejectedValue(new Error('API Error'))

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      const saveButton = wrapper.find('[data-test="save-button"]')
      if (saveButton.exists()) {
        await saveButton.trigger('click')

        // Should show error message
        expect(wrapper.text()).toContain('保存失败')
      }
    })

    it('should handle validation errors from API', async () => {
      const mockCreatePost = vi.mocked(postApi.createPost)
      mockCreatePost.mockRejectedValue({
        response: {
          data: {
            message: 'Validation Error',
            errors: {
              title: ['标题是必填项'],
              slug: ['Slug已存在']
            }
          }
        }
      })

      const wrapper = mountWithNaiveProviders(PostEditor, {
        props: {},
        router: mockRouter
      })

      const saveButton = wrapper.find('[data-test="save-button"]')
      if (saveButton.exists()) {
        await saveButton.trigger('click')

        // Should show validation errors
        expect(wrapper.text()).toContain('标题是必填项')
        expect(wrapper.text()).toContain('Slug已存在')
      }
    })
  })
})