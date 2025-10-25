<script setup lang="ts">
const props = defineProps<{
  images?: Array<{
    src: string;
    alt?: string;
    caption?: string;
  }>;
  columns?: number;
  gap?: string;
  aspectRatio?: string;
}>();

const api = useApi();

const galleryStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns || 3}, 1fr)`,
  gap: props.gap || '1rem',
}));

const getImageUrl = (src: string) => api.getMediaUrl(src);
</script>

<template>
  <section class="block-image-gallery">
    <div class="container">
      <div class="gallery-grid" :style="galleryStyle">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="gallery-item"
        >
          <div class="image-wrapper" :style="{ paddingBottom: aspectRatio || '75%' }">
            <img
              :src="getImageUrl(image.src)"
              :alt="image.alt || `图片 ${index + 1}`"
              loading="lazy"
            />
          </div>
          <p v-if="image.caption" class="image-caption">{{ image.caption }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block-image-gallery {
  padding: 3rem 0;
}

.gallery-grid {
  display: grid;
}

.gallery-item {
  position: relative;
}

.image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--border-radius);
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover .image-wrapper img {
  transform: scale(1.05);
}

.image-caption {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-light);
  text-align: center;
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
