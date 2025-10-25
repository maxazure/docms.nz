<template>
  <div class="product-editor">
    <!-- Header -->
    <div class="editor-header">
      <n-space justify="space-between" align="center">
        <n-space align="center">
          <n-button text @click="handleBack">
            <template #icon>
              <n-icon><ArrowBackOutline /></n-icon>
            </template>
          </n-button>
          <h2>{{ isNew ? '新建产品' : '编辑产品' }}</h2>
          <n-tag v-if="!isNew && productData" :type="productData.isActive ? 'success' : 'default'">
            {{ productData.isActive ? '已激活' : '未激活' }}
          </n-tag>
          <n-tag v-if="!isNew && productData && productData.isFeatured" type="warning">
            推荐
          </n-tag>
        </n-space>

        <n-space>
          <n-button @click="handleSave" :loading="saving">
            <template #icon>
              <n-icon><SaveOutline /></n-icon>
            </template>
            保存
          </n-button>
          <n-button v-if="!isNew" type="warning" @click="handleToggleFeatured" :loading="saving">
            {{ productData?.isFeatured ? '取消推荐' : '设为推荐' }}
          </n-button>
          <n-button v-if="!isNew" :type="productData?.isActive ? 'default' : 'success'" @click="handleToggleActive" :loading="saving">
            {{ productData?.isActive ? '停用' : '激活' }}
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
      <n-tabs v-model:value="activeTab" type="line">
        <!-- 基本信息 -->
        <n-tab-pane name="basic" tab="基本信息">
          <n-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-placement="top"
            size="medium"
          >
            <n-grid :cols="2" :x-gap="16">
              <n-gi>
                <n-form-item label="产品名称" path="name">
                  <n-input
                    v-model:value="formData.name"
                    placeholder="请输入产品名称"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="URL Slug" path="slug">
                  <n-input
                    v-model:value="formData.slug"
                    placeholder="例如: hydroponic-system-pro"
                  />
                </n-form-item>
              </n-gi>
            </n-grid>

            <n-form-item label="产品摘要">
              <n-input
                v-model:value="formData.summary"
                type="textarea"
                :rows="3"
                placeholder="请输入产品摘要，用于产品列表展示"
              />
            </n-form-item>

            <n-form-item label="所属栏目" path="menuItemId">
              <n-select
                v-model:value="formData.menuItemId"
                :options="menuItemOptions"
                placeholder="选择所属栏目"
              />
            </n-form-item>

            <n-grid :cols="2" :x-gap="16">
              <n-gi>
                <n-form-item label="产品分类">
                  <n-select
                    v-model:value="formData.categoryId"
                    :options="categoryOptions"
                    placeholder="选择产品分类"
                    clearable
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="产品标签">
                  <n-select
                    v-model:value="formData.tagIds"
                    :options="tagOptions"
                    multiple
                    placeholder="选择产品标签"
                  />
                </n-form-item>
              </n-gi>
            </n-grid>

            <n-form-item label="产品描述" path="description">
              <n-input
                v-model:value="formData.description"
                type="textarea"
                :rows="8"
                placeholder="请输入产品详细描述"
              />
            </n-form-item>

            <n-form-item label="封面图片">
              <media-selector
                v-model:value="formData.coverImageId"
                :preview-url="coverImagePreview"
                @update:value="handleCoverImageChange"
              />
            </n-form-item>
          </n-form>
        </n-tab-pane>

        <!-- 产品规格 -->
        <n-tab-pane name="specs" tab="产品规格">
          <div class="specs-editor">
            <n-space vertical :size="16">
              <n-space justify="space-between">
                <h3>规格参数</h3>
                <n-button type="primary" @click="handleAddSpec">
                  <template #icon>
                    <n-icon><Add /></n-icon>
                  </template>
                  添加规格
                </n-button>
              </n-space>

              <n-empty v-if="!formData.specs || formData.specs.length === 0" description="暂无规格参数">
                <template #extra>
                  <n-button size="small" @click="handleAddSpec">添加第一个规格</n-button>
                </template>
              </n-empty>

              <n-list v-else bordered>
                <n-list-item v-for="(spec, index) in formData.specs" :key="index">
                  <n-space vertical style="width: 100%">
                    <n-grid :cols="4" :x-gap="12">
                      <n-gi>
                        <n-input
                          v-model:value="spec.key"
                          placeholder="键（如：capacity）"
                          size="small"
                        />
                      </n-gi>
                      <n-gi>
                        <n-input
                          v-model:value="spec.label"
                          placeholder="标签（如：容量）"
                          size="small"
                        />
                      </n-gi>
                      <n-gi>
                        <n-input
                          v-model:value="spec.value"
                          placeholder="值（如：48）"
                          size="small"
                        />
                      </n-gi>
                      <n-gi>
                        <n-input-group>
                          <n-input
                            v-model:value="spec.unit"
                            placeholder="单位（如：株）"
                            size="small"
                            style="width: calc(100% - 32px)"
                          />
                          <n-button size="small" type="error" @click="handleRemoveSpec(index)">
                            <template #icon>
                              <n-icon><TrashOutline /></n-icon>
                            </template>
                          </n-button>
                        </n-input-group>
                      </n-gi>
                    </n-grid>
                  </n-space>
                </n-list-item>
              </n-list>

              <n-alert type="info" title="规格说明">
                <ul>
                  <li><strong>键（Key）</strong>: 英文字段名，用于程序识别，如 "capacity"</li>
                  <li><strong>标签（Label）</strong>: 中文显示名称，如 "容量"</li>
                  <li><strong>值（Value）</strong>: 规格的具体值，如 "48"</li>
                  <li><strong>单位（Unit）</strong>: 可选，如 "株"、"cm"、"kg"</li>
                </ul>
              </n-alert>
            </n-space>
          </div>
        </n-tab-pane>

        <!-- 产品图集 -->
        <n-tab-pane name="gallery" tab="产品图集">
          <div class="gallery-editor">
            <n-space vertical :size="16">
              <n-space justify="space-between">
                <h3>产品图片</h3>
                <n-space>
                  <n-button type="primary" @click="showGalleryUploadModal = true">
                    <template #icon>
                      <n-icon><CloudUploadOutline /></n-icon>
                    </template>
                    上传图片
                  </n-button>
                  <n-button @click="showGallerySelectModal = true">
                    <template #icon>
                      <n-icon><ImageOutline /></n-icon>
                    </template>
                    从媒体库选择
                  </n-button>
                </n-space>
              </n-space>

              <n-empty v-if="!galleryImages || galleryImages.length === 0" description="暂无产品图片">
                <template #extra>
                  <n-space>
                    <n-button size="small" @click="showGalleryUploadModal = true">上传图片</n-button>
                    <n-button size="small" @click="showGallerySelectModal = true">从媒体库选择</n-button>
                  </n-space>
                </template>
              </n-empty>

              <div v-else class="gallery-grid">
                <div v-for="(image, index) in galleryImages" :key="index" class="gallery-item">
                  <div class="gallery-image">
                    <n-image
                      :src="image.url"
                      :alt="image.filename"
                      object-fit="cover"
                      width="100%"
                      height="150px"
                    />
                  </div>
                  <div class="gallery-item-info">
                    <n-ellipsis style="max-width: 100%">{{ image.filename }}</n-ellipsis>
                  </div>
                  <div class="gallery-item-actions">
                    <n-button size="tiny" type="error" @click="handleRemoveGalleryImage(index)">
                      <template #icon>
                        <n-icon><TrashOutline /></n-icon>
                      </template>
                      删除
                    </n-button>
                  </div>
                </div>
              </div>

              <n-alert type="info" title="图集说明">
                <ul>
                  <li>产品图集用于在产品详情页展示多张产品图片</li>
                  <li>建议上传高质量的产品实拍图或效果图</li>
                  <li>图片会按照添加顺序展示</li>
                  <li>支持上传新图片或从媒体库选择已有图片</li>
                </ul>
              </n-alert>
            </n-space>
          </div>
        </n-tab-pane>

        <!-- SEO设置 -->
        <n-tab-pane name="seo" tab="SEO设置">
          <n-form label-placement="top" size="medium">
            <n-form-item>
              <template #label>
                <span>SEO标题</span>
                <span style="color: #999; font-size: 12px; margin-left: 8px">
                  ({{ seoTitleLength }}/60)
                </span>
              </template>
              <n-input
                v-model:value="formData.seoTitle"
                placeholder="留空则使用产品名称"
                :maxlength="60"
                show-count
              />
            </n-form-item>

            <n-form-item>
              <template #label>
                <span>SEO描述</span>
                <span style="color: #999; font-size: 12px; margin-left: 8px">
                  ({{ seoDescriptionLength }}/160)
                </span>
              </template>
              <n-input
                v-model:value="formData.seoDescription"
                type="textarea"
                :rows="4"
                placeholder="留空则使用产品摘要"
                :maxlength="160"
                show-count
              />
            </n-form-item>

            <n-form-item label="SEO关键词">
              <n-dynamic-tags v-model:value="formData.seoKeywords" />
            </n-form-item>

            <n-alert type="info" title="SEO优化建议">
              <ul>
                <li><strong>标题</strong>: 建议50-60个字符，包含核心关键词</li>
                <li><strong>描述</strong>: 建议150-160个字符，简洁描述产品特点</li>
                <li><strong>关键词</strong>: 3-5个核心关键词，用逗号分隔</li>
              </ul>
            </n-alert>
          </n-form>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 上传图片对话框 -->
    <n-modal v-model:show="showGalleryUploadModal" preset="card" title="上传产品图片" style="width: 600px">
      <n-upload
        :action="uploadAction"
        :headers="uploadHeaders"
        :max="10"
        multiple
        list-type="image-card"
        @finish="handleGalleryUploadFinish"
        @error="handleGalleryUploadError"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon :component="CloudUploadOutline" size="48" :depth="3" />
          </div>
          <n-text style="font-size: 16px">点击或拖拽图片到此处上传</n-text>
          <n-text depth="3" style="margin: 8px 0 0 0">
            支持 JPG、PNG、WebP 格式，单个文件不超过 10MB
          </n-text>
        </n-upload-dragger>
      </n-upload>
    </n-modal>

    <!-- 从媒体库选择对话框 -->
    <n-modal
      v-model:show="showGallerySelectModal"
      preset="card"
      title="从媒体库选择图片"
      style="width: 900px"
      :segmented="{ content: 'soft' }"
    >
      <div style="max-height: 600px; overflow-y: auto">
        <n-empty v-if="!mediaList || mediaList.length === 0" description="媒体库暂无图片">
          <template #extra>
            <n-button size="small" @click="showGalleryUploadModal = true; showGallerySelectModal = false">
              上传图片
            </n-button>
          </template>
        </n-empty>

        <div v-else class="media-select-grid">
          <div
            v-for="media in mediaList"
            :key="media.id"
            class="media-select-item"
            :class="{ selected: selectedMediaIds.includes(media.id) }"
            @click="toggleMediaSelection(media.id)"
          >
            <div class="media-select-preview">
              <n-image
                :src="media.url"
                :alt="media.filename"
                object-fit="cover"
                width="100%"
                height="120px"
              />
            </div>
            <div class="media-select-info">
              <n-ellipsis style="font-size: 12px">{{ media.filename }}</n-ellipsis>
            </div>
            <div v-if="selectedMediaIds.includes(media.id)" class="media-select-check">
              <n-icon :component="CheckmarkCircle" size="24" color="#18a058" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showGallerySelectModal = false">取消</n-button>
          <n-button type="primary" @click="handleConfirmMediaSelection" :disabled="selectedMediaIds.length === 0">
            添加选中项 ({{ selectedMediaIds.length }})
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  ArrowBackOutline,
  SaveOutline,
  Add,
  TrashOutline,
  ImageOutline,
  CloudUploadOutline,
  CheckmarkCircle
} from '@vicons/ionicons5'
import type { ProductSpec } from '@/types/product'
import {
  getProduct,
  createProduct,
  updateProduct,
  toggleActive,
  toggleFeatured
} from '@/api/product'
import { getMediaList } from '@/api/media'
import MediaSelector from '@/components/media/MediaSelector.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const productId = computed(() => route.params.id as string)
const isNew = computed(() => !productId.value || productId.value === 'create')

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const activeTab = ref('basic')

const productData = ref<any>(null)
const coverImagePreview = ref<string>('')

const formRef = ref()
const formData = ref({
  menuItemId: '',
  name: '',
  slug: '',
  summary: '',
  description: '',
  coverImageId: '',
  categoryId: '',
  tagIds: [] as string[],
  specs: [] as ProductSpec[],
  gallery: [] as string[],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: [] as string[]
})

const formRules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: '请输入URL Slug', trigger: 'blur' },
    {
      pattern: /^[a-z0-9-]+$/,
      message: 'Slug只能包含小写字母、数字和连字符',
      trigger: 'blur'
    }
  ],
  description: [
    { required: true, message: '请输入产品描述', trigger: 'blur' }
  ],
  menuItemId: [
    { required: true, message: '请选择所属栏目', trigger: 'change' }
  ]
}

const menuItemOptions = ref<Array<{ label: string; value: string }>>([])
const categoryOptions = ref<Array<{ label: string; value: string }>>([])
const tagOptions = ref<Array<{ label: string; value: string }>>([])

const seoTitleLength = computed(() => formData.value.seoTitle?.length || 0)
const seoDescriptionLength = computed(() => formData.value.seoDescription?.length || 0)

// Gallery management
const showGalleryUploadModal = ref(false)
const showGallerySelectModal = ref(false)
const mediaList = ref<any[]>([])
const selectedMediaIds = ref<string[]>([])
const galleryImages = ref<any[]>([])

const uploadAction = computed(() => `${import.meta.env.VITE_API_BASE_URL}/media/upload`)
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`
}))

// Load product data
async function loadProduct() {
  if (isNew.value) return

  try {
    loading.value = true
    error.value = ''
    const response = await getProduct(productId.value)
    productData.value = response

    // Populate form data
    formData.value = {
      menuItemId: response.menuItemId || '',
      name: response.name || '',
      slug: response.slug || '',
      summary: response.summary || '',
      description: response.description || '',
      coverImageId: response.coverImageId || '',
      categoryId: response.categoryId || '',
      tagIds: response.tagIds || [],
      specs: response.specs || [],
      gallery: response.gallery || [],
      seoTitle: response.meta?.seoTitle || '',
      seoDescription: response.meta?.seoDescription || '',
      seoKeywords: response.meta?.seoKeywords || []
    }

    if (response.coverImageUrl) {
      coverImagePreview.value = response.coverImageUrl
    }

    // Load gallery images after form data is populated
    await loadGalleryImages()
  } catch (err: any) {
    error.value = err.message || '加载产品失败'
    message.error(error.value)
  } finally {
    loading.value = false
  }
}

// Load menu items (mock for now)
function loadMenuItems() {
  // TODO: Implement actual API call
  menuItemOptions.value = [
    { label: '产品中心', value: 'menu-products' }
  ]
}

// Load categories (mock for now)
function loadCategories() {
  // TODO: Implement actual API call
  categoryOptions.value = [
    { label: '家庭水培系统', value: 'cat-home-systems' },
    { label: '商业水培系统', value: 'cat-commercial-systems' },
    { label: '水培配件', value: 'cat-accessories' }
  ]
}

// Load tags (mock for now)
function loadTags() {
  // TODO: Implement actual API call
  tagOptions.value = [
    { label: '热门', value: 'tag-hot' },
    { label: '新品', value: 'tag-new' },
    { label: '推荐', value: 'tag-recommended' }
  ]
}

// Handle cover image change
function handleCoverImageChange(imageId: string) {
  formData.value.coverImageId = imageId
  // TODO: Get image URL from media library
  coverImagePreview.value = imageId ? `/api/media/${imageId}/url` : ''
}

// Specs management
function handleAddSpec() {
  if (!formData.value.specs) {
    formData.value.specs = []
  }
  formData.value.specs.push({
    key: '',
    label: '',
    value: '',
    unit: ''
  })
}

function handleRemoveSpec(index: number) {
  formData.value.specs.splice(index, 1)
}

// Gallery management
async function loadMediaLibrary() {
  try {
    const response = await getMediaList({ page: 1, limit: 100, type: 'image' })
    mediaList.value = response.data || []
  } catch (err: any) {
    message.error('加载媒体库失败')
    console.error(err)
  }
}

async function loadGalleryImages() {
  if (!formData.value.gallery || formData.value.gallery.length === 0) {
    galleryImages.value = []
    return
  }

  try {
    // In a real implementation, we would batch-fetch media details by IDs
    // For now, we'll filter from the loaded media list
    const response = await getMediaList({ page: 1, limit: 100 })
    const allMedia = response.data || []
    galleryImages.value = formData.value.gallery
      .map(id => allMedia.find((m: any) => m.id === id))
      .filter(Boolean)
  } catch (err: any) {
    console.error('加载图集图片失败:', err)
    galleryImages.value = []
  }
}

function handleRemoveGalleryImage(index: number) {
  formData.value.gallery.splice(index, 1)
  galleryImages.value.splice(index, 1)
}

function handleGalleryUploadFinish(options: any) {
  message.success('上传成功')
  const response = options.event?.target?.response
  if (response) {
    try {
      const result = typeof response === 'string' ? JSON.parse(response) : response
      if (result.id) {
        if (!formData.value.gallery) {
          formData.value.gallery = []
        }
        formData.value.gallery.push(result.id)
      }
    } catch (err) {
      console.error('解析上传响应失败:', err)
    }
  }
  loadGalleryImages()
  showGalleryUploadModal.value = false
}

function handleGalleryUploadError() {
  message.error('上传失败')
}

function toggleMediaSelection(mediaId: string) {
  const index = selectedMediaIds.value.indexOf(mediaId)
  if (index > -1) {
    selectedMediaIds.value.splice(index, 1)
  } else {
    selectedMediaIds.value.push(mediaId)
  }
}

function handleConfirmMediaSelection() {
  if (!formData.value.gallery) {
    formData.value.gallery = []
  }

  // Add selected media IDs to gallery (avoid duplicates)
  selectedMediaIds.value.forEach(id => {
    if (!formData.value.gallery.includes(id)) {
      formData.value.gallery.push(id)
    }
  })

  selectedMediaIds.value = []
  showGallerySelectModal.value = false
  loadGalleryImages()
}

// Save product
async function handleSave() {
  try {
    await formRef.value?.validate()
    saving.value = true

    const productDto = {
      ...formData.value,
      meta: {
        seoTitle: formData.value.seoTitle,
        seoDescription: formData.value.seoDescription,
        seoKeywords: formData.value.seoKeywords
      }
    }

    if (isNew.value) {
      await createProduct(productDto)
      message.success('产品创建成功')
      router.push('/products')
    } else {
      await updateProduct(productId.value, productDto)
      message.success('产品更新成功')
      await loadProduct()
    }
  } catch (err: any) {
    if (err.errors) {
      // Form validation errors
      return
    }
    message.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// Toggle active status
async function handleToggleActive() {
  if (isNew.value) return

  try {
    saving.value = true
    await toggleActive(productId.value)
    message.success(productData.value?.isActive ? '已停用' : '已激活')
    await loadProduct()
  } catch (err: any) {
    message.error(err.message || '操作失败')
  } finally {
    saving.value = false
  }
}

// Toggle featured status
async function handleToggleFeatured() {
  if (isNew.value) return

  try {
    saving.value = true
    await toggleFeatured(productId.value)
    message.success(productData.value?.isFeatured ? '已取消推荐' : '已设为推荐')
    await loadProduct()
  } catch (err: any) {
    message.error(err.message || '操作失败')
  } finally {
    saving.value = false
  }
}

// Go back
function handleBack() {
  router.push('/products')
}

// Watch for when media select modal opens to load media list
watch(showGallerySelectModal, (newVal) => {
  if (newVal) {
    loadMediaLibrary()
  }
})

onMounted(() => {
  loadProduct()
  loadMenuItems()
  loadCategories()
  loadTags()
})
</script>

<style scoped>
.product-editor {
  padding: 16px;
}

.editor-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.editor-content {
  background: white;
  border-radius: 4px;
  padding: 16px;
}

.specs-editor,
.gallery-editor {
  padding: 16px 0;
}

/* Gallery Grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.gallery-item {
  position: relative;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: all 0.3s;
}

.gallery-item:hover {
  border-color: #18a058;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.1);
}

.gallery-image {
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  overflow: hidden;
}

.gallery-item-info {
  padding: 8px;
  font-size: 12px;
  color: #666;
}

.gallery-item-actions {
  padding: 8px;
  display: flex;
  justify-content: center;
}

/* Media Selection Modal */
.media-select-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.media-select-item {
  position: relative;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.media-select-item:hover {
  border-color: #18a058;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.1);
}

.media-select-item.selected {
  border-color: #18a058;
  background: #f0fdf4;
}

.media-select-preview {
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  overflow: hidden;
}

.media-select-info {
  padding: 8px;
}

.media-select-check {
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
