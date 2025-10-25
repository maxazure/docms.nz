<template>
  <div class="tag-management">
    <n-space vertical :size="16">
      <!-- Header -->
      <n-space justify="space-between" align="center">
        <h2>标签管理</h2>
        <n-button type="primary" @click="handleCreate">
          <template #icon><n-icon><Add /></n-icon></template>
          新建标签
        </n-button>
      </n-space>

      <!-- Tag Manager Component -->
      <tag-manager />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { Add } from '@vicons/ionicons5'
import TagManager from '@/components/posts/TagManager.vue'
import { useMessage } from 'naive-ui'

const message = useMessage()

const handleCreate = () => {
  // Tag Manager 组件内部会处理创建逻辑
  message.info('请在下方标签列表中添加新标签')
}
</script>

<style scoped>
.tag-management {
  padding: 20px;
}
</style>
