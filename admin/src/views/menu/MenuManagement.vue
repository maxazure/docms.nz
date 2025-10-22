<template>
  <div class="menu-management">
    <n-card title="菜单管理">
      <template #header-extra>
        <n-button
          type="primary"
          data-test="add-menu-button"
          @click="handleCreate"
        >
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          添加栏目
        </n-button>
      </template>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <n-spin size="large" />
      </div>

      <!-- Error State -->
      <n-alert v-else-if="error" type="error" title="加载失败">
        {{ error }}
      </n-alert>

      <!-- Menu Tree -->
      <div v-else class="menu-tree">
        <n-tree
          :data="treeData"
          :render-label="renderLabel"
          :render-suffix="renderSuffix"
          block-line
          draggable
          @update:expanded-keys="handleExpandedKeysChange"
          @drop="handleDrop"
        />

        <n-empty
          v-if="menuItems.length === 0"
          description="暂无菜单项，点击上方按钮添加"
        />
      </div>
    </n-card>

    <!-- Create/Edit Dialog -->
    <n-modal
      v-model:show="showDialog"
      :title="dialogMode === 'create' ? '添加栏目' : '编辑栏目'"
      preset="dialog"
      :positive-text="dialogMode === 'create' ? '创建' : '更新'"
      negative-text="取消"
      @positive-click="handleSubmit"
      @negative-click="handleCancel"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="菜单位置" path="menuCode">
          <n-select
            v-model:value="formData.menuCode"
            :options="menuCodeOptions"
            placeholder="选择菜单位置"
          />
        </n-form-item>

        <n-form-item label="栏目名称" path="label">
          <n-input
            v-model:value="formData.label"
            placeholder="请输入栏目名称"
          />
        </n-form-item>

        <n-form-item label="URL Slug" path="slug">
          <n-input
            v-model:value="formData.slug"
            placeholder="例如: products"
          />
        </n-form-item>

        <n-form-item label="栏目类型" path="type">
          <n-select
            v-model:value="formData.type"
            :options="typeOptions"
            placeholder="选择栏目类型"
          />
        </n-form-item>

        <n-form-item label="父级栏目" path="parentId">
          <n-tree-select
            v-model:value="formData.parentId"
            :options="parentOptions"
            placeholder="选择父级栏目（可选）"
            clearable
            :disabled-field="disabledParentField"
          />
        </n-form-item>

        <n-form-item label="图标" path="icon">
          <n-select
            v-model:value="formData.icon"
            :options="iconOptions"
            placeholder="选择图标（可选）"
            clearable
          />
        </n-form-item>

        <n-form-item label="排序" path="order">
          <n-input-number
            v-model:value="formData.order"
            :min="0"
            placeholder="数字越小越靠前"
          />
        </n-form-item>

        <n-form-item label="是否显示" path="isVisible">
          <n-switch v-model:value="formData.isVisible" />
        </n-form-item>

        <n-form-item label="是否启用" path="isActive">
          <n-switch v-model:value="formData.isActive" />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- Delete Confirmation -->
    <n-modal
      v-model:show="deleteConfirmVisible"
      preset="dialog"
      title="确认删除"
      positive-text="删除"
      negative-text="取消"
      @positive-click="confirmDelete"
    >
      <p>确定要删除栏目 "{{ deleteTarget?.label }}" 吗？</p>
      <p v-if="deleteTarget && hasChildren(deleteTarget)" class="warning">
        此栏目包含子栏目，请先删除子栏目。
      </p>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage, type FormInst, type FormRules, type TreeOption } from 'naive-ui'
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { menuApi } from '@/api/menu'
import { useMenuStore } from '@/stores/menu'
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '@/types'

// State
const message = useMessage()
const menuStore = useMenuStore()
const formRef = ref<FormInst | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)
const menuItems = ref<MenuItem[]>([])
const expandedKeys = ref<string[]>([])

// Dialog state
const showDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentEditId = ref<string | null>(null)

// Form state
const formData = ref<Partial<CreateMenuItemRequest>>({
  menuCode: 'main',
  label: '',
  slug: '',
  type: 'page',
  linkType: 'internal',
  order: 0,
  isVisible: true,
  isActive: true
})

// Delete state
const deleteConfirmVisible = ref(false)
const deleteTarget = ref<MenuItem | null>(null)

// Options
const menuCodeOptions = [
  { label: '主导航', value: 'main' },
  { label: '页脚导航', value: 'footer' }
]

const typeOptions = [
  { label: '单页模块', value: 'page' },
  { label: '文章列表', value: 'postList' },
  { label: '产品模块', value: 'product' }
]

const iconOptions = [
  { label: '首页', value: 'home' },
  { label: '立方体', value: 'cube' },
  { label: '灯泡', value: 'bulb' },
  { label: '工具', value: 'construct' },
  { label: '报纸', value: 'newspaper' },
  { label: '信息', value: 'information' },
  { label: '电话', value: 'call' },
  { label: '图片', value: 'image' },
  { label: '聊天', value: 'chatbubble' },
  { label: '文档', value: 'document' }
]

// Form validation rules
const formRules: FormRules = {
  menuCode: [
    { required: true, message: '请选择菜单位置', trigger: 'change' }
  ],
  label: [
    { required: true, message: '请输入栏目名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: '请输入 URL Slug', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择栏目类型', trigger: 'change' }
  ]
}

// Computed
const treeData = computed<TreeOption[]>(() => {
  return buildTree(menuItems.value.filter(item => !item.parentId))
})

const parentOptions = computed<TreeOption[]>(() => {
  // Exclude current item and its descendants when editing
  const availableItems = currentEditId.value
    ? menuItems.value.filter(item =>
        item.id !== currentEditId.value &&
        !isDescendant(item.id, currentEditId.value)
      )
    : menuItems.value

  return buildTreeOptions(availableItems.filter(item => !item.parentId))
})

const disabledParentField = (option: TreeOption) => {
  return option.key === currentEditId.value
}

// Methods
function buildTree(items: MenuItem[], level = 0): TreeOption[] {
  return items
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      key: item.id,
      label: item.label,
      children: buildTree(
        menuItems.value.filter(child => child.parentId === item.id),
        level + 1
      ),
      _rawData: item,
      _level: level
    }))
}

function buildTreeOptions(items: MenuItem[]): TreeOption[] {
  return items
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      key: item.id,
      label: item.label,
      children: buildTreeOptions(
        menuItems.value.filter(child => child.parentId === item.id)
      )
    }))
}

function isDescendant(itemId: string, ancestorId: string): boolean {
  const item = menuItems.value.find(i => i.id === itemId)
  if (!item || !item.parentId) return false
  if (item.parentId === ancestorId) return true
  return isDescendant(item.parentId, ancestorId)
}

function hasChildren(item: MenuItem): boolean {
  return menuItems.value.some(i => i.parentId === item.id)
}

function canDeleteItem(item: MenuItem): boolean {
  return !hasChildren(item)
}

function renderLabel({ option }: { option: TreeOption }) {
  const item = (option._rawData as MenuItem)
  return h('div', { class: 'menu-item-label' }, [
    h('span', { class: 'label-text' }, option.label),
    h('span', { class: 'label-meta' }, [
      h('n-tag', { size: 'small', type: getTypeColor(item.type) }, { default: () => getTypeLabel(item.type) }),
      !item.isVisible && h('n-tag', { size: 'small', type: 'warning' }, { default: () => '隐藏' }),
      !item.isActive && h('n-tag', { size: 'small', type: 'error' }, { default: () => '禁用' })
    ])
  ])
}

function renderSuffix({ option }: { option: TreeOption }) {
  const item = (option._rawData as MenuItem)
  return h('div', { class: 'menu-item-actions' }, [
    h('n-button', {
      size: 'small',
      quaternary: true,
      onClick: () => handleEdit(item)
    }, { icon: () => h('n-icon', null, { default: () => h(CreateOutline) }) }),
    h('n-button', {
      size: 'small',
      quaternary: true,
      type: 'error',
      onClick: () => handleDelete(item)
    }, { icon: () => h('n-icon', null, { default: () => h(TrashOutline) }) })
  ])
}

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    page: '单页',
    postList: '文章',
    product: '产品'
  }
  return map[type] || type
}

function getTypeColor(type: string): 'default' | 'success' | 'info' | 'warning' {
  const map: Record<string, 'default' | 'success' | 'info' | 'warning'> = {
    page: 'default',
    postList: 'success',
    product: 'info'
  }
  return map[type] || 'default'
}

async function loadMenuItems() {
  loading.value = true
  error.value = null

  try {
    const response = await menuApi.getMenuItems()
    menuItems.value = response.data || []
  } catch (err: any) {
    error.value = err.message || '加载菜单失败'
    message.error('加载菜单失败')
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  dialogMode.value = 'create'
  currentEditId.value = null
  formData.value = {
    menuCode: 'main',
    label: '',
    slug: '',
    type: 'page',
    linkType: 'internal',
    order: menuItems.value.length,
    isVisible: true,
    isActive: true
  }
  showDialog.value = true
}

function handleEdit(item: MenuItem) {
  dialogMode.value = 'edit'
  currentEditId.value = item.id
  formData.value = {
    menuCode: item.menuCode,
    label: item.label,
    slug: item.slug,
    type: item.type,
    linkType: item.linkType,
    linkTarget: item.linkTarget,
    parentId: item.parentId,
    order: item.order,
    icon: item.icon,
    isVisible: item.isVisible,
    isActive: item.isActive
  }
  showDialog.value = true
}

function handleDelete(item: MenuItem) {
  if (!canDeleteItem(item)) {
    message.warning('请先删除该栏目的子栏目')
    return
  }
  deleteTarget.value = item
  deleteConfirmVisible.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return

  try {
    await menuApi.deleteMenuItem(deleteTarget.value.id)
    message.success('删除成功')
    await loadMenuItems()
    await menuStore.refreshMenu()
    deleteConfirmVisible.value = false
    deleteTarget.value = null
  } catch (err: any) {
    error.value = err.message
    message.error('删除失败')
  }
}

async function validateForm(): Promise<boolean> {
  if (!formRef.value) return false

  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

async function handleSubmit() {
  const isValid = await validateForm()
  if (!isValid) return

  try {
    if (dialogMode.value === 'create') {
      await menuApi.createMenuItem(formData.value as CreateMenuItemRequest)
      message.success('创建成功')
    } else {
      if (!currentEditId.value) return
      await menuApi.updateMenuItem(
        currentEditId.value,
        formData.value as UpdateMenuItemRequest
      )
      message.success('更新成功')
    }

    await loadMenuItems()
    await menuStore.refreshMenu()
    showDialog.value = false
  } catch (err: any) {
    error.value = err.message
    message.error(dialogMode.value === 'create' ? '创建失败' : '更新失败')
  }
}

function handleCancel() {
  showDialog.value = false
  formData.value = {
    menuCode: 'main',
    label: '',
    slug: '',
    type: 'page',
    linkType: 'internal'
  }
}

function handleExpandedKeysChange(keys: string[]) {
  expandedKeys.value = keys
}

async function handleDrop({ node, dragNode, dropPosition }: any) {
  // This would be implemented with more complex logic
  // For now, just trigger a reorder
  await handleReorder(menuItems.value)
}

async function handleReorder(items: MenuItem[]) {
  try {
    const orderData = items.map((item, index) => ({
      id: item.id,
      order: index,
      parentId: item.parentId
    }))

    await menuApi.updateMenuOrder(orderData)
    message.success('排序已更新')
    await loadMenuItems()
  } catch (err: any) {
    message.error('排序更新失败')
  }
}

// Lifecycle
onMounted(() => {
  loadMenuItems()
})

// Expose for testing
defineExpose({
  loading,
  error,
  menuItems,
  showDialog,
  dialogMode,
  currentEditId,
  formData,
  deleteConfirmVisible,
  deleteTarget,
  handleCreate,
  handleEdit,
  handleDelete,
  confirmDelete,
  handleSubmit,
  validateForm,
  canDeleteItem,
  handleReorder
})
</script>

<style scoped>
.menu-management {
  width: 100%;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.menu-tree {
  margin-top: 16px;
}

.menu-item-label {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.label-text {
  font-weight: 500;
}

.label-meta {
  display: flex;
  gap: 6px;
}

.menu-item-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.warning {
  color: var(--n-color-warning);
  margin-top: 8px;
}

:deep(.n-tree-node-content) {
  padding: 8px 12px;
}

:deep(.n-tree-node) {
  margin-bottom: 4px;
}
</style>
