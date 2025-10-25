<template>
  <div class="divider-block-config">
    <n-form-item label="”¿7">
      <n-select
        v-model:value="localConfig.style"
        :options="styleOptions"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="”¿œr">
      <n-color-picker
        v-model:value="localConfig.color"
        :show-alpha="false"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="ôÝ'">
      <n-slider
        v-model:value="localConfig.spacing"
        :min="8"
        :max="64"
        :step="4"
        @update:value="handleUpdate"
      />
    </n-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface DividerConfig {
  style: 'solid' | 'dashed' | 'dotted'
  color: string
  spacing: number
}

const props = defineProps<{
  config: DividerConfig
}>()

const emit = defineEmits<{
  (e: 'update:config', value: DividerConfig): void
}>()

const localConfig = ref<DividerConfig>({
  style: props.config?.style || 'solid',
  color: props.config?.color || '#e0e0e0',
  spacing: props.config?.spacing || 32
})

const styleOptions = [
  { label: 'ž¿', value: 'solid' },
  { label: 'Z¿', value: 'dashed' },
  { label: '¹¿', value: 'dotted' }
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
.divider-block-config {
  padding: 16px 0;
}
</style>
