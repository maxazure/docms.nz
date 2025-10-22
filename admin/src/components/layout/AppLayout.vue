<template>
  <n-layout has-sider class="app-layout">
    <!-- 左侧边栏 -->
    <app-sidebar />

    <!-- 右侧主内容区 -->
    <n-layout>
      <!-- 顶部栏 -->
      <app-header />

      <!-- 内容区域 -->
      <n-layout-content class="app-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </n-layout-content>

      <!-- 页脚 -->
      <n-layout-footer bordered class="app-footer">
        <div class="footer-content">
          <span>© 2025 Docms. All rights reserved.</span>
          <div class="footer-links">
            <a href="https://github.com" target="_blank">GitHub</a>
            <span>|</span>
            <a href="/docs" target="_blank">文档</a>
            <span>|</span>
            <a href="/about">关于</a>
          </div>
        </div>
      </n-layout-footer>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

// 需要缓存的视图组件名称
const cachedViews = ref<string[]>([
  'Dashboard',
  'PageList',
  'PostList',
  'ProductList',
  'MediaLibrary'
])
</script>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
}

.app-content {
  padding: 24px;
  overflow-y: auto;
  background-color: var(--n-color);
  min-height: calc(100vh - 64px - 48px);
}

.app-footer {
  height: 48px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  background-color: var(--n-color);
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--n-text-color-3);
}

.footer-links {
  display: flex;
  gap: 12px;
  align-items: center;
}

.footer-links a {
  color: var(--n-text-color-3);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--n-text-color-1);
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
