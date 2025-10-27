<template>
  <div>
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" />

    <!-- Page Header -->
    <div class="bg-gray-50 py-12">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">产品中心</h1>
        <p class="text-lg text-gray-600">专业水培设备，助力智能种植</p>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="container mx-auto px-4 py-12">
      <!-- Filter/Category Section -->
      <div v-if="categories.length > 0" class="mb-8 pb-8 border-b">
        <h2 class="text-xl font-bold mb-4">产品分类</h2>
        <div class="flex flex-wrap gap-3">
          <button
            :class="[
              'px-6 py-2 rounded-full transition-all',
              !selectedCategory
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectedCategory = null"
          >
            全部产品
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            :class="[
              'px-6 py-2 rounded-full transition-all',
              selectedCategory === category.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectedCategory = category.id"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Products -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="text-center py-16">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-gray-600">暂无产品</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
        >
          <!-- Product Image -->
          <NuxtLink :to="`/products/${product.slug}`" class="block relative overflow-hidden bg-gray-100 aspect-square">
            <img
              v-if="product.images && product.images.length > 0"
              :src="`/api/uploads/${product.images[0]}`"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- Featured Badge -->
            <div v-if="product.isFeatured" class="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              推荐
            </div>
          </NuxtLink>

          <!-- Product Info -->
          <div class="p-6">
            <NuxtLink :to="`/products/${product.slug}`">
              <h3 class="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                {{ product.name }}
              </h3>
            </NuxtLink>

            <p v-if="product.summary" class="text-gray-600 text-sm mb-4 line-clamp-2">
              {{ product.summary }}
            </p>
            <p v-else-if="product.description" class="text-gray-600 text-sm mb-4 line-clamp-2">
              {{ getPlainText(product.description) }}
            </p>

            <!-- Price -->
            <div class="flex items-center justify-between">
              <div class="text-2xl font-bold text-primary-600">
                ¥{{ formatPrice(product.price) }}
              </div>
              <NuxtLink
                :to="`/products/${product.slug}`"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                查看详情
              </NuxtLink>
            </div>

            <!-- Specifications Preview -->
            <div v-if="product.specifications && Object.keys(product.specifications).length > 0" class="mt-4 pt-4 border-t">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(value, key) in getTopSpecs(product.specifications)"
                  :key="key"
                  class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>
          </div>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import type { Product, Category } from '~/types'
import Breadcrumb from '~/components/common/Breadcrumb.vue'

const api = useApi()
const route = useRoute()
const router = useRouter()

// State
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const selectedCategory = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 12

// Breadcrumb
const breadcrumbItems = computed(() => [
  { label: '产品中心' }
])

// Fetch data
const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await api.products.getAll({
      page: currentPage.value,
      limit: pageSize,
      category: selectedCategory.value || undefined,
    })
    products.value = response.data
    totalPages.value = Math.ceil(response.total / pageSize)
  } catch (error) {
    console.error('Failed to fetch products:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const allCategories = await api.categories.getAll()

    // Only show categories that are used by products
    // Get unique category IDs from current products
    const productCategoryIds = new Set(products.value.map(p => p.categoryId).filter(Boolean))

    // Filter categories to only include those used by products
    categories.value = allCategories.filter(cat => productCategoryIds.has(cat.id))
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// Computed
const filteredProducts = computed(() => {
  if (!selectedCategory.value) {
    return products.value
  }
  return products.value.filter(p => p.categoryId === selectedCategory.value)
})

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
const formatPrice = (price: number): string => {
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getPlainText = (content: any): string => {
  if (!content) return ''

  // If content is an object with type and data fields
  let htmlContent = ''
  if (typeof content === 'object' && content.type === 'html' && content.data) {
    htmlContent = content.data
  } else if (typeof content === 'string') {
    htmlContent = content
  } else {
    return ''
  }

  // Remove HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  // Truncate to 100 characters
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

const getTopSpecs = (specs: any): Record<string, any> => {
  const entries = Object.entries(specs)
  return Object.fromEntries(entries.slice(0, 3))
}

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watchers
watch(selectedCategory, () => {
  currentPage.value = 1
  fetchProducts()
})

// Lifecycle
onMounted(async () => {
  // Fetch products first, then filter categories based on products
  await fetchProducts()
  await fetchCategories()
})

// SEO
useHead({
  title: '产品中心 - 绿野水培',
  meta: [
    { name: 'description', content: '浏览我们的水培设备产品，找到最适合您的智能种植解决方案' }
  ]
})
</script>

<style scoped>
.bg-primary-600 {
  background-color: var(--primary-color, #10B981);
}

.text-primary-600 {
  color: var(--primary-color, #10B981);
}

.hover\:bg-primary-700:hover {
  background-color: var(--secondary-color, #059669);
}

.hover\:text-primary-600:hover {
  color: var(--primary-color, #10B981);
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
</style>
