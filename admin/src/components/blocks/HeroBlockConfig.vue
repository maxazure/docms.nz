<template>
  <div class="block-config">
    <n-form label-placement="left" label-width="80">
      <n-form-item label="主标题">
        <n-input :value="props.title" @update:value="updateProp('title', $event)" placeholder="输入主标题" />
      </n-form-item>

      <n-form-item label="副标题">
        <n-input :value="props.subtitle" @update:value="updateProp('subtitle', $event)" placeholder="输入副标题" />
      </n-form-item>

      <n-form-item label="背景图">
        <n-button @click="selectImage('backgroundImage')">
          {{ props.backgroundImage ? '更换图片' : '选择图片' }}
        </n-button>
        <img v-if="props.backgroundImage" :src="props.backgroundImage" style="max-width: 200px; margin-top: 8px" />
      </n-form-item>

      <n-form-item label="按钮文字">
        <n-input :value="props.ctaText" @update:value="updateProp('ctaText', $event)" placeholder="了解更多" />
      </n-form-item>

      <n-form-item label="按钮链接">
        <n-input :value="props.ctaLink" @update:value="updateProp('ctaLink', $event)" placeholder="/about" />
      </n-form-item>

      <n-form-item label="高度">
        <n-select :value="props.height" @update:value="updateProp('height', $event)" :options="heightOptions" />
      </n-form-item>

      <n-form-item label="对齐">
        <n-select :value="props.textAlign" @update:value="updateProp('textAlign', $event)" :options="alignOptions" />
      </n-form-item>
    </n-form>

    <media-selector
      :visible="showMediaSelector"
      :multiple="false"
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

const props = defineProps<{
  props: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:props', value: Record<string, any>): void
}>()

const showMediaSelector = ref(false)
const currentImageField = ref<string>('')

const heightOptions = [
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' },
  { label: '大', value: 'large' },
  { label: '全屏', value: 'full' }
]

const alignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' }
]

function updateProp(key: string, value: any) {
  emit('update:props', { [key]: value })
}

function selectImage(field: string) {
  currentImageField.value = field
  showMediaSelector.value = true
}

function handleMediaSelect(media: Media | Media[]) {
  if (!Array.isArray(media)) {
    updateProp(currentImageField.value, media.url)
  }
  showMediaSelector.value = false
}
</script>
