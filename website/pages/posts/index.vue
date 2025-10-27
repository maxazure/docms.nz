<template>
  <div>
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" />

    <!-- Page Header -->
    <div class="bg-gray-50 py-12">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ pageTitle }}</h1>
        <p class="text-lg text-gray-600">{{ pageDescription }}</p>
      </div>
    </div>

    <!-- Posts List -->
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p class="mt-4 text-gray-600">加载中...</p>
          </div>

          <!-- No Posts -->
          <div v-else-if="posts.length === 0" class="text-center py-16 bg-gray-50 rounded-lg">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-gray-600">暂无文章</p>
          </div>

          <!-- Posts Grid -->
          <div v-else class="space-y-8">
            <article
              v-for="post in posts"
              :key="post.id"
              class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
            >
              <div class="md:flex">
                <!-- Featured Image -->
                <div class="md:w-1/3 relative overflow-hidden bg-gray-100 aspect-video md:aspect-square">
                  <NuxtLink :to="`/posts/${post.slug}`">
                    <img
                      v-if="post.featuredImage"
                      :src="`/api/uploads/${post.featuredImage}`"
                      :alt="post.title"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                      <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </NuxtLink>
                </div>

                <!-- Content -->
                <div class="md:w-2/3 p-6">
                  <!-- Category & Date -->
                  <div class="flex items-center text-sm text-gray-500 mb-3">
                    <span
                      v-if="post.category"
                      class="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium mr-3"
                    >
                      {{ post.category.name }}
                    </span>
                    <time :datetime="post.publishedAt">
                      {{ formatDate(post.publishedAt) }}
                    </time>
                  </div>

                  <!-- Title -->
                  <NuxtLink :to="`/posts/${post.slug}`">
                    <h2 class="text-2xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors line-clamp-2">
                      {{ post.title }}
                    </h2>
                  </NuxtLink>

                  <!-- Excerpt -->
                  <p class="text-gray-600 mb-4 line-clamp-3">
                    {{ post.excerpt || getPlainText(post.content) }}
                  </p>

                  <!-- Tags & Read More -->
                  <div class="flex items-center justify-between">
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="tag in post.tags?.slice(0, 3)"
                        :key="tag.id"
                        class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        #{{ tag.name }}
                      </span>
                    </div>
                    <NuxtLink
                      :to="`/posts/${post.slug}`"
                      class="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                    >
                      阅读更多
                      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-12 flex justify-center">
            <nav class="flex items-center space-x-2">
              <button
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
                :class="[
                  'px-4 py-2 rounded-md transition-colors',
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                ]"
              >
                上一页
              </button>

              <button
                v-for="page in displayPages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-4 py-2 rounded-md transition-colors',
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                ]"
              >
                {{ page }}
              </button>

              <button
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
                :class="[
                  'px-4 py-2 rounded-md transition-colors',
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                ]"
              >
                下一页
              </button>
            </nav>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Categories -->
          <div v-if="categories.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">分类</h3>
            <ul class="space-y-2">
              <li>
                <button
                  @click="selectedCategory = null"
                  :class="[
                    'w-full text-left px-3 py-2 rounded transition-colors',
                    !selectedCategory
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'hover:bg-gray-50'
                  ]"
                >
                  全部分类
                </button>
              </li>
              <li v-for="category in categories" :key="category.id">
                <button
                  @click="selectedCategory = category.id"
                  :class="[
                    'w-full text-left px-3 py-2 rounded transition-colors',
                    selectedCategory === category.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'hover:bg-gray-50'
                  ]"
                >
                  {{ category.name }}
                </button>
              </li>
            </ul>
          </div>

          <!-- Popular Tags -->
          <div v-if="tags.length > 0" class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-bold mb-4">热门标签</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in tags"
                :key="tag.id"
                class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-primary-100 hover:text-primary-700 cursor-pointer transition-colors"
              >
                #{{ tag.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post, Category, Tag } from '~/types'
import Breadcrumb from '~/components/common/Breadcrumb.vue'

const api = useApi()
const route = useRoute()
const router = useRouter()
const { menu } = useSiteData()

// State
const posts = ref<Post[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const loading = ref(true)
const selectedCategory = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

// Computed
const menuItem = computed(() => {
  const menuId = route.query.menuId as string | undefined
  if (menuId && menu.value.length > 0) {
    return menu.value.find(item => item.id === menuId)
  }
  return null
})

const pageTitle = computed(() => {
  if (menuItem.value) {
    return menuItem.value.label
  }
  return '文章列表'
})

const pageDescription = computed(() => {
  if (menuItem.value?.label === '水培学堂') return '学习水培知识，掌握种植技巧'
  if (menuItem.value?.label === '新闻资讯') return '最新行业资讯和公司动态'
  return '浏览所有文章'
})

const breadcrumbItems = computed(() => [
  { label: pageTitle.value }
])

const displayPages = computed(() => {
  const pages: number[] = []
  const maxDisplay = 5
  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(totalPages.value, start + maxDisplay - 1)

  if (end - start < maxDisplay - 1) {
    start = Math.max(1, end - maxDisplay + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const fetchPosts = async () => {
  loading.value = true
  try {
    const menuId = route.query.menuId as string | undefined
    const response = await api.posts.getAll({
      page: currentPage.value,
      limit: pageSize,
      categoryId: selectedCategory.value || undefined,
      menuItemId: menuId,
    })
    posts.value = response.data
    totalPages.value = Math.ceil(response.total / pageSize)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const allCategories = await api.categories.getAll()

    // 根据menuId过滤分类
    const menuId = route.query.menuId as string | undefined

    // 定义不同栏目对应的分类slug
    const categoryFilters: Record<string, string[]> = {
      // 水培学堂 - 显示"水培教程"及其子分类
      [route.query.menuId as string]: ['hydroponics-education', 'beginner-guide', 'advanced-techniques'],
    }

    // 根据菜单标题判断（更灵活的方法）
    if (pageTitle.value === '水培学堂') {
      // 只显示"水培教程"及其子分类
      categories.value = allCategories.filter(cat =>
        ['hydroponics-education', 'beginner-guide', 'advanced-techniques'].includes(cat.slug)
      )
    } else if (pageTitle.value === '新闻资讯') {
      // 只显示"行业资讯"分类
      categories.value = allCategories.filter(cat =>
        cat.slug === 'industry-news'
      )
    } else {
      // 默认显示所有分类
      categories.value = allCategories
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const fetchTags = async () => {
  try {
    tags.value = await api.tags.getAll()
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getPlainText = (content: any): string => {
  if (!content) return ''

  // content is an object with { type: 'html', data: '...' }
  const htmlContent = content.data || content

  // Remove HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, '')

  // Truncate to 150 characters
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watchers
watch(selectedCategory, () => {
  currentPage.value = 1
  fetchPosts()
})

// Watch for menuId changes in route query
watch(() => route.query.menuId, async () => {
  currentPage.value = 1
  selectedCategory.value = null // Reset category filter when switching between menus
  await fetchCategories()
  fetchPosts()
})

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchPosts(),
    fetchCategories(),
    fetchTags()
  ])
})

// SEO
useHead({
  title: computed(() => `${pageTitle.value} - 绿野水培`),
  meta: [
    { name: 'description', content: computed(() => pageDescription.value) }
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

.bg-primary-100 {
  background-color: rgba(16, 185, 129, 0.2);
}

.text-primary-600 {
  color: var(--primary-color, #10B981);
}

.text-primary-700 {
  color: var(--secondary-color, #059669);
}

.hover\:bg-primary-100:hover {
  background-color: rgba(16, 185, 129, 0.2);
}

.hover\:text-primary-600:hover {
  color: var(--primary-color, #10B981);
}

.hover\:text-primary-700:hover {
  color: var(--secondary-color, #059669);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
