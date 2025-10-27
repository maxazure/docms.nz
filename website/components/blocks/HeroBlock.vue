<template>
  <section
    class="hero-block relative overflow-hidden"
    :class="[heightClass, backgroundClass]"
    :style="backgroundStyle"
  >
    <div class="absolute inset-0 bg-black bg-opacity-40"></div>

    <div class="container mx-auto px-4 h-full relative z-10">
      <div class="h-full flex items-center" :class="alignmentClass">
        <div class="text-white max-w-3xl">
          <h1 v-if="title" class="text-5xl md:text-6xl font-bold mb-4">
            {{ title }}
          </h1>

          <p v-if="subtitle" class="text-xl md:text-2xl mb-8">
            {{ subtitle }}
          </p>

          <NuxtLink
            v-if="ctaText && ctaLink"
            :to="ctaLink"
            class="inline-block px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
          >
            {{ ctaText }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const api = useApi()

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  backgroundImage?: string | number
  ctaText?: string
  ctaLink?: string
  height?: 'small' | 'medium' | 'large' | 'full'
  textAlign?: 'left' | 'center' | 'right'
}>(), {
  height: 'large',
  textAlign: 'center'
})

const heightClass = computed(() => {
  const heights = {
    small: 'h-96',
    medium: 'h-[32rem]',
    large: 'h-[40rem]',
    full: 'h-screen'
  }
  return heights[props.height]
})

const alignmentClass = computed(() => {
  const alignments = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }
  return alignments[props.textAlign]
})

const backgroundClass = computed(() => {
  return props.backgroundImage ? '' : 'bg-gradient-to-br from-primary to-secondary'
})

const backgroundStyle = computed(() => {
  if (typeof props.backgroundImage === 'string') {
    return {
      backgroundImage: `url(${props.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  } else if (typeof props.backgroundImage === 'number') {
    // If it's a media ID, we'd need to fetch it first
    return {}
  }
  return {}
})
</script>

<style scoped>
.bg-primary {
  background-color: var(--primary-color, #10B981);
}

.from-primary {
  --tw-gradient-from: var(--primary-color, #10B981);
}

.to-secondary {
  --tw-gradient-to: var(--secondary-color, #059669);
}
</style>
