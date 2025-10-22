<template>
  <div class="page-list">
    <n-card title="页面管理">
      <template #header-extra>
        <n-button type="primary" @click="handleCreate">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          新建页面
        </n-button>
      </template>

      <!-- Search and Filter -->
      <n-space vertical :size="16" style="margin-bottom: 16px">
        <n-space>
          <n-input
            v-model:value="searchQuery"
            placeholder="搜索页面标题..."
            clearable
            style="width: 300px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>

          <n-select
            v-model:value="filterStatus"
            placeholder="状态"
            clearable
            style="width: 120px"
            :options="statusOptions"
            @update:value="handleFilter"
          />

          <n-select
            v-model:value="filterMenuItemId"
            placeholder="所属栏目"
            clearable
            style="width: 180px"
            :options="menuItemOptions"
            @update:value="handleFilter"
          />

          <n-button @click="handleSearch">搜索</n-button>
          <n-button @click="handleReset">重置</n-button>
        </n-space>
      </n-space>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <n-spin size="large" />
      </div>

      <!-- Error State -->
      <n-alert v-else-if="error" type="error" title="加载失败">
        {{ error }}
      </n-alert>

      <!-- Data Table -->
      <div v-else>
        <n-data-table
          :columns="columns"
          :data="pages"
          :pagination="false"
        />

        <n-empty
          v-if="pages.length === 0"
          description="暂无页面，点击上方按钮创建"
        />

        <!-- Pagination -->
        <div v-if="total > pageSize" class="pagination">
          <n-pagination
            v-model:page="currentPage"
            v-model:page-size="pageSize"
            :page-count="Math.ceil(total / pageSize)"
            :page-sizes="[10, 20, 50]"
            show-size-picker
            @update:page="loadPages"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </div>
    </n-card>

    <!-- Delete Confirmation -->
    <n-modal
      v-model:show="deleteConfirmVisible"
      preset="dialog"
      title="确认删除"
      positive-text="删除"
      negative-text="取消"
      @positive-click="confirmDelete"
    >
      <p>确定要删除页面 "{{ deleteTarget?.title }}" 吗？</p>
      <p class="warning">此操作不可恢复。</p>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type DataTableColumns, NTag, NButton, NSpace } from 'naive-ui'
import { AddOutline, SearchOutline, CreateOutline, TrashOutline, EyeOutline } from '@vicons/ionicons5'
import { pageApi } from '@/api/page'
import { useMenuStore } from '@/stores/menu'
import type { Page } from '@/types'

// State
const router = useRouter()
const message = useMessage()
const menuStore = useMenuStore()

const loading = ref(false)
const error = ref<string | null>(null)
const pages = ref<Page[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// Search and Filter
const searchQuery = ref('')
const filterStatus = ref<string | null>(null)
const filterMenuItemId = ref<string | null>(null)

// Delete
const deleteConfirmVisible = ref(false)
const deleteTarget = ref<Page | null>(null)

// Options
const statusOptions = [
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' }
]

const menuItemOptions = computed(() => {
  return menuStore.menuItems.map(item => ({
    label: item.label,
    value: item.id
  }))
})

// Table Columns
const columns = computed<DataTableColumns<Page>>(() => [
  {
    title: '标题',
    key: 'title',
    ellipsis: {
      tooltip: true
    },
    render: (row) => {
      return h('div', [
        h('div', { style: 'font-weight: 500' }, row.title),
        h('div', { style: 'font-size: 12px; color: #999; margin-top: 4px' }, `/${row.slug}`)
      ])
    }
  },
  {
    title: '所属栏目',
    key: 'menuItemId',
    width: 150,
    render: (row) => {
      const menuItem = menuStore.menuItems.find(m => m.id === row.menuItemId)
      return menuItem?.label || '-'
    }
  },
  {
    title: '区块数',
    key: 'blocks',
    width: 100,
    render: (row) => row.blocks?.length || 0
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      return h(NTag, {
        type: row.status === 'published' ? 'success' : 'default'
      }, {
        default: () => row.status === 'published' ? '已发布' : '草稿'
      })
    }
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 180,
    render: (row) => formatDate(row.updatedAt || row.createdAt)
  },
  {
    title: '操作',
    key: 'actions',
    width: 250,
    render: (row) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            onClick: () => handleEdit(row)
          }, { default: () => '编辑', icon: () => h('n-icon', null, { default: () => h(CreateOutline) }) }),
          row.status === 'draft'
            ? h(NButton, {
                size: 'small',
                type: 'success',
                onClick: () => handlePublish(row)
              }, { default: () => '发布' })
            : h(NButton, {
                size: 'small',
                onClick: () => handleUnpublish(row)
              }, { default: () => '取消发布' }),
          h(NButton, {
            size: 'small',
            type: 'error',
            onClick: () => handleDelete(row)
          }, { icon: () => h('n-icon', null, { default: () => h(TrashOutline) }) })
        ]
      })
    }
  }
])

// Methods
async function loadPages() {
  loading.value = true
  error.value = null

  try {
    const response = await pageApi.getPageList({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      status: filterStatus.value || undefined,
      menuItemId: filterMenuItemId.value || undefined
    })

    if (response.data) {
      pages.value = response.data.data
      total.value = response.data.total
    }
  } catch (err: any) {
    error.value = err.message || '加载页面列表失败'
    message.error('加载页面列表失败')
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  router.push({ name: 'PageEditor', params: { id: 'new' } })
}

function handleEdit(page: Page) {
  router.push({ name: 'PageEditor', params: { id: page.id } })
}

function handleDelete(page: Page) {
  deleteTarget.value = page
  deleteConfirmVisible.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return

  try {
    await pageApi.deletePage(deleteTarget.value.id)
    message.success('删除成功')
    await loadPages()
    deleteConfirmVisible.value = false
    deleteTarget.value = null
  } catch (err: any) {
    error.value = err.message
    message.error('删除失败')
  }
}

async function handlePublish(page: Page) {
  try {
    await pageApi.publishPage(page.id)
    message.success('发布成功')
    await loadPages()
  } catch (err: any) {
    error.value = err.message
    message.error('发布失败')
  }
}

async function handleUnpublish(page: Page) {
  try {
    await pageApi.unpublishPage(page.id)
    message.success('已取消发布')
    await loadPages()
  } catch (err: any) {
    error.value = err.message
    message.error('取消发布失败')
  }
}

async function handleSearch() {
  currentPage.value = 1
  await loadPages()
}

async function handleFilter() {
  currentPage.value = 1
  await loadPages()
}

async function handleReset() {
  searchQuery.value = ''
  filterStatus.value = null
  filterMenuItemId.value = null
  currentPage.value = 1
  await loadPages()
}

function handlePageSizeChange() {
  currentPage.value = 1
  loadPages()
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// Lifecycle
onMounted(async () => {
  // Load menu items first if not loaded
  if (menuStore.menuItems.length === 0) {
    await menuStore.fetchAllMenuItems()
  }
  await loadPages()
})

// Expose for testing
defineExpose({
  loading,
  error,
  pages,
  total,
  currentPage,
  pageSize,
  searchQuery,
  filterStatus,
  filterMenuItemId,
  deleteConfirmVisible,
  deleteTarget,
  handleCreate,
  handleEdit,
  handleDelete,
  confirmDelete,
  handlePublish,
  handleUnpublish,
  handleSearch,
  handleFilter,
  loadPages
})
</script>

<style scoped>
.page-list {
  width: 100%;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.warning {
  color: var(--n-color-error);
  margin-top: 8px;
}
</style>
