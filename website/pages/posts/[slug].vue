<template>
  <div>
    <!-- Loading State -->
    <div v-if="pending" class="container mx-auto px-4 py-16 text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 py-16 text-center">
      <h1 class="text-4xl font-bold mb-4">文章未找到</h1>
      <p class="text-gray-600 mb-8">{{ error.message }}</p>
      <NuxtLink to="/posts" class="text-primary hover:underline">
        返回文章列表
      </NuxtLink>
    </div>

    <!-- Article Content -->
    <div v-else-if="post" class="post-detail">
      <!-- Breadcrumb -->
      <Breadcrumb :items="breadcrumbItems" />

      <article class="container mx-auto px-4 py-12 max-w-4xl">
      <!-- Header -->
      <header class="mb-8">
        <!-- Category & Date -->
        <div class="flex items-center text-sm text-gray-500 mb-4">
          <NuxtLink
            v-if="post.category"
            :to="`/posts?category=${post.category.id}`"
            class="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium mr-3 hover:bg-primary-200 transition-colors"
          >
            {{ post.category.name }}
          </NuxtLink>
          <time v-if="post.publishedAt" :datetime="post.publishedAt">
            {{ formatDate(post.publishedAt) }}
          </time>
          <span v-if="post.author" class="ml-3">
            · 作者: {{ post.author.displayName || post.author.name }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {{ post.title }}
        </h1>

        <!-- Summary -->
        <p v-if="post.summary" class="text-xl text-gray-600 leading-relaxed mb-6">
          {{ post.summary }}
        </p>
      </header>

      <!-- Cover Image -->
      <div v-if="post.coverImage" class="mb-12 rounded-lg overflow-hidden">
        <img
          :src="getMediaUrl(post.coverImage.storageKey)"
          :alt="post.coverImage.alt || post.title"
          class="w-full h-auto object-cover"
        />
      </div>

      <!-- Article Content -->
      <div class="prose prose-lg max-w-none mb-12">
        <div v-html="renderContent(post.content)"></div>
      </div>

      <!-- Tags -->
      <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mb-12 pb-8 border-b">
        <span class="text-gray-600 font-medium mr-2">标签:</span>
        <NuxtLink
          v-for="tag in post.tags"
          :key="tag.id"
          :to="`/posts?tag=${tag.id}`"
          class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-primary-100 hover:text-primary-700 transition-colors"
        >
          #{{ tag.name }}
        </NuxtLink>
      </div>

      <!-- Share Section -->
      <div class="mb-12 pb-8 border-b">
        <h3 class="text-lg font-bold mb-4">分享文章</h3>
        <div class="flex gap-3">
          <button
            @click="shareToWeChat"
            class="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.5 12c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5zm7.5 0c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5zM12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2z"/>
            </svg>
            微信
          </button>
          <button
            @click="shareToWeibo"
            class="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2z"/>
            </svg>
            微博
          </button>
          <button
            @click="copyLink"
            class="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            复制链接
          </button>
        </div>
      </div>

      <!-- Related Posts -->
      <div v-if="relatedPosts && relatedPosts.length > 0" class="mb-12">
        <h3 class="text-2xl font-bold mb-6">相关文章推荐</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="relatedPost in relatedPosts"
            :key="relatedPost.id"
            :to="`/posts/${relatedPost.slug}`"
            class="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
          >
            <!-- Image -->
            <div class="aspect-video bg-gray-100 overflow-hidden">
              <img
                v-if="relatedPost.coverImage"
                :src="getMediaUrl(relatedPost.coverImage.storageKey)"
                :alt="relatedPost.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4">
              <h4 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {{ relatedPost.title }}
              </h4>
              <p class="text-sm text-gray-600 line-clamp-2">
                {{ relatedPost.summary || relatedPost.content?.substring(0, 80) + '...' }}
              </p>
              <div class="mt-3 text-xs text-gray-500">
                {{ formatDate(relatedPost.publishedAt) }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Back Link -->
      <div class="text-center pt-8 border-t">
        <NuxtLink to="/posts" class="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回文章列表
        </NuxtLink>
      </div>
    </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types'
import Breadcrumb from '~/components/common/Breadcrumb.vue'

const route = useRoute()
const api = useApi()

const slug = computed(() => route.params.slug as string)

// Fetch post
const { data: post, pending, error } = await useAsyncData(`post-${slug.value}`, async () => {
  try {
    return await api.posts.getBySlug(slug.value)
  } catch (err: any) {
    if (err.statusCode === 404) {
      throw createError({ statusCode: 404, message: '文章不存在' })
    }
    throw err
  }
})

// Fetch related posts (by category or tags)
const { data: relatedPosts } = await useAsyncData(`related-posts-${slug.value}`, async () => {
  if (!post.value) return []

  try {
    const response = await api.posts.getAll({
      page: 1,
      limit: 3,
      category: post.value.category?.id,
      exclude: post.value.id
    })
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch related posts:', error)
    return []
  }
})

// Breadcrumb
const breadcrumbItems = computed(() => {
  const items = [
    { label: '文章列表', to: '/posts' }
  ]

  if (post.value?.category) {
    items.push({
      label: post.value.category.name,
      to: `/posts?category=${post.value.category.id}`
    })
  }

  items.push({ label: post.value?.title || '文章详情' })

  return items
})

// Utility functions
const getMediaUrl = (storageKey: string) => {
  return api.media.getUrl(storageKey)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const renderContent = (content: any) => {
  if (typeof content === 'string') {
    return content
  }
  // Handle {type: 'html', data: '...'} structure from API
  if (typeof content === 'object' && content.type === 'html' && content.data) {
    return content.data
  }
  if (typeof content === 'object' && content.type === 'markdown' && content.data) {
    // In a real implementation, you'd use a markdown parser here
    return content.data.replace(/\n/g, '<br>')
  }
  // Fallback for other structures
  if (typeof content === 'object' && content.html) {
    return content.html
  }
  if (typeof content === 'object' && content.markdown) {
    return content.markdown.replace(/\n/g, '<br>')
  }
  return JSON.stringify(content)
}

// Share functions
const shareToWeChat = () => {
  // In a real implementation, this would open WeChat share dialog
  alert('微信分享功能需要在移动端使用')
}

const shareToWeibo = () => {
  const url = window.location.href
  const title = post.value?.title || ''
  const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  window.open(weiboUrl, '_blank', 'width=600,height=400')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  } catch (error) {
    console.error('Failed to copy link:', error)
    alert('复制失败，请手动复制链接')
  }
}

// SEO
useHead({
  title: computed(() => post.value?.meta?.title || `${post.value?.title} - 绿野水培`),
  meta: [
    {
      name: 'description',
      content: computed(() => post.value?.meta?.description || post.value?.summary || '')
    },
    {
      name: 'keywords',
      content: computed(() => post.value?.meta?.keywords?.join(',') || post.value?.tags?.map(t => t.name).join(',') || '')
    },
    {
      property: 'og:title',
      content: computed(() => post.value?.meta?.ogTitle || post.value?.title || '')
    },
    {
      property: 'og:description',
      content: computed(() => post.value?.meta?.ogDescription || post.value?.summary || '')
    },
    {
      property: 'og:type',
      content: 'article'
    },
    {
      property: 'article:published_time',
      content: computed(() => post.value?.publishedAt || '')
    },
    {
      property: 'article:author',
      content: computed(() => post.value?.author?.displayName || post.value?.author?.name || '')
    },
    {
      property: 'article:section',
      content: computed(() => post.value?.category?.name || '')
    },
    {
      property: 'article:tag',
      content: computed(() => post.value?.tags?.map(t => t.name).join(',') || '')
    }
  ]
})
</script>

<style scoped>
.text-primary-600 {
  color: var(--primary-color, #10B981);
}

.text-primary-700 {
  color: var(--secondary-color, #059669);
}

.bg-primary-100 {
  background-color: rgba(16, 185, 129, 0.2);
}

.bg-primary-50 {
  background-color: rgba(16, 185, 129, 0.1);
}

.hover\:bg-primary-100:hover {
  background-color: rgba(16, 185, 129, 0.2);
}

.hover\:bg-primary-200:hover {
  background-color: rgba(16, 185, 129, 0.3);
}

.hover\:text-primary-600:hover {
  color: var(--primary-color, #10B981);
}

.hover\:text-primary-700:hover {
  color: var(--secondary-color, #059669);
}

.border-primary-600 {
  border-color: var(--primary-color, #10B981);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Prose Styles */
.prose {
  color: #374151;
  line-height: 1.75;
}

.prose :deep(h2) {
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #111827;
}

.prose :deep(h3) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  color: #111827;
}

.prose :deep(h4) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.prose :deep(p) {
  margin-bottom: 1.25rem;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.prose :deep(li) {
  margin-bottom: 0.5rem;
}

.prose :deep(a) {
  color: var(--primary-color, #10B981);
  text-decoration: underline;
}

.prose :deep(a:hover) {
  color: var(--secondary-color, #059669);
}

.prose :deep(blockquote) {
  border-left: 4px solid var(--primary-color, #10B981);
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6B7280;
}

.prose :deep(code) {
  background-color: #F3F4F6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: 'Courier New', monospace;
}

.prose :deep(pre) {
  background-color: #1F2937;
  color: #F9FAFB;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.prose :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.prose :deep(img) {
  margin: 2rem 0;
  border-radius: 0.5rem;
  max-width: 100%;
  height: auto;
}

.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.prose :deep(th),
.prose :deep(td) {
  border: 1px solid #E5E7EB;
  padding: 0.75rem;
  text-align: left;
}

.prose :deep(th) {
  background-color: #F9FAFB;
  font-weight: 600;
}

.prose :deep(hr) {
  border: none;
  border-top: 2px solid #E5E7EB;
  margin: 2rem 0;
}
</style>
