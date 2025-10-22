<template>
  <div class="placeholder-page">
    <n-empty
      :description="description"
      size="large"
    >
      <template #icon>
        <n-icon :size="80" :component="icon" />
      </template>
      <template #extra>
        <n-space vertical :size="16">
          <n-text depth="3">
            {{ message }}
          </n-text>
          <n-button v-if="showBackButton" @click="router.back()">
            返回上一页
          </n-button>
        </n-space>
      </template>
    </n-empty>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ConstructOutline } from '@vicons/ionicons5'

interface Props {
  title?: string
  description?: string
  message?: string
  icon?: any
  showBackButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '功能开发中',
  description: '该功能正在开发中...',
  message: '我们正在努力完善这个功能，敬请期待！',
  icon: ConstructOutline,
  showBackButton: false
})

const router = useRouter()
</script>

<style scoped>
.placeholder-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px;
}
</style>
