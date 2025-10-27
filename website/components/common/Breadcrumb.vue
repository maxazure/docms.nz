<template>
  <nav aria-label="面包屑导航" class="breadcrumb py-4">
    <div class="container mx-auto px-4">
      <ol class="flex items-center space-x-2 text-sm">
        <li>
          <NuxtLink to="/" class="text-gray-500 hover:text-primary-600 transition-colors">
            首页
          </NuxtLink>
        </li>
        <li v-for="(item, index) in items" :key="index" class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <NuxtLink
            v-if="item.to && index < items.length - 1"
            :to="item.to"
            class="text-gray-500 hover:text-primary-600 transition-colors"
          >
            {{ item.label }}
          </NuxtLink>
          <span v-else class="text-gray-900 font-medium">
            {{ item.label }}
          </span>
        </li>
      </ol>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<style scoped>
.text-primary-600 {
  color: var(--primary-color, #10B981);
}
</style>
