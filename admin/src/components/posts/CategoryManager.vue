<template>
  <div class="category-manager">
    <n-space vertical :size="16">
      <!-- Add/Edit Form -->
      <n-card :title="editingCategory ? '编辑分类' : '添加分类'" size="small">
        <n-form>
          <n-form-item label="分类名称">
            <n-input
              v-model:value="formData.name"
              placeholder="请输入分类名称"
              @input="handleNameChange"
            />
          </n-form-item>
          <n-form-item label="URL路径">
            <n-input
              v-model:value="formData.slug"
              placeholder="自动生成或手动输入"
            />
          </n-form-item>
          <n-form-item label="父分类">
            <n-select
              v-model:value="formData.parentId"
              :options="parentOptions"
              placeholder="选择父分类（可选）"
              clearable
            />
          </n-form-item>
          <n-form-item label="排序">
            <n-input-number
              v-model:value="formData.order"
              :min="0"
              placeholder="数字越小越靠前"
            />
          </n-form-item>
          <n-space>
            <n-button type="primary" @click="handleSubmit">
              {{ editingCategory ? '保存' : '添加' }}
            </n-button>
            <n-button v-if="editingCategory" @click="handleCancelEdit">
              取消
            </n-button>
          </n-space>
        </n-form>
      </n-card>

      <!-- Categories Table -->
      <n-data-table
        :columns="columns"
        :data="categories"
        :pagination="false"
        :bordered="true"
      />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { useMessage, useDialog, NButton, NSpace, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { Category } from '@/types/post'
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/post'

const props = defineProps<{
  menuItemId?: string
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const message = useMessage()
const dialog = useDialog()
const categories = ref<any[]>([])
const editingCategory = ref<any | null>(null)

const formData = ref({
  name: '',
  slug: '',
  parentId: null as string | null,
  order: 0
})

// Parent category options
const parentOptions = computed(() => {
  return categories.value
    .filter(cat => !editingCategory.value || cat.id !== editingCategory.value.id)
    .map(cat => ({
      label: cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name,
      value: cat.id
    }))
})

// Table columns
const columns = computed<DataTableColumns<any>>(() => [
  {
    title: '分类名称',
    key: 'name',
    render: (row) => {
      return row.parent ? h('span', {}, [
        h('span', { style: 'color: #999; margin-right: 8px' }, '├─'),
        row.name
      ]) : row.name
    }
  },
  {
    title: 'URL路径',
    key: 'slug',
    width: 200
  },
  {
    title: '类型',
    key: 'type',
    width: 120,
    render: (row) => {
      if (row.productsCount > 0 && row.postsCount > 0) {
        return h(NTag, { type: 'info', size: 'small' }, { default: () => '通用' })
      } else if (row.productsCount > 0) {
        return h(NTag, { type: 'success', size: 'small' }, { default: () => '产品' })
      } else if (row.postsCount > 0) {
        return h(NTag, { type: 'warning', size: 'small' }, { default: () => '文章' })
      }
      return h(NTag, { type: 'default', size: 'small' }, { default: () => '未使用' })
    }
  },
  {
    title: '使用情况',
    key: 'usage',
    width: 150,
    render: (row) => {
      const parts = []
      if (row.productsCount > 0) {
        parts.push(`${row.productsCount}个产品`)
      }
      if (row.postsCount > 0) {
        parts.push(`${row.postsCount}篇文章`)
      }
      if (row.childrenCount > 0) {
        parts.push(`${row.childrenCount}个子分类`)
      }
      return parts.length > 0 ? parts.join(', ') : '-'
    }
  },
  {
    title: '排序',
    key: 'order',
    width: 80
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {
            size: 'small',
            onClick: () => handleEdit(row)
          }, { default: () => '编辑' }),
          h(NButton, {
            size: 'small',
            type: 'error',
            onClick: () => handleDeleteConfirm(row)
          }, { default: () => '删除' })
        ]
      })
    }
  }
])

async function loadCategories() {
  try {
    const params = props.menuItemId ? { menuItemId: props.menuItemId } : {}
    const data = await getCategoryList(params)
    categories.value = data
  } catch (error) {
    message.error('加载分类失败')
  }
}

function handleNameChange() {
  // Auto-generate slug from name
  if (!editingCategory.value) {
    formData.value.slug = formData.value.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
}

function handleEdit(category: any) {
  editingCategory.value = category
  formData.value = {
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    order: category.order
  }
}

function handleCancelEdit() {
  editingCategory.value = null
  formData.value = {
    name: '',
    slug: '',
    parentId: null,
    order: 0
  }
}

async function handleSubmit() {
  if (!formData.value.name.trim()) {
    message.warning('请输入分类名称')
    return
  }

  if (!formData.value.slug.trim()) {
    message.warning('请输入URL路径')
    return
  }

  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, formData.value)
      message.success('更新成功')
    } else {
      // 创建新分类时包含 menuItemId
      const dataToSubmit = {
        ...formData.value,
        menuItemId: props.menuItemId
      }
      await createCategory(dataToSubmit)
      message.success('添加成功')
    }
    handleCancelEdit()
    loadCategories()
    emit('update')
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

function handleDeleteConfirm(category: any) {
  const usageInfo = []
  if (category.productsCount > 0) {
    usageInfo.push(`${category.productsCount}个产品`)
  }
  if (category.postsCount > 0) {
    usageInfo.push(`${category.postsCount}篇文章`)
  }
  if (category.childrenCount > 0) {
    usageInfo.push(`${category.childrenCount}个子分类`)
  }

  const content = usageInfo.length > 0
    ? `该分类正被 ${usageInfo.join('、')} 使用，确定要删除吗？`
    : '确定要删除该分类吗？'

  dialog.warning({
    title: '确认删除',
    content,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await handleDelete(category)
    }
  })
}

async function handleDelete(category: any) {
  try {
    await deleteCategory(category.id)
    message.success('删除成功')
    loadCategories()
    emit('update')
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-manager {
  width: 100%;
}
</style>
