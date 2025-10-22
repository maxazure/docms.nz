<template>
  <div class="block-config">
    <n-form label-placement="left" label-width="80">
      <n-form-item label="图片列表">
        <n-button @click="showMediaSelector = true">选择图片</n-button>
        <div v-if="props.images && props.images.length" class="image-list">
          <div v-for="(img, idx) in props.images" :key="idx" class="image-item">
            <img :src="img" style="width: 80px; height: 80px; object-fit: cover" />
            <n-button size="tiny" @click="removeImage(idx)">删除</n-button>
          </div>
        </div>
      </n-form-item>

      <n-form-item label="布局">
        <n-select :value="props.layout" @update:value="updateProp('layout', $event)" :options="layoutOptions" />
      </n-form-item>

      <n-form-item label="列数">
        <n-select :value="props.columns" @update:value="updateProp('columns', $event)" :options="columnOptions" />
      </n-form-item>

      <n-form-item label="纵横比">
        <n-select :value="props.aspectRatio" @update:value="updateProp('aspectRatio', $event)" :options="ratioOptions" />
      </n-form-item>
    </n-form>

    <media-selector
      :visible="showMediaSelector"
      :multiple="true"
      accept="image/"
      @select="handleMediaSelect"
      @cancel="showMediaSelector = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MediaSelector from '@/components/media/MediaSelector.vue'
import type { Media } from '@/types'

const props = defineProps<{ props: Record<string, any> }>()
const emit = defineEmits<{ (e: 'update:props', value: Record<string, any>): void }>()

const showMediaSelector = ref(false)

const layoutOptions = [
  { label: '网格', value: 'grid' },
  { label: '轮播', value: 'carousel' },
  { label: '瀑布流', value: 'masonry' }
]

const columnOptions = [
  { label: '2列', value: 2 },
  { label: '3列', value: 3 },
  { label: '4列', value: 4 }
]

const ratioOptions = [
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' }
]

function updateProp(key: string, value: any) {
  emit('update:props', { [key]: value })
}

function handleMediaSelect(media: Media | Media[]) {
  if (Array.isArray(media)) {
    updateProp('images', media.map(m => m.url))
  }
  showMediaSelector.value = false
}

function removeImage(index: number) {
  const newImages = [...props.props.images]
  newImages.splice(index, 1)
  updateProp('images', newImages)
}
</script>

<style scoped>
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.image-item {
  position: relative;
}
</style>
