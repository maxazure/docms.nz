<template>
  <div>
    <div v-if="pending" class="container mx-auto px-4 py-16 text-center">
      <p class="text-gray-600">加载中...</p>
    </div>

    <div v-else-if="error" class="container mx-auto px-4 py-16 text-center">
      <h1 class="text-4xl font-bold mb-4">页面未找到</h1>
      <p class="text-gray-600 mb-8">{{ error.message }}</p>
      <NuxtLink to="/" class="text-primary hover:underline">
        返回首页
      </NuxtLink>
    </div>

    <div v-else-if="page">
      <!-- Render blocks -->
      <BlockRenderer :blocks="page.blocks" />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()

const slug = computed(() => route.params.slug as string)

// Fetch page by slug
const { data: page, pending, error } = await useAsyncData(`page-${slug.value}`, async () => {
  try {
    return await api.pages.getBySlug(slug.value)
  } catch (err: any) {
    if (err.statusCode === 404) {
      throw createError({ statusCode: 404, message: '页面不存在' })
    }
    throw err
  }
})

// SEO Meta
useHead({
  title: page.value?.meta?.title || page.value?.title,
  meta: [
    {
      name: 'description',
      content: page.value?.meta?.description || ''
    },
    {
      property: 'og:title',
      content: page.value?.meta?.ogTitle || page.value?.meta?.title || page.value?.title
    },
    {
      property: 'og:description',
      content: page.value?.meta?.ogDescription || page.value?.meta?.description || ''
    }
  ]
})
</script>

<style scoped>
.text-primary {
  color: var(--primary-color, #10B981);
}
</style>
