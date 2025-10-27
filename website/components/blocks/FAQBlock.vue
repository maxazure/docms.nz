<template>
  <section class="faq-block py-16 bg-gray-50">
    <div class="container mx-auto px-4 max-w-4xl">
      <h2 v-if="title" class="text-3xl font-bold text-center mb-12">{{ title }}</h2>

      <div class="space-y-4">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <button
            @click="toggle(index)"
            class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span class="font-semibold text-lg">{{ item.question }}</span>
            <svg
              class="w-5 h-5 transition-transform"
              :class="{ 'rotate-180': openItems.has(index) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            v-show="openItems.has(index)"
            class="px-6 pb-4 text-gray-600"
          >
            {{ item.answer }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  items?: Array<{
    question: string
    answer: string
  }>
  expandMode?: 'single' | 'multiple'
}>(), {
  items: () => [],
  expandMode: 'single'
})

const openItems = ref<Set<number>>(new Set())

const toggle = (index: number) => {
  if (props.expandMode === 'single') {
    // Single mode: close all others
    if (openItems.value.has(index)) {
      openItems.value.delete(index)
    } else {
      openItems.value.clear()
      openItems.value.add(index)
    }
  } else {
    // Multiple mode: toggle individual item
    if (openItems.value.has(index)) {
      openItems.value.delete(index)
    } else {
      openItems.value.add(index)
    }
  }
}
</script>
