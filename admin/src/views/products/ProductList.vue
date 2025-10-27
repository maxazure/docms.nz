<template>
  <div class="product-list">
    <div class="product-list-container">
      <!-- Left Sidebar: Category Tree -->
      <div class="category-sidebar">
        <div class="category-header">
          <h3>产品分类</h3>
          <n-button text @click="showCategoryManager = true">
            <template #icon><n-icon><Settings /></n-icon></template>
            管理
          </n-button>
        </div>
        <div class="category-tree-container">
          <n-alert v-if="!menuId" type="warning" style="margin-bottom: 12px" :bordered="false">
            请从左侧菜单点击"产品中心"进入，以查看对应的分类
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
            <h2>产品管理</h2>
            <n-button type="primary" @click="handleCreate">
              <template #icon><n-icon><Add /></n-icon></template>
              新建产品
            </n-button>
          </n-space>

          <!-- Filters -->
      <n-space>
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索产品名称或描述"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix><n-icon><Search /></n-icon></template>
        </n-input>

        <n-select
          v-model:value="activeFilter"
          placeholder="状态"
          clearable
          style="width: 120px"
          :options="activeOptions"
          @update:value="loadProducts"
        />

        <n-select
          v-model:value="featuredFilter"
          placeholder="推荐"
          clearable
          style="width: 120px"
          :options="featuredOptions"
          @update:value="loadProducts"
        />

        <n-select
          v-model:value="categoryFilter"
          placeholder="分类"
          clearable
          style="width: 150px"
          :options="categoryOptions"
          @update:value="loadProducts"
        />

        <n-button @click="handleSearch">搜索</n-button>
        <n-button @click="handleReset">重置</n-button>
      </n-space>

          <!-- Table -->
      <n-data-table
        :columns="columns"
        :data="products"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage, useDialog, NButton, NSpace, NTag, NSwitch, NAlert, type DataTableColumns, type TreeOption } from 'naive-ui'
import { Add, Search, Settings } from '@vicons/ionicons5'
import type { Product } from '@/types/product'
import {
  getProductList,
  deleteProduct,
  toggleActive,
  toggleFeatured
} from '@/api/product'
import { getCategoryList } from '@/api/post'
import CategoryManager from '@/components/posts/CategoryManager.vue'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const products = ref<Product[]>([])
const categories = ref<any[]>([])
const showCategoryManager = ref(false)

// Tree state
const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])

// 从 URL 查询参数获取 menuId
const menuId = computed(() => route.query.menuId as string | undefined)

const searchKeyword = ref('')
const activeFilter = ref<boolean | null>(null)
const featuredFilter = ref<boolean | null>(null)
const categoryFilter = ref<string | null>(null)

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const activeOptions = [
  { label: '激活', value: true },
  { label: '未激活', value: false }
]

const featuredOptions = [
  { label: '推荐', value: true },
  { label: '普通', value: false }
]

const categoryOptions = ref<{ label: string; value: string }[]>([])

const columns: DataTableColumns<Product> = [
  {
    title: '产品名称',
    key: 'name',
    width: 250,
    ellipsis: { tooltip: true }
  },
  {
    title: '封面',
    key: 'coverImageUrl',
    width: 100,
    render: row => {
      if (!row.coverImageUrl) return '-'
      return h('img', {
        src: row.coverImageUrl,
        style: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }
      })
    }
  },
  {
    title: '摘要',
    key: 'summary',
    width: 200,
    ellipsis: { tooltip: true },
    render: row => row.summary || '-'
  },
  {
    title: '状态',
    key: 'isActive',
    width: 100,
    render: row => {
      return h(NSwitch, {
        value: row.isActive,
        onUpdateValue: () => handleToggleActive(row)
      })
    }
  },
  {
    title: '推荐',
    key: 'isFeatured',
    width: 100,
    render: row => {
      return h(NTag, {
        type: row.isFeatured ? 'warning' : 'default',
        style: { cursor: 'pointer' },
        onClick: () => handleToggleFeatured(row)
      }, () => row.isFeatured ? '已推荐' : '普通')
    }
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
    width: 180,
    fixed: 'right',
    render: row => {
      return h(NSpace, { size: 8 }, () => [
        h(
          NButton,
          { size: 'small', onClick: () => handleEdit(row) },
          () => '编辑'
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

const pagination = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  pageCount: Math.ceil(total.value / pageSize.value),
  itemCount: total.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: handlePageChange,
  onUpdatePageSize: handlePageSizeChange
}))

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
    const count = cat.productsCount || 0
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

async function loadProducts() {
  try {
    loading.value = true
    const response = await getProductList({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value || undefined,
      isActive: activeFilter.value ?? undefined,
      isFeatured: featuredFilter.value ?? undefined,
      categoryId: categoryFilter.value || undefined
    })
    // response is AxiosResponse, actual data is in response.data
    const result = response.data as any
    products.value = Array.isArray(result.data) ? result.data : []
    total.value = result.total || 0
  } catch (error) {
    message.error('加载产品列表失败')
    console.error(error)
    products.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    // 只加载当前菜单项的分类
    const params = menuId.value ? { menuItemId: menuId.value } : {}
    const categoryList = await getCategoryList(params)
    categories.value = categoryList
    categoryOptions.value = categoryList.map(cat => ({
      label: cat.name,
      value: cat.id
    }))
  } catch (error) {
    message.error('加载分类失败')
    console.error(error)
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
  loadProducts()
}

// Handle tree expansion
function handleExpandedKeysChange(keys: string[]) {
  expandedKeys.value = keys
}

function handleCreate() {
  router.push('/products/create')
}

function handleEdit(product: Product) {
  router.push(`/products/${product.id}/edit`)
}

async function handleDelete(product: Product) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除产品 "${product.name}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteProduct(product.id)
        message.success('删除成功')
        loadProducts()
      } catch (error) {
        message.error('删除失败')
        console.error(error)
      }
    }
  })
}

async function handleToggleActive(product: Product) {
  try {
    await toggleActive(product.id)
    message.success(product.isActive ? '已停用' : '已激活')
    loadProducts()
  } catch (error) {
    message.error('切换状态失败')
    console.error(error)
  }
}

async function handleToggleFeatured(product: Product) {
  try {
    await toggleFeatured(product.id)
    message.success(product.isFeatured ? '已取消推荐' : '已设为推荐')
    loadProducts()
  } catch (error) {
    message.error('切换推荐状态失败')
    console.error(error)
  }
}

function handleSearch() {
  currentPage.value = 1
  loadProducts()
}

function handleReset() {
  searchKeyword.value = ''
  activeFilter.value = null
  featuredFilter.value = null
  categoryFilter.value = null
  currentPage.value = 1
  loadProducts()
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadProducts()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadProducts()
}

onMounted(() => {
  selectedKeys.value = ['all'] // Select "全部" by default
  loadProducts()
  loadCategories()
})

defineExpose({
  loadProducts,
  handleCreate,
  handleEdit,
  handleDelete,
  handleToggleActive,
  handleToggleFeatured,
  searchKeyword,
  activeFilter,
  featuredFilter,
  categoryFilter,
  currentPage
})
</script>

<style scoped>
.product-list {
  padding: 16px;
  height: calc(100vh - 100px);
  overflow: hidden;
}

.product-list-container {
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
