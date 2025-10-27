<template>
  <div class="user-profile">
    <n-space vertical :size="24">
      <!-- 个人信息卡片 -->
      <n-card title="个人信息">
        <n-space vertical :size="16">
          <!-- 头像 -->
          <n-form-item label="头像">
            <div class="avatar-section">
              <n-avatar
                round
                :size="80"
                :src="formData.avatar"
                :fallback-src="defaultAvatar"
              >
                {{ userInitial }}
              </n-avatar>
              <div class="avatar-actions">
                <n-upload
                  :custom-request="handleAvatarUpload"
                  :show-file-list="false"
                  accept="image/*"
                >
                  <n-button size="small">更换头像</n-button>
                </n-upload>
                <n-button
                  size="small"
                  quaternary
                  type="error"
                  @click="handleRemoveAvatar"
                  v-if="formData.avatar"
                >
                  移除头像
                </n-button>
              </div>
            </div>
          </n-form-item>

          <!-- 用户名 -->
          <n-form-item label="用户名">
            <n-input
              v-model:value="formData.username"
              placeholder="用户名"
              disabled
            />
          </n-form-item>

          <!-- 邮箱 -->
          <n-form-item label="邮箱">
            <n-input
              v-model:value="formData.email"
              placeholder="邮箱地址"
              disabled
            />
          </n-form-item>

          <!-- 显示名称 -->
          <n-form-item label="显示名称">
            <n-input
              v-model:value="formData.displayName"
              placeholder="显示名称"
            />
          </n-form-item>

          <!-- 角色 -->
          <n-form-item label="角色">
            <n-tag :type="getRoleType(user?.role || 'VIEWER')">
              {{ getRoleLabel(user?.role || 'VIEWER') }}
            </n-tag>
          </n-form-item>

          <!-- 注册时间 -->
          <n-form-item label="注册时间">
            <span>{{ formatDate(user?.createdAt) }}</span>
          </n-form-item>

          <!-- 最后登录 -->
          <n-form-item label="最后登录">
            <span>{{ formatDate(user?.lastLoginAt) }}</span>
          </n-form-item>

          <!-- 保存按钮 -->
          <n-form-item>
            <n-space>
              <n-button
                type="primary"
                @click="handleSaveProfile"
                :loading="saving"
              >
                保存更改
              </n-button>
              <n-button @click="handleReset">重置</n-button>
            </n-space>
          </n-form-item>
        </n-space>
      </n-card>

      <!-- 修改密码卡片 -->
      <n-card title="修改密码">
        <n-space vertical :size="16">
          <n-form-item label="当前密码">
            <n-input
              v-model:value="passwordForm.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password-on="click"
            />
          </n-form-item>

          <n-form-item label="新密码">
            <n-input
              v-model:value="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password-on="click"
            />
          </n-form-item>

          <n-form-item label="确认新密码">
            <n-input
              v-model:value="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password-on="click"
            />
          </n-form-item>

          <n-form-item>
            <n-button
              type="primary"
              @click="handleChangePassword"
              :loading="changingPassword"
            >
              修改密码
            </n-button>
          </n-form-item>
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { UploadCustomRequestOptions } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { updateUserProfile, changePassword } from '@/api/user'
import { uploadMedia } from '@/api/media'

const message = useMessage()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userInitial = computed(() =>
  (user.value?.displayName || user.value?.email || 'U').charAt(0).toUpperCase()
)
const defaultAvatar = computed(() =>
  'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.value?.displayName || user.value?.email || 'User')
)

const saving = ref(false)
const changingPassword = ref(false)

const formData = ref({
  username: '',
  email: '',
  displayName: '',
  avatar: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 初始化表单数据
function initFormData() {
  if (user.value) {
    formData.value = {
      username: user.value.username || '',
      email: user.value.email || '',
      displayName: user.value.displayName || '',
      avatar: user.value.avatar || ''
    }
  }
}

// 角色标签类型
function getRoleType(role: string) {
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
    OWNER: 'success',
    ADMIN: 'success',
    EDITOR: 'warning',
    AUTHOR: 'info',
    VIEWER: 'default'
  }
  return typeMap[role] || 'default'
}

// 角色标签文本
function getRoleLabel(role: string) {
  const labelMap: Record<string, string> = {
    OWNER: '所有者',
    ADMIN: '管理员',
    EDITOR: '编辑',
    AUTHOR: '作者',
    VIEWER: '查看者'
  }
  return labelMap[role] || role
}

// 格式化日期
function formatDate(dateString?: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 上传头像
async function handleAvatarUpload(options: UploadCustomRequestOptions) {
  try {
    const { file } = options
    const formData = new FormData()
    formData.append('file', file.file as File)

    const response = await uploadMedia(formData)
    formData.value.avatar = response.url
    message.success('头像上传成功')
  } catch (error: any) {
    message.error(error.message || '头像上传失败')
    options.onError()
  }
}

// 移除头像
function handleRemoveAvatar() {
  formData.value.avatar = ''
  message.success('头像已移除')
}

// 保存个人资料
async function handleSaveProfile() {
  try {
    saving.value = true
    await updateUserProfile({
      displayName: formData.value.displayName,
      avatar: formData.value.avatar
    })

    // 更新 store 中的用户信息
    await authStore.fetchUserProfile()

    message.success('个人资料已更新')
  } catch (error: any) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 重置表单
function handleReset() {
  initFormData()
  message.info('已重置')
}

// 修改密码
async function handleChangePassword() {
  if (!passwordForm.value.oldPassword) {
    message.warning('请输入当前密码')
    return
  }

  if (!passwordForm.value.newPassword) {
    message.warning('请输入新密码')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    message.warning('新密码至少6个字符')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    message.warning('两次输入的密码不一致')
    return
  }

  try {
    changingPassword.value = true
    await changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })

    message.success('密码修改成功')

    // 清空表单
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error: any) {
    message.error(error.message || '密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  initFormData()
})
</script>

<style scoped>
.user-profile {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.n-form-item) {
  margin-bottom: 0;
}

:deep(.n-form-item-label) {
  font-weight: 500;
}
</style>
