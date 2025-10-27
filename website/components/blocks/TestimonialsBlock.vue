<template>
  <section class="testimonials-block py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 v-if="title" class="text-3xl font-bold mb-4">{{ title }}</h2>
        <p v-if="subtitle" class="text-gray-600 text-lg">{{ subtitle }}</p>
      </div>

      <div v-if="items && items.length > 0" class="max-w-6xl mx-auto">
        <!-- Grid Layout -->
        <div v-if="layout === 'grid'"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(item, index) in items" :key="index"
            class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <!-- Quote Icon -->
            <div class="text-primary mb-4">
              <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            <!-- Content -->
            <p class="text-gray-700 mb-6 leading-relaxed">
              {{ item.content }}
            </p>

            <!-- Rating -->
            <div v-if="item.rating" class="flex items-center mb-4">
              <svg v-for="star in 5" :key="star"
                class="w-5 h-5"
                :class="star <= item.rating ? 'text-yellow-400' : 'text-gray-300'"
                fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>

            <!-- Author Info -->
            <div class="flex items-center border-t pt-4">
              <div v-if="item.avatar"
                class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4 flex-shrink-0">
                <img :src="item.avatar" :alt="item.name" class="w-full h-full object-cover" />
              </div>
              <div v-else
                class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-4 flex-shrink-0 text-lg font-bold">
                {{ getInitials(item.name) }}
              </div>
              <div>
                <div class="font-semibold text-gray-900">{{ item.name }}</div>
                <div class="text-sm text-gray-600">{{ item.company || item.position }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Carousel Layout -->
        <div v-else class="relative">
          <div class="overflow-hidden">
            <div class="flex transition-transform duration-500 ease-in-out"
              :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
              <div v-for="(item, index) in items" :key="index"
                class="w-full flex-shrink-0 px-4">
                <div class="bg-white rounded-lg shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
                  <!-- Quote Icon -->
                  <div class="text-primary mb-6 text-center">
                    <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  <!-- Content -->
                  <p class="text-gray-700 text-lg md:text-xl mb-8 text-center leading-relaxed">
                    {{ item.content }}
                  </p>

                  <!-- Rating -->
                  <div v-if="item.rating" class="flex items-center justify-center mb-6">
                    <svg v-for="star in 5" :key="star"
                      class="w-6 h-6"
                      :class="star <= item.rating ? 'text-yellow-400' : 'text-gray-300'"
                      fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>

                  <!-- Author Info -->
                  <div class="flex items-center justify-center">
                    <div v-if="item.avatar"
                      class="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mr-4">
                      <img :src="item.avatar" :alt="item.name" class="w-full h-full object-cover" />
                    </div>
                    <div v-else
                      class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mr-4 text-xl font-bold">
                      {{ getInitials(item.name) }}
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-gray-900 text-lg">{{ item.name }}</div>
                      <div class="text-gray-600">{{ item.company || item.position }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <button v-if="items.length > 1" @click="prev"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button v-if="items.length > 1" @click="next"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Dots Indicator -->
          <div v-if="items.length > 1" class="flex items-center justify-center mt-8 space-x-2">
            <button v-for="(item, index) in items" :key="index"
              @click="currentIndex = index"
              class="w-2 h-2 rounded-full transition-all"
              :class="index === currentIndex ? 'bg-primary w-8' : 'bg-gray-300'">
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-500">暂无评价</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  items?: Array<{
    name: string
    company?: string
    position?: string
    avatar?: string
    content: string
    rating?: number
  }>
  layout?: 'grid' | 'carousel'
}>(), {
  items: () => [],
  layout: 'grid'
})

const currentIndex = ref(0)

// Get initials from name
const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Carousel navigation
const next = () => {
  if (props.items && props.items.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % props.items.length
  }
}

const prev = () => {
  if (props.items && props.items.length > 0) {
    currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length
  }
}

// Auto-play carousel
let autoplayInterval: NodeJS.Timeout | null = null

onMounted(() => {
  if (props.layout === 'carousel' && props.items && props.items.length > 1) {
    autoplayInterval = setInterval(() => {
      next()
    }, 5000) // 5 seconds
  }
})

onUnmounted(() => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }
})
</script>
