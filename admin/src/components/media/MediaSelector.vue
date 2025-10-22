<template>
  <n-modal
    :show="visible"
    preset="card"
    title="	é’S‡ö"
    style="width: 90%; max-width: 1200px"
    @update:show="handleUpdateShow"
  >
    <template #header-extra>
      <n-upload
        :multiple="false"
        :show-file-list="false"
        :custom-request="handleCustomUpload"
        @before-upload="handleBeforeUpload"
      >
        <n-button size="small" type="primary">
          <template #icon>
            <n-icon><CloudUploadOutline /></n-icon>
          </template>
          
 
        </n-button>
      </n-upload>
    </template>

    <!-- Search -->
    <n-space style="margin-bottom: 16px">
      <n-input
        v-model:value="searchQuery"
        placeholder=""‡ö..."
        clearable
        style="width: 300px"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <n-icon><SearchOutline /></n-icon>
        </template>
      </n-input>

      <n-button @click="handleSearch">"</n-button>
    </n-space>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
    </div>

    <!-- Error State -->
    <n-alert v-else-if="error" type="error" title=" }1%">
      {{ error }}
    </n-alert>

    <!-- Media Grid -->
    <div v-else class="media-grid">
      <div
        v-for="item in mediaItems"
        :key="item.id"
        class="media-card"
        :class="{ selected: isSelected(item.id) }"
        @click="handleSelectToggle(item)"
      >
        <div class="media-preview">
          <img
            v-if="isImage(item.mime)"
            :src="item.url"
            :alt="item.alt || item.filename"
          />
          <div v-else class="file-icon">
            <n-icon size="48">
              <DocumentOutline v-if="isPDF(item.mime)" />
              <VideocamOutline v-else-if="isVideo(item.mime)" />
              <DocumentTextOutline v-else />
            </n-icon>
          </div>
        </div>

        <div class="media-info">
          <n-ellipsis class="filename" :tooltip="true">
            {{ item.filename }}
          </n-ellipsis>
          <n-text depth="3" class="meta">
            {{ formatFileSize(item.size) }}
            <span v-if="item.width && item.height">
              · {{ item.width }}×{{ item.height }}
            </span>
          </n-text>
        </div>

        <div v-if="isSelected(item.id)" class="selection-indicator">
          <n-icon size="20" color="white">
            <CheckmarkCircle />
          </n-icon>
        </div>
      </div>

      <n-empty
        v-if="mediaItems.length === 0"
        description="‚à’S‡ö"
      />
    </div>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="pagination">
      <n-pagination
        v-model:page="currentPage"
        :page-count="Math.ceil(total / pageSize)"
        :page-size="pageSize"
        @update:page="loadMedia"
      />
    </div>

    <template #footer>
      <n-space justify="end">
        <n-text v-if="multiple && selectedIds.length > 0" depth="3">
          ò	é {{ selectedIds.length }} y
        </n-text>
        <n-button @click="handleCancel">Öˆ</n-button>
        <n-button
          type="primary"
          :disabled="!hasSelection"
          @click="handleConfirm"
        >
          nš
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage, type UploadCustomRequestOptions } from 'naive-ui'
import {
  CloudUploadOutline,
  SearchOutline,
  DocumentOutline,
  DocumentTextOutline,
  VideocamOutline,
  CheckmarkCircle
} from '@vicons/ionicons5'
import { mediaApi } from '@/api/media'
import type { Media } from '@/types'

// Props
interface Props {
  visible: boolean
  multiple?: boolean
  accept?: string
  maxSize?: number
  onSelect?: (media: Media | Media[]) => void
  onCancel?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  multiple: false,
  accept: undefined,
  maxSize: 10 * 1024 * 1024 // 10MB
})

// State
const message = useMessage()

const loading = ref(false)
const error = ref<string | null>(null)
const mediaItems = ref<Media[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const searchQuery = ref('')
const selectedIds = ref<string[]>([])
const selectedMedia = ref<Media | Media[] | null>(null)

// Computed
const hasSelection = computed(() => {
  if (props.multiple) {
    return selectedIds.value.length > 0
  }
  return selectedMedia.value !== null
})

// Methods
async function loadMedia() {
  loading.value = true
  error.value = null

  try {
    const response = await mediaApi.getMediaList({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      mime: props.accept || undefined
    })

    if (response.data) {
      mediaItems.value = response.data.data
      total.value = response.data.total
    }
  } catch (err: any) {
    error.value = err.message || ' }’S‡ö1%'
    message.error(' }’S‡ö1%')
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  currentPage.value = 1
  await loadMedia()
}

function isSelected(id: string): boolean {
  return selectedIds.value.includes(id)
}

function handleSelect(item: Media) {
  if (props.multiple) {
    // Multiple selection mode
    const index = selectedIds.value.indexOf(item.id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
      const mediaArray = selectedMedia.value as Media[]
      mediaArray.splice(index, 1)
    } else {
      selectedIds.value.push(item.id)
      if (Array.isArray(selectedMedia.value)) {
        selectedMedia.value.push(item)
      } else {
        selectedMedia.value = [item]
      }
    }
  } else {
    // Single selection mode
    selectedIds.value = [item.id]
    selectedMedia.value = item
  }
}

function handleSelectToggle(item: Media) {
  handleSelect(item)
}

function validateFileSize(file: File): boolean {
  return file.size <= props.maxSize
}

function validateFileType(file: File): boolean {
  if (!props.accept) return true
  return file.type.startsWith(props.accept.replace('*', ''))
}

function handleBeforeUpload({ file }: { file: { file: File } }): boolean {
  if (!validateFileSize(file.file)) {
    message.error(`‡ö'ý…Ç ${formatFileSize(props.maxSize)}`)
    return false
  }

  if (!validateFileType(file.file)) {
    message.error('/„‡ö{‹')
    return false
  }

  return true
}

async function handleCustomUpload({ file }: UploadCustomRequestOptions) {
  try {
    await handleUploadInSelector(file.file as File)
  } catch (err: any) {
    message.error('
 1%')
  }
}

async function handleUploadInSelector(file: File) {
  try {
    const response = await mediaApi.uploadMedia(file)
    message.success('
 Ÿ')

    // Auto-select the uploaded file
    if (response.data) {
      if (props.multiple) {
        selectedIds.value.push(response.data.id)
        if (Array.isArray(selectedMedia.value)) {
          selectedMedia.value.push(response.data)
        } else {
          selectedMedia.value = [response.data]
        }
      } else {
        selectedIds.value = [response.data.id]
        selectedMedia.value = response.data
      }
    }

    // Reload media list
    await loadMedia()
  } catch (err: any) {
    error.value = err.message
    message.error('
 1%')
    throw err
  }
}

function handleConfirm() {
  if (props.onSelect) {
    props.onSelect(selectedMedia.value as Media | Media[])
  }
  resetSelection()
}

function handleCancel() {
  if (props.onCancel) {
    props.onCancel()
  }
  resetSelection()
}

function handleUpdateShow(show: boolean) {
  if (!show) {
    handleCancel()
  }
}

function resetSelection() {
  selectedIds.value = []
  selectedMedia.value = props.multiple ? [] : null
  searchQuery.value = ''
  currentPage.value = 1
}

function isImage(mime: string): boolean {
  return mime.startsWith('image/')
}

function isPDF(mime: string): boolean {
  return mime === 'application/pdf'
}

function isVideo(mime: string): boolean {
  return mime.startsWith('video/')
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Watch visible prop to load media
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadMedia()
  }
})

// Expose for testing
defineExpose({
  loading,
  error,
  mediaItems,
  total,
  currentPage,
  pageSize,
  searchQuery,
  selectedIds,
  selectedMedia,
  handleSelect,
  handleSearch,
  handleUploadInSelector,
  handleConfirm,
  handleCancel,
  validateFileSize,
  validateFileType,
  loadMedia
})
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
  padding: 8px;
}

.media-card {
  position: relative;
  border: 2px solid var(--n-border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.media-card:hover {
  border-color: var(--n-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.media-card.selected {
  border-color: var(--n-color-primary);
  background-color: var(--n-color-primary-hover);
}

.media-preview {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--n-color-target);
  overflow: hidden;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--n-text-color-disabled);
}

.media-info {
  padding: 8px;
}

.filename {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.meta {
  font-size: 11px;
}

.selection-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: var(--n-color-primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
