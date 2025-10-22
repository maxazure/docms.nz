<template>
  <div class="media-library">
    <n-card title="媒体库">
      <template #header-extra>
        <n-space>
          <n-button type="primary" @click="handleUpload">
            <template #icon>
              <n-icon :component="CloudUploadOutline" />
            </template>
            上传文件
          </n-button>
          <n-button-group>
            <n-button
              :type="viewMode === 'grid' ? 'primary' : 'default'"
              @click="viewMode = 'grid'"
            >
              <template #icon>
                <n-icon :component="GridOutline" />
              </template>
            </n-button>
            <n-button
              :type="viewMode === 'list' ? 'primary' : 'default'"
              @click="viewMode = 'list'"
            >
              <template #icon>
                <n-icon :component="ListOutline" />
              </template>
            </n-button>
          </n-button-group>
        </n-space>
      </template>

      <!-- 工具栏 -->
      <n-space vertical :size="16">
        <!-- 搜索和筛选 -->
        <n-space>
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索文件名..."
            clearable
            style="width: 300px"
          >
            <template #prefix>
              <n-icon :component="SearchOutline" />
            </template>
          </n-input>
          <n-select
            v-model:value="filterType"
            placeholder="文件类型"
            clearable
            style="width: 150px"
            :options="fileTypeOptions"
          />
          <n-button @click="handleSearch">搜索</n-button>
          <n-button @click="handleReset">重置</n-button>
        </n-space>

        <!-- 批量操作 -->
        <n-space v-if="selectedIds.length > 0">
          <n-text>已选择 {{ selectedIds.length }} 项</n-text>
          <n-button @click="handleBatchDelete" type="error" size="small">
            批量删除
          </n-button>
          <n-button @click="selectedIds = []" size="small">取消选择</n-button>
        </n-space>

        <!-- 媒体列表 - 网格视图 -->
        <div v-if="viewMode === 'grid'" class="media-grid">
          <div
            v-for="item in mediaList"
            :key="item.id"
            class="media-item"
            :class="{ selected: selectedIds.includes(item.id) }"
            @click="toggleSelect(item.id)"
          >
            <div class="media-preview">
              <img
                v-if="isImage(item.mimeType)"
                :src="item.url"
                :alt="item.filename"
                @error="handleImageError"
              />
              <n-icon
                v-else
                :component="getFileIcon(item.mimeType)"
                size="48"
                class="file-icon"
              />
            </div>
            <div class="media-info">
              <n-text class="filename" :title="item.filename">{{ item.filename }}</n-text>
              <n-text depth="3" class="filesize">{{ formatFileSize(item.size) }}</n-text>
            </div>
            <div class="media-actions">
              <n-button-group size="small">
                <n-button @click.stop="handlePreview(item)">
                  <template #icon>
                    <n-icon :component="EyeOutline" />
                  </template>
                </n-button>
                <n-button @click.stop="handleEdit(item)">
                  <template #icon>
                    <n-icon :component="CreateOutline" />
                  </template>
                </n-button>
                <n-button @click.stop="handleCopyUrl(item)">
                  <template #icon>
                    <n-icon :component="CopyOutline" />
                  </template>
                </n-button>
                <n-button @click.stop="handleDelete(item)" type="error">
                  <template #icon>
                    <n-icon :component="TrashOutline" />
                  </template>
                </n-button>
              </n-button-group>
            </div>
          </div>
        </div>

        <!-- 媒体列表 - 列表视图 -->
        <n-data-table
          v-else
          :columns="columns"
          :data="mediaList"
          :loading="loading"
          :pagination="pagination"
          :row-key="(row: MediaItem) => row.id"
          :checked-row-keys="selectedIds"
          @update:checked-row-keys="handleCheck"
        />
      </n-space>
    </n-card>

    <!-- 上传对话框 -->
    <n-modal v-model:show="uploadModalVisible" preset="card" title="上传文件" style="width: 600px">
      <n-upload
        :action="uploadAction"
        :headers="uploadHeaders"
        :max="10"
        multiple
        @finish="handleUploadFinish"
        @error="handleUploadError"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon :component="CloudUploadOutline" size="48" :depth="3" />
          </div>
          <n-text style="font-size: 16px">点击或拖拽文件到此处上传</n-text>
          <n-text depth="3" style="margin: 8px 0 0 0">
            支持常见图片、文档、视频格式，单个文件不超过 10MB
          </n-text>
        </n-upload-dragger>
      </n-upload>
    </n-modal>

    <!-- 编辑对话框 -->
    <n-modal
      v-model:show="editModalVisible"
      preset="card"
      title="编辑文件信息"
      style="width: 500px"
    >
      <n-form v-if="editingItem" :model="editingItem" label-placement="left" :label-width="80">
        <n-form-item label="文件名">
          <n-input v-model:value="editingItem.filename" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="editingItem.alt" type="textarea" :rows="3" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="editModalVisible = false">取消</n-button>
          <n-button type="primary" @click="handleSaveEdit">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 预览对话框 -->
    <n-modal
      v-model:show="previewModalVisible"
      preset="card"
      :title="previewItem?.filename"
      style="width: 800px"
    >
      <div v-if="previewItem" class="preview-content">
        <img
          v-if="isImage(previewItem.mimeType)"
          :src="previewItem.url"
          :alt="previewItem.filename"
          style="max-width: 100%; max-height: 600px"
        />
        <video
          v-else-if="isVideo(previewItem.mimeType)"
          :src="previewItem.url"
          controls
          style="max-width: 100%"
        />
        <div v-else>
          <n-text>此文件类型不支持预览</n-text>
        </div>
        <n-divider />
        <n-descriptions :column="2" size="small">
          <n-descriptions-item label="文件名">{{ previewItem.filename }}</n-descriptions-item>
          <n-descriptions-item label="文件大小">{{
            formatFileSize(previewItem.size)
          }}</n-descriptions-item>
          <n-descriptions-item label="MIME 类型">{{ previewItem.mimeType }}</n-descriptions-item>
          <n-descriptions-item label="上传时间">{{
            formatDate(previewItem.createdAt)
          }}</n-descriptions-item>
          <n-descriptions-item label="URL" :span="2">
            <n-text code>{{ previewItem.url }}</n-text>
          </n-descriptions-item>
        </n-descriptions>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { NButton, NImage, NSpace, NText, useDialog, useMessage, type DataTableColumns } from 'naive-ui'
import {
  CloudUploadOutline,
  GridOutline,
  ListOutline,
  SearchOutline,
  EyeOutline,
  CreateOutline,
  CopyOutline,
  TrashOutline,
  DocumentOutline,
  VideocamOutline,
  MusicalNotesOutline,
  ArchiveOutline
} from '@vicons/ionicons5'
import { mediaApi } from '@/api/media'

interface MediaItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt?: string
  createdAt: string
  updatedAt: string
}

defineOptions({
  name: 'MediaLibrary'
})

const message = useMessage()
const dialog = useDialog()

// 视图模式
const viewMode = ref<'grid' | 'list'>('grid')

// 搜索和筛选
const searchKeyword = ref('')
const filterType = ref<string | null>(null)

const fileTypeOptions = [
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '音频', value: 'audio' },
  { label: '文档', value: 'document' }
]

// 媒体列表
const mediaList = ref<MediaItem[]>([])
const loading = ref(false)
const selectedIds = ref<string[]>([])

// 分页
const pagination = {
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
}

// 上传相关
const uploadModalVisible = ref(false)
const uploadAction = computed(() => `${import.meta.env.VITE_API_BASE_URL}/media/upload`)
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))

// 编辑相关
const editModalVisible = ref(false)
const editingItem = ref<MediaItem | null>(null)

// 预览相关
const previewModalVisible = ref(false)
const previewItem = ref<MediaItem | null>(null)

// 表格列定义
const columns: DataTableColumns<MediaItem> = [
  {
    type: 'selection'
  },
  {
    title: '预览',
    key: 'preview',
    width: 80,
    render(row) {
      if (isImage(row.mimeType)) {
        return h(NImage, {
          src: row.url,
          width: 50,
          height: 50,
          objectFit: 'cover'
        })
      }
      return h('div', { class: 'file-icon-cell' }, [
        h(
          'n-icon',
          {
            component: getFileIcon(row.mimeType),
            size: 32
          }
        )
      ])
    }
  },
  {
    title: '文件名',
    key: 'filename',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: 'MIME 类型',
    key: 'mimeType',
    width: 150
  },
  {
    title: '大小',
    key: 'size',
    width: 100,
    render(row) {
      return formatFileSize(row.size)
    }
  },
  {
    title: '上传时间',
    key: 'createdAt',
    width: 180,
    render(row) {
      return formatDate(row.createdAt)
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    render(row) {
      return h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                onClick: () => handlePreview(row)
              },
              { default: () => '预览' }
            ),
            h(
              NButton,
              {
                size: 'small',
                onClick: () => handleEdit(row)
              },
              { default: () => '编辑' }
            ),
            h(
              NButton,
              {
                size: 'small',
                onClick: () => handleCopyUrl(row)
              },
              { default: () => '复制链接' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleDelete(row)
              },
              { default: () => '删除' }
            )
          ]
        }
      )
    }
  }
]

// 加载媒体列表
const loadMediaList = async () => {
  loading.value = true
  try {
    const data = await mediaApi.getMediaList({
      keyword: searchKeyword.value,
      type: filterType.value,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    mediaList.value = data.items
    pagination.itemCount = data.total
  } catch (error) {
    message.error('加载媒体列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 工具函数
const isImage = (mimeType: string) => mimeType.startsWith('image/')
const isVideo = (mimeType: string) => mimeType.startsWith('video/')
const isAudio = (mimeType: string) => mimeType.startsWith('audio/')

const getFileIcon = (mimeType: string) => {
  if (isVideo(mimeType)) return VideocamOutline
  if (isAudio(mimeType)) return MusicalNotesOutline
  if (mimeType.includes('zip') || mimeType.includes('archive')) return ArchiveOutline
  return DocumentOutline
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 事件处理
const handleUpload = () => {
  uploadModalVisible.value = true
}

const handleUploadFinish = () => {
  message.success('上传成功')
  uploadModalVisible.value = false
  loadMediaList()
}

const handleUploadError = () => {
  message.error('上传失败')
}

const handleSearch = () => {
  pagination.page = 1
  loadMediaList()
}

const handleReset = () => {
  searchKeyword.value = ''
  filterType.value = null
  pagination.page = 1
  loadMediaList()
}

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const handleCheck = (keys: string[]) => {
  selectedIds.value = keys
}

const handlePreview = (item: MediaItem) => {
  previewItem.value = item
  previewModalVisible.value = true
}

const handleEdit = (item: MediaItem) => {
  editingItem.value = { ...item }
  editModalVisible.value = true
}

const handleSaveEdit = async () => {
  if (!editingItem.value) return

  try {
    await mediaApi.updateMedia(editingItem.value.id, {
      filename: editingItem.value.filename,
      alt: editingItem.value.alt
    })
    message.success('保存成功')
    editModalVisible.value = false
    loadMediaList()
  } catch (error) {
    message.error('保存失败')
    console.error(error)
  }
}

const handleCopyUrl = async (item: MediaItem) => {
  try {
    await navigator.clipboard.writeText(item.url)
    message.success('链接已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

const handleDelete = (item: MediaItem) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除文件 "${item.filename}" 吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await mediaApi.deleteMedia(item.id)
        message.success('删除成功')
        loadMediaList()
      } catch (error) {
        message.error('删除失败')
        console.error(error)
      }
    }
  })
}

const handleBatchDelete = () => {
  dialog.warning({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedIds.value.length} 个文件吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await mediaApi.deleteMediaBatch(selectedIds.value)
        message.success('批量删除成功')
        selectedIds.value = []
        loadMediaList()
      } catch (error) {
        message.error('批量删除失败')
        console.error(error)
      }
    }
  })
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E'
}

// 初始化
loadMediaList()
</script>

<style scoped>
.media-library {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.media-item {
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--n-color);
}

.media-item:hover {
  border-color: var(--n-color-target);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.media-item.selected {
  border-color: var(--n-color-target);
  background: var(--n-color-hover);
}

.media-preview {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--n-color-hover);
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
}

.media-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-icon {
  color: var(--n-text-color-3);
}

.media-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.filename {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filesize {
  font-size: 12px;
}

.media-actions {
  display: flex;
  justify-content: center;
}

.preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.file-icon-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
}
</style>
