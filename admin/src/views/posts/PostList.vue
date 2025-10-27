<template>
  <div class="post-list">
    <div class="post-list-container">
      <!-- Left Sidebar: Category Tree -->
      <div class="category-sidebar">
        <div class="category-header">
          <h3>文章分类</h3>
          <n-button text @click="showCategoryManager = true">
            <template #icon><n-icon><Settings /></n-icon></template>
            管理
          </n-button>
        </div>
        <div class="category-tree-container">
          <n-alert v-if="!menuId" type="warning" style="margin-bottom: 12px" :bordered="false">
            请从左侧菜单点击相应栏目进入，以查看对应的分类
          </n-alert>
          <n-tree
            block-line
            :data="categoryTreeData"
            :selected-keys="selectedKeys"
            :expanded-keys="expandedKeys"
            @update:selected-keys="handleCategorySelect"
            @update:expanded-keys="handleExpandedKeysChange"
          />
        </div>
      </div>

      <!-- Right Content Area -->
      <div class="content-area">
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
      </div>
    </div>

    <!-- Category Manager Modal -->
    <n-modal
      v-model:show="showCategoryManager"
      preset="card"
      title="分类管理"
      style="width: 90%; max-width: 1200px"
    >
      <category-manager :menu-item-id="menuId" @update="loadCategories" />
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
import { ref, onMounted, h, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage, useDialog, NButton, NSpace, NTag, NAlert, type DataTableColumns, type TreeOption } from 'naive-ui'
import { Add, Search, Settings } from '@vicons/ionicons5'
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
const route = useRoute()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const posts = ref<Post[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

// Tree state
const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])

const searchKeyword = ref('')
const statusFilter = ref<string | null>(null)
const categoryFilter = ref<string | null>(null)

// 从 URL 查询参数获取 menuId
const menuId = computed(() => route.query.menuId as string | undefined)

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const showCategoryManager = ref(false)
const showTagManager = ref(false)

const statusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' }
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
      const status = row.status?.toUpperCase()
      const type = status === 'PUBLISHED' ? 'success' : 'default'
      const label = status === 'PUBLISHED' ? '已发布' : '草稿'
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
        row.status?.toUpperCase() === 'DRAFT'
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

// Build tree structure from flat categories
const categoryTreeData = computed<TreeOption[]>(() => {
  const categoryMap = new Map<string, TreeOption>()
  const roots: TreeOption[] = []

  // Add "全部" option at the top
  roots.push({
    key: 'all',
    label: '全部',
    isLeaf: true
  })

  // First pass: create map
  categories.value.forEach((cat) => {
    const count = cat.postsCount || 0
    categoryMap.set(cat.id, {
      key: cat.id,
      label: `${cat.name} ${count > 0 ? `(${count})` : ''}`,
      children: []
    })
  })

  // Second pass: build tree
  categories.value.forEach((cat) => {
    const node = categoryMap.get(cat.id)!
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId)
      if (parent) {
        parent.children!.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  return roots
})

async function loadPosts() {
  try {
    loading.value = true
    const response = await getPostList({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value || undefined,
      status: statusFilter.value || undefined,
      categoryId: categoryFilter.value || undefined,
      menuItemId: menuId.value || undefined
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
    // 只加载当前菜单项的分类
    const params = menuId.value ? { menuItemId: menuId.value } : {}
    categories.value = await getCategoryList(params)
    categoryOptions.value = categories.value.map(cat => ({
      label: cat.name,
      value: cat.id
    }))
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

// Handle tree node selection
function handleCategorySelect(keys: string[]) {
  selectedKeys.value = keys
  if (keys.length > 0) {
    const selectedKey = keys[0]
    categoryFilter.value = selectedKey === 'all' ? null : selectedKey
  } else {
    categoryFilter.value = null
  }
  currentPage.value = 1
  loadPosts()
}

// Handle tree expansion
function handleExpandedKeysChange(keys: string[]) {
  expandedKeys.value = keys
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
  router.push(`/posts/${post.id}/edit`)
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

// 监听 menuId 变化，当切换栏目时重新加载文章列表
watch(menuId, () => {
  currentPage.value = 1 // 重置为第一页
  loadPosts()
})

onMounted(() => {
  selectedKeys.value = ['all'] // Select "全部" by default
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
  handleUnpublish,
  searchKeyword,
  statusFilter,
  categoryFilter,
  currentPage
})
</script>

<style scoped>
.post-list {
  padding: 16px;
  height: calc(100vh - 100px);
  overflow: hidden;
}

.post-list-container {
  display: flex;
  gap: 16px;
  height: 100%;
}

.category-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.category-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.category-tree-container {
  flex: 1;
  overflow-y: auto;
}

.content-area {
  flex: 1;
  min-width: 0;
  overflow: auto;
}
</style>
