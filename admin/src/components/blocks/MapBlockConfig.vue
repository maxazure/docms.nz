<template>
  <div class="map-block-config">
    <n-form-item label="0þ˜">
      <n-input
        v-model:value="localConfig.title"
        placeholder="ì„Mn"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="0@">
      <n-input
        v-model:value="localConfig.address"
        placeholder="“e0@"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="Ï¦">
      <n-input-number
        v-model:value="localConfig.longitude"
        placeholder="Ï¦"
        :step="0.000001"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="¬¦">
      <n-input-number
        v-model:value="localConfig.latitude"
        placeholder="¬¦"
        :step="0.000001"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label=")>§+">
      <n-slider
        v-model:value="localConfig.zoom"
        :min="1"
        :max="20"
        :step="1"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="0þØ¦ (px)">
      <n-input-number
        v-model:value="localConfig.height"
        :min="200"
        :max="800"
        :step="50"
        @update:value="handleUpdate"
      />
    </n-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface MapConfig {
  title: string
  address: string
  longitude: number
  latitude: number
  zoom: number
  height: number
}

const props = defineProps<{
  config: MapConfig
}>()

const emit = defineEmits<{
  (e: 'update:config', value: MapConfig): void
}>()

const localConfig = ref<MapConfig>({
  title: props.config?.title || 'ì„Mn',
  address: props.config?.address || '',
  longitude: props.config?.longitude || 0,
  latitude: props.config?.latitude || 0,
  zoom: props.config?.zoom || 15,
  height: props.config?.height || 400
})

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
.map-block-config {
  padding: 16px 0;
}
</style>
