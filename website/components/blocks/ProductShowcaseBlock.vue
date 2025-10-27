<template>
  <section class="product-showcase-block py-16">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 v-if="title" class="text-3xl font-bold mb-4">{{ title }}</h2>
        <p v-if="subtitle" class="text-gray-600 text-lg">{{ subtitle }}</p>
      </div>

      <div v-if="pending" class="text-center py-8">
        <p class="text-gray-500">加载产品中...</p>
      </div>

      <div v-else-if="displayProducts.length > 0"
        :class="layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'">
        <article v-for="product in displayProducts" :key="product.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
          <NuxtLink :to="`/products/${product.slug}`" class="block">
            <!-- Product Image -->
            <div class="aspect-[4/3] bg-gray-200 overflow-hidden">
              <img v-if="product.coverImage"
                :src="getMediaUrl(product.coverImage.storageKey)"
                :alt="product.coverImage.alt || product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-6">
              <h3 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {{ product.name }}
              </h3>

              <p v-if="product.summary" class="text-gray-600 mb-4 line-clamp-2">
                {{ product.summary }}
              </p>

              <!-- Price Display -->
              <div v-if="showPrice && product.price" class="mb-4">
                <span class="text-2xl font-bold text-primary">
                  ¥{{ formatPrice(product.price) }}
                </span>
              </div>

              <!-- View Details Button -->
              <div class="flex items-center text-primary font-semibold">
                查看详情
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-500">暂无产品</p>
      </div>

      <!-- View All Link -->
      <div v-if="showViewAll && displayProducts.length > 0" class="text-center mt-12">
        <NuxtLink to="/products"
          class="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors">
          查看所有产品
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  productIds?: number[]  // Manual product selection
  limit?: number         // Auto-fetch limit
  layout?: 'grid' | 'list'
  showPrice?: boolean
  showViewAll?: boolean
}>(), {
  limit: 6,
  layout: 'grid',
  showPrice: true,
  showViewAll: true
})

const api = useApi()
const config = useRuntimeConfig()

// Fetch products
const { data: products, pending } = await useAsyncData(
  `products-showcase-${props.productIds?.join('-') || 'auto'}`,
  async () => {
    if (props.productIds && props.productIds.length > 0) {
      // Fetch specific products by IDs
      const productPromises = props.productIds.map(id =>
        api.products.getById(id).catch(() => null)
      )
      const results = await Promise.all(productPromises)
      return results.filter(p => p !== null) as Product[]
    } else {
      // Auto-fetch active products
      const response = await api.products.getAll({
        page: 1,
        limit: props.limit,
        isActive: true
      })
      return response.data
    }
  }
)

const displayProducts = computed(() => products.value || [])

// Helper: Get media URL
const getMediaUrl = (storageKey: string) => {
  const apiBase = config.public.apiBase as string
  const baseUrl = apiBase.replace('/api', '')
  return `${baseUrl}/uploads/${storageKey}`
}

// Helper: Format price
const formatPrice = (price: number) => {
  return price.toFixed(2)
}
</script>
