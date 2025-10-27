<template>
  <div class="block-renderer">
    <component
      v-for="block in visibleBlocks"
      :key="block.id"
      :is="getBlockComponent(block.type)"
      v-bind="block.props"
      :block-id="block.id"
    />
  </div>
</template>

<script setup lang="ts">
import type { Block, BlockType } from '~/types'

import HeroBlock from './HeroBlock.vue'
import TextBlock from './TextBlock.vue'
import ImageGalleryBlock from './ImageGalleryBlock.vue'
import FeaturesBlock from './FeaturesBlock.vue'
import CTABlock from './CTABlock.vue'
import FAQBlock from './FAQBlock.vue'
import ProductShowcaseBlock from './ProductShowcaseBlock.vue'
import TestimonialsBlock from './TestimonialsBlock.vue'
import ContactFormBlock from './ContactFormBlock.vue'
import MapBlock from './MapBlock.vue'
import VideoBlock from './VideoBlock.vue'
import DividerBlock from './DividerBlock.vue'

const props = withDefaults(defineProps<{
  blocks: Block[]
}>(), {
  blocks: () => []
})

// 类型转换映射：将数据库的大写类型转换为前端的小驼峰类型
const normalizeBlockType = (type: string): BlockType => {
  const typeMapping: Record<string, BlockType> = {
    'HERO': 'hero',
    'TEXT': 'text',
    'IMAGE_GALLERY': 'imageGallery',
    'FEATURES': 'features',
    'CTA': 'cta',
    'FAQ': 'faq',
    'PRODUCT_SHOWCASE': 'productShowcase',
    'TESTIMONIALS': 'testimonials',
    'CONTACT_FORM': 'contactForm',
    'MAP': 'map',
    'VIDEO': 'video',
    'DIVIDER': 'divider',
  }

  return typeMapping[type] || type.toLowerCase() as BlockType
}

const visibleBlocks = computed(() => {
  return props.blocks
    .filter(block => block.visibility !== false)
    .sort((a, b) => a.order - b.order)
})

const getBlockComponent = (type: string | BlockType) => {
  // 转换类型
  const normalizedType = normalizeBlockType(type as string)

  const blockComponents: Record<BlockType, any> = {
    hero: HeroBlock,
    text: TextBlock,
    imageGallery: ImageGalleryBlock,
    features: FeaturesBlock,
    cta: CTABlock,
    faq: FAQBlock,
    productShowcase: ProductShowcaseBlock,
    testimonials: TestimonialsBlock,
    contactForm: ContactFormBlock,
    map: MapBlock,
    video: VideoBlock,
    divider: DividerBlock,
  }

  return blockComponents[normalizedType] || TextBlock
}
</script>

<style scoped>
.block-renderer {
  width: 100%;
}
</style>
