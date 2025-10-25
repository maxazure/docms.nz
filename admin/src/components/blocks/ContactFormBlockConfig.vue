<template>
  <div class="contact-form-block-config">
    <n-form-item label="表单标题">
      <n-input
        v-model:value="localConfig.title"
        placeholder="联系我们"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="选择表单">
      <n-select
        v-model:value="localConfig.formId"
        :options="formOptions"
        placeholder="请选择表单"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="提交按钮文字">
      <n-input
        v-model:value="localConfig.submitText"
        placeholder="提交"
        @update:value="handleUpdate"
      />
    </n-form-item>

    <n-form-item label="成功提示">
      <n-input
        v-model:value="localConfig.successMessage"
        placeholder="提交成功！我们会尽快回复您。"
        @update:value="handleUpdate"
      />
    </n-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface ContactFormConfig {
  title: string
  formId?: string
  submitText: string
  successMessage: string
}

const props = defineProps<{
  config: ContactFormConfig
}>()

const emit = defineEmits<{
  (e: 'update:config', value: ContactFormConfig): void
}>()

const localConfig = ref<ContactFormConfig>({
  title: props.config?.title || '联系我们',
  formId: props.config?.formId,
  submitText: props.config?.submitText || '提交',
  successMessage: props.config?.successMessage || '提交成功！我们会尽快回复您。'
})

// TODO: Load form options from API
const formOptions = ref([
  { label: '默认联系表单', value: 'default' }
])

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
.contact-form-block-config {
  padding: 16px 0;
}
</style>
