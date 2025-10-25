<template>
  <div class="audit-log">
    <n-space vertical :size="16">
      <n-card title="审计日志">
        <template #header-extra>
          <n-button @click="loadLogs">
            <template #icon>
              <n-icon><Refresh /></n-icon>
            </template>
            刷新
          </n-button>
        </template>

        <n-space vertical :size="16">
          <!-- Filters -->
          <n-space :size="12" wrap>
            <n-select
              v-model:value="filters.userId"
              placeholder="筛选用户"
              clearable
              filterable
              style="width: 200px"
              :options="userOptions"
              @update:value="loadLogs"
            />

            <n-select
              v-model:value="filters.action"
              placeholder="操作类型"
              clearable
              style="width: 150px"
              :options="actionOptions"
              @update:value="loadLogs"
            />

            <n-select
              v-model:value="filters.resource"
              placeholder="资源类型"
              clearable
              style="width: 150px"
              :options="resourceOptions"
              @update:value="loadLogs"
            />

            <n-date-picker
              v-model:value="dateRange"
              type="daterange"
              clearable
              style="width: 300px"
              @update:value="handleDateRangeChange"
            />

            <n-button @click="handleReset">重置</n-button>
          </n-space>

          <!-- Data Table -->
          <n-data-table
            :columns="columns"
            :data="logs"
            :loading="loading"
            :pagination="pagination"
            :row-key="(row: AuditLog) => row.id"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </n-space>
      </n-card>
    </n-space>

    <!-- Log Detail Dialog -->
    <n-modal
      v-model:show="showDetailDialog"
      title="日志详情"
      preset="dialog"
      :mask-closable="true"
      style="width: 700px"
    >
      <n-space vertical :size="16" v-if="selectedLog">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="用户">
            {{ selectedLog.userName }}
          </n-descriptions-item>
          <n-descriptions-item label="操作">
            <n-tag :type="getActionTagType(selectedLog.action)">
              {{ getActionLabel(selectedLog.action) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="资源">
            {{ getResourceLabel(selectedLog.resource) }}
          </n-descriptions-item>
          <n-descriptions-item label="资源ID" v-if="selectedLog.resourceId">
            {{ selectedLog.resourceId }}
          </n-descriptions-item>
          <n-descriptions-item label="IP地址" v-if="selectedLog.ipAddress">
            {{ selectedLog.ipAddress }}
          </n-descriptions-item>
          <n-descriptions-item label="时间">
            {{ formatDate(selectedLog.createdAt) }}
          </n-descriptions-item>
        </n-descriptions>

        <div v-if="selectedLog.details">
          <n-h3>详细信息</n-h3>
          <n-code :code="JSON.stringify(selectedLog.details, null, 2)" language="json" />
        </div>

        <div v-if="selectedLog.userAgent">
          <n-h3>User Agent</n-h3>
          <n-text>{{ selectedLog.userAgent }}</n-text>
        </div>
      </n-space>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { NButton, NTag, NIcon } from 'naive-ui'
import { Refresh, EyeOutline } from '@vicons/ionicons5'
import { getAuditLogs } from '@/api/audit'
import { getUsers } from '@/api/user'
import type { AuditLog, AuditAction, User } from '@/types'
import { formatDate } from '@/utils/date'

const message = useMessage()
const loading = ref(false)
const logs = ref<AuditLog[]>([])
const users = ref<User[]>([])
const dateRange = ref<[number, number] | null>(null)
const showDetailDialog = ref(false)
const selectedLog = ref<AuditLog | null>(null)

// Filters
const filters = reactive({
  userId: null as string | null,
  action: null as AuditAction | null,
  resource: null as string | null,
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined
})

// Pagination
const pagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.page = page
    loadLogs()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    loadLogs()
  }
})

// User options for filter
const userOptions = computed(() => {
  return users.value.map(user => ({
    label: `${user.displayName} (${user.email})`,
    value: user.id
  }))
})

// Action options
const actionOptions = [
  { label: '创建', value: 'create' },
  { label: '更新', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '发布', value: 'publish' },
  { label: '取消发布', value: 'unpublish' },
  { label: '登录', value: 'login' },
  { label: '登出', value: 'logout' }
]

// Resource options
const resourceOptions = [
  { label: '用户', value: 'user' },
  { label: '页面', value: 'page' },
  { label: '文章', value: 'post' },
  { label: '产品', value: 'product' },
  { label: '媒体', value: 'media' },
  { label: '菜单', value: 'menu' },
  { label: '站点设置', value: 'site' }
]

// Get action label
const getActionLabel = (action: AuditAction) => {
  const option = actionOptions.find(opt => opt.value === action)
  return option?.label || action
}

// Get action tag type
const getActionTagType = (action: AuditAction): 'success' | 'info' | 'warning' | 'error' | 'default' => {
  const typeMap: Record<AuditAction, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
    create: 'success',
    update: 'info',
    delete: 'error',
    publish: 'success',
    unpublish: 'warning',
    login: 'info',
    logout: 'default'
  }
  return typeMap[action] || 'default'
}

// Get resource label
const getResourceLabel = (resource: string) => {
  const option = resourceOptions.find(opt => opt.value === resource)
  return option?.label || resource
}

// Table columns
const columns: DataTableColumns<AuditLog> = [
  {
    title: '时间',
    key: 'createdAt',
    width: 180,
    render: (row) => formatDate(row.createdAt)
  },
  {
    title: '用户',
    key: 'userName',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render: (row) => h(
      NTag,
      { type: getActionTagType(row.action) },
      { default: () => getActionLabel(row.action) }
    )
  },
  {
    title: '资源',
    key: 'resource',
    width: 120,
    render: (row) => getResourceLabel(row.resource)
  },
  {
    title: '资源ID',
    key: 'resourceId',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: 'IP地址',
    key: 'ipAddress',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row) => h(
      NButton,
      {
        size: 'small',
        onClick: () => handleViewDetail(row)
      },
      {
        default: () => '查看详情',
        icon: () => h(NIcon, null, { default: () => h(EyeOutline) })
      }
    )
  }
]

// Load logs
const loadLogs = async () => {
  try {
    loading.value = true
    const response = await getAuditLogs({
      page: pagination.page,
      limit: pagination.pageSize,
      userId: filters.userId || undefined,
      action: filters.action || undefined,
      resource: filters.resource || undefined,
      startDate: filters.startDate,
      endDate: filters.endDate
    })

    logs.value = response.data
    pagination.itemCount = response.total
  } catch (error: any) {
    message.error(error.message || '加载审计日志失败')
  } finally {
    loading.value = false
  }
}

// Load users for filter
const loadUsers = async () => {
  try {
    const response = await getUsers({ page: 1, limit: 100 })
    users.value = response.data
  } catch (error: any) {
    console.error('Failed to load users:', error)
  }
}

// Handle date range change
const handleDateRangeChange = (value: [number, number] | null) => {
  if (value) {
    filters.startDate = new Date(value[0]).toISOString()
    filters.endDate = new Date(value[1]).toISOString()
  } else {
    filters.startDate = undefined
    filters.endDate = undefined
  }
  loadLogs()
}

// Handle reset filters
const handleReset = () => {
  filters.userId = null
  filters.action = null
  filters.resource = null
  filters.startDate = undefined
  filters.endDate = undefined
  dateRange.value = null
  pagination.page = 1
  loadLogs()
}

// Handle page change
const handlePageChange = (page: number) => {
  pagination.page = page
  loadLogs()
}

// Handle page size change
const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadLogs()
}

// Handle view detail
const handleViewDetail = (log: AuditLog) => {
  selectedLog.value = log
  showDetailDialog.value = true
}

// Initialize
onMounted(() => {
  loadUsers()
  loadLogs()
})
</script>

<style scoped>
.audit-log {
  padding: 16px;
}
</style>
