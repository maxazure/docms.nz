<script setup lang="ts">
const props = defineProps<{
  heading?: string;
  features?: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
  columns?: number;
  backgroundColor?: string;
}>();

const sectionStyle = computed(() => ({
  backgroundColor: props.backgroundColor || '#f9fafb',
}));

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns || 3}, 1fr)`,
}));
</script>

<template>
  <section class="block-features" :style="sectionStyle">
    <div class="container">
      <h2 v-if="heading" class="features-heading">{{ heading }}</h2>
      <div class="features-grid" :style="gridStyle">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-item"
        >
          <div v-if="feature.icon" class="feature-icon">
            <img :src="feature.icon" :alt="feature.title" />
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block-features {
  padding: 4rem 0;
}

.features-heading {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
}

.features-grid {
  display: grid;
  gap: 2rem;
}

.feature-item {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
}

.feature-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.feature-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.feature-description {
  color: var(--text-light);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
