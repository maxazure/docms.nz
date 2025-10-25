<template>
  <div class="category-management">
    <n-space vertical :size="16">
      <!-- Header -->
      <n-space justify="space-between" align="center">
        <h2>分类管理</h2>
        <n-button type="primary" @click="handleCreate">
          <template #icon><n-icon><Add /></n-icon></template>
          新建分类
        </n-button>
      </n-space>

      <!-- Category Manager Component -->
      <category-manager />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { Add } from '@vicons/ionicons5'
import CategoryManager from '@/components/posts/CategoryManager.vue'
import { useMessage } from 'naive-ui'

const message = useMessage()

const handleCreate = () => {
  // Category Manager 组件内部会处理创建逻辑
  message.info('请在下方分类列表中添加新分类')
}
</script>

<style scoped>
.category-management {
  padding: 20px;
}
</style>
