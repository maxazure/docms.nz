<template>
  <div class="testimonials-block-config">
    <n-form-item label="˜">
      <n-input
        v-model:value="localConfig.title"
        placeholder="¢7Ä÷"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="Ä÷h">
      <n-space vertical :size="12">
        <n-card
          v-for="(item, index) in localConfig.items"
          :key="index"
          size="small"
        >
          <n-space vertical :size="8">
            <n-input
              v-model:value="item.name"
              placeholder="¢7Ó"
              @update:value="handleUpdate"
            />
            <n-input
              v-model:value="item.role"
              placeholder="LM/lø"
              @update:value="handleUpdate"
            />
            <n-input
              v-model:value="item.content"
              type="textarea"
              placeholder="Ä÷…¹"
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
        <n-button @click="addItem">û Ä÷</n-button>
      </n-space>
    </n-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface TestimonialItem {
  name: string
  role: string
  content: string
}

interface TestimonialsConfig {
  title: string
  items: TestimonialItem[]
}

const props = defineProps<{
  config: TestimonialsConfig
}>()

const emit = defineEmits<{
  (e: 'update:config', value: TestimonialsConfig): void
}>()

const localConfig = ref<TestimonialsConfig>({
  title: props.config?.title || '¢7Ä÷',
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
    name: '',
    role: '',
    content: ''
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
.testimonials-block-config {
  padding: 16px 0;
}
</style>
