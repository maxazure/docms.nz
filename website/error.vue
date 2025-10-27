<template>
  <div class="error-page">
    <div class="container mx-auto px-4 py-20">
      <div class="max-w-2xl mx-auto text-center">
        <!-- Error Code -->
        <div class="mb-8">
          <h1 class="text-9xl font-bold text-primary-600 mb-4">
            {{ error.statusCode }}
          </h1>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">
            {{ errorTitle }}
          </h2>
          <p class="text-lg text-gray-600">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Illustration -->
        <div class="mb-12">
          <svg class="w-64 h-64 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Actions -->
        <div class="space-y-4 mb-12">
          <NuxtLink
            to="/"
            class="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            返回首页
          </NuxtLink>

          <button
            @click="goBack"
            class="ml-4 inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回上一页
          </button>
        </div>

        <!-- Quick Links -->
        <div class="border-t pt-12">
          <h3 class="text-xl font-bold text-gray-900 mb-6">您可能想要访问</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NuxtLink
              to="/products"
              class="p-4 bg-gray-50 rounded-lg hover:bg-primary-50 hover:border-primary-300 border border-transparent transition-colors group"
            >
              <svg class="w-8 h-8 mx-auto text-gray-400 group-hover:text-primary-600 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div class="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">产品中心</div>
              <div class="text-sm text-gray-500 mt-1">浏览水培设备</div>
            </NuxtLink>

            <NuxtLink
              to="/posts"
              class="p-4 bg-gray-50 rounded-lg hover:bg-primary-50 hover:border-primary-300 border border-transparent transition-colors group"
            >
              <svg class="w-8 h-8 mx-auto text-gray-400 group-hover:text-primary-600 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div class="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">文章列表</div>
              <div class="text-sm text-gray-500 mt-1">学习水培知识</div>
            </NuxtLink>

            <NuxtLink
              to="/about"
              class="p-4 bg-gray-50 rounded-lg hover:bg-primary-50 hover:border-primary-300 border border-transparent transition-colors group"
            >
              <svg class="w-8 h-8 mx-auto text-gray-400 group-hover:text-primary-600 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">关于我们</div>
              <div class="text-sm text-gray-500 mt-1">了解我们</div>
            </NuxtLink>
          </div>
        </div>

        <!-- Support -->
        <div class="mt-12 p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-bold text-gray-900 mb-2">需要帮助？</h3>
          <p class="text-gray-600 mb-4">
            如果您认为这是一个错误，请联系我们的技术支持团队
          </p>
          <div class="flex items-center justify-center space-x-6 text-sm">
            <a href="mailto:support@example.com" class="text-primary-600 hover:text-primary-700 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              发送邮件
            </a>
            <span class="text-gray-300">|</span>
            <span class="text-gray-600">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              400-XXX-XXXX
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
  }
}>()

const errorTitle = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return '页面未找到'
    case 500:
      return '服务器错误'
    case 403:
      return '访问被拒绝'
    default:
      return '出错了'
  }
})

const errorMessage = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return '抱歉，您访问的页面不存在或已被移除'
    case 500:
      return '服务器遇到了一些问题，我们正在努力修复'
    case 403:
      return '您没有权限访问此页面'
    default:
      return props.error.message || props.error.statusMessage || '发生了一个未知错误'
  }
})

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/')
  }
}

// SEO
useHead({
  title: computed(() => `${errorTitle.value} - 绿野水培`),
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})
</script>

<style scoped>
.bg-primary-600 {
  background-color: var(--primary-color, #10B981);
}

.bg-primary-50 {
  background-color: rgba(16, 185, 129, 0.1);
}

.text-primary-600 {
  color: var(--primary-color, #10B981);
}

.text-primary-700 {
  color: var(--secondary-color, #059669);
}

.hover\:bg-primary-700:hover {
  background-color: var(--secondary-color, #059669);
}

.hover\:text-primary-600:hover {
  color: var(--primary-color, #10B981);
}

.hover\:text-primary-700:hover {
  color: var(--secondary-color, #059669);
}

.hover\:bg-primary-50:hover {
  background-color: rgba(16, 185, 129, 0.1);
}

.hover\:border-primary-300:hover {
  border-color: rgba(16, 185, 129, 0.4);
}

.group:hover .group-hover\:text-primary-600 {
  color: var(--primary-color, #10B981);
}

.group:hover .group-hover\:text-primary-700 {
  color: var(--secondary-color, #059669);
}
</style>
