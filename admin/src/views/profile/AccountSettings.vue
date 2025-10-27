<template>
  <div class="account-settings">
    <n-space vertical :size="24">
      <!-- 账户安全 -->
      <n-card title="账户安全">
        <n-space vertical :size="16">
          <n-form-item label="两步验证">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">启用两步验证</div>
                <div class="setting-desc">
                  为您的账户添加额外的安全保护
                </div>
              </div>
              <n-switch
                v-model:value="settings.twoFactorEnabled"
                @update:value="handleToggleTwoFactor"
              />
            </div>
          </n-form-item>

          <n-divider />

          <n-form-item label="登录通知">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">新设备登录通知</div>
                <div class="setting-desc">
                  当有新设备登录时发送邮件通知
                </div>
              </div>
              <n-switch
                v-model:value="settings.loginNotification"
                @update:value="handleSaveSettings"
              />
            </div>
          </n-form-item>
        </n-space>
      </n-card>

      <!-- 隐私设置 -->
      <n-card title="隐私设置">
        <n-space vertical :size="16">
          <n-form-item label="个人资料">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">公开个人资料</div>
                <div class="setting-desc">
                  允许其他用户查看您的个人资料
                </div>
              </div>
              <n-switch
                v-model:value="settings.profilePublic"
                @update:value="handleSaveSettings"
              />
            </div>
          </n-form-item>

          <n-divider />

          <n-form-item label="活动记录">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">显示活动状态</div>
                <div class="setting-desc">
                  显示您的在线状态和最近活动
                </div>
              </div>
              <n-switch
                v-model:value="settings.showActivity"
                @update:value="handleSaveSettings"
              />
            </div>
          </n-form-item>
        </n-space>
      </n-card>

      <!-- 通知偏好 -->
      <n-card title="通知偏好">
        <n-space vertical :size="16">
          <n-form-item label="邮件通知">
            <n-checkbox-group v-model:value="settings.emailNotifications">
              <n-space vertical>
                <n-checkbox value="comments">评论通知</n-checkbox>
                <n-checkbox value="mentions">提及通知</n-checkbox>
                <n-checkbox value="updates">系统更新</n-checkbox>
                <n-checkbox value="newsletter">新闻通讯</n-checkbox>
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-divider />

          <n-form-item label="站内通知">
            <n-checkbox-group v-model:value="settings.inAppNotifications">
              <n-space vertical>
                <n-checkbox value="comments">评论通知</n-checkbox>
                <n-checkbox value="mentions">提及通知</n-checkbox>
                <n-checkbox value="system">系统通知</n-checkbox>
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-form-item>
            <n-button type="primary" @click="handleSaveSettings" :loading="saving">
              保存通知设置
            </n-button>
          </n-form-item>
        </n-space>
      </n-card>

      <!-- 语言和地区 -->
      <n-card title="语言和地区">
        <n-space vertical :size="16">
          <n-form-item label="语言">
            <n-select
              v-model:value="settings.language"
              :options="languageOptions"
              @update:value="handleSaveSettings"
            />
          </n-form-item>

          <n-form-item label="时区">
            <n-select
              v-model:value="settings.timezone"
              :options="timezoneOptions"
              @update:value="handleSaveSettings"
              filterable
            />
          </n-form-item>

          <n-form-item label="日期格式">
            <n-select
              v-model:value="settings.dateFormat"
              :options="dateFormatOptions"
              @update:value="handleSaveSettings"
            />
          </n-form-item>
        </n-space>
      </n-card>

      <!-- 会话管理 -->
      <n-card title="活动会话">
        <n-space vertical :size="16">
          <n-alert type="info" :bordered="false">
            显示您当前登录的所有设备和会话
          </n-alert>

          <div class="sessions-list">
            <div v-for="session in sessions" :key="session.id" class="session-item">
              <div class="session-info">
                <div class="session-device">
                  <n-icon :size="24">
                    <component :is="getDeviceIcon(session.device)" />
                  </n-icon>
                  <div>
                    <div class="session-name">{{ session.device }}</div>
                    <div class="session-meta">
                      {{ session.location }} · {{ formatSessionTime(session.lastActive) }}
                    </div>
                  </div>
                </div>
                <n-tag v-if="session.current" type="success" size="small">
                  当前会话
                </n-tag>
              </div>
              <n-button
                v-if="!session.current"
                size="small"
                type="error"
                ghost
                @click="handleRevokeSession(session.id)"
              >
                结束会话
              </n-button>
            </div>
          </div>

          <n-button type="warning" ghost @click="handleRevokeAllSessions">
            结束所有其他会话
          </n-button>
        </n-space>
      </n-card>

      <!-- 危险操作 -->
      <n-card title="危险操作">
        <n-space vertical :size="16">
          <n-alert type="error" :bordered="false">
            以下操作无法撤销，请谨慎操作
          </n-alert>

          <div class="danger-actions">
            <div class="danger-item">
              <div>
                <div class="danger-title">导出数据</div>
                <div class="danger-desc">下载您的账户数据副本</div>
              </div>
              <n-button type="info" ghost>导出数据</n-button>
            </div>

            <n-divider />

            <div class="danger-item">
              <div>
                <div class="danger-title">停用账户</div>
                <div class="danger-desc">临时停用您的账户</div>
              </div>
              <n-button type="warning" ghost>停用账户</n-button>
            </div>

            <n-divider />

            <div class="danger-item">
              <div>
                <div class="danger-title">删除账户</div>
                <div class="danger-desc">永久删除您的账户及所有数据</div>
              </div>
              <n-button type="error" ghost @click="handleDeleteAccount">
                删除账户
              </n-button>
            </div>
          </div>
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { useRouter } from 'vue-router'
import {
  LaptopOutline,
  PhonePortraitOutline,
  TabletLandscapeOutline
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'

const message = useMessage()
const dialog = useDialog()
const router = useRouter()
const authStore = useAuthStore()

const saving = ref(false)

const settings = ref({
  twoFactorEnabled: false,
  loginNotification: true,
  profilePublic: false,
  showActivity: true,
  emailNotifications: ['comments', 'mentions', 'updates'],
  inAppNotifications: ['comments', 'mentions', 'system'],
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD'
})

const sessions = ref([
  {
    id: '1',
    device: 'Windows · Chrome',
    location: '北京市',
    lastActive: new Date().toISOString(),
    current: true
  },
  {
    id: '2',
    device: 'iPhone · Safari',
    location: '上海市',
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    current: false
  }
])

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
  { label: '繁體中文', value: 'zh-TW' },
  { label: '日本語', value: 'ja-JP' }
]

const timezoneOptions = [
  { label: '(UTC+08:00) 北京，上海', value: 'Asia/Shanghai' },
  { label: '(UTC+09:00) 东京', value: 'Asia/Tokyo' },
  { label: '(UTC-08:00) 洛杉矶', value: 'America/Los_Angeles' },
  { label: '(UTC-05:00) 纽约', value: 'America/New_York' },
  { label: '(UTC+00:00) 伦敦', value: 'Europe/London' }
]

const dateFormatOptions = [
  { label: '2024-01-01', value: 'YYYY-MM-DD' },
  { label: '01/01/2024', value: 'MM/DD/YYYY' },
  { label: '01-01-2024', value: 'DD-MM-YYYY' }
]

function getDeviceIcon(device: string) {
  if (device.includes('iPhone') || device.includes('Android')) {
    return PhonePortraitOutline
  } else if (device.includes('iPad') || device.includes('Tablet')) {
    return TabletLandscapeOutline
  }
  return LaptopOutline
}

function formatSessionTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}

async function handleSaveSettings() {
  try {
    saving.value = true
    // TODO: 实现保存设置的 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    message.success('设置已保存')
  } catch (error: any) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function handleToggleTwoFactor(value: boolean) {
  if (value) {
    dialog.info({
      title: '启用两步验证',
      content: '此功能将在未来版本中提供',
      positiveText: '知道了',
      onPositiveClick: () => {
        settings.value.twoFactorEnabled = false
      }
    })
  }
}

function handleRevokeSession(sessionId: string) {
  dialog.warning({
    title: '结束会话',
    content: '确定要结束此会话吗？该设备将被登出。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      sessions.value = sessions.value.filter(s => s.id !== sessionId)
      message.success('会话已结束')
    }
  })
}

function handleRevokeAllSessions() {
  dialog.warning({
    title: '结束所有其他会话',
    content: '确定要结束所有其他设备的登录会话吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      sessions.value = sessions.value.filter(s => s.current)
      message.success('已结束所有其他会话')
    }
  })
}

function handleDeleteAccount() {
  dialog.error({
    title: '删除账户',
    content: '此操作将永久删除您的账户及所有数据，且无法恢复。是否确认删除？',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      message.info('此功能将在未来版本中提供')
    }
  })
}

onMounted(() => {
  // 加载用户设置
  // TODO: 实现加载设置的 API 调用
})
</script>

<style scoped>
.account-settings {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 13px;
  color: var(--n-text-color-2);
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.session-device {
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.session-meta {
  font-size: 13px;
  color: var(--n-text-color-3);
}

.danger-actions {
  display: flex;
  flex-direction: column;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.danger-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.danger-desc {
  font-size: 13px;
  color: var(--n-text-color-3);
}

:deep(.n-form-item) {
  margin-bottom: 0;
}

:deep(.n-form-item-label) {
  font-weight: 500;
}
</style>
