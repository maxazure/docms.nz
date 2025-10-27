<template>
  <div>
    <!-- Loading State -->
    <div v-if="pending" class="container mx-auto px-4 py-16 text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <!-- Page Content -->
    <div v-else-if="page" class="about-page">
      <!-- Breadcrumb -->
      <Breadcrumb :items="breadcrumbItems" />

      <!-- Page Blocks -->
      <BlockRenderer :blocks="page.blocks" />
    </div>

    <!-- Fallback: Static Content if no page data -->
    <div v-else class="about-page-fallback">
      <!-- Breadcrumb -->
      <Breadcrumb :items="[{ label: '关于我们' }]" />

      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-primary-50 to-white py-20">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl mx-auto text-center">
            <h1 class="text-5xl font-bold text-gray-900 mb-6">关于我们</h1>
            <p class="text-xl text-gray-600 leading-relaxed">
              致力于为家庭和企业提供专业的水培种植解决方案，让健康生活触手可及
            </p>
          </div>
        </div>
      </div>

      <!-- Company Info -->
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-4xl mx-auto">
          <!-- Our Story -->
          <section class="mb-16">
            <h2 class="text-3xl font-bold mb-6">我们的故事</h2>
            <div class="prose prose-lg max-w-none">
              <p class="text-gray-700 leading-relaxed mb-4">
                绿野水培成立于2010年，是一家专注于水培技术研发和推广的创新企业。我们始终相信，通过科技的力量可以让每个家庭都能轻松享受到新鲜、健康的绿色蔬菜。
              </p>
              <p class="text-gray-700 leading-relaxed mb-4">
                经过15年的发展，我们已经成功服务了超过10万家庭用户和7000家企业客户，产品销往全国70多个城市。我们不仅提供优质的水培设备，更致力于传播健康的生活方式。
              </p>
            </div>
          </section>

          <!-- Our Values -->
          <section class="mb-16">
            <h2 class="text-3xl font-bold mb-8">核心价值观</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="text-center">
                <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold mb-2">创新</h3>
                <p class="text-gray-600">持续创新，引领行业发展</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold mb-2">品质</h3>
                <p class="text-gray-600">精益求精，追求卓越品质</p>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold mb-2">服务</h3>
                <p class="text-gray-600">用心服务，客户至上</p>
              </div>
            </div>
          </section>

          <!-- Team -->
          <section class="mb-16">
            <h2 class="text-3xl font-bold mb-8">我们的团队</h2>
            <div class="bg-gray-50 rounded-lg p-8">
              <p class="text-gray-700 leading-relaxed mb-4">
                我们拥有一支由农业专家、工程师和设计师组成的专业团队，平均从业经验超过10年。团队成员来自国内外知名农业科技企业，在水培技术、设备研发和用户体验方面拥有深厚的积累。
              </p>
              <p class="text-gray-700 leading-relaxed">
                我们相信，只有专业的团队才能提供最优质的产品和服务，为用户创造真正的价值。
              </p>
            </div>
          </section>

          <!-- Contact -->
          <section class="mb-16 bg-primary-50 rounded-lg p-8">
            <h2 class="text-3xl font-bold mb-6">联系我们</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-bold text-lg mb-3">公司地址</h3>
                <p class="text-gray-700">中国·上海</p>
              </div>
              <div>
                <h3 class="font-bold text-lg mb-3">联系方式</h3>
                <p class="text-gray-700 mb-2">电话：400-XXX-XXXX</p>
                <p class="text-gray-700">邮箱：info@example.com</p>
              </div>
            </div>
            <div class="mt-6">
              <NuxtLink
                to="/contact"
                class="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                在线咨询
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </NuxtLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Page } from '~/types'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import BlockRenderer from '~/components/blocks/BlockRenderer.vue'

const api = useApi()

// Try to fetch page data
const { data: page, pending } = await useAsyncData('about-page', async () => {
  try {
    return await api.pages.getBySlug('about')
  } catch (error) {
    // If page doesn't exist, return null and show fallback content
    console.log('About page not found in database, showing fallback content')
    return null
  }
})

const breadcrumbItems = computed(() => [
  { label: '关于我们' }
])

// SEO
useHead({
  title: computed(() => page.value?.meta?.title || '关于我们 - 绿野水培'),
  meta: [
    {
      name: 'description',
      content: computed(() => page.value?.meta?.description || '致力于为家庭和企业提供专业的水培种植解决方案，让健康生活触手可及')
    },
    {
      name: 'keywords',
      content: computed(() => page.value?.meta?.keywords?.join(',') || '关于我们,水培,企业介绍')
    }
  ]
})
</script>

<style scoped>
.bg-primary-50 {
  background-color: rgba(16, 185, 129, 0.1);
}

.bg-primary-100 {
  background-color: rgba(16, 185, 129, 0.2);
}

.bg-primary-600 {
  background-color: var(--primary-color, #10B981);
}

.border-primary-600 {
  border-color: var(--primary-color, #10B981);
}

.text-primary-600 {
  color: var(--primary-color, #10B981);
}

.hover\:bg-primary-700:hover {
  background-color: var(--secondary-color, #059669);
}

.from-primary-50 {
  --tw-gradient-from: rgba(16, 185, 129, 0.1);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, transparent);
}
</style>
