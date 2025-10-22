<template>
  <div class="block-config">
    <n-form label-placement="left" label-width="80">
      <n-form-item label="内容">
        <n-input
          :value="props.content"
          @update:value="updateProp('content', $event)"
          type="textarea"
          :rows="10"
          placeholder="输入文本内容（支持HTML）"
        />
      </n-form-item>

      <n-form-item label="对齐">
        <n-select :value="props.align" @update:value="updateProp('align', $event)" :options="alignOptions" />
      </n-form-item>

      <n-form-item label="最大宽度">
        <n-select :value="props.maxWidth" @update:value="updateProp('maxWidth', $event)" :options="widthOptions" />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ props: Record<string, any> }>()
const emit = defineEmits<{ (e: 'update:props', value: Record<string, any>): void }>()

const alignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' }
]

const widthOptions = [
  { label: '窄', value: 'narrow' },
  { label: '中', value: 'medium' },
  { label: '宽', value: 'wide' },
  { label: '全宽', value: 'full' }
]

function updateProp(key: string, value: any) {
  emit('update:props', { [key]: value })
}
</script>
