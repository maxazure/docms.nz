<template>
  <n-layout-header bordered class="app-header">
    <div class="header-left">
      <!-- 面包屑导航 -->
      <n-breadcrumb>
        <n-breadcrumb-item
          v-for="item in breadcrumbs"
          :key="item.path"
          @click="handleBreadcrumbClick(item.path)"
        >
          {{ item.title }}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <div class="header-right">
      <!-- 全局搜索 -->
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索内容..."
        clearable
        class="search-input"
        @keydown.enter="handleSearch"
      >
        <template #prefix>
          <n-icon :component="SearchOutline" />
        </template>
      </n-input>

      <!-- 主题切换 -->
      <n-button
        quaternary
        circle
        @click="appStore.toggleTheme"
        :title="appStore.isDark ? '切换到亮色模式' : '切换到暗色模式'"
      >
        <template #icon>
          <n-icon>
            <component :is="appStore.isDark ? SunnyOutline : MoonOutline" />
          </n-icon>
        </template>
      </n-button>

      <!-- 通知 -->
      <n-badge :value="3" :max="99">
        <n-button quaternary circle>
          <template #icon>
            <n-icon :component="NotificationsOutline" />
          </template>
        </n-button>
      </n-badge>

      <!-- 用户菜单 -->
      <n-dropdown
        :options="userMenuOptions"
        placement="bottom-end"
        @select="handleUserMenuSelect"
      >
        <div class="user-avatar">
          <n-avatar
            round
            :size="36"
            :src="userAvatar"
            :fallback-src="defaultAvatar"
          >
            {{ userInitial }}
          </n-avatar>
          <span class="user-name">{{ userName }}</span>
          <n-icon :component="ChevronDownOutline" :size="16" />
        </div>
      </n-dropdown>
    </div>
  </n-layout-header>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDialog, useMessage } from 'naive-ui'
import {
  SearchOutline,
  SunnyOutline,
  MoonOutline,
  NotificationsOutline,
  ChevronDownOutline,
  PersonCircleOutline,
  LogOutOutline,
  SettingsOutline
} from '@vicons/ionicons5'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const dialog = useDialog()
const message = useMessage()
const appStore = useAppStore()
const authStore = useAuthStore()

// 搜索关键词
const searchKeyword = ref('')

// 用户信息
const userName = computed(() => authStore.user?.displayName || authStore.user?.email || '用户')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const userAvatar = computed(() => authStore.user?.avatar || '')
const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName.value)

// 面包屑导航
interface Breadcrumb {
  title: string
  path: string
}

const breadcrumbs = computed<Breadcrumb[]>(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const crumbs: Breadcrumb[] = [
    { title: '首页', path: '/dashboard' }
  ]

  matched.forEach(item => {
    if (item.path !== '/') {
      crumbs.push({
        title: item.meta.title as string,
        path: item.path
      })
    }
  })

  return crumbs
})

// 用户菜单选项
const userMenuOptions = computed(() => [
  {
    label: '个人资料',
    key: 'profile',
    icon: () => h('n-icon', null, { default: () => h(PersonCircleOutline) })
  },
  {
    label: '账户设置',
    key: 'settings',
    icon: () => h('n-icon', null, { default: () => h(SettingsOutline) })
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h('n-icon', null, { default: () => h(LogOutOutline) })
  }
])

// 处理面包屑点击
const handleBreadcrumbClick = (path: string) => {
  if (path && path !== route.path) {
    router.push(path)
  }
}

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    message.info(`搜索: ${searchKeyword.value}`)
    // TODO: 实现全局搜索功能
  }
}

// 处理用户菜单选择
const handleUserMenuSelect = (key: string) => {
  switch (key) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理退出登录
const handleLogout = () => {
  dialog.warning({
    title: '确认退出',
    content: '确定要退出登录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await authStore.logout()
        message.success('已退出登录')
        router.push('/login')
      } catch (error: any) {
        message.error(error.message || '退出失败')
      }
    }
  })
}
</script>

<style scoped>
.app-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: var(--n-color);
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 240px;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-avatar:hover {
  background-color: var(--n-color-hover);
}

.user-name {
  font-size: 14px;
  color: var(--n-text-color-1);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.n-breadcrumb-item__link) {
  cursor: pointer;
  color: var(--n-item-text-color);
}

:deep(.n-breadcrumb-item__link:hover) {
  color: var(--n-item-text-color-hover);
}
</style>
