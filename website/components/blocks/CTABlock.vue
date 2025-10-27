<template>
  <section class="cta-block py-16 bg-primary text-white">
    <div class="container mx-auto px-4 text-center">
      <h2 v-if="title" class="text-3xl md:text-4xl font-bold mb-4">{{ title }}</h2>
      <p v-if="description" class="text-xl mb-8">{{ description }}</p>
      <NuxtLink v-if="buttonText && buttonLink" :to="buttonLink" class="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-opacity-90 transition-colors">
        {{ buttonText }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  buttonText?: string
  buttonLink?: string
}>(), {})
</script>

<style scoped>
.bg-primary { background-color: var(--primary-color, #10B981); }
.text-primary { color: var(--primary-color, #10B981); }
</style>
