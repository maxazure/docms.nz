<template>
  <section class="text-block py-12">
    <div class="container mx-auto px-4">
      <div :class="['prose', maxWidthClass, alignmentClass]" v-html="content"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  content?: string
  align?: 'left' | 'center' | 'right'
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full'
}>(), {
  content: '',
  align: 'left',
  maxWidth: 'medium'
})

const maxWidthClass = computed(() => {
  const widths = {
    narrow: 'max-w-2xl',
    medium: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-none'
  }
  return widths[props.maxWidth]
})

const alignmentClass = computed(() => {
  const alignments = {
    left: 'mx-0',
    center: 'mx-auto',
    right: 'ml-auto mr-0'
  }
  return props.align === 'center' || props.align === 'left' ? alignments[props.align] : alignments.left
})
</script>

<style scoped>
.prose {
  color: #374151;
}

.prose :deep(h1) {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.prose :deep(h2) {
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose :deep(h3) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.75;
}

.prose :deep(ul), .prose :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.prose :deep(li) {
  margin: 0.5rem 0;
}

.prose :deep(a) {
  color: var(--primary-color, #10B981);
  text-decoration: underline;
}

.prose :deep(img) {
  margin: 2rem 0;
  border-radius: 0.5rem;
  max-width: 100%;
}
</style>
