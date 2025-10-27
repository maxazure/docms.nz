<template>
  <section class="image-gallery-block py-12">
    <div class="container mx-auto px-4">
      <div :class="['grid gap-4', gridClass]">
        <div v-for="(imageId, index) in images" :key="index" class="overflow-hidden rounded-lg">
          <img :src="getImageUrl(imageId)" :alt="`Gallery image ${index + 1}`" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const api = useApi()

const props = withDefaults(defineProps<{
  images?: string[]
  layout?: 'grid' | 'carousel' | 'masonry'
  columns?: 2 | 3 | 4
}>(), {
  images: () => [],
  layout: 'grid',
  columns: 3
})

const gridClass = computed(() => {
  const grids = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
  return grids[props.columns]
})

const getImageUrl = (imageId: string | number) => {
  return typeof imageId === 'string' ? imageId : api.media.getUrl(imageId.toString())
}
</script>
