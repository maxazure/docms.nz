<template>
  <div class="cta-block-config">
    <n-form-item label="˜">
      <n-input
        v-model:value="localConfig.title"
        placeholder="“eCTA˜"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="o˜">
      <n-input
        v-model:value="localConfig.subtitle"
        placeholder="“eo˜ï		"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="	®‡W">
      <n-input
        v-model:value="localConfig.buttonText"
        placeholder="‹‚Ës¨â"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="	®þ¥">
      <n-input
        v-model:value="localConfig.buttonLink"
        placeholder="“eþ¥0@"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="Ìoœr">
      <n-color-picker
        v-model:value="localConfig.backgroundColor"
        :show-alpha="false"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="‡Wœr">
      <n-color-picker
        v-model:value="localConfig.textColor"
        :show-alpha="false"
        @update:value="handleUpdate"
      />
    </n-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface CTAConfig {
  title: string
  subtitle?: string
  buttonText: string
  buttonLink: string
  backgroundColor: string
  textColor: string
}

const props = defineProps<{
  config: CTAConfig
}>()

const emit = defineEmits<{
  (e: 'update:config', value: CTAConfig): void
}>()

const localConfig = ref<CTAConfig>({
  title: props.config?.title || '',
  subtitle: props.config?.subtitle || '',
  buttonText: props.config?.buttonText || '†ãô',
  buttonLink: props.config?.buttonLink || '#',
  backgroundColor: props.config?.backgroundColor || '#1890ff',
  textColor: props.config?.textColor || '#ffffff'
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
.cta-block-config {
  padding: 16px 0;
}
</style>
