<template>
  <div class="menu-management">
    <n-card>
      <template #header>
        <div class="header-content">
          <h2>菜单管理</h2>
          <n-text depth="3">拖拽调整顺序，支持层级嵌套</n-text>
        </div>
      </template>

      <template #header-extra>
        <n-space>
          <n-button
            v-if="menuItems.length > 0"
            quaternary
            @click="toggleExpandAll"
          >
            {{ allExpanded ? '折叠全部' : '展开全部' }}
          </n-button>
          <n-button
            type="primary"
            data-test="add-menu-button"
            @click="handleCreate"
          >
            <template #icon>
              <n-icon><AddOutline /></n-icon>
            </template>
            添加一级菜单
          </n-button>
        </n-space>
      </template>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <n-spin size="large" />
      </div>

      <!-- Error State -->
      <n-alert v-else-if="error" type="error" title="加载失败">
        {{ error }}
      </n-alert>

      <!-- Menu List -->
      <div v-else class="menu-list">
        <n-empty
          v-if="menuItems.length === 0"
          description="暂无菜单项，点击上方按钮添加"
        />

        <!-- Top-level menu items -->
        <draggable
          v-model="topLevelMenus"
          :item-key="(item: MenuItem) => item.id"
          handle=".drag-handle"
          @end="handleTopLevelReorder"
          class="menu-items-container"
        >
          <template #item="{ element: item }">
            <div class="menu-item-wrapper" :key="item.id">
              <!-- Top-level menu card -->
              <n-card
                class="menu-item-card top-level"
                :class="{ 'has-children': hasChildren(item) }"
                hoverable
              >
                <div class="menu-item-content">
                  <!-- Drag handle -->
                  <div class="drag-handle">
                    <n-icon size="20" :component="ReorderThreeOutline" />
                  </div>

                  <!-- Expand/collapse toggle -->
                  <div
                    v-if="hasChildren(item)"
                    class="expand-toggle"
                    @click="toggleExpand(item.id)"
                  >
                    <n-icon
                      size="18"
                      :component="expandedIds.includes(item.id) ? ChevronDownOutline : ChevronForwardOutline"
                    />
                  </div>
                  <div v-else class="expand-toggle-placeholder"></div>

                  <!-- Icon -->
                  <div class="menu-icon">
                    <n-icon
                      size="24"
                      :component="getMenuIcon(item.icon || item.type)"
                      :color="getTypeColor(item.type)"
                    />
                  </div>

                  <!-- Menu info -->
                  <div class="menu-info">
                    <div class="menu-title">
                      <span class="title-text">{{ item.label }}</span>
                      <n-tag
                        size="small"
                        :type="getTypeTagType(item.type)"
                        round
                      >
                        {{ getTypeLabel(item.type) }}
                      </n-tag>
                    </div>
                    <div class="menu-meta">
                      <n-text depth="3" class="slug">{{ item.slug }}</n-text>
                      <n-divider vertical />
                      <n-text depth="3" class="order">排序: {{ item.order }}</n-text>
                      <n-divider vertical />
                      <n-tag
                        v-if="!item.isVisible"
                        size="small"
                        type="warning"
                        round
                      >
                        已隐藏
                      </n-tag>
                      <n-tag
                        v-if="!item.isActive"
                        size="small"
                        type="error"
                        round
                      >
                        已禁用
                      </n-tag>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="menu-actions">
                    <n-button
                      size="small"
                      quaternary
                      circle
                      title="添加子菜单"
                      @click="handleCreateChild(item)"
                    >
                      <template #icon>
                        <n-icon><AddCircleOutline /></n-icon>
                      </template>
                    </n-button>
                    <n-button
                      size="small"
                      quaternary
                      circle
                      title="切换可见性"
                      @click="handleToggleVisibility(item)"
                    >
                      <template #icon>
                        <n-icon>
                          <component :is="item.isVisible ? EyeOutline : EyeOffOutline" />
                        </n-icon>
                      </template>
                    </n-button>
                    <n-button
                      size="small"
                      quaternary
                      circle
                      title="编辑"
                      @click="handleEdit(item)"
                    >
                      <template #icon>
                        <n-icon><CreateOutline /></n-icon>
                      </template>
                    </n-button>
                    <n-button
                      size="small"
                      quaternary
                      circle
                      type="error"
                      title="删除"
                      @click="handleDelete(item)"
                    >
                      <template #icon>
                        <n-icon><TrashOutline /></n-icon>
                      </template>
                    </n-button>
                  </div>
                </div>

                <!-- Child menu items -->
                <transition name="expand">
                  <div
                    v-if="hasChildren(item) && expandedIds.includes(item.id)"
                    class="child-menus"
                  >
                    <draggable
                      :model-value="getChildren(item.id)"
                      :item-key="(child: MenuItem) => child.id"
                      handle=".drag-handle"
                      @end="(evt: any) => handleChildReorder(evt, item.id)"
                      class="child-items-container"
                    >
                      <template #item="{ element: child }">
                        <n-card
                          class="menu-item-card child-level"
                          hoverable
                          :key="child.id"
                        >
                          <div class="menu-item-content">
                            <!-- Drag handle -->
                            <div class="drag-handle">
                              <n-icon size="18" :component="ReorderTwoOutline" />
                            </div>

                            <!-- Icon -->
                            <div class="menu-icon small">
                              <n-icon
                                size="20"
                                :component="getMenuIcon(child.icon || child.type)"
                                :color="getTypeColor(child.type)"
                              />
                            </div>

                            <!-- Menu info -->
                            <div class="menu-info">
                              <div class="menu-title">
                                <span class="title-text">{{ child.label }}</span>
                                <n-tag
                                  size="tiny"
                                  :type="getTypeTagType(child.type)"
                                  round
                                >
                                  {{ getTypeLabel(child.type) }}
                                </n-tag>
                              </div>
                              <div class="menu-meta">
                                <n-text depth="3" class="slug">{{ child.slug }}</n-text>
                                <n-divider vertical />
                                <n-text depth="3" class="order">排序: {{ child.order }}</n-text>
                                <n-tag
                                  v-if="!child.isVisible"
                                  size="tiny"
                                  type="warning"
                                  round
                                >
                                  已隐藏
                                </n-tag>
                                <n-tag
                                  v-if="!child.isActive"
                                  size="tiny"
                                  type="error"
                                  round
                                >
                                  已禁用
                                </n-tag>
                              </div>
                            </div>

                            <!-- Actions -->
                            <div class="menu-actions">
                              <n-button
                                size="small"
                                quaternary
                                circle
                                title="切换可见性"
                                @click="handleToggleVisibility(child)"
                              >
                                <template #icon>
                                  <n-icon>
                                    <component :is="child.isVisible ? EyeOutline : EyeOffOutline" />
                                  </n-icon>
                                </template>
                              </n-button>
                              <n-button
                                size="small"
                                quaternary
                                circle
                                title="编辑"
                                @click="handleEdit(child)"
                              >
                                <template #icon>
                                  <n-icon><CreateOutline /></n-icon>
                                </template>
                              </n-button>
                              <n-button
                                size="small"
                                quaternary
                                circle
                                type="error"
                                title="删除"
                                @click="handleDelete(child)"
                              >
                                <template #icon>
                                  <n-icon><TrashOutline /></n-icon>
                                </template>
                              </n-button>
                            </div>
                          </div>
                        </n-card>
                      </template>
                    </draggable>
                  </div>
                </transition>
              </n-card>
            </div>
          </template>
        </draggable>
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
import { ref, computed, onMounted } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import {
  AddOutline,
  CreateOutline,
  TrashOutline,
  AddCircleOutline,
  EyeOutline,
  EyeOffOutline,
  ChevronDownOutline,
  ChevronForwardOutline,
  ReorderThreeOutline,
  ReorderTwoOutline,
  HomeOutline,
  CubeOutline,
  NewspaperOutline,
  DocumentTextOutline
} from '@vicons/ionicons5'
import draggable from 'vuedraggable'
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
const expandedIds = ref<string[]>([])
const allExpanded = ref(false)

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
const topLevelMenus = computed({
  get: () => menuItems.value.filter(item => !item.parentId).sort((a, b) => a.order - b.order),
  set: (newValue) => {
    // Update the order when drag-drop happens
    newValue.forEach((item, index) => {
      const originalItem = menuItems.value.find(m => m.id === item.id)
      if (originalItem) {
        originalItem.order = index
      }
    })
  }
})

const parentOptions = computed(() => {
  // Exclude current item and its descendants when editing
  const availableItems = currentEditId.value
    ? menuItems.value.filter(item =>
        item.id !== currentEditId.value &&
        !isDescendant(item.id, currentEditId.value)
      )
    : menuItems.value

  return buildTreeOptions(availableItems.filter(item => !item.parentId))
})

// Methods
function buildTreeOptions(items: MenuItem[]): any[] {
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

function getChildren(parentId: string): MenuItem[] {
  return menuItems.value
    .filter(item => item.parentId === parentId)
    .sort((a, b) => a.order - b.order)
}

function toggleExpand(id: string) {
  const index = expandedIds.value.indexOf(id)
  if (index > -1) {
    expandedIds.value.splice(index, 1)
  } else {
    expandedIds.value.push(id)
  }
}

function toggleExpandAll() {
  if (allExpanded.value) {
    expandedIds.value = []
    allExpanded.value = false
  } else {
    expandedIds.value = topLevelMenus.value
      .filter(item => hasChildren(item))
      .map(item => item.id)
    allExpanded.value = true
  }
}

function getMenuIcon(iconOrType: string) {
  const iconMap: Record<string, any> = {
    home: HomeOutline,
    cube: CubeOutline,
    newspaper: NewspaperOutline,
    document: DocumentTextOutline,
    PAGE: HomeOutline,
    POST_LIST: NewspaperOutline,
    PRODUCT: CubeOutline,
    page: HomeOutline,
    postList: NewspaperOutline,
    product: CubeOutline
  }
  return iconMap[iconOrType] || DocumentTextOutline
}

function getTypeTagType(type: string): 'default' | 'success' | 'info' | 'warning' {
  const map: Record<string, 'default' | 'success' | 'info' | 'warning'> = {
    PAGE: 'default',
    POST_LIST: 'success',
    PRODUCT: 'info',
    page: 'default',
    postList: 'success',
    product: 'info'
  }
  return map[type] || 'default'
}

function hasChildren(item: MenuItem): boolean {
  return menuItems.value.some(i => i.parentId === item.id)
}

function canDeleteItem(item: MenuItem): boolean {
  return !hasChildren(item)
}


function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    PAGE: '单页',
    POST_LIST: '文章列表',
    PRODUCT: '产品',
    page: '单页',
    postList: '文章列表',
    product: '产品'
  }
  return map[type] || type
}

function getTypeColor(type: string): string {
  const map: Record<string, string> = {
    PAGE: '#18a058',
    POST_LIST: '#2080f0',
    PRODUCT: '#f0a020',
    page: '#18a058',
    postList: '#2080f0',
    product: '#f0a020'
  }
  return map[type] || '#666'
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
    parentId: undefined,
    order: topLevelMenus.value.length,
    isVisible: true,
    isActive: true
  }
  showDialog.value = true
}

function handleCreateChild(parent: MenuItem) {
  dialogMode.value = 'create'
  currentEditId.value = null
  const childrenCount = getChildren(parent.id).length
  formData.value = {
    menuCode: parent.menuCode,
    label: '',
    slug: '',
    type: 'page',
    linkType: 'internal',
    parentId: parent.id,
    order: childrenCount,
    isVisible: true,
    isActive: true
  }
  showDialog.value = true

  // Auto-expand parent if collapsed
  if (!expandedIds.value.includes(parent.id)) {
    expandedIds.value.push(parent.id)
  }
}

async function handleToggleVisibility(item: MenuItem) {
  try {
    await menuApi.toggleMenuVisibility(item.id)
    item.isVisible = !item.isVisible
    message.success(item.isVisible ? '已显示' : '已隐藏')
    await menuStore.refreshMenu()
  } catch (err: any) {
    message.error('操作失败')
  }
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

async function handleTopLevelReorder() {
  try {
    const orderData = topLevelMenus.value.map((item, index) => ({
      id: item.id,
      order: index
    }))

    await menuApi.updateMenuOrder(orderData)
    message.success('排序已更新')
    await loadMenuItems()
    await menuStore.refreshMenu()
  } catch (err: any) {
    message.error('排序更新失败')
    await loadMenuItems() // Revert on error
  }
}

async function handleChildReorder(evt: any, parentId: string) {
  try {
    const children = getChildren(parentId)
    const orderData = children.map((item, index) => ({
      id: item.id,
      order: index
    }))

    await menuApi.updateMenuOrder(orderData)
    message.success('排序已更新')
    await loadMenuItems()
    await menuStore.refreshMenu()
  } catch (err: any) {
    message.error('排序更新失败')
    await loadMenuItems() // Revert on error
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
  expandedIds,
  showDialog,
  dialogMode,
  currentEditId,
  formData,
  deleteConfirmVisible,
  deleteTarget,
  handleCreate,
  handleCreateChild,
  handleEdit,
  handleDelete,
  handleToggleVisibility,
  confirmDelete,
  handleSubmit,
  validateForm,
  canDeleteItem,
  handleTopLevelReorder,
  handleChildReorder,
  toggleExpand,
  toggleExpandAll
})
</script>

<style scoped>
.menu-management {
  width: 100%;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-content h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.menu-list {
  margin-top: 20px;
}

.menu-items-container,
.child-items-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item-wrapper {
  width: 100%;
}

.menu-item-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.menu-item-card.top-level {
  background: var(--n-color);
  border-left-color: var(--n-primary-color);
}

.menu-item-card.top-level.has-children {
  border-left-color: var(--n-info-color);
}

.menu-item-card.child-level {
  background: var(--n-color-embedded);
  border-left-color: var(--n-border-color);
}

.menu-item-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
}

.drag-handle {
  cursor: move;
  color: var(--n-text-color-3);
  display: flex;
  align-items: center;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.menu-item-card:hover .drag-handle {
  opacity: 1;
}

.expand-toggle {
  cursor: pointer;
  color: var(--n-text-color-2);
  display: flex;
  align-items: center;
  width: 24px;
  height: 24px;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.expand-toggle:hover {
  background: var(--n-color-hover);
}

.expand-toggle-placeholder {
  width: 24px;
  height: 24px;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--n-color-embedded);
}

.menu-icon.small {
  width: 32px;
  height: 32px;
}

.menu-info {
  flex: 1;
  min-width: 0;
}

.menu-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.title-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--n-text-color-1);
}

.menu-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.menu-meta .slug {
  color: var(--n-text-color-3);
  font-family: 'Consolas', 'Monaco', monospace;
}

.menu-meta .order {
  color: var(--n-text-color-3);
}

.menu-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.3s;
}

.menu-item-card:hover .menu-actions {
  opacity: 1;
}

.child-menus {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--n-divider-color);
}

.child-items-container {
  gap: 8px;
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 1000px;
  opacity: 1;
}

.warning {
  color: var(--n-warning-color);
  margin-top: 8px;
  font-size: 14px;
}

/* Dragging styles */
:deep(.sortable-ghost) {
  opacity: 0.4;
}

:deep(.sortable-drag) {
  opacity: 0.8;
  transform: rotate(2deg);
}
</style>
