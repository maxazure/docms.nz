<template>
  <div class="block-config">
    <n-form label-placement="left" label-width="80">
      <n-form-item label="布局列数">
        <n-select :value="props.columns" @update:value="updateProp('columns', $event)" :options="columnOptions" />
      </n-form-item>

      <n-form-item label="样式">
        <n-select :value="props.style" @update:value="updateProp('style', $event)" :options="styleOptions" />
      </n-form-item>

      <n-form-item label="特点列表">
        <n-dynamic-input
          :value="props.items"
          @update:value="updateProp('items', $event)"
          :min="1"
          :max="12"
        >
          <template #default="{ value }">
            <div style="display: flex; gap: 8px; width: 100%">
              <n-input v-model:value="value.icon" placeholder="图标名称" style="width: 120px" />
              <n-input v-model:value="value.title" placeholder="标题" style="flex: 1" />
              <n-input v-model:value="value.description" placeholder="描述" style="flex: 2" />
            </div>
          </template>
        </n-dynamic-input>
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ props: Record<string, any> }>()
const emit = defineEmits<{ (e: 'update:props', value: Record<string, any>): void }>()

const columnOptions = [
  { label: '2列', value: 2 },
  { label: '3列', value: 3 },
  { label: '4列', value: 4 }
]

const styleOptions = [
  { label: '卡片', value: 'card' },
  { label: '列表', value: 'list' },
  { label: '图标', value: 'icon' }
]

function updateProp(key: string, value: any) {
  emit('update:props', { [key]: value })
}
</script>
