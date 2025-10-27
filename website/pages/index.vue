<template>
  <div>
    <div v-if="pending" class="container mx-auto px-4 py-16 text-center">
      <p class="text-gray-600">加载中...</p>
    </div>

    <div v-else-if="error" class="container mx-auto px-4 py-16 text-center">
      <p class="text-red-600">加载失败: {{ error.message }}</p>
    </div>

    <div v-else-if="page">
      <!-- Render blocks -->
      <BlockRenderer :blocks="page.blocks" />
    </div>

    <div v-else class="container mx-auto px-4 py-16 text-center">
      <h1 class="text-4xl font-bold mb-4">欢迎</h1>
      <p class="text-gray-600">正在加载首页内容...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import BlockRenderer from '~/components/blocks/BlockRenderer.vue'

const api = useApi()

// Fetch home page
const { data: page, pending, error } = await useAsyncData('home-page', async () => {
  try {
    return await api.pages.getBySlug('home')
  } catch (err: any) {
    console.error('Failed to fetch home page:', err)
    // Return null if page doesn't exist yet
    if (err.statusCode === 404) {
      return null
    }
    throw err
  }
})

// SEO Meta
useHead({
  title: page.value?.meta?.title || page.value?.title || '首页',
  meta: [
    {
      name: 'description',
      content: page.value?.meta?.description || '企业官网首页'
    }
  ]
})
</script>
