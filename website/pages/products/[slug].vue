<template>
  <div>
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" />

    <div v-if="pending" class="container mx-auto px-4 py-16 text-center">
      <p class="text-gray-600">加载中...</p>
    </div>

    <div v-else-if="error" class="container mx-auto px-4 py-16 text-center">
      <h1 class="text-4xl font-bold mb-4">产品未找到</h1>
      <p class="text-gray-600 mb-8">{{ error.message }}</p>
      <NuxtLink to="/products" class="text-primary hover:underline">
        返回产品列表
      </NuxtLink>
    </div>

    <div v-else-if="product" class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Product Images -->
        <div>
          <!-- Main Image -->
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              v-if="selectedImage"
              :src="getMediaUrl(selectedImage.storageKey)"
              :alt="selectedImage.alt || product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              暂无图片
            </div>
          </div>

          <!-- Thumbnail Gallery -->
          <div v-if="product.galleryMedia && product.galleryMedia.length > 1" class="grid grid-cols-4 gap-2">
            <div
              v-for="(image, index) in product.galleryMedia"
              :key="index"
              @click="selectedImage = image"
              :class="[
                'aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer border-2',
                selectedImage?.id === image.id ? 'border-primary' : 'border-transparent'
              ]"
            >
              <img
                :src="getMediaUrl(image.storageKey)"
                :alt="image.alt || product.name"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div>
          <h1 class="text-4xl font-bold mb-4">{{ product.name }}</h1>

          <!-- Price -->
          <div v-if="product.price" class="text-3xl font-bold text-primary mb-6">
            ¥{{ product.price.toLocaleString() }}
          </div>

          <!-- Summary -->
          <p v-if="product.summary" class="text-lg text-gray-700 mb-6">
            {{ product.summary }}
          </p>

          <!-- Specs -->
          <div v-if="product.specs && Object.keys(product.specs).length > 0" class="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-bold mb-4">产品规格</h3>
            <dl class="space-y-2">
              <div v-for="(value, key) in product.specs" :key="key" class="flex">
                <dt class="font-medium text-gray-700 w-32">{{ key }}:</dt>
                <dd class="text-gray-600">{{ value }}</dd>
              </div>
            </dl>
          </div>

          <!-- Tags -->
          <div v-if="product.tags && product.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="tag in product.tags"
              :key="tag.id"
              class="px-3 py-1 bg-gray-100 text-sm rounded-full"
            >
              #{{ tag.name }}
            </span>
          </div>

          <!-- CTA Buttons -->
          <div class="flex gap-4">
            <button class="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
              立即咨询
            </button>
            <button class="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-primary transition-colors">
              收藏
            </button>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="product.description" class="mt-12 pt-12 border-t">
        <h2 class="text-2xl font-bold mb-6">产品详情</h2>
        <div class="prose max-w-none" v-html="renderContent(product.description)"></div>
      </div>

      <!-- Back Link -->
      <div class="mt-12 pt-8 border-t">
        <NuxtLink to="/products" class="text-primary hover:underline">
          ← 返回产品列表
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Media } from '~/types'
import Breadcrumb from '~/components/common/Breadcrumb.vue'

const route = useRoute()
const api = useApi()

const slug = computed(() => route.params.slug as string)

// Fetch product
const { data: product, pending, error } = await useAsyncData(`product-${slug.value}`, async () => {
  try {
    return await api.products.getBySlug(slug.value)
  } catch (err: any) {
    if (err.statusCode === 404) {
      throw createError({ statusCode: 404, message: '产品不存在' })
    }
    throw err
  }
})

// Breadcrumb
const breadcrumbItems = computed(() => [
  { label: '产品中心', to: '/products' },
  { label: product.value?.name || '加载中...' }
])

// Selected image for gallery
const selectedImage = ref<Media | null>(null)

watchEffect(() => {
  if (product.value?.galleryMedia && product.value.galleryMedia.length > 0 && !selectedImage.value) {
    selectedImage.value = product.value.galleryMedia[0]
  }
})

const getMediaUrl = (storageKey: string) => {
  return api.media.getUrl(storageKey)
}

const renderContent = (content: any) => {
  if (typeof content === 'string') {
    return content
  }
  if (typeof content === 'object' && content.type === 'html' && content.data) {
    return content.data
  }
  return ''
}

// SEO
useHead({
  title: product.value?.meta?.title || product.value?.name,
  meta: [
    {
      name: 'description',
      content: product.value?.meta?.description || product.value?.summary || ''
    },
    {
      property: 'og:title',
      content: product.value?.meta?.ogTitle || product.value?.name
    },
    {
      property: 'og:description',
      content: product.value?.meta?.ogDescription || product.value?.summary || ''
    },
    {
      property: 'og:type',
      content: 'product'
    },
    {
      property: 'product:price:amount',
      content: product.value?.price?.toString() || ''
    },
    {
      property: 'product:price:currency',
      content: 'CNY'
    }
  ]
})
</script>

<style scoped>
.text-primary {
  color: var(--primary-color, #10B981);
}

.bg-primary {
  background-color: var(--primary-color, #10B981);
}

.border-primary {
  border-color: var(--primary-color, #10B981);
}

.hover\:border-primary:hover {
  border-color: var(--primary-color, #10B981);
}

.prose {
  color: #374151;
}

.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.75;
}

.prose :deep(img) {
  margin: 2rem 0;
  border-radius: 0.5rem;
}
</style>
