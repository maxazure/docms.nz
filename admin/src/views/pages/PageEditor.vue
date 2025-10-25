<template>
  <div class="page-editor">
    <!-- Header -->
    <div class="editor-header">
      <n-space justify="space-between" align="center">
        <n-space align="center">
          <n-button text @click="handleBack">
            <template #icon>
              <n-icon><ArrowBackOutline /></n-icon>
            </template>
          </n-button>
          <h2>{{ isNew ? '新建页面' : '编辑页面' }}</h2>
          <n-tag v-if="!isNew" :type="pageData.status === 'published' ? 'success' : 'default'">
            {{ pageData.status === 'published' ? '已发布' : '草稿' }}
          </n-tag>
        </n-space>

        <n-space>
          <n-button @click="handleSave" :loading="saving">
            <template #icon>
              <n-icon><SaveOutline /></n-icon>
            </template>
            保存
          </n-button>
          <n-button type="primary" @click="handleSaveAndPublish" :loading="saving">
            <template #icon>
              <n-icon><CloudUploadOutline /></n-icon>
            </template>
            保存并发布
          </n-button>
        </n-space>
      </n-space>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
    </div>

    <!-- Error -->
    <n-alert v-else-if="error" type="error" title="加载失败" style="margin: 16px 0">
      {{ error }}
    </n-alert>

    <!-- Editor Content -->
    <div v-else class="editor-content">
      <!-- Left Panel: Basic Info -->
      <div class="left-panel">
        <n-card title="基本信息" size="small">
          <n-form
            ref="formRef"
            :model="pageData"
            :rules="formRules"
            label-placement="top"
          >
            <n-form-item label="页面标题" path="title">
              <n-input v-model:value="pageData.title" placeholder="请输入页面标题" />
            </n-form-item>

            <n-form-item label="URL Slug" path="slug">
              <n-input v-model:value="pageData.slug" placeholder="例如: about-us" />
            </n-form-item>

            <n-form-item label="所属栏目" path="menuItemId">
              <n-select
                v-model:value="pageData.menuItemId"
                :options="menuItemOptions"
                placeholder="选择所属栏目"
              />
            </n-form-item>
          </n-form>
        </n-card>

        <!-- Blocks List -->
        <n-card title="页面区块" size="small" style="margin-top: 16px">
          <template #header-extra>
            <n-button size="small" @click="showBlockSelector = true">
              <template #icon>
                <n-icon><AddOutline /></n-icon>
              </template>
              添加区块
            </n-button>
          </template>

          <div v-if="pageData.blocks && pageData.blocks.length === 0" class="empty-blocks">
            <n-empty description="暂无区块，点击上方按钮添加" size="small" />
          </div>

          <div v-else class="blocks-list">
            <div
              v-for="(block, index) in pageData.blocks"
              :key="block.id"
              class="block-item"
              :class="{ selected: selectedBlockIndex === index, hidden: !block.visibility }"
              @click="handleSelectBlock(index)"
            >
              <div class="block-info">
                <n-icon size="20">
                  <component :is="getBlockIcon(block.type)" />
                </n-icon>
                <span class="block-label">{{ getBlockLabel(block.type) }}</span>
                <n-tag v-if="!block.visibility" size="small" type="warning">隐藏</n-tag>
              </div>

              <div class="block-actions" @click.stop>
                <n-button-group size="tiny">
                  <n-button @click="handleMoveBlockUp(index)" :disabled="index === 0">
                    <template #icon><n-icon><ChevronUpOutline /></n-icon></template>
                  </n-button>
                  <n-button @click="handleMoveBlockDown(index)" :disabled="index === pageData.blocks.length - 1">
                    <template #icon><n-icon><ChevronDownOutline /></n-icon></template>
                  </n-button>
                  <n-button @click="handleToggleBlockVisibility(index)">
                    <template #icon>
                      <n-icon><component :is="block.visibility ? EyeOutline : EyeOffOutline" /></n-icon>
                    </template>
                  </n-button>
                  <n-button @click="handleDuplicateBlock(index)">
                    <template #icon><n-icon><CopyOutline /></n-icon></template>
                  </n-button>
                  <n-button @click="handleRemoveBlock(index)">
                    <template #icon><n-icon><TrashOutline /></n-icon></template>
                  </n-button>
                </n-button-group>
              </div>
            </div>
          </div>
        </n-card>
      </div>

      <!-- Right Panel: Block Configuration -->
      <div class="right-panel">
        <n-card v-if="selectedBlock" title="区块配置" size="small">
          <component
            :is="getBlockConfigComponent(selectedBlock.type)"
            :props="selectedBlock.props"
            @update:props="handleUpdateBlockProps"
          />
        </n-card>
        <n-card v-else title="区块配置" size="small">
          <n-empty description="请在左侧选择一个区块进行配置" />
        </n-card>
      </div>
    </div>

    <!-- Block Selector Modal -->
    <n-modal
      v-model:show="showBlockSelector"
      preset="card"
      title="选择区块类型"
      style="width: 600px"
    >
      <div class="block-selector">
        <div v-for="category in blockCategories" :key="category" class="block-category">
          <h4>{{ getCategoryLabel(category) }}</h4>
          <div class="block-grid">
            <div
              v-for="blockDef in getBlocksByCategory(category)"
              :key="blockDef.type"
              class="block-option"
              @click="handleAddBlock(blockDef.type)"
            >
              <n-icon size="32">
                <component :is="getBlockIcon(blockDef.type)" />
              </n-icon>
              <span>{{ blockDef.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import {
  ArrowBackOutline,
  SaveOutline,
  CloudUploadOutline,
  AddOutline,
  ChevronUpOutline,
  ChevronDownOutline,
  EyeOutline,
  EyeOffOutline,
  CopyOutline,
  TrashOutline,
  ImageOutline,
  DocumentTextOutline,
  ImagesOutline,
  GridOutline,
  MegaphoneOutline,
  HelpCircleOutline,
  CubeOutline,
  ChatbubblesOutline,
  MailOutline,
  LocationOutline,
  VideocamOutline,
  RemoveOutline
} from '@vicons/ionicons5'
import { pageApi } from '@/api/page'
import { useMenuStore } from '@/stores/menu'
import { blockRegistry, getBlockDefinition, getBlocksByCategory, getBlockCategories } from '@/config/blocks'
import type { Page, Block, CreatePageRequest, UpdatePageRequest } from '@/types'

// Block config components (lazy loaded)
import HeroBlockConfig from '@/components/blocks/HeroBlockConfig.vue'
import TextBlockConfig from '@/components/blocks/TextBlockConfig.vue'
import ImageGalleryBlockConfig from '@/components/blocks/ImageGalleryBlockConfig.vue'
import FeaturesBlockConfig from '@/components/blocks/FeaturesBlockConfig.vue'
import CTABlockConfig from '@/components/blocks/CTABlockConfig.vue'
import FAQBlockConfig from '@/components/blocks/FAQBlockConfig.vue'
import ProductShowcaseBlockConfig from '@/components/blocks/ProductShowcaseBlockConfig.vue'
import TestimonialsBlockConfig from '@/components/blocks/TestimonialsBlockConfig.vue'
import ContactFormBlockConfig from '@/components/blocks/ContactFormBlockConfig.vue'
import MapBlockConfig from '@/components/blocks/MapBlockConfig.vue'
import VideoBlockConfig from '@/components/blocks/VideoBlockConfig.vue'
import DividerBlockConfig from '@/components/blocks/DividerBlockConfig.vue'

// State
const router = useRouter()
const route = useRoute()
const message = useMessage()
const menuStore = useMenuStore()
const formRef = ref<FormInst | null>(null)

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const showBlockSelector = ref(false)
const selectedBlockIndex = ref<number | null>(null)
const autoSaveTimer = ref<NodeJS.Timeout | null>(null)

const pageData = ref<Partial<Page>>({
  menuItemId: '',
  title: '',
  slug: '',
  blocks: [],
  status: 'draft'
})

// Computed
const isNew = computed(() => route.params.id === 'new')

const selectedBlock = computed(() => {
  if (selectedBlockIndex.value !== null && pageData.value.blocks) {
    return pageData.value.blocks[selectedBlockIndex.value]
  }
  return null
})

const menuItemOptions = computed(() => {
  return menuStore.menuItems
    .filter(item => item.type === 'page')
    .map(item => ({
      label: item.label,
      value: item.id
    }))
})

const blockCategories = computed(() => getBlockCategories())

// Form validation
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入页面标题', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: '请输入 URL Slug', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符', trigger: 'blur' }
  ],
  menuItemId: [
    { required: true, message: '请选择所属栏目', trigger: 'change' }
  ]
}

// Icon mapping
const iconMap: Record<string, any> = {
  hero: markRaw(ImageOutline),
  text: markRaw(DocumentTextOutline),
  imageGallery: markRaw(ImagesOutline),
  features: markRaw(GridOutline),
  cta: markRaw(MegaphoneOutline),
  faq: markRaw(HelpCircleOutline),
  productShowcase: markRaw(CubeOutline),
  testimonials: markRaw(ChatbubblesOutline),
  contactForm: markRaw(MailOutline),
  map: markRaw(LocationOutline),
  video: markRaw(VideocamOutline),
  divider: markRaw(RemoveOutline)
}

// Block config component mapping
const blockConfigMap: Record<string, any> = {
  hero: markRaw(HeroBlockConfig),
  text: markRaw(TextBlockConfig),
  imageGallery: markRaw(ImageGalleryBlockConfig),
  features: markRaw(FeaturesBlockConfig),
  cta: markRaw(CTABlockConfig),
  faq: markRaw(FAQBlockConfig),
  productShowcase: markRaw(ProductShowcaseBlockConfig),
  testimonials: markRaw(TestimonialsBlockConfig),
  contactForm: markRaw(ContactFormBlockConfig),
  map: markRaw(MapBlockConfig),
  video: markRaw(VideoBlockConfig),
  divider: markRaw(DividerBlockConfig)
}

// Methods
async function loadPage() {
  if (isNew.value) {
    pageData.value = {
      menuItemId: '',
      title: '',
      slug: '',
      blocks: [],
      status: 'draft'
    }
    return
  }

  loading.value = true
  error.value = null

  try {
    const idOrSlug = route.params.id || route.params.slugOrId
    if (!idOrSlug) {
      throw new Error('页面ID或Slug不能为空')
    }

    // 判断是UUID还是slug (UUID格式: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug as string)

    let response
    if (isUUID) {
      response = await pageApi.getPage(idOrSlug as string)
    } else {
      // 使用slug加载
      response = await pageApi.getPageBySlug(idOrSlug as string)
    }

    if (response.data) {
      pageData.value = response.data
    }
  } catch (err: any) {
    error.value = err.message || '加载页面失败'
    message.error('加载页面失败')
  } finally {
    loading.value = false
  }
}

function handleBack() {
  router.push({ name: 'PageList' })
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

async function handleSave() {
  const isValid = await validateForm()
  if (!isValid) return

  saving.value = true
  error.value = null

  try {
    if (isNew.value) {
      const response = await pageApi.createPage(pageData.value as CreatePageRequest)
      if (response.data) {
        message.success('创建成功')
        router.push({ name: 'PageEditor', params: { id: response.data.id } })
      }
    } else {
      await pageApi.updatePage(route.params.id as string, pageData.value as UpdatePageRequest)
      message.success('保存成功')
      await loadPage()
    }
  } catch (err: any) {
    error.value = err.message
    message.error(isNew.value ? '创建失败' : '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleSaveAndPublish() {
  await handleSave()
  if (!error.value && !isNew.value) {
    try {
      await pageApi.publishPage(route.params.id as string)
      message.success('发布成功')
      await loadPage()
    } catch (err: any) {
      message.error('发布失败')
    }
  }
}

function handleAddBlock(type: string) {
  const blockDef = getBlockDefinition(type)
  if (!blockDef) return

  const newBlock: Block = {
    id: `block-${Date.now()}`,
    type,
    props: { ...blockDef.defaultProps },
    order: pageData.value.blocks?.length || 0,
    visibility: true
  }

  if (!pageData.value.blocks) {
    pageData.value.blocks = []
  }
  pageData.value.blocks.push(newBlock)
  selectedBlockIndex.value = pageData.value.blocks.length - 1
  showBlockSelector.value = false
  triggerAutoSave()
}

function handleRemoveBlock(index: number) {
  if (!pageData.value.blocks) return
  pageData.value.blocks.splice(index, 1)
  if (selectedBlockIndex.value === index) {
    selectedBlockIndex.value = null
  }
  triggerAutoSave()
}

function handleMoveBlockUp(index: number) {
  if (!pageData.value.blocks || index === 0) return
  const temp = pageData.value.blocks[index]
  pageData.value.blocks[index] = pageData.value.blocks[index - 1]
  pageData.value.blocks[index - 1] = temp
  selectedBlockIndex.value = index - 1
  triggerAutoSave()
}

function handleMoveBlockDown(index: number) {
  if (!pageData.value.blocks || index === pageData.value.blocks.length - 1) return
  const temp = pageData.value.blocks[index]
  pageData.value.blocks[index] = pageData.value.blocks[index + 1]
  pageData.value.blocks[index + 1] = temp
  selectedBlockIndex.value = index + 1
  triggerAutoSave()
}

function handleDuplicateBlock(index: number) {
  if (!pageData.value.blocks) return
  const original = pageData.value.blocks[index]
  const duplicate: Block = {
    ...JSON.parse(JSON.stringify(original)),
    id: `block-${Date.now()}`,
    order: pageData.value.blocks.length
  }
  pageData.value.blocks.splice(index + 1, 0, duplicate)
  selectedBlockIndex.value = index + 1
  triggerAutoSave()
}

function handleToggleBlockVisibility(index: number) {
  if (!pageData.value.blocks) return
  pageData.value.blocks[index].visibility = !pageData.value.blocks[index].visibility
  triggerAutoSave()
}

function handleSelectBlock(index: number) {
  selectedBlockIndex.value = index
}

function handleUpdateBlockProps(props: Record<string, any>) {
  if (selectedBlockIndex.value === null || !pageData.value.blocks) return
  pageData.value.blocks[selectedBlockIndex.value].props = {
    ...pageData.value.blocks[selectedBlockIndex.value].props,
    ...props
  }
  triggerAutoSave()
}

function triggerAutoSave() {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  autoSaveTimer.value = setTimeout(() => {
    if (!isNew.value) {
      handleAutoSave()
    }
  }, 3000)
}

async function handleAutoSave() {
  if (isNew.value) return
  try {
    await pageApi.updatePage(route.params.id as string, pageData.value as UpdatePageRequest)
  } catch (err) {
    // Silent fail for auto-save
  }
}

function getBlockIcon(type: string) {
  return iconMap[type] || DocumentTextOutline
}

function getBlockLabel(type: string) {
  const blockDef = getBlockDefinition(type)
  return blockDef?.label || type
}

function getBlockConfigComponent(type: string) {
  // 转换为小写以匹配 blockConfigMap 的 key
  const normalizedType = type.toLowerCase()
  return blockConfigMap[normalizedType] || null
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    layout: '布局',
    content: '内容',
    media: '媒体',
    form: '表单'
  }
  return labels[category] || category
}

// Lifecycle
onMounted(async () => {
  if (menuStore.menuItems.length === 0) {
    await menuStore.fetchAllMenuItems()
  }
  await loadPage()
})

// Expose for testing
defineExpose({
  loading,
  saving,
  error,
  pageData,
  selectedBlockIndex,
  isNew,
  handleSave,
  handleSaveAndPublish,
  handleAddBlock,
  handleRemoveBlock,
  handleMoveBlockUp,
  handleMoveBlockDown,
  handleDuplicateBlock,
  handleToggleBlockVisibility,
  handleSelectBlock,
  handleUpdateBlockProps,
  validateForm,
  triggerAutoSave,
  handleAutoSave
})
</script>

<style scoped>
.page-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--n-border-color);
  background: var(--n-color);
}

.editor-header h2 {
  margin: 0;
  font-size: 18px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.editor-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 16px;
  padding: 16px;
  flex: 1;
  overflow: hidden;
}

.left-panel,
.right-panel {
  overflow-y: auto;
}

.empty-blocks {
  padding: 20px 0;
}

.blocks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--n-border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.block-item:hover {
  border-color: var(--n-color-primary);
  background: var(--n-color-target);
}

.block-item.selected {
  border-color: var(--n-color-primary);
  background: var(--n-color-primary-hover);
}

.block-item.hidden {
  opacity: 0.5;
}

.block-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.block-label {
  font-weight: 500;
}

.block-actions {
  display: flex;
  gap: 4px;
}

.block-selector {
  max-height: 500px;
  overflow-y: auto;
}

.block-category {
  margin-bottom: 24px;
}

.block-category h4 {
  margin: 0 0 12px 0;
  color: var(--n-text-color-2);
}

.block-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.block-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 1px solid var(--n-border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.block-option:hover {
  border-color: var(--n-color-primary);
  background: var(--n-color-target);
}

.block-option span {
  font-size: 13px;
  text-align: center;
}
</style>
