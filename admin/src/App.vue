<template>
  <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <router-view />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { darkTheme, zhCN, dateZhCN } from 'naive-ui'
import { useAppStore, useAuthStore, useMenuStore } from '@/stores'

const appStore = useAppStore()
const authStore = useAuthStore()
const menuStore = useMenuStore()

// 主题配置
const theme = computed(() => {
  return appStore.currentTheme === 'dark' ? darkTheme : null
})

// 初始化应用
onMounted(async () => {
  // 初始化认证状态
  await authStore.init()
  
  // 如果已登录，初始化菜单
  if (authStore.isLoggedIn) {
    await menuStore.init()
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
}

#app {
  height: 100%;
  color: #333;
  background-color: #f5f5f5;
}
</style>
