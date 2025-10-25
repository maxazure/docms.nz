<script setup lang="ts">
const props = defineProps<{
  content?: string;
  heading?: string;
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: string;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
}>();

const sectionStyle = computed(() => ({
  backgroundColor: props.backgroundColor || 'transparent',
  color: props.textColor || 'var(--text-color)',
  padding: props.padding || '3rem 0',
}));

const contentStyle = computed(() => ({
  maxWidth: props.maxWidth || '800px',
  textAlign: props.textAlign || 'left',
}));
</script>

<template>
  <section class="block-text" :style="sectionStyle">
    <div class="container">
      <div class="text-content" :style="contentStyle">
        <h2 v-if="heading" class="text-heading">{{ heading }}</h2>
        <div v-if="content" class="text-body" v-html="content"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block-text {
  width: 100%;
}

.text-content {
  margin: 0 auto;
}

.text-heading {
  margin-bottom: 1.5rem;
}

.text-body {
  line-height: 1.8;
}

.text-body :deep(p) {
  margin-bottom: 1rem;
}

.text-body :deep(ul),
.text-body :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.text-body :deep(li) {
  margin-bottom: 0.5rem;
}

.text-body :deep(strong) {
  font-weight: 600;
}

.text-body :deep(em) {
  font-style: italic;
}

.text-body :deep(a) {
  color: var(--primary-color);
  text-decoration: underline;
}

.text-body :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: var(--text-light);
}
</style>
