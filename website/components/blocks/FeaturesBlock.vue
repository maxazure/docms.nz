<template>
  <section class="features-block py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <!-- 标题 -->
      <h2 v-if="title" class="text-3xl font-bold text-center mb-12">{{ title }}</h2>

      <!-- 特性网格 -->
      <div :class="['grid gap-8', gridClass]">
        <div
          v-for="(item, index) in featureItems"
          :key="index"
          :class="['feature-item', styleClass]"
        >
          <div v-if="item.icon" class="feature-icon text-4xl mb-4">
            {{ item.icon }}
          </div>
          <h3 class="text-xl font-bold mb-2">{{ item.title }}</h3>
          <p class="text-gray-600">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  features?: Array<{
    icon?: string
    title: string
    description: string
  }>
  items?: Array<{
    icon?: string
    title: string
    description: string
  }>
  columns?: 2 | 3 | 4
  style?: 'card' | 'icon-text'
}>(), {
  title: '',
  features: () => [],
  items: () => [],
  columns: 4,
  style: 'card'
})

// 兼容两种属性名：features（数据库使用）和 items（组件原始设计）
const featureItems = computed(() => {
  return props.features.length > 0 ? props.features : props.items
})

const gridClass = computed(() => {
  const grids = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
  return grids[props.columns]
})

const styleClass = computed(() => {
  return props.style === 'card'
    ? 'p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow'
    : 'text-center'
})
</script>

<style scoped>
.feature-icon {
  color: var(--primary-color, #10B981);
}
</style>
