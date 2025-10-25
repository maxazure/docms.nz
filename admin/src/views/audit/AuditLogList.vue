<template>
  <div class="audit-log-list">
    <n-space vertical :size="16">
      <!-- Header -->
      <n-space justify="space-between" align="center">
        <h2>审计日志</h2>
        <n-button @click="loadLogs" :loading="loading">
          <template #icon>
            <n-icon><RefreshOutline /></n-icon>
          </template>
          刷新
        </n-button>
      </n-space>

      <!-- Filters -->
      <n-space>
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索操作或用户"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <n-icon><SearchOutline /></n-icon>
          </template>
        </n-input>

        <n-select
          v-model:value="actionFilter"
          placeholder="操作类型"
          clearable
          style="width: 150px"
          :options="actionOptions"
          @update:value="loadLogs"
        />

        <n-select
          v-model:value="entityFilter"
          placeholder="实体类型"
          clearable
          style="width: 150px"
          :options="entityOptions"
          @update:value="loadLogs"
        />

        <n-date-picker
          v-model:value="dateRange"
          type="daterange"
          clearable
          placeholder="选择日期范围"
          @update:value="loadLogs"
        />

        <n-button @click="handleSearch">搜索</n-button>
        <n-button @click="handleReset">重置</n-button>
      </n-space>

      <!-- Table -->
      <n-data-table
        :columns="columns"
        :data="logs"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { useMessage, NTag, NButton, type DataTableColumns } from 'naive-ui'
import { RefreshOutline, SearchOutline, EyeOutline } from '@vicons/ionicons5'

const message = useMessage()

const loading = ref(false)
const logs = ref<any[]>([])

const searchKeyword = ref('')
const actionFilter = ref<string | null>(null)
const entityFilter = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const actionOptions = [
  { label: '创建', value: 'CREATE' },
  { label: '更新', value: 'UPDATE' },
  { label: '删除', value: 'DELETE' },
  { label: '登录', value: 'LOGIN' },
  { label: '登出', value: 'LOGOUT' },
  { label: '发布', value: 'PUBLISH' },
  { label: '取消发布', value: 'UNPUBLISH' }
]

const entityOptions = [
  { label: '页面', value: 'PAGE' },
  { label: '文章', value: 'POST' },
  { label: '产品', value: 'PRODUCT' },
  { label: '媒体', value: 'MEDIA' },
  { label: '菜单', value: 'MENU' },
  { label: '用户', value: 'USER' },
  { label: '站点', value: 'SITE' }
]

const getActionColor = (action: string) => {
  const colorMap: Record<string, any> = {
    CREATE: 'success',
    UPDATE: 'info',
    DELETE: 'error',
    LOGIN: 'success',
    LOGOUT: 'default',
    PUBLISH: 'warning',
    UNPUBLISH: 'default'
  }
  return colorMap[action] || 'default'
}

const getActionLabel = (action: string) => {
  const labelMap: Record<string, string> = {
    CREATE: '创建',
    UPDATE: '更新',
    DELETE: '删除',
    LOGIN: '登录',
    LOGOUT: '登出',
    PUBLISH: '发布',
    UNPUBLISH: '取消发布'
  }
  return labelMap[action] || action
}

const columns: DataTableColumns<any> = [
  {
    title: '时间',
    key: 'createdAt',
    width: 180,
    render: row => new Date(row.createdAt || Date.now()).toLocaleString('zh-CN')
  },
  {
    title: '用户',
    key: 'user',
    width: 150,
    render: row => row.user?.displayName || row.user?.email || '系统'
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    render: row => h(NTag, {
      type: getActionColor(row.action),
      size: 'small'
    }, () => getActionLabel(row.action))
  },
  {
    title: '实体类型',
    key: 'entity',
    width: 100,
    render: row => row.entityType || '-'
  },
  {
    title: '实体名称',
    key: 'entityName',
    width: 200,
    ellipsis: { tooltip: true },
    render: row => row.entityName || row.entityId || '-'
  },
  {
    title: '描述',
    key: 'description',
    ellipsis: { tooltip: true },
    render: row => row.description || '-'
  },
  {
    title: 'IP地址',
    key: 'ipAddress',
    width: 140,
    render: row => row.ipAddress || '-'
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: row => {
      return h(NButton, {
        size: 'small',
        onClick: () => handleViewDetails(row)
      }, {
        icon: () => h('i', { class: 'n-icon' }, [h(EyeOutline)]),
        default: () => '详情'
      })
    }
  }
]

const pagination = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  pageCount: Math.ceil(total.value / pageSize.value),
  itemCount: total.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: handlePageChange,
  onUpdatePageSize: handlePageSizeChange
}))

async function loadLogs() {
  try {
    loading.value = true

    // Mock data for now - replace with actual API call
    // const response = await getAuditLogs({
    //   page: currentPage.value,
    //   limit: pageSize.value,
    //   search: searchKeyword.value || undefined,
    //   action: actionFilter.value || undefined,
    //   entityType: entityFilter.value || undefined,
    //   startDate: dateRange.value?.[0] ? new Date(dateRange.value[0]) : undefined,
    //   endDate: dateRange.value?.[1] ? new Date(dateRange.value[1]) : undefined
    // })

    // Mock data
    const mockLogs = [
      {
        id: '1',
        createdAt: new Date().toISOString(),
        user: { displayName: '张总', email: 'owner@hydroponics.com' },
        action: 'UPDATE',
        entityType: 'PAGE',
        entityId: 'home',
        entityName: '首页',
        description: '更新首页内容区块',
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        user: { displayName: '李编辑', email: 'editor@hydroponics.com' },
        action: 'CREATE',
        entityType: 'POST',
        entityId: 'new-product-launch',
        entityName: '新产品发布',
        description: '创建新文章：新产品发布',
        ipAddress: '192.168.1.101'
      },
      {
        id: '3',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        user: { displayName: '王管理员', email: 'admin@hydroponics.com' },
        action: 'DELETE',
        entityType: 'MEDIA',
        entityId: 'old-image.jpg',
        entityName: 'old-image.jpg',
        description: '删除过期的媒体文件',
        ipAddress: '192.168.1.102'
      },
      {
        id: '4',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        user: { displayName: '张总', email: 'owner@hydroponics.com' },
        action: 'LOGIN',
        entityType: 'USER',
        entityId: 'owner',
        entityName: '张总',
        description: '用户登录系统',
        ipAddress: '192.168.1.100'
      },
      {
        id: '5',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        user: { displayName: '李编辑', email: 'editor@hydroponics.com' },
        action: 'PUBLISH',
        entityType: 'PRODUCT',
        entityId: 'nft-system-pro',
        entityName: 'NFT水培系统 Pro',
        description: '发布产品到前台',
        ipAddress: '192.168.1.101'
      }
    ]

    logs.value = mockLogs
    total.value = 5

  } catch (error) {
    message.error('加载审计日志失败')
    console.error(error)
    logs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleViewDetails(log: any) {
  message.info(`查看日志详情: ${log.entityName}`)
  // TODO: Open modal with full log details
  console.log('Log details:', log)
}

function handleSearch() {
  currentPage.value = 1
  loadLogs()
}

function handleReset() {
  searchKeyword.value = ''
  actionFilter.value = null
  entityFilter.value = null
  dateRange.value = null
  currentPage.value = 1
  loadLogs()
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadLogs()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadLogs()
}

onMounted(() => {
  loadLogs()
})

defineExpose({
  loadLogs,
  handleViewDetails,
  searchKeyword,
  actionFilter,
  entityFilter,
  currentPage
})
</script>

<style scoped>
.audit-log-list {
  padding: 16px;
}
</style>
