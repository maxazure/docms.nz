<template>
  <div class="user-list">
    <n-space vertical :size="16">
      <n-card title="用户与权限">
        <template #header-extra>
          <n-button type="primary" @click="handleCreate">
            <template #icon>
              <n-icon><AddCircle /></n-icon>
            </template>
            创建用户
          </n-button>
        </template>

        <n-space vertical :size="16">
          <!-- Filters -->
          <n-space :size="12">
            <n-input
              v-model:value="filters.search"
              placeholder="搜索邮箱或名称"
              clearable
              style="width: 300px"
              @input="handleSearch"
            >
              <template #prefix>
                <n-icon><Search /></n-icon>
              </template>
            </n-input>

            <n-select
              v-model:value="filters.role"
              placeholder="筛选角色"
              clearable
              style="width: 200px"
              :options="roleOptions"
              @update:value="loadUsers"
            />
          </n-space>

          <!-- Data Table -->
          <n-data-table
            :columns="columns"
            :data="users"
            :loading="loading"
            :pagination="pagination"
            :row-key="(row: User) => row.id"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </n-space>
      </n-card>
    </n-space>

    <!-- Create/Edit User Dialog -->
    <n-modal
      v-model:show="showDialog"
      :title="editingUser ? '编辑用户' : '创建用户'"
      preset="dialog"
      :mask-closable="false"
      style="width: 600px"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100"
      >
        <n-form-item label="邮箱" path="email">
          <n-input
            v-model:value="formData.email"
            placeholder="请输入邮箱地址"
            :disabled="!!editingUser"
          />
        </n-form-item>

        <n-form-item label="显示名称" path="displayName">
          <n-input
            v-model:value="formData.displayName"
            placeholder="请输入显示名称"
          />
        </n-form-item>

        <n-form-item label="密码" :path="editingUser ? undefined : 'password'">
          <n-input
            v-model:value="formData.password"
            type="password"
            show-password-on="click"
            :placeholder="editingUser ? '留空则不修改密码' : '请输入密码'"
          />
        </n-form-item>

        <n-form-item label="角色" path="role">
          <n-select
            v-model:value="formData.role"
            :options="roleOptions"
            placeholder="请选择角色"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="showDialog = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">
            保存
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { useMessage, useDialog, type FormInst, type FormRules, type DataTableColumns } from 'naive-ui'
import { NButton, NTag, NSpace, NIcon } from 'naive-ui'
import { AddCircle, Search, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  type UserListQuery,
  type CreateUserData,
  type UpdateUserData,
} from '@/api/user'
import type { User } from '@/types'
import { formatDate } from '@/utils/date'

const message = useMessage()
const dialog = useDialog()

// State
const loading = ref(false)
const saving = ref(false)
const users = ref<User[]>([])
const showDialog = ref(false)
const editingUser = ref<User | null>(null)
const formRef = ref<FormInst | null>(null)

// Filters
const filters = reactive<UserListQuery>({
  page: 1,
  limit: 10,
  search: '',
  role: undefined,
})

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.page = page
    filters.page = page
    loadUsers()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    filters.limit = pageSize
    filters.page = 1
    loadUsers()
  },
})

// Form data
const formData = reactive<CreateUserData | UpdateUserData>({
  email: '',
  password: '',
  displayName: '',
  role: 'VIEWER',
})

// Role options
const roleOptions = [
  { label: '所有者', value: 'OWNER' },
  { label: '管理员', value: 'ADMIN' },
  { label: '编辑者', value: 'EDITOR' },
  { label: '作者', value: 'AUTHOR' },
  { label: '查看者', value: 'VIEWER' },
]

// Get role label
function getRoleLabel(role: string): string {
  const option = roleOptions.find(opt => opt.value === role)
  return option?.label || role
}

// Get role type
function getRoleType(role: string): 'error' | 'warning' | 'success' | 'info' | 'primary' {
  switch (role) {
    case 'OWNER':
      return 'error'
    case 'ADMIN':
      return 'warning'
    case 'EDITOR':
      return 'success'
    case 'AUTHOR':
      return 'info'
    default:
      return 'primary'
  }
}

// Table columns
const columns: DataTableColumns<User> = [
  {
    title: '邮箱',
    key: 'email',
    width: 250,
  },
  {
    title: '显示名称',
    key: 'displayName',
    width: 150,
  },
  {
    title: '角色',
    key: 'role',
    width: 120,
    render(row) {
      return h(
        NTag,
        {
          type: getRoleType(row.role),
          size: 'small',
        },
        { default: () => getRoleLabel(row.role) }
      )
    },
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
    render(row) {
      return formatDate(row.createdAt)
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h(
        NSpace,
        { size: 4 },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                onClick: () => handleEdit(row),
              },
              {
                icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
              }
            ),
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                type: 'error',
                onClick: () => handleDelete(row),
              },
              {
                icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
              }
            ),
          ],
        }
      )
    },
  },
]

// Form validation rules
const formRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: ['blur', 'input'],
    },
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: ['blur', 'change'] },
  ],
}

// Load users
async function loadUsers() {
  loading.value = true
  try {
    const result = await getUserList(filters)
    users.value = result.data
    pagination.itemCount = result.total
    pagination.page = result.page
  } catch (error: any) {
    message.error(error.message || '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// Search with debounce
let searchTimer: ReturnType<typeof setTimeout> | null = null
function handleSearch() {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    filters.page = 1
    pagination.page = 1
    loadUsers()
  }, 300)
}

// Handle page change
function handlePageChange(page: number) {
  filters.page = page
  pagination.page = page
  loadUsers()
}

// Handle page size change
function handlePageSizeChange(pageSize: number) {
  filters.limit = pageSize
  filters.page = 1
  pagination.pageSize = pageSize
  pagination.page = 1
  loadUsers()
}

// Handle create
function handleCreate() {
  editingUser.value = null
  formData.email = ''
  formData.password = ''
  formData.displayName = ''
  formData.role = 'VIEWER'
  showDialog.value = true
}

// Handle edit
function handleEdit(user: User) {
  editingUser.value = user
  formData.email = user.email
  formData.password = ''
  formData.displayName = user.displayName || ''
  formData.role = user.role
  showDialog.value = true
}

// Handle save
async function handleSave() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    saving.value = true

    if (editingUser.value) {
      // Update
      const updateData: UpdateUserData = {
        displayName: formData.displayName,
        role: formData.role,
      }
      if (formData.password) {
        updateData.password = formData.password
      }
      await updateUser(editingUser.value.id, updateData)
      message.success('用户更新成功')
    } else {
      // Create
      await createUser(formData as CreateUserData)
      message.success('用户创建成功')
    }

    showDialog.value = false
    loadUsers()
  } catch (error: any) {
    if (error.message) {
      message.error(error.message || '保存失败')
    }
  } finally {
    saving.value = false
  }
}

// Handle delete
function handleDelete(user: User) {
  dialog.warning({
    title: '删除用户',
    content: `确定要删除用户 "${user.email}" 吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteUser(user.id)
        message.success('用户删除成功')
        loadUsers()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    },
  })
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-list {
  padding: 20px;
}
</style>
