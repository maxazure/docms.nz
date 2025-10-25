<script setup lang="ts">
const props = defineProps<{
  mainTitle?: string;
  subTitle?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  ctaButtons?: Array<{ text: string; link: string; style?: string }>;
  height?: string;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
}>();

const api = useApi();

// 处理背景图片 URL
const bgImageUrl = computed(() => {
  if (!props.backgroundImage) return '';
  return api.getMediaUrl(props.backgroundImage);
});

// 计算样式
const sectionStyle = computed(() => ({
  backgroundImage: bgImageUrl.value ? `url(${bgImageUrl.value})` : 'none',
  backgroundColor: props.backgroundColor || 'transparent',
  minHeight: props.height || '500px',
  color: props.textColor || '#ffffff',
}));
</script>

<template>
  <section class="block-hero" :style="sectionStyle">
    <div class="hero-overlay"></div>
    <div class="hero-content container" :class="`text-${textAlign || 'center'}`">
      <h1 v-if="mainTitle" class="hero-title">{{ mainTitle }}</h1>
      <p v-if="subTitle" class="hero-subtitle">{{ subTitle }}</p>
      <div v-if="ctaButtons && ctaButtons.length" class="hero-cta">
        <a
          v-for="(btn, index) in ctaButtons"
          :key="index"
          :href="btn.link"
          class="cta-button"
          :class="btn.style || 'primary'"
        >
          {{ btn.text }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.hero-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.text-left .hero-cta {
  justify-content: flex-start;
}

.text-right .hero-cta {
  justify-content: flex-end;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.cta-button.primary {
  background-color: var(--primary-color);
  color: white;
}

.cta-button.secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .cta-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
