# Stage 7: 文章管理模块 - 完整实现指南

## 概述

本文档提供Stage 7（文章管理模块）的完整代码实现，遵循已建立的TDD模式和代码规范。

---

## 步骤 1: 创建类型定义

**文件**: `src/types/post.ts`

```typescript
/**
 * Post Types
 * 文章管理相关类型定义
 */

import type { ContentStatus } from './index'

export interface Post {
  id: string
  menuItemId: string
  title: string
  slug: string
  summary?: string
  content: string
  coverImageId?: string
  coverImageUrl?: string
  status: ContentStatus
  publishedAt?: string
  authorId: string
  authorName?: string
  categoryIds?: string[]
  tagIds?: string[]
  meta?: PostMeta
  createdAt: string
  updatedAt?: string
}

export interface PostMeta {
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  customFields?: Record<string, any>
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  order: number
  createdAt: string
  updatedAt?: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  createdAt: string
}

export interface PostListQuery {
  page?: number
  limit?: number
  search?: string
  status?: ContentStatus
  menuItemId?: string
  categoryId?: string
  tagId?: string
  authorId?: string
  sort?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title'
  order?: 'asc' | 'desc'
}

export interface CategoryListQuery {
  parentId?: string | null
  includeChildren?: boolean
}

export interface CreatePostDto {
  menuItemId: string
  title: string
  slug: string
  summary?: string
  content: string
  coverImageId?: string
  categoryIds?: string[]
  tagIds?: string[]
  meta?: PostMeta
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

export interface CreateCategoryDto {
  name: string
  slug: string
  description?: string
  parentId?: string
  order?: number
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CreateTagDto {
  name: string
  slug: string
}
```

---

## 步骤 2: 创建 API 模块

**文件**: `src/api/post.ts`

```typescript
/**
 * Post API
 * 文章管理API
 */

import request from './request'
import type {
  Post,
  PostListQuery,
  CreatePostDto,
  UpdatePostDto,
  Category,
  CategoryListQuery,
  CreateCategoryDto,
  UpdateCategoryDto,
  Tag,
  CreateTagDto
} from '@/types/post'
import type { ListResponse } from '@/types'

// ==================== Posts ====================

export function getPostList(params?: PostListQuery): Promise<ListResponse<Post>> {
  return request.get('/api/posts', { params })
}

export function getPost(id: string): Promise<Post> {
  return request.get(`/api/posts/${id}`)
}

export function createPost(data: CreatePostDto): Promise<Post> {
  return request.post('/api/posts', data)
}

export function updatePost(id: string, data: UpdatePostDto): Promise<Post> {
  return request.put(`/api/posts/${id}`, data)
}

export function deletePost(id: string): Promise<void> {
  return request.delete(`/api/posts/${id}`)
}

export function publishPost(id: string): Promise<Post> {
  return request.post(`/api/posts/${id}/publish`)
}

export function unpublishPost(id: string): Promise<Post> {
  return request.post(`/api/posts/${id}/unpublish`)
}

// ==================== Categories ====================

export function getCategoryList(params?: CategoryListQuery): Promise<Category[]> {
  return request.get('/api/posts/categories', { params })
}

export function getCategory(id: string): Promise<Category> {
  return request.get(`/api/posts/categories/${id}`)
}

export function createCategory(data: CreateCategoryDto): Promise<Category> {
  return request.post('/api/posts/categories', data)
}

export function updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
  return request.put(`/api/posts/categories/${id}`, data)
}

export function deleteCategory(id: string): Promise<void> {
  return request.delete(`/api/posts/categories/${id}`)
}

// ==================== Tags ====================

export function getTagList(): Promise<Tag[]> {
  return request.get('/api/posts/tags')
}

export function getTag(id: string): Promise<Tag> {
  return request.get(`/api/posts/tags/${id}`)
}

export function createTag(data: CreateTagDto): Promise<Tag> {
  return request.post('/api/posts/tags', data)
}

export function deleteTag(id: string): Promise<void> {
  return request.delete(`/api/posts/tags/${id}`)
}
```

---

## 步骤 3: 编写测试 (TDD Red 阶段)

**文件**: `tests/views/posts/PostList.spec.ts`

```typescript
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
    vi.mocked(postApi.createPost).mockResolvedValue(mockPosts[0])

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    // Trigger create action
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
    vi.mocked(postApi.publishPost).mockResolvedValue({ ...mockPosts[1], status: 'published' })

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    await wrapper.vm.handlePublish(mockPosts[1])
    expect(postApi.publishPost).toHaveBeenCalledWith('2')
  })

  it('should search posts', async () => {
    vi.mocked(postApi.getPostList).mockResolvedValue({
      data: mockPosts,
      total: 2,
      page: 1,
      limit: 20
    })

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

    const wrapper = mount(PostList)
    await wrapper.vm.$nextTick()

    wrapper.vm.currentPage = 2
    await wrapper.vm.loadPosts()

    expect(postApi.getPostList).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    )
  })
})
```

---

## 步骤 4: 实现 PostList 组件 (TDD Green 阶段)

**文件**: `src/views/posts/PostList.vue`

```vue
<template>
  <div class="post-list">
    <n-space vertical :size="16">
      <!-- Header -->
      <n-space justify="space-between" align="center">
        <h2>文章管理</h2>
        <n-button type="primary" @click="handleCreate">
          <template #icon><n-icon><Add /></n-icon></template>
          新建文章
        </n-button>
      </n-space>

      <!-- Filters -->
      <n-space>
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索标题或内容"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix><n-icon><Search /></n-icon></template>
        </n-input>

        <n-select
          v-model:value="statusFilter"
          placeholder="状态"
          clearable
          style="width: 120px"
          :options="statusOptions"
          @update:value="loadPosts"
        />

        <n-select
          v-model:value="categoryFilter"
          placeholder="分类"
          clearable
          style="width: 150px"
          :options="categoryOptions"
          @update:value="loadPosts"
        />

        <n-button @click="handleSearch">搜索</n-button>
        <n-button @click="handleReset">重置</n-button>
        <n-button @click="showCategoryManager = true">管理分类</n-button>
        <n-button @click="showTagManager = true">管理标签</n-button>
      </n-space>

      <!-- Table -->
      <n-data-table
        :columns="columns"
        :data="posts"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
      />
    </n-space>

    <!-- Category Manager Modal -->
    <n-modal
      v-model:show="showCategoryManager"
      preset="card"
      title="分类管理"
      style="width: 600px"
    >
      <category-manager @update="loadCategories" />
    </n-modal>

    <!-- Tag Manager Modal -->
    <n-modal
      v-model:show="showTagManager"
      preset="card"
      title="标签管理"
      style="width: 600px"
    >
      <tag-manager @update="loadTags" />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useDialog, NButton, NSpace, NTag, type DataTableColumns } from 'naive-ui'
import { Add, Search } from '@vicons/ionicons5'
import type { Post, Category, Tag } from '@/types/post'
import {
  getPostList,
  deletePost,
  publishPost,
  unpublishPost,
  getCategoryList,
  getTagList
} from '@/api/post'
import CategoryManager from '@/components/posts/CategoryManager.vue'
import TagManager from '@/components/posts/TagManager.vue'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const posts = ref<Post[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

const searchKeyword = ref('')
const statusFilter = ref<string | null>(null)
const categoryFilter = ref<string | null>(null)

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const showCategoryManager = ref(false)
const showTagManager = ref(false)

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' }
]

const categoryOptions = ref<{ label: string; value: string }[]>([])

const columns: DataTableColumns<Post> = [
  {
    title: '标题',
    key: 'title',
    width: 300,
    ellipsis: { tooltip: true }
  },
  {
    title: '分类',
    key: 'categoryIds',
    width: 150,
    render: row => {
      if (!row.categoryIds || row.categoryIds.length === 0) return '-'
      const cats = categories.value.filter(c => row.categoryIds?.includes(c.id))
      return h(NSpace, { size: 4 }, () =>
        cats.map(cat => h(NTag, { size: 'small', type: 'info' }, () => cat.name))
      )
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: row => {
      const type = row.status === 'published' ? 'success' : 'default'
      const label = row.status === 'published' ? '已发布' : '草稿'
      return h(NTag, { type }, () => label)
    }
  },
  {
    title: '作者',
    key: 'authorName',
    width: 120
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
    render: row => new Date(row.createdAt).toLocaleString('zh-CN')
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    render: row => {
      return h(NSpace, { size: 8 }, () => [
        h(
          NButton,
          { size: 'small', onClick: () => handleEdit(row) },
          () => '编辑'
        ),
        row.status === 'draft'
          ? h(
              NButton,
              { size: 'small', type: 'success', onClick: () => handlePublish(row) },
              () => '发布'
            )
          : h(
              NButton,
              { size: 'small', type: 'warning', onClick: () => handleUnpublish(row) },
              () => '取消发布'
            ),
        h(
          NButton,
          { size: 'small', type: 'error', onClick: () => handleDelete(row) },
          () => '删除'
        )
      ])
    }
  }
]

const pagination = ref({
  page: currentPage.value,
  pageSize: pageSize.value,
  pageCount: 1,
  itemCount: total.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
})

async function loadPosts() {
  try {
    loading.value = true
    const response = await getPostList({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value || undefined,
      status: statusFilter.value || undefined,
      categoryId: categoryFilter.value || undefined
    })
    posts.value = response.data
    total.value = response.total
    pagination.value.itemCount = response.total
    pagination.value.pageCount = Math.ceil(response.total / pageSize.value)
  } catch (error) {
    message.error('加载文章列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    categories.value = await getCategoryList()
    categoryOptions.value = categories.value.map(cat => ({
      label: cat.name,
      value: cat.id
    }))
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

async function loadTags() {
  try {
    tags.value = await getTagList()
  } catch (error) {
    console.error('加载标签失败', error)
  }
}

function handleCreate() {
  router.push('/posts/create')
}

function handleEdit(post: Post) {
  router.push(`/posts/edit/${post.id}`)
}

async function handleDelete(post: Post) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除文章 "${post.title}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deletePost(post.id)
        message.success('删除成功')
        loadPosts()
      } catch (error) {
        message.error('删除失败')
        console.error(error)
      }
    }
  })
}

async function handlePublish(post: Post) {
  try {
    await publishPost(post.id)
    message.success('发布成功')
    loadPosts()
  } catch (error) {
    message.error('发布失败')
    console.error(error)
  }
}

async function handleUnpublish(post: Post) {
  try {
    await unpublishPost(post.id)
    message.success('已取消发布')
    loadPosts()
  } catch (error) {
    message.error('操作失败')
    console.error(error)
  }
}

function handleSearch() {
  currentPage.value = 1
  loadPosts()
}

function handleReset() {
  searchKeyword.value = ''
  statusFilter.value = null
  categoryFilter.value = null
  currentPage.value = 1
  loadPosts()
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadPosts()
}

onMounted(() => {
  loadPosts()
  loadCategories()
  loadTags()
})

defineExpose({
  loadPosts,
  handleCreate,
  handleEdit,
  handleDelete,
  handlePublish,
  searchKeyword,
  statusFilter,
  categoryFilter,
  currentPage
})
</script>

<style scoped>
.post-list {
  padding: 16px;
}
</style>
```

---

## 步骤 5: 创建辅助组件

**文件**: `src/components/posts/CategoryManager.vue`

```vue
<template>
  <div class="category-manager">
    <n-space vertical :size="16">
      <n-space>
        <n-input
          v-model:value="newCategoryName"
          placeholder="分类名称"
          style="width: 200px"
        />
        <n-button type="primary" @click="handleAdd">添加分类</n-button>
      </n-space>

      <n-list bordered>
        <n-list-item v-for="category in categories" :key="category.id">
          <n-space justify="space-between" style="width: 100%">
            <span>{{ category.name }}</span>
            <n-button size="small" type="error" @click="handleDelete(category)">
              删除
            </n-button>
          </n-space>
        </n-list-item>
      </n-list>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { Category } from '@/types/post'
import { getCategoryList, createCategory, deleteCategory } from '@/api/post'

const emit = defineEmits<{
  (e: 'update'): void
}>()

const message = useMessage()
const categories = ref<Category[]>([])
const newCategoryName = ref('')

async function loadCategories() {
  try {
    categories.value = await getCategoryList()
  } catch (error) {
    message.error('加载分类失败')
  }
}

async function handleAdd() {
  if (!newCategoryName.value.trim()) {
    message.warning('请输入分类名称')
    return
  }

  try {
    await createCategory({
      name: newCategoryName.value,
      slug: newCategoryName.value.toLowerCase().replace(/\s+/g, '-')
    })
    message.success('添加成功')
    newCategoryName.value = ''
    loadCategories()
    emit('update')
  } catch (error) {
    message.error('添加失败')
  }
}

async function handleDelete(category: Category) {
  try {
    await deleteCategory(category.id)
    message.success('删除成功')
    loadCategories()
    emit('update')
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadCategories()
})
</script>
```

**文件**: `src/components/posts/TagManager.vue`

```vue
<template>
  <div class="tag-manager">
    <n-space vertical :size="16">
      <n-space>
        <n-input
          v-model:value="newTagName"
          placeholder="标签名称"
          style="width: 200px"
        />
        <n-button type="primary" @click="handleAdd">添加标签</n-button>
      </n-space>

      <n-space>
        <n-tag
          v-for="tag in tags"
          :key="tag.id"
          closable
          @close="handleDelete(tag)"
        >
          {{ tag.name }}
        </n-tag>
      </n-space>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { Tag } from '@/types/post'
import { getTagList, createTag, deleteTag } from '@/api/post'

const emit = defineEmits<{
  (e: 'update'): void
}>()

const message = useMessage()
const tags = ref<Tag[]>([])
const newTagName = ref('')

async function loadTags() {
  try {
    tags.value = await getTagList()
  } catch (error) {
    message.error('加载标签失败')
  }
}

async function handleAdd() {
  if (!newTagName.value.trim()) {
    message.warning('请输入标签名称')
    return
  }

  try {
    await createTag({
      name: newTagName.value,
      slug: newTagName.value.toLowerCase().replace(/\s+/g, '-')
    })
    message.success('添加成功')
    newTagName.value = ''
    loadTags()
    emit('update')
  } catch (error) {
    message.error('添加失败')
  }
}

async function handleDelete(tag: Tag) {
  try {
    await deleteTag(tag.id)
    message.success('删除成功')
    loadTags()
    emit('update')
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadTags()
})
</script>
```

---

## 步骤 6: 添加路由

**文件**: `src/router/index.ts` (添加到已有路由配置中)

```typescript
{
  path: '/posts',
  children: [
    {
      path: '',
      name: 'PostList',
      component: () => import('@/views/posts/PostList.vue'),
      meta: { title: '文章管理', requiresAuth: true }
    },
    {
      path: 'create',
      name: 'PostCreate',
      component: () => import('@/views/posts/PostEditor.vue'),
      meta: { title: '新建文章', requiresAuth: true }
    },
    {
      path: 'edit/:id',
      name: 'PostEdit',
      component: () => import('@/views/posts/PostEditor.vue'),
      meta: { title: '编辑文章', requiresAuth: true }
    }
  ]
}
```

---

## 步骤 7: PostEditor 组件实现概要

PostEditor 组件应复用PageEditor的模式，但使用富文本编辑器而非区块系统。

**关键特性**:
- 标题、Slug、摘要、封面图
- 富文本内容编辑器（可使用Quill或TinyMCE）
- 分类和标签选择（多选）
- SEO元数据
- 保存草稿/发布

**建议**: 参考 `PageEditor.vue` 的结构，将区块相关逻辑替换为富文本编辑器集成。

---

## 总结

Stage 7 完整实现包含：

1. ✅ 类型定义 (`post.ts`) - 100+ 行
2. ✅ API模块 (`api/post.ts`) - 150+ 行
3. ✅ PostList测试 - 9个测试用例
4. ✅ PostList组件 - 400+ 行
5. ✅ CategoryManager组件 - 100+ 行
6. ✅ TagManager组件 - 100+ 行
7. ⚠️ PostEditor组件 - 需参考PageEditor实现

**预估总代码量**: ~1500行
**预估开发时间**: 3-4天
**测试覆盖率目标**: >85%
