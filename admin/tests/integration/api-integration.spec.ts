/**
 * API Integration Tests
 * API集成测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mockApiServer } from '../mocks/api-server'

describe('API Integration Tests', () => {
  beforeEach(() => {
    mockApiServer.reset()
  })

  describe('Authentication Flow', () => {
    it('should complete login flow', () => {
      // 1. 登录
      const loginResult = mockApiServer.login('admin', 'admin123')

      expect(loginResult).toHaveProperty('token')
      expect(loginResult).toHaveProperty('refreshToken')
      expect(loginResult.user).toHaveProperty('id')
      expect(loginResult.user.username).toBe('admin')
      expect(loginResult.user.role).toBe('admin')

      // 2. 获取用户信息
      const profile = mockApiServer.getProfile(loginResult.token)

      expect(profile.id).toBe(loginResult.user.id)
      expect(profile.username).toBe('admin')

      // 3. 登出
      const logoutResult = mockApiServer.logout()

      expect(logoutResult.success).toBe(true)
    })

    it('should handle login failure', () => {
      expect(() => {
        mockApiServer.login('admin', 'wrongpassword')
      }).toThrow('Invalid credentials')
    })

    it('should refresh token', async () => {
      const loginResult = mockApiServer.login('admin', 'admin123')

      // 等待一小段时间确保token不同
      await new Promise(resolve => setTimeout(resolve, 10))

      const refreshResult = mockApiServer.refreshToken(loginResult.refreshToken)

      expect(refreshResult).toHaveProperty('token')
      expect(refreshResult).toHaveProperty('refreshToken')
      expect(refreshResult.token).not.toBe(loginResult.token)
    })
  })

  describe('Menu Management Flow', () => {
    it('should complete menu CRUD operations', () => {
      // 1. 创建菜单项
      const newMenuItem = mockApiServer.createMenuItem({
        label: '新菜单',
        type: 'page',
        pageId: 'page-test',
        path: '/test',
        icon: 'star',
        order: 10,
        visibility: true
      })

      expect(newMenuItem).toHaveProperty('id')
      expect(newMenuItem.label).toBe('新菜单')
      expect(newMenuItem.type).toBe('page')

      // 2. 获取菜单列表
      const menuList = mockApiServer.getMenuList()

      expect(menuList.length).toBeGreaterThan(0)
      expect(menuList.some(m => m.id === newMenuItem.id)).toBe(true)

      // 3. 更新菜单项
      const updatedMenuItem = mockApiServer.updateMenuItem(newMenuItem.id, {
        label: '更新后的菜单'
      })

      expect(updatedMenuItem.label).toBe('更新后的菜单')

      // 4. 删除菜单项
      mockApiServer.deleteMenuItem(newMenuItem.id)

      const menuListAfterDelete = mockApiServer.getMenuList()
      expect(menuListAfterDelete.some(m => m.id === newMenuItem.id)).toBe(false)
    })

    it('should get main menu items', () => {
      const mainMenu = mockApiServer.getMainMenu()

      expect(Array.isArray(mainMenu)).toBe(true)
      expect(mainMenu.every(item => !item.parentId)).toBe(true)
    })

    it('should reorder menu items', () => {
      const menuList = mockApiServer.getMenuList()

      if (menuList.length === 0) {
        // 如果没有菜单，先创建一些
        mockApiServer.createMenuItem({ label: 'Test 1', type: 'page', pageId: 'p1', path: '/t1', order: 0 })
        mockApiServer.createMenuItem({ label: 'Test 2', type: 'page', pageId: 'p2', path: '/t2', order: 1 })
      }

      const currentMenuList = mockApiServer.getMenuList()
      const reorderData = currentMenuList.map((item, index) => ({
        id: item.id,
        order: currentMenuList.length - index - 1 // 反向排序
      }))

      const reordered = mockApiServer.reorderMenuItems(reorderData)

      expect(reordered.length).toBeGreaterThan(0)
      // After sorting, the first item should have the lowest order (0)
      expect(reordered[0].order).toBe(0)
      // The last item should have the highest order
      expect(reordered[reordered.length - 1].order).toBe(currentMenuList.length - 1)
    })
  })

  describe('Media Management Flow', () => {
    it('should complete media CRUD operations', () => {
      // 1. 上传媒体
      const uploadedMedia = mockApiServer.uploadMedia({
        name: 'test-upload.jpg',
        type: 'image/jpeg',
        size: 204800
      })

      expect(uploadedMedia).toHaveProperty('id')
      expect(uploadedMedia.filename).toBe('test-upload.jpg')
      expect(uploadedMedia.mime).toBe('image/jpeg')

      // 2. 获取媒体列表
      const mediaList = mockApiServer.getMediaList()

      expect(mediaList.data.length).toBeGreaterThan(0)
      expect(mediaList.data.some(m => m.id === uploadedMedia.id)).toBe(true)

      // 3. 更新媒体
      const updatedMedia = mockApiServer.updateMedia(uploadedMedia.id, {
        alt: '测试图片Alt',
        title: '测试图片标题'
      })

      expect(updatedMedia.alt).toBe('测试图片Alt')
      expect(updatedMedia.title).toBe('测试图片标题')

      // 4. 删除媒体
      mockApiServer.deleteMedia(uploadedMedia.id)

      const mediaListAfterDelete = mockApiServer.getMediaList()
      expect(mediaListAfterDelete.data.some(m => m.id === uploadedMedia.id)).toBe(false)
    })

    it('should filter media by search', () => {
      mockApiServer.uploadMedia({ name: 'image-one.jpg', type: 'image/jpeg', size: 100000 })
      mockApiServer.uploadMedia({ name: 'image-two.jpg', type: 'image/jpeg', size: 100000 })
      mockApiServer.uploadMedia({ name: 'document.pdf', type: 'application/pdf', size: 50000 })

      const searchResult = mockApiServer.getMediaList({ search: 'image' })

      expect(searchResult.data.length).toBe(2)
      expect(searchResult.data.every(m => m.filename.includes('image'))).toBe(true)
    })

    it('should filter media by mime type', () => {
      mockApiServer.uploadMedia({ name: 'image.jpg', type: 'image/jpeg', size: 100000 })
      mockApiServer.uploadMedia({ name: 'document.pdf', type: 'application/pdf', size: 50000 })

      const imagesOnly = mockApiServer.getMediaList({ mime: 'image/' })

      expect(imagesOnly.data.every(m => m.mime.startsWith('image/'))).toBe(true)
    })

    it('should paginate media list', async () => {
      // 添加多个媒体，确保每个有唯一ID
      for (let i = 0; i < 25; i++) {
        await new Promise(resolve => setTimeout(resolve, 1)) // 确保每个media有不同的时间戳ID
        mockApiServer.uploadMedia({
          name: `image-${i}.jpg`,
          type: 'image/jpeg',
          size: 100000
        })
      }

      const page1 = mockApiServer.getMediaList({ page: 1, limit: 10 })
      const page2 = mockApiServer.getMediaList({ page: 2, limit: 10 })

      expect(page1.data.length).toBe(10)
      expect(page2.data.length).toBe(10)

      // 验证分页数据不重复
      const page1Ids = page1.data.map(m => m.id)
      const page2Ids = page2.data.map(m => m.id)
      const overlap = page1Ids.filter(id => page2Ids.includes(id))
      expect(overlap.length).toBe(0)

      expect(page1.total).toBeGreaterThanOrEqual(25)
    })
  })

  describe('Page Management Flow', () => {
    it('should complete page CRUD operations', () => {
      // 1. 创建页面
      const newPage = mockApiServer.createPage({
        menuItemId: 'menu-1',
        title: '测试页面',
        slug: 'test-page',
        blocks: [
          {
            id: 'block-1',
            type: 'hero',
            props: { title: 'Hero标题' },
            order: 0,
            visibility: true
          }
        ],
        status: 'draft'
      })

      expect(newPage).toHaveProperty('id')
      expect(newPage.title).toBe('测试页面')
      expect(newPage.blocks).toHaveLength(1)

      // 2. 获取页面列表
      const pageList = mockApiServer.getPageList()

      expect(pageList.data.some(p => p.id === newPage.id)).toBe(true)

      // 3. 更新页面
      const updatedPage = mockApiServer.updatePage(newPage.id, {
        title: '更新后的页面'
      })

      expect(updatedPage.title).toBe('更新后的页面')

      // 4. 发布页面
      const publishedPage = mockApiServer.publishPage(newPage.id)

      expect(publishedPage.status).toBe('published')
      expect(publishedPage.publishedAt).toBeTruthy()

      // 5. 取消发布
      const unpublishedPage = mockApiServer.unpublishPage(newPage.id)

      expect(unpublishedPage.status).toBe('draft')

      // 6. 删除页面
      mockApiServer.deletePage(newPage.id)

      const pageListAfterDelete = mockApiServer.getPageList()
      expect(pageListAfterDelete.data.some(p => p.id === newPage.id)).toBe(false)
    })

    it('should filter pages by status', () => {
      mockApiServer.createPage({
        menuItemId: 'menu-1',
        title: '草稿页面',
        slug: 'draft-page',
        blocks: [],
        status: 'draft'
      })

      mockApiServer.createPage({
        menuItemId: 'menu-1',
        title: '已发布页面',
        slug: 'published-page',
        blocks: [],
        status: 'published'
      })

      const draftPages = mockApiServer.getPageList({ status: 'draft' })
      const publishedPages = mockApiServer.getPageList({ status: 'published' })

      expect(draftPages.data.every(p => p.status === 'draft')).toBe(true)
      expect(publishedPages.data.every(p => p.status === 'published')).toBe(true)
    })

    it('should search pages by title', () => {
      mockApiServer.createPage({
        menuItemId: 'menu-1',
        title: '关于我们',
        slug: 'about',
        blocks: []
      })

      const searchResult = mockApiServer.getPageList({ search: '关于' })

      expect(searchResult.data.length).toBeGreaterThan(0)
      expect(searchResult.data.some(p => p.title.includes('关于'))).toBe(true)
    })
  })

  describe('Post Management Flow', () => {
    it('should complete post CRUD with categories and tags', () => {
      // 1. 创建分类
      const category = mockApiServer.createCategory({
        name: '技术文章',
        slug: 'tech-articles'
      })

      expect(category).toHaveProperty('id')
      expect(category.name).toBe('技术文章')

      // 2. 创建标签
      const tag = mockApiServer.createTag({
        name: 'JavaScript',
        slug: 'javascript'
      })

      expect(tag).toHaveProperty('id')
      expect(tag.name).toBe('JavaScript')

      // 3. 获取分类和标签列表
      const categories = mockApiServer.getCategoryList()
      const tags = mockApiServer.getTagList()

      expect(categories.some(c => c.id === category.id)).toBe(true)
      expect(tags.some(t => t.id === tag.id)).toBe(true)

      // 4. 删除分类和标签
      mockApiServer.deleteCategory(category.id)
      mockApiServer.deleteTag(tag.id)

      const categoriesAfterDelete = mockApiServer.getCategoryList()
      const tagsAfterDelete = mockApiServer.getTagList()

      expect(categoriesAfterDelete.some(c => c.id === category.id)).toBe(false)
      expect(tagsAfterDelete.some(t => t.id === tag.id)).toBe(false)
    })

    it('should get post list with filters', () => {
      const postList = mockApiServer.getPostList()

      expect(Array.isArray(postList.data)).toBe(true)
      expect(postList).toHaveProperty('total')
      expect(postList).toHaveProperty('page')
      expect(postList).toHaveProperty('limit')
    })
  })

  describe('Complete User Journey', () => {
    it('should simulate complete CMS workflow', () => {
      // 1. 用户登录
      const loginResult = mockApiServer.login('admin', 'admin123')
      expect(loginResult.token).toBeTruthy()

      // 2. 创建菜单项
      const menuItem = mockApiServer.createMenuItem({
        label: '产品介绍',
        type: 'page',
        pageId: 'page-products',
        path: '/products',
        icon: 'cube',
        order: 5,
        visibility: true
      })
      expect(menuItem.id).toBeTruthy()

      // 3. 上传媒体
      const media = mockApiServer.uploadMedia({
        name: 'product-hero.jpg',
        type: 'image/jpeg',
        size: 307200
      })
      expect(media.url).toBeTruthy()

      // 4. 创建页面
      const page = mockApiServer.createPage({
        menuItemId: menuItem.id,
        title: '产品介绍',
        slug: 'products',
        blocks: [
          {
            id: 'block-hero',
            type: 'hero',
            props: {
              title: '我们的产品',
              subtitle: '创新解决方案',
              backgroundImage: media.url
            },
            order: 0,
            visibility: true
          },
          {
            id: 'block-features',
            type: 'features',
            props: {
              items: [
                { icon: 'rocket', title: '高性能', description: '快速响应' },
                { icon: 'shield', title: '安全可靠', description: '数据安全' }
              ]
            },
            order: 1,
            visibility: true
          }
        ],
        status: 'draft'
      })
      expect(page.blocks).toHaveLength(2)

      // 5. 发布页面
      const publishedPage = mockApiServer.publishPage(page.id)
      expect(publishedPage.status).toBe('published')

      // 6. 验证工作流完成
      const mainMenu = mockApiServer.getMainMenu()
      expect(mainMenu.some(m => m.id === menuItem.id)).toBe(true)

      const mediaList = mockApiServer.getMediaList()
      expect(mediaList.data.some(m => m.id === media.id)).toBe(true)

      const pageDetails = mockApiServer.getPage(page.id)
      expect(pageDetails.status).toBe('published')
    })
  })
})
