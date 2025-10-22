/**
 * Mock API Server for Integration Testing
 * 用于集成测试的Mock API服务器
 */

import type { MenuItem, Page, Media, Post, Category, Tag } from '@/types'

// Mock数据存储
const mockData = {
  // 认证
  users: [
    {
      id: 'user-1',
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // 仅用于测试
      role: 'admin',
      isActive: true
    }
  ],
  tokens: new Map<string, { userId: string; expiresAt: number }>(),

  // 菜单
  menuItems: [
    {
      id: 'menu-1',
      label: '首页',
      type: 'page' as const,
      pageId: 'page-1',
      path: '/',
      icon: 'home',
      order: 0,
      visibility: true,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'menu-2',
      label: '关于我们',
      type: 'page' as const,
      pageId: 'page-2',
      path: '/about',
      icon: 'information-circle',
      order: 1,
      visibility: true,
      createdAt: '2025-01-01T00:00:00Z'
    }
  ] as MenuItem[],

  // 页面
  pages: [
    {
      id: 'page-1',
      menuItemId: 'menu-1',
      title: '首页',
      slug: 'home',
      blocks: [],
      status: 'published' as const,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'page-2',
      menuItemId: 'menu-2',
      title: '关于我们',
      slug: 'about',
      blocks: [],
      status: 'draft' as const,
      createdAt: '2025-01-02T00:00:00Z'
    }
  ] as Page[],

  // 媒体
  media: [
    {
      id: 'media-1',
      filename: 'test-image.jpg',
      mime: 'image/jpeg',
      size: 102400,
      width: 1920,
      height: 1080,
      url: 'https://example.com/uploads/test-image.jpg',
      alt: '测试图片',
      title: '测试图片',
      uploadedBy: 'user-1',
      createdAt: '2025-01-01T00:00:00Z'
    }
  ] as Media[],

  // 文章
  posts: [
    {
      id: 'post-1',
      menuItemId: 'menu-3',
      title: '测试文章',
      slug: 'test-post',
      content: '<p>这是测试文章内容</p>',
      status: 'published' as const,
      authorId: 'user-1',
      authorName: '管理员',
      createdAt: '2025-01-01T00:00:00Z'
    }
  ] as Post[],

  // 分类
  categories: [
    {
      id: 'cat-1',
      name: '技术',
      slug: 'tech',
      order: 0,
      createdAt: '2025-01-01T00:00:00Z'
    }
  ] as Category[],

  // 标签
  tags: [
    {
      id: 'tag-1',
      name: 'Vue',
      slug: 'vue',
      createdAt: '2025-01-01T00:00:00Z'
    }
  ] as Tag[]
}

// Mock API响应
export const mockApiServer = {
  // ==================== Auth API ====================
  login: (username: string, password: string) => {
    const user = mockData.users.find(u => u.username === username && u.password === password)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const token = `mock-token-${Date.now()}`
    const refreshToken = `mock-refresh-${Date.now()}`

    mockData.tokens.set(token, {
      userId: user.id,
      expiresAt: Date.now() + 3600000 // 1 hour
    })

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  },

  logout: () => {
    return { success: true }
  },

  refreshToken: (refreshToken: string) => {
    const newToken = `mock-token-${Date.now()}`
    mockData.tokens.set(newToken, {
      userId: 'user-1',
      expiresAt: Date.now() + 3600000
    })
    return {
      token: newToken,
      refreshToken: `mock-refresh-${Date.now()}`
    }
  },

  getProfile: (token: string) => {
    const tokenData = mockData.tokens.get(token)
    if (!tokenData) {
      throw new Error('Invalid token')
    }

    const user = mockData.users.find(u => u.id === tokenData.userId)
    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  },

  // ==================== Menu API ====================
  getMainMenu: () => {
    return mockData.menuItems.filter(item => !item.parentId)
  },

  getMenuList: () => {
    return mockData.menuItems
  },

  getMenuItem: (id: string) => {
    const item = mockData.menuItems.find(m => m.id === id)
    if (!item) {
      throw new Error('Menu item not found')
    }
    return item
  },

  createMenuItem: (data: Partial<MenuItem>) => {
    const newItem: MenuItem = {
      id: `menu-${Date.now()}`,
      label: data.label!,
      type: data.type!,
      pageId: data.pageId,
      postListConfig: data.postListConfig,
      productConfig: data.productConfig,
      path: data.path!,
      icon: data.icon,
      parentId: data.parentId,
      order: data.order || mockData.menuItems.length,
      visibility: data.visibility !== false,
      createdAt: new Date().toISOString()
    }
    mockData.menuItems.push(newItem)
    return newItem
  },

  updateMenuItem: (id: string, data: Partial<MenuItem>) => {
    const index = mockData.menuItems.findIndex(m => m.id === id)
    if (index === -1) {
      throw new Error('Menu item not found')
    }
    mockData.menuItems[index] = { ...mockData.menuItems[index], ...data }
    return mockData.menuItems[index]
  },

  deleteMenuItem: (id: string) => {
    const index = mockData.menuItems.findIndex(m => m.id === id)
    if (index === -1) {
      throw new Error('Menu item not found')
    }
    mockData.menuItems.splice(index, 1)
  },

  reorderMenuItems: (items: Array<{ id: string; order: number }>) => {
    items.forEach(({ id, order }) => {
      const item = mockData.menuItems.find(m => m.id === id)
      if (item) {
        item.order = order
      }
    })
    // 返回排序后的菜单
    return [...mockData.menuItems].sort((a, b) => a.order - b.order)
  },

  // ==================== Media API ====================
  getMediaList: (params?: any) => {
    let filtered = [...mockData.media]

    if (params?.search) {
      filtered = filtered.filter(m =>
        m.filename.toLowerCase().includes(params.search.toLowerCase())
      )
    }

    if (params?.mime) {
      filtered = filtered.filter(m => m.mime.startsWith(params.mime))
    }

    const page = params?.page || 1
    const limit = params?.limit || 20
    const start = (page - 1) * limit
    const end = start + limit

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit
    }
  },

  getMedia: (id: string) => {
    const media = mockData.media.find(m => m.id === id)
    if (!media) {
      throw new Error('Media not found')
    }
    return media
  },

  uploadMedia: (file: any) => {
    const newMedia: Media = {
      id: `media-${Date.now()}`,
      filename: file.name || 'uploaded-file.jpg',
      mime: file.type || 'image/jpeg',
      size: file.size || 102400,
      width: 1920,
      height: 1080,
      url: `https://example.com/uploads/${file.name}`,
      uploadedBy: 'user-1',
      createdAt: new Date().toISOString()
    }
    mockData.media.push(newMedia)
    return newMedia
  },

  updateMedia: (id: string, data: Partial<Media>) => {
    const index = mockData.media.findIndex(m => m.id === id)
    if (index === -1) {
      throw new Error('Media not found')
    }
    mockData.media[index] = { ...mockData.media[index], ...data }
    return mockData.media[index]
  },

  deleteMedia: (id: string) => {
    const index = mockData.media.findIndex(m => m.id === id)
    if (index === -1) {
      throw new Error('Media not found')
    }
    mockData.media.splice(index, 1)
  },

  // ==================== Page API ====================
  getPageList: (params?: any) => {
    let filtered = [...mockData.pages]

    if (params?.search) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(params.search.toLowerCase())
      )
    }

    if (params?.status) {
      filtered = filtered.filter(p => p.status === params.status)
    }

    const page = params?.page || 1
    const limit = params?.limit || 20
    const start = (page - 1) * limit
    const end = start + limit

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit
    }
  },

  getPage: (id: string) => {
    const page = mockData.pages.find(p => p.id === id)
    if (!page) {
      throw new Error('Page not found')
    }
    return page
  },

  createPage: (data: Partial<Page>) => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      menuItemId: data.menuItemId!,
      title: data.title!,
      slug: data.slug!,
      blocks: data.blocks || [],
      status: data.status || 'draft',
      createdAt: new Date().toISOString()
    }
    mockData.pages.push(newPage)
    return newPage
  },

  updatePage: (id: string, data: Partial<Page>) => {
    const index = mockData.pages.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Page not found')
    }
    mockData.pages[index] = { ...mockData.pages[index], ...data }
    return mockData.pages[index]
  },

  deletePage: (id: string) => {
    const index = mockData.pages.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Page not found')
    }
    mockData.pages.splice(index, 1)
  },

  publishPage: (id: string) => {
    const page = mockData.pages.find(p => p.id === id)
    if (!page) {
      throw new Error('Page not found')
    }
    page.status = 'published'
    page.publishedAt = new Date().toISOString()
    return page
  },

  unpublishPage: (id: string) => {
    const page = mockData.pages.find(p => p.id === id)
    if (!page) {
      throw new Error('Page not found')
    }
    page.status = 'draft'
    page.publishedAt = undefined
    return page
  },

  // ==================== Post API ====================
  getPostList: (params?: any) => {
    let filtered = [...mockData.posts]

    if (params?.search) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(params.search.toLowerCase())
      )
    }

    if (params?.status) {
      filtered = filtered.filter(p => p.status === params.status)
    }

    const page = params?.page || 1
    const limit = params?.limit || 20
    const start = (page - 1) * limit
    const end = start + limit

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit
    }
  },

  getCategoryList: () => {
    return mockData.categories
  },

  createCategory: (data: Partial<Category>) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: data.name!,
      slug: data.slug!,
      order: data.order || mockData.categories.length,
      createdAt: new Date().toISOString()
    }
    mockData.categories.push(newCategory)
    return newCategory
  },

  deleteCategory: (id: string) => {
    const index = mockData.categories.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Category not found')
    }
    mockData.categories.splice(index, 1)
  },

  getTagList: () => {
    return mockData.tags
  },

  createTag: (data: Partial<Tag>) => {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: data.name!,
      slug: data.slug!,
      createdAt: new Date().toISOString()
    }
    mockData.tags.push(newTag)
    return newTag
  },

  deleteTag: (id: string) => {
    const index = mockData.tags.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error('Tag not found')
    }
    mockData.tags.splice(index, 1)
  },

  // 重置数据
  reset: () => {
    mockData.menuItems.length = 0
    mockData.pages.length = 0
    mockData.media.length = 0
    mockData.posts.length = 0
    mockData.categories.length = 0
    mockData.tags.length = 0
    mockData.tokens.clear()
  }
}

export default mockApiServer
