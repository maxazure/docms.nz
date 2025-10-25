<template>
  <div class="media-selector">
    <n-space vertical :size="16">
      <!-- 搜索和筛选 -->
      <n-space>
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索文件名..."
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
          v-model:value="mimeTypeFilter"
          placeholder="文件类型"
          clearable
          style="width: 120px"
          :options="mimeTypeOptions"
          @update:value="handleSearch"
        />

        <n-button @click="handleSearch">搜索</n-button>
        <n-button @click="handleReset">重置</n-button>
      </n-space>

      <!-- 上传区域 -->
      <div class="upload-area" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent>
        <input
          ref="fileInputRef"
          type="file"
          :multiple="props.multiple"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
          style="display: none"
          @change="handleFileChange"
        />
        <div class="upload-dragger">
          <div style="margin-bottom: 12px">
            <n-icon size="48" depth="3">
              <CloudUploadOutline />
            </n-icon>
          </div>
          <n-text style="font-size: 16px">
            点击或拖拽文件到此处上传
          </n-text>
          <n-p depth="3" style="margin: 8px 0 0 0">
            支持图片、视频、文档等格式
          </n-p>
        </div>
      </div>

      <!-- 媒体列表 -->
      <div class="media-grid" v-if="!loading">
        <div
          v-for="media in mediaList"
          :key="media.id"
          class="media-item"
          :class="{ selected: selectedIds.includes(media.id) }"
          @click="handleSelect(media)"
        >
          <div class="media-preview">
            <img
              v-if="isImage(media.mime)"
              :src="media.storageKey"
              :alt="media.filename"
              @error="handleImageError"
            />
            <div v-else class="file-icon">
              <n-icon size="32">
                <DocumentOutline />
              </n-icon>
            </div>
          </div>

          <div class="media-info">
            <div class="media-name" :title="media.filename">
              {{ media.filename }}
            </div>
            <div class="media-meta">
              {{ formatFileSize(media.size) }}
            </div>
          </div>

          <div class="media-actions" v-if="props.multiple || selectedIds.includes(media.id)">
            <n-button
              v-if="props.multiple"
              size="small"
              :type="selectedIds.includes(media.id) ? 'primary' : 'default'"
              circle
              @click.stop="handleSelect(media)"
            >
              <template #icon>
                <n-icon><CheckmarkOutline /></n-icon>
              </template>
            </n-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="mediaList.length === 0" class="empty-state">
          <n-empty description="暂无媒体文件" />
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <n-spin size="large" />
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination">
        <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :item-count="total"
          :page-sizes="[12, 24, 48, 96]"
          show-size-picker
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import {
  SearchOutline,
  CloudUploadOutline,
  DocumentOutline,
  CheckmarkOutline
} from '@vicons/ionicons5'
import type { Media } from '@/types/media'
import type { UploadCustomRequestOptions } from 'naive-ui'
import { getMediaList, uploadMedia } from '@/api/media'

interface Props {
  multiple?: boolean
  maxFiles?: number
  acceptTypes?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  maxFiles: 10,
  acceptTypes: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
})

const emit = defineEmits<{
  (e: 'select', media: Media[]): void
}>()

const message = useMessage()

// 状态
const loading = ref(false)
const mediaList = ref<Media[]>([])
const selectedIds = ref<string[]>([])
const searchQuery = ref('')
const mimeTypeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(24)
const total = ref(0)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 计算属性
const mimeTypeOptions = [
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '文档', value: 'document' }
]

// 方法
function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function triggerFileInput() {
  console.log('[triggerFileInput] Clicked')
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  console.log('[handleFileChange] File input changed')
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    console.log('[handleFileChange] Files selected:', files.length)
    handleFiles(Array.from(files))
  }
}

function handleDrop(event: DragEvent) {
  console.log('[handleDrop] Files dropped')
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    console.log('[handleDrop] Files count:', files.length)
    handleFiles(Array.from(files))
  }
}

async function handleFiles(files: File[]) {
  console.log('[handleFiles] Processing files:', files)
  for (const file of files) {
    console.log('[handleFiles] Uploading file:', file.name)
    try {
      await handleUploadInSelector(file)
    } catch (error) {
      console.error('[handleFiles] Upload failed for file:', file.name, error)
    }
  }
  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function handleUploadInSelector(file: File) {
  try {
    const response = await uploadMedia(file)
    message.success('上传成功')

    // Auto-select the uploaded file
    if (response.data) {
      if (props.multiple) {
        selectedIds.value.push(response.data.id)
      } else {
        selectedIds.value = [response.data.id]
        emit('select', [response.data])
      }
    }

    // Reload the media list
    await loadMedia()
  } catch (err: any) {
    message.error('上传失败：' + err.message)
  }
}

function handleSelect(media: Media) {
  if (props.multiple) {
    const index = selectedIds.value.indexOf(media.id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    } else {
      if (selectedIds.value.length < props.maxFiles) {
        selectedIds.value.push(media.id)
      } else {
        message.warning(`最多只能选择 ${props.maxFiles} 个文件`)
      }
    }
  } else {
    selectedIds.value = [media.id]
    emit('select', [media])
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

async function loadMedia() {
  try {
    loading.value = true
    const response = await getMediaList({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      mime: mimeTypeFilter.value || undefined
    })

    if (response.data) {
      mediaList.value = response.data.list || response.data
      total.value = response.data.total || response.data.length || 0
    }
  } catch (err: any) {
    message.error('加载媒体文件失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  loadMedia()
}

function handleReset() {
  searchQuery.value = ''
  mimeTypeFilter.value = ''
  currentPage.value = 1
  loadMedia()
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadMedia()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadMedia()
}

// 监听选择变化
watch(selectedIds, (newIds) => {
  if (props.multiple) {
    const selectedMedia = mediaList.value.filter(m => newIds.includes(m.id))
    emit('select', selectedMedia)
  }
})

// 生命周期
onMounted(() => {
  loadMedia()
})
</script>

<style scoped>
.media-selector {
  padding: 16px;
}

.upload-area {
  cursor: pointer;
  margin-bottom: 16px;
}

.upload-dragger {
  border: 2px dashed var(--n-border-color);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s;
  background: var(--n-color);
}

.upload-dragger:hover {
  border-color: var(--n-primary-color);
  background: var(--n-color-hover);
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.media-item {
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.media-item:hover {
  border-color: var(--n-primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.media-item.selected {
  border-color: var(--n-primary-color);
  box-shadow: 0 0 0 2px var(--n-primary-color);
}

.media-preview {
  width: 100%;
  height: 150px;
  background: var(--n-color);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  color: var(--n-text-color-3);
}

.media-info {
  padding: 12px;
}

.media-name {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.media-meta {
  font-size: 12px;
  color: var(--n-text-color-3);
}

.media-actions {
  position: absolute;
  top: 8px;
  right: 8px;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 60px 0;
  text-align: center;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>