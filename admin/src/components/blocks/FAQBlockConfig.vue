<template>
  <div class="faq-block-config">
    <n-form-item label="˜">
      <n-input
        v-model:value="localConfig.title"
        placeholder="8Áî˜"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="FAQh">
      <n-space vertical :size="12">
        <n-card
          v-for="(item, index) in localConfig.items"
          :key="index"
          size="small"
        >
          <n-space vertical :size="8">
            <n-input
              v-model:value="item.question"
              placeholder="î˜"
              @update:value="handleUpdate"
            />
            <n-input
              v-model:value="item.answer"
              type="textarea"
              placeholder="TH"
              :rows="3"
              @update:value="handleUpdate"
            />
            <n-button
              size="small"
              type="error"
              @click="removeItem(index)"
            >
               d
            </n-button>
          </n-space>
        </n-card>
        <n-button @click="addItem">û FAQ</n-button>
      </n-space>
    </n-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface FAQItem {
  question: string
  answer: string
}

interface FAQConfig {
  title: string
  items: FAQItem[]
}

const props = defineProps<{
  config: FAQConfig
}>()

const emit = defineEmits<{
  (e: 'update:config', value: FAQConfig): void
}>()

const localConfig = ref<FAQConfig>({
  title: props.config?.title || '8Áî˜',
  items: props.config?.items || []
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

function addItem() {
  localConfig.value.items.push({
    question: '',
    answer: ''
  })
  handleUpdate()
}

function removeItem(index: number) {
  localConfig.value.items.splice(index, 1)
  handleUpdate()
}

function handleUpdate() {
  emit('update:config', localConfig.value)
}
</script>

<style scoped>
.faq-block-config {
  padding: 16px 0;
}
</style>
