<template>
  <div class="form-list">
    <n-space vertical :size="16">
      <!-- Header -->
      <n-space justify="space-between" align="center">
        <h2>留言管理</h2>
        <n-space>
          <n-button
            v-if="checkedRowKeys.length > 0"
            type="error"
            @click="handleBatchDelete"
          >
            批量删除 ({{ checkedRowKeys.length }})
          </n-button>
          <n-button @click="handleRefresh">
            <template #icon>
              <n-icon><Refresh /></n-icon>
            </template>
            刷新
          </n-button>
        </n-space>
      </n-space>

      <!-- Filters -->
      <n-card>
        <n-space vertical :size="12">
          <n-space :size="12">
            <n-select
              v-model:value="filters.formCode"
              :options="formCodeOptions"
              placeholder="选择表单"
              clearable
              style="width: 200px"
              @update:value="handleFilterChange"
            />
            <n-input
              v-model:value="filters.search"
              placeholder="搜索内容..."
              clearable
              style="width: 300px"
              @update:value="handleFilterChange"
            >
              <template #prefix>
                <n-icon><Search /></n-icon>
              </template>
            </n-input>
            <n-date-picker
              v-model:value="dateRange"
              type="daterange"
              clearable
              placeholder="选择日期范围"
              @update:value="handleDateChange"
            />
          </n-space>
        </n-space>
      </n-card>

      <!-- Data Table -->
      <n-card>
        <n-data-table
          :columns="columns"
          :data="formSubmissions"
          :loading="loading"
          :row-key="(row) => row.id"
          :pagination="pagination"
          :checked-row-keys="checkedRowKeys"
          @update:checked-row-keys="handleCheck"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </n-card>
    </n-space>

    <!-- Detail Modal -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="留言详情"
      style="width: 600px"
      :segmented="{
        content: true,
        footer: 'soft'
      }"
    >
      <n-spin :show="detailLoading">
        <n-descriptions
          v-if="currentSubmission"
          label-placement="left"
          :column="1"
          bordered
        >
          <n-descriptions-item label="表单代码">
            <n-tag>{{ currentSubmission.formCode }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="IP地址">
            {{ currentSubmission.ip || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="User Agent">
            <n-ellipsis style="max-width: 400px">
              {{ currentSubmission.ua || '-' }}
            </n-ellipsis>
          </n-descriptions-item>
          <n-descriptions-item label="提交时间">
            {{ formatDate(currentSubmission.createdAt) }}
          </n-descriptions-item>
          <n-descriptions-item label="垃圾评分">
            <n-tag v-if="currentSubmission.spamScore !== null" :type="getSpamTagType(currentSubmission.spamScore)">
              {{ currentSubmission.spamScore?.toFixed(2) || '-' }}
            </n-tag>
            <span v-else>-</span>
          </n-descriptions-item>
        </n-descriptions>

        <n-divider />

        <h3>表单数据</h3>
        <n-card v-if="currentSubmission">
          <n-descriptions
            label-placement="left"
            :column="1"
            bordered
          >
            <n-descriptions-item
              v-for="(value, key) in currentSubmission.payload"
              :key="key"
              :label="key"
            >
              <n-ellipsis style="max-width: 400px">
                {{ value }}
              </n-ellipsis>
            </n-descriptions-item>
          </n-descriptions>
        </n-card>
      </n-spin>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="error" @click="handleDeleteFromDetail">删除</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { NButton, NTag, NSpace, useMessage, useDialog, type DataTableColumns } from 'naive-ui'
import { Refresh, Search, Eye, Trash } from '@vicons/ionicons5'
import * as formSubmissionApi from '@/api/form-submission'
import type { FormSubmission, FormSubmissionListQuery } from '@/api/form-submission'
import { formatDate } from '@/utils/date'

const message = useMessage()
const dialog = useDialog()

// Data
const formSubmissions = ref<FormSubmission[]>([])
const loading = ref(false)
const detailLoading = ref(false)
const checkedRowKeys = ref<string[]>([])
const showDetailModal = ref(false)
const currentSubmission = ref<FormSubmission | null>(null)
const formCodeOptions = ref<Array<{ label: string; value: string }>>([])
const dateRange = ref<[number, number] | null>(null)

// Filters
const filters = ref<FormSubmissionListQuery>({
  page: 1,
  limit: 10,
  formCode: undefined,
  search: undefined,
  startDate: undefined,
  endDate: undefined
})

// Pagination
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 50, 100],
  showSizePicker: true,
  prefix: (info: any) => `共 ${info.itemCount} 条`
})

// Columns
const columns: DataTableColumns<FormSubmission> = [
  {
    type: 'selection'
  },
  {
    title: '表单代码',
    key: 'formCode',
    width: 150,
    render: (row) => h(NTag, null, { default: () => row.formCode })
  },
  {
    title: '提交内容',
    key: 'payload',
    ellipsis: {
      tooltip: true
    },
    render: (row) => {
      const preview = Object.entries(row.payload)
        .slice(0, 2)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
      return preview || '-'
    }
  },
  {
    title: 'IP地址',
    key: 'ip',
    width: 140,
    render: (row) => row.ip || '-'
  },
  {
    title: '提交时间',
    key: 'createdAt',
    width: 180,
    render: (row) => formatDate(row.createdAt)
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => {
      return h(NSpace, null, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              onClick: () => handleView(row)
            },
            {
              icon: () => h(Eye),
              default: () => '查看'
            }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              onClick: () => handleDelete(row.id)
            },
            {
              icon: () => h(Trash),
              default: () => '删除'
            }
          )
        ]
      })
    }
  }
]

// Methods
const loadFormSubmissions = async () => {
  loading.value = true
  try {
    const response = await formSubmissionApi.getFormSubmissionList(filters.value)
    formSubmissions.value = response.data
    pagination.value.itemCount = response.total
    pagination.value.page = response.page
  } catch (error: any) {
    message.error(error.message || '加载留言列表失败')
  } finally {
    loading.value = false
  }
}

const loadFormCodes = async () => {
  try {
    const codes = await formSubmissionApi.getFormCodes()
    formCodeOptions.value = codes.map(item => ({
      label: `${item.code} (${item.count})`,
      value: item.code
    }))
  } catch (error: any) {
    console.error('Failed to load form codes:', error)
  }
}

const handleView = async (submission: FormSubmission) => {
  currentSubmission.value = submission
  showDetailModal.value = true
}

const handleDelete = (id: string) => {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条留言吗？此操作不可恢复。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await formSubmissionApi.deleteFormSubmission(id)
        message.success('删除成功')
        loadFormSubmissions()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

const handleDeleteFromDetail = () => {
  if (!currentSubmission.value) return

  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条留言吗？此操作不可恢复。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await formSubmissionApi.deleteFormSubmission(currentSubmission.value!.id)
        message.success('删除成功')
        showDetailModal.value = false
        loadFormSubmissions()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

const handleBatchDelete = () => {
  dialog.warning({
    title: '确认批量删除',
    content: `确定要删除选中的 ${checkedRowKeys.value.length} 条留言吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await formSubmissionApi.batchDeleteFormSubmissions(checkedRowKeys.value)
        message.success('批量删除成功')
        checkedRowKeys.value = []
        loadFormSubmissions()
      } catch (error: any) {
        message.error(error.message || '批量删除失败')
      }
    }
  })
}

const handleCheck = (keys: string[]) => {
  checkedRowKeys.value = keys
}

const handlePageChange = (page: number) => {
  filters.value.page = page
  loadFormSubmissions()
}

const handlePageSizeChange = (pageSize: number) => {
  filters.value.limit = pageSize
  filters.value.page = 1
  pagination.value.pageSize = pageSize
  loadFormSubmissions()
}

const handleFilterChange = () => {
  filters.value.page = 1
  loadFormSubmissions()
}

const handleDateChange = (value: [number, number] | null) => {
  if (value) {
    filters.value.startDate = new Date(value[0]).toISOString()
    filters.value.endDate = new Date(value[1]).toISOString()
  } else {
    filters.value.startDate = undefined
    filters.value.endDate = undefined
  }
  handleFilterChange()
}

const handleRefresh = () => {
  loadFormSubmissions()
  loadFormCodes()
}

const getSpamTagType = (score?: number) => {
  if (!score) return 'default'
  if (score > 0.8) return 'error'
  if (score > 0.5) return 'warning'
  return 'success'
}

// Lifecycle
onMounted(() => {
  loadFormSubmissions()
  loadFormCodes()
})
</script>

<style scoped>
.form-list {
  padding: 20px;
}

h3 {
  margin-top: 0;
  margin-bottom: 12px;
}
</style>
