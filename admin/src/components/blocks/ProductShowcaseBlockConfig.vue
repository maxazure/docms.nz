<template>
  <div class="product-showcase-block-config">
    <n-form-item label="˜">
      <n-input
        v-model:value="localConfig.title"
        placeholder="§ÁU:"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label=">:pÏ">
      <n-input-number
        v-model:value="localConfig.count"
        :min="1"
        :max="12"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="@p">
      <n-select
        v-model:value="localConfig.columns"
        :options="columnOptions"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label=">:÷<">
      <n-switch
        v-model:value="localConfig.showPrice"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label=">:Ïð">
      <n-switch
        v-model:value="localConfig.showDescription"
        @update:value="handleUpdate"
      />
    </n-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface ProductShowcaseConfig {
  title: string
  count: number
  columns: number
  showPrice: boolean
  showDescription: boolean
}

const props = defineProps<{
  config: ProductShowcaseConfig
}>()

const emit = defineEmits<{
  (e: 'update:config', value: ProductShowcaseConfig): void
}>()

const localConfig = ref<ProductShowcaseConfig>({
  title: props.config?.title || '§ÁU:',
  count: props.config?.count || 6,
  columns: props.config?.columns || 3,
  showPrice: props.config?.showPrice !== undefined ? props.config.showPrice : true,
  showDescription: props.config?.showDescription !== undefined ? props.config.showDescription : true
})

const columnOptions = [
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '6', value: 6 }
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
.product-showcase-block-config {
  padding: 16px 0;
}
</style>
