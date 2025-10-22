<template>
  <div class="not-found">
    <n-result
      status="404"
      title="404 页面不存在"
      description="抱歉，您访问的页面不存在。"
    >
      <template #footer>
        <n-space>
          <n-button @click="router.back()">返回上一页</n-button>
          <n-button type="primary" @click="router.push('/dashboard')">
            返回首页
          </n-button>
        </n-space>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px;
}
</style>
