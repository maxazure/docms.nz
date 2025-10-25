<template>
  <div class="video-block-config">
    <n-form-item label="Æ‘URL">
      <n-input
        v-model:value="localConfig.url"
        placeholder="“eÆ‘þ¥"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="Æ‘˜">
      <n-input
        v-model:value="localConfig.title"
        placeholder="Æ‘˜ï		"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="ê¨­>">
      <n-switch
        v-model:value="localConfig.autoplay"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label=">:§6a">
      <n-switch
        v-model:value="localConfig.controls"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="ª¯­>">
      <n-switch
        v-model:value="localConfig.loop"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="Yó">
      <n-switch
        v-model:value="localConfig.muted"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="½ØÔ">
      <n-select
        v-model:value="localConfig.aspectRatio"
        :options="aspectRatioOptions"
        @update:value="handleUpdate"
      />
    </n-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface VideoConfig {
  url: string
  title?: string
  autoplay: boolean
  controls: boolean
  loop: boolean
  muted: boolean
  aspectRatio: '16:9' | '4:3' | '1:1' | '21:9'
}

const props = defineProps<{
  config: VideoConfig
}>()

const emit = defineEmits<{
  (e: 'update:config', value: VideoConfig): void
}>()

const localConfig = ref<VideoConfig>({
  url: props.config?.url || '',
  title: props.config?.title || '',
  autoplay: props.config?.autoplay || false,
  controls: props.config?.controls !== undefined ? props.config.controls : true,
  loop: props.config?.loop || false,
  muted: props.config?.muted || false,
  aspectRatio: props.config?.aspectRatio || '16:9'
})

const aspectRatioOptions = [
  { label: '16:9 (½O)', value: '16:9' },
  { label: '4:3 (Æ)', value: '4:3' },
  { label: '1:1 (c¹b)', value: '1:1' },
  { label: '21:9 (…½)', value: '21:9' }
]

watch(
  () => props.config,
  (newConfig) => {
    if (newConfig) {
      localConfig.value = { ...newConfig }
    }
  },
  { deep: true }
)

function handleUpdate() {
  emit('update:config', localConfig.value)
}
</script>

<style scoped>
.video-block-config {
  padding: 16px 0;
}
</style>
